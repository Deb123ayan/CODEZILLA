from celery import shared_task
from events.models import Event
from users.models import Worker
from policies.models import Policy
from claims.models import Claim
from datetime import date

@shared_task
def ingest_external_data():
    """
    Fetch real weather/AQI data for all active worker zones and create Events
    if thresholds are exceeded. Runs periodically (e.g., every 10 mins).
    """
    from ai_engine.weather_service import WeatherService

    # Pull zones dynamically from workers with active policies
    active_worker_zones = Worker.objects.filter(
        policies__status='ACTIVE',
        policies__end_date__gte=date.today()
    ).values_list('zone', flat=True).distinct()

    zones = list(active_worker_zones) if active_worker_zones else ["Salt Lake", "Park Street", "New Town", "Gariahat"]

    for zone in zones:
        coords = WeatherService.get_coordinates_for_zone(zone)
        if not coords:
            continue

        lat, lng = coords
        conditions = WeatherService.check_disruption_conditions(lat, lng)

        if conditions['is_disrupted']:
            for trigger in conditions['triggers']:
                # Map trigger type to event type
                trigger_to_event = {
                    'HEAVY_RAIN': 'WEATHER',
                    'EXTREME_HEAT': 'HEAT',
                    'HIGH_WIND': 'WEATHER',
                    'SEVERE_POLLUTION': 'AQI',
                    'STORM': 'STORM',
                    'FLOOD_RISK': 'FLOOD',
                }
                event_type = trigger_to_event.get(trigger['type'], 'WEATHER')

                event = Event.objects.create(
                    type=event_type,
                    zone=zone,
                    severity=8 if trigger['severity'] == 'HIGH' else 5,
                    description=trigger.get('detail', ''),
                    reported_by='automated_ingestion',
                )
                process_claims_for_event.delay(str(event.event_id))


@shared_task
def process_claims_for_event(event_id):
    """
    Find workers in the zone, check active policies, and create claims.
    """
    try:
        event = Event.objects.get(event_id=event_id)
    except Event.DoesNotExist:
        return

    workers = Worker.objects.filter(zone__icontains=event.zone.split(',')[0].strip())

    for worker in workers:
        active_policy = Policy.objects.filter(
            worker=worker,
            status='ACTIVE',
            end_date__gte=date.today()
        ).first()

        if not active_policy:
            continue

        # Check for duplicate claim today
        existing = Claim.objects.filter(
            worker=worker,
            claim_date=date.today(),
            claim_reason=event.type
        ).exists()

        if existing:
            continue

        # Calculate compensation
        working_days = len(worker.working_days) if worker.working_days else 6
        daily_income = worker.weekly_earnings / max(working_days, 1)
        lost_hours = min(worker.working_hours, 6)
        hourly_income = daily_income / max(worker.working_hours, 1)
        compensation = min(int(hourly_income * lost_hours), active_policy.coverage_limit)

        claim = Claim.objects.create(
            worker=worker,
            policy=active_policy,
            event=event,
            claim_reason=event.type,
            claim_date=date.today(),
            lost_hours=lost_hours,
            compensation=compensation,
            status='PENDING'
        )

        # Run fraud check
        run_fraud_check.delay(str(claim.claim_id))


@shared_task
def run_fraud_check(claim_id):
    """
    Perform fraud checks using ML anomaly detection + real GPS distance.
    """
    try:
        claim = Claim.objects.get(claim_id=claim_id)
    except Claim.DoesNotExist:
        return

    from ai_engine.risk_calculator import audit_claim_for_fraud, compute_gps_distance
    from ai_engine.weather_service import WeatherService

    # Compute real distance from zone center using GPS
    worker = claim.worker
    zone_coords = WeatherService.get_coordinates_for_zone(worker.zone)

    if zone_coords and worker.latitude and worker.longitude:
        distance_km = compute_gps_distance(
            worker.latitude, worker.longitude,
            zone_coords[0], zone_coords[1]
        )
    else:
        distance_km = 0.0  # Can't compute, assume co-located

    # ML anomaly detection
    passed_fraud_check = audit_claim_for_fraud(
        lost_hours=claim.lost_hours,
        compensation=claim.compensation,
        distance_km=distance_km
    )

    claim.fraud_score = 0.0 if passed_fraud_check else 0.85
    claim.verification_data = {
        'distance_from_zone_km': round(distance_km, 2),
        'fraud_check_passed': passed_fraud_check,
        'method': 'ml_anomaly_detection + gps_distance',
    }

    if passed_fraud_check:
        claim.status = 'AUTO_APPROVED'
        claim.save()
        print(f"ML Audit Passed: Payout of ₹{claim.compensation} approved for {claim.worker.name}")
    else:
        claim.status = 'FRAUD_FLAGGED'
        claim.save()
        print(f"ML Audit Failed: Fraud flagged for Claim ID: {claim.claim_id}")


@shared_task
def expire_policies():
    """
    Periodic task: Mark policies past end_date as EXPIRED.
    Run daily via Celery Beat.
    """
    expired = Policy.objects.filter(
        status='ACTIVE',
        end_date__lt=date.today()
    ).update(status='EXPIRED')

    if expired:
        print(f"Expired {expired} policies that passed their end date.")

    return f"{expired} policies expired"
