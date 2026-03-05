from celery import shared_task
from events.models import Event
from users.models import Worker
from policies.models import Policy
from claims.models import Claim
import requests
import random

@shared_task
def ingest_external_data():
    """
    Fetch data from Weather/AQI APIs and create Events if thresholds exceeded.
    Runs periodically (e.g., every 10 mins).
    """
    # Example: OpenWeatherMap (Mocked for now)
    # response = requests.get("https://api.openweathermap.org/data/2.5/weather?...")
    # data = response.json()
    
    # Mocked data for demonstration
    zones = ["Salt Lake", "Park Street", "New Town", "Gariahat"]
    
    for zone in zones:
        rainfall = random.randint(0, 150) # mm
        aqi = random.randint(50, 500)
        
        # evaluation logic (Step 7)
        if rainfall > 100:
            event = Event.objects.create(
                type='WEATHER',
                zone=zone,
                severity=rainfall,
            )
            process_claims_for_event.delay(event.event_id)
            
        elif aqi > 400:
            event = Event.objects.create(
                type='AQI',
                zone=zone,
                severity=aqi,
            )
            process_claims_for_event.delay(event.event_id)

@shared_task
def process_claims_for_event(event_id):
    """
    Find workers in the zone, check active policies, and create claims.
    """
    try:
        event = Event.objects.get(event_id=event_id)
    except Event.DoesNotExist:
        return

    # Find workers in this zone
    workers = Worker.objects.filter(zone=event.zone)
    
    for worker in workers:
        # Check active policy
        active_policy = Policy.objects.filter(
            worker=worker, 
            status='ACTIVE'
        ).first()
        
        if active_policy:
            # Estimate lost hours (Mocked: 4-6 hours based on event severity)
            lost_hours = random.randint(4, 8)
            
            # Step 9: Lost Income Calculation
            # hourly_income = avg_daily_income / 8
            # compensation = hourly_income * lost_hours
            
            hourly_income = worker.avg_daily_income / 8
            compensation = int(hourly_income * lost_hours)
            
            # Step 8: Create Claim
            claim = Claim.objects.create(
                worker=worker,
                event=event,
                lost_hours=lost_hours,
                compensation=compensation,
                status='PENDING'
            )
            
            # Step 10: Fraud Detection Evaluation (Async)
            run_fraud_check.delay(claim.claim_id)

@shared_task
def run_fraud_check(claim_id):
    """
    Perform fraud checks and approve for payment.
    """
    try:
        claim = Claim.objects.get(claim_id=claim_id)
    except Claim.DoesNotExist:
        return
        
    # Check 1: GPS location (Simulated distance from zone center in km)
    distance_km = random.uniform(0, 15)
    
    # Step 10: Fraud Detection Evaluation (Actual ML Anomaly Detection)
    from ai_engine.risk_calculator import audit_claim_for_fraud
    passed_fraud_check = audit_claim_for_fraud(
        lost_hours=claim.lost_hours,
        compensation=claim.compensation,
        distance_km=distance_km
    )
    
    if passed_fraud_check:
        claim.status = 'PAID'
        claim.save()
        print(f"ML Audit Passed: Payout of ₹{claim.compensation} processed for {claim.worker.name}")
    else:
        print(f"ML Audit Failed: Fraud flagged for Claim ID: {claim.claim_id}")
