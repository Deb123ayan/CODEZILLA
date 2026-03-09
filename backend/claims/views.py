from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from django.db import IntegrityError
from datetime import date

from .models import Claim
from users.models import Worker
from policies.models import Policy
from events.models import Event


class ClaimSubmitView(views.APIView):
    """
    POST /api/claims/submit/
    Core parametric claim flow:
    1. Validate worker has an active policy
    2. Check for duplicate claim (same day + reason)
    3. Call WeatherService for parametric verification
    4. Auto-create Event + Claim if verified
    5. Run fraud anomaly check
    6. Return instant verdict
    """

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['worker_id', 'claim_reason'],
            properties={
                'worker_id': openapi.Schema(type=openapi.TYPE_STRING, description="UUID of the worker"),
                'claim_reason': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Disruption reason: WEATHER, RAIN, HEAT, AQI, POLLUTION, STORM, FLOOD, CURFEW, STRIKE, ZONE_CLOSURE"
                ),
                'lost_hours': openapi.Schema(type=openapi.TYPE_INTEGER, description="Hours of work lost (optional, auto-calculated if omitted)"),
            }
        ),
        responses={
            201: "Claim created and approved",
            200: "Claim rejected — conditions don't match",
            400: "Bad request / Duplicate claim",
            404: "Worker not found",
        }
    )
    def post(self, request):
        from ai_engine.weather_service import WeatherService
        from ai_engine.risk_calculator import audit_claim_for_fraud, compute_gps_distance

        worker_id = request.data.get('worker_id')
        claim_reason = request.data.get('claim_reason', 'WEATHER').upper()
        lost_hours_input = request.data.get('lost_hours')

        if not worker_id:
            return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # ── 1. Find worker ─────────────────────────────────────────────
        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        # ── 2. Check active policy ─────────────────────────────────────
        active_policy = Policy.objects.filter(
            worker=worker,
            status='ACTIVE',
            start_date__lte=date.today(),
            end_date__gte=date.today()
        ).first()

        if not active_policy:
            return Response(
                {"error": "No active policy found. Purchase or renew a policy first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── 3. Duplicate claim check ───────────────────────────────────
        existing = Claim.objects.filter(
            worker=worker,
            claim_date=date.today(),
            claim_reason=claim_reason
        ).exists()

        if existing:
            return Response(
                {"error": f"Duplicate claim: You already filed a '{claim_reason}' claim today."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── 4. Parametric weather verification ─────────────────────────
        # Social disruptions (CURFEW, STRIKE, ZONE_CLOSURE) are admin-reported,
        # so we check if a matching Event exists in the DB instead of weather API
        social_reasons = ['CURFEW', 'STRIKE', 'ZONE_CLOSURE']

        if claim_reason in social_reasons:
            # Check if there's a recent social event for this zone
            recent_event = Event.objects.filter(
                type=claim_reason,
                zone__icontains=worker.zone.split(',')[0].strip(),
                timestamp__date=date.today()
            ).first()

            if not recent_event:
                return Response({
                    "claim_verified": False,
                    "verdict": "REJECTED",
                    "reason": f"No confirmed '{claim_reason}' event found for zone '{worker.zone}' today.",
                    "message": "Social disruptions must be reported by admin before claims can be filed."
                }, status=status.HTTP_200_OK)

            # Create claim for verified social event
            lost_hours = int(lost_hours_input) if lost_hours_input else 4
            hourly_income = (worker.weekly_earnings / max(len(worker.working_days), 1)) / worker.working_hours
            compensation = min(int(hourly_income * lost_hours), active_policy.coverage_limit)

            try:
                claim = Claim.objects.create(
                    worker=worker,
                    policy=active_policy,
                    event=recent_event,
                    claim_reason=claim_reason,
                    claim_date=date.today(),
                    lost_hours=lost_hours,
                    compensation=compensation,
                    status='AUTO_APPROVED',
                    verification_data={
                        'method': 'social_event_lookup',
                        'event_id': str(recent_event.event_id),
                        'event_type': recent_event.type,
                    }
                )
            except IntegrityError:
                return Response({"error": "Duplicate claim for today."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "claim_verified": True,
                "verdict": "AUTO_APPROVED",
                "claim_id": str(claim.claim_id),
                "compensation": compensation,
                "lost_hours": lost_hours,
                "message": f"Claim approved based on confirmed {claim_reason} event in your zone."
            }, status=status.HTTP_201_CREATED)

        # ── Weather-based claims: verify parametrically ─────────────────
        lat, lng = worker.latitude, worker.longitude
        if not lat or not lng:
            coords = WeatherService.get_coordinates_for_zone(worker.zone)
            if coords:
                lat, lng = coords
            else:
                return Response(
                    {"error": "No location data. Update your GPS location first."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Call weather verification
        verification = WeatherService.verify_claim(lat, lng, claim_reason)

        if not verification['claim_verified']:
            return Response({
                "claim_verified": False,
                "verdict": "REJECTED",
                "claimed_reason": claim_reason,
                "fraud_flag": verification['fraud_flag'],
                "fraud_reason": verification['fraud_reason'],
                "actual_weather": verification['actual_conditions']['weather']['description'],
                "actual_aqi": verification['actual_conditions']['air_quality']['aqi'],
                "message": "Weather conditions do not support your claim. No disruption detected."
            }, status=status.HTTP_200_OK)

        # ── 5. Conditions verified — create Event + Claim ──────────────
        conditions = verification['actual_conditions']
        trigger = conditions['triggers'][0] if conditions['triggers'] else {}

        event = Event.objects.create(
            type=claim_reason if claim_reason in ['RAIN', 'HEAT', 'STORM', 'FLOOD'] else 'WEATHER',
            zone=worker.zone,
            severity=int(trigger.get('severity', 'HIGH') == 'HIGH') * 8 + 5,
            description=f"Auto-detected: {trigger.get('detail', conditions['weather']['description'])}",
            reported_by='parametric_system',
        )

        # Calculate compensation
        lost_hours = int(lost_hours_input) if lost_hours_input else min(worker.working_hours, 6)
        hourly_income = (worker.weekly_earnings / max(len(worker.working_days), 1)) / max(worker.working_hours, 1)
        compensation = min(int(hourly_income * lost_hours), active_policy.coverage_limit)

        # ── 6. Fraud anomaly check ─────────────────────────────────────
        # Calculate distance from zone center
        zone_coords = WeatherService.get_coordinates_for_zone(worker.zone)
        if zone_coords and worker.latitude and worker.longitude:
            distance_km = compute_gps_distance(
                worker.latitude, worker.longitude,
                zone_coords[0], zone_coords[1]
            )
        else:
            distance_km = 0.0

        passed_fraud = audit_claim_for_fraud(
            lost_hours=lost_hours,
            compensation=compensation,
            distance_km=distance_km
        )

        fraud_score = 0.0 if passed_fraud else 0.85
        claim_status = 'AUTO_APPROVED' if passed_fraud else 'FRAUD_FLAGGED'

        try:
            claim = Claim.objects.create(
                worker=worker,
                policy=active_policy,
                event=event,
                claim_reason=claim_reason,
                claim_date=date.today(),
                lost_hours=lost_hours,
                compensation=compensation if passed_fraud else 0,
                status=claim_status,
                fraud_score=fraud_score,
                verification_data={
                    'method': 'parametric_weather_verification',
                    'weather': conditions['weather'],
                    'air_quality': conditions['air_quality'],
                    'triggers': conditions['triggers'],
                    'distance_from_zone_km': round(distance_km, 2),
                    'fraud_check_passed': passed_fraud,
                }
            )
        except IntegrityError:
            return Response({"error": "Duplicate claim for today."}, status=status.HTTP_400_BAD_REQUEST)

        response_data = {
            "claim_verified": True,
            "verdict": claim_status,
            "claim_id": str(claim.claim_id),
            "compensation": claim.compensation,
            "lost_hours": lost_hours,
            "disruption_type": trigger.get('type', claim_reason),
            "disruption_detail": trigger.get('detail', ''),
            "actual_weather": conditions['weather']['description'],
            "actual_aqi": conditions['air_quality']['aqi'],
        }

        if not passed_fraud:
            response_data["message"] = "Claim flagged for manual review by fraud detection system."
            return Response(response_data, status=status.HTTP_201_CREATED)

        response_data["message"] = "Claim auto-approved! Payout will be processed shortly."
        return Response(response_data, status=status.HTTP_201_CREATED)


class ClaimHistoryView(views.APIView):
    """
    GET /api/claims/history/?worker_id=<uuid>
    Returns all claims for a worker with status and payout details.
    """

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('worker_id', openapi.IN_QUERY, description="Worker UUID", type=openapi.TYPE_STRING),
        ],
        responses={200: "List of claims"}
    )
    def get(self, request):
        worker_id = request.query_params.get('worker_id')
        if not worker_id:
            return Response({"error": "worker_id query param is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        claims = Claim.objects.filter(worker=worker).values(
            'claim_id', 'claim_reason', 'claim_date', 'lost_hours',
            'compensation', 'status', 'fraud_score', 'created_at',
            'event__type', 'event__zone', 'event__severity',
            'policy__policy_number', 'policy__plan_type',
        )

        total_compensation = sum(c['compensation'] for c in claims if c['status'] in ['AUTO_APPROVED', 'PAID'])

        return Response({
            "worker_id": str(worker_id),
            "worker_name": worker.name,
            "total_claims": len(claims),
            "total_compensation": total_compensation,
            "claims": list(claims),
        }, status=status.HTTP_200_OK)
