from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.models import Worker
from ai_engine.risk_calculator import calculate_risk_and_premium, compute_dynamic_risk
from .models import Policy
from datetime import date, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class PolicyQuoteQuerySerializer(serializers.Serializer):
    worker_id = serializers.UUIDField(help_text="UUID of the worker")


class PolicyQuoteView(generics.GenericAPIView):
    """
    GET /api/policy/quote/?worker_id=<uuid>
    Returns AI-calculated premium quote with DYNAMIC risk assessment.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PolicyQuoteQuerySerializer

    @swagger_auto_schema(
        query_serializer=PolicyQuoteQuerySerializer,
        responses={200: openapi.Response("Success", openapi.Schema(type=openapi.TYPE_OBJECT))}
    )
    def get(self, request, *args, **kwargs):
        worker_id = request.query_params.get('worker_id')
        if not worker_id:
            return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workers can only get their own quote; staff can see anyone's
        if not request.user.is_staff and worker.user != request.user:
            return Response({"error": "You can only view your own quote"}, status=status.HTTP_403_FORBIDDEN)

        # ── Dynamic risk calculation from real weather/AQI data ────────
        weather_risk, pollution_risk = compute_dynamic_risk(
            zone=worker.zone,
            lat=worker.latitude,
            lng=worker.longitude
        )

        # Use avg_daily_income; fallback to weekly_earnings / 6 if not set
        avg_income = worker.avg_daily_income
        if avg_income <= 0:
            working_days = len(worker.working_days) if worker.working_days else 6
            avg_income = worker.weekly_earnings // max(working_days, 1)

        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=avg_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk,
            platform=worker.platform
        )

        return Response({
            "worker_id": worker_id,
            "zone": worker.zone,
            "avg_income": avg_income,
            "premium": quote['premium'],
            "coverage": quote['coverage'],
            "risks": quote['risks'],
            "risk_source": "dynamic_weather_based"
        })


class PolicyPurchaseView(APIView):
    """
    POST /api/policy/purchase/
    Purchase and activate a weekly policy with dynamic pricing.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['worker_id', 'payment_status'],
            properties={
                'worker_id': openapi.Schema(type=openapi.TYPE_STRING, description="UUID of the worker"),
                'payment_status': openapi.Schema(type=openapi.TYPE_STRING, description="Set to 'SUCCESS' to simulate payment"),
            }
        ),
        responses={201: "Policy created", 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        worker_id = request.data.get('worker_id')
        payment_status = request.data.get('payment_status')

        if not worker_id:
            return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if payment_status != 'SUCCESS':
            return Response({"error": "Payment failed or not successful"}, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workers can only buy for themselves
        if not request.user.is_staff and worker.user != request.user:
            return Response({"error": "You can only purchase a policy for yourself"}, status=status.HTTP_403_FORBIDDEN)

        # Check for existing active policy
        existing = Policy.objects.filter(worker=worker, status='ACTIVE', end_date__gte=date.today()).first()
        if existing:
            return Response({
                "error": "You already have an active policy",
                "policy_number": existing.policy_number,
                "valid_until": existing.end_date
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── Dynamic risk calculation ───────────────────────────────────
        weather_risk, pollution_risk = compute_dynamic_risk(
            zone=worker.zone,
            lat=worker.latitude,
            lng=worker.longitude
        )

        avg_income = worker.avg_daily_income
        if avg_income <= 0:
            working_days = len(worker.working_days) if worker.working_days else 6
            avg_income = worker.weekly_earnings // max(working_days, 1)

        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=avg_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk,
            platform=worker.platform
        )

        policy = Policy.objects.create(
            worker=worker,
            platform=worker.platform,
            weekly_premium=quote['premium'],
            coverage_limit=quote['coverage'],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7),
            next_payment_date=date.today() + timedelta(days=7),
            status='ACTIVE'
        )

        return Response({
            "message": "Policy activated successfully",
            "policy_id": policy.policy_id,
            "policy_number": policy.policy_number,
            "worker": worker.name,
            "weekly_premium": policy.weekly_premium,
            "coverage_limit": policy.coverage_limit,
            "valid_until": policy.end_date,
            "risks_assessed": quote['risks'],
        }, status=status.HTTP_201_CREATED)


class PolicyRenewView(APIView):
    """
    POST /api/policy/renew/
    Renew an expired or about-to-expire policy for another 7 days.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['worker_id'],
            properties={
                'worker_id': openapi.Schema(type=openapi.TYPE_STRING, description="UUID of the worker"),
                'payment_status': openapi.Schema(type=openapi.TYPE_STRING, description="Set to 'SUCCESS'"),
            }
        ),
        responses={201: "Policy renewed"}
    )
    def post(self, request):
        worker_id = request.data.get('worker_id')
        payment_status = request.data.get('payment_status', 'SUCCESS')

        if not worker_id:
            return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        if payment_status != 'SUCCESS':
            return Response({"error": "Payment not successful"}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Check for existing active policy (still valid)
        existing_active = Policy.objects.filter(
            worker=worker, status='ACTIVE', end_date__gte=date.today()
        ).first()
        if existing_active:
            return Response({
                "message": "Policy is still active, no renewal needed yet.",
                "policy_number": existing_active.policy_number,
                "valid_until": existing_active.end_date
            }, status=status.HTTP_200_OK)

        # Expire any old active policies
        Policy.objects.filter(worker=worker, status='ACTIVE').update(status='EXPIRED')

        # Dynamic risk for new premium
        weather_risk, pollution_risk = compute_dynamic_risk(
            zone=worker.zone, lat=worker.latitude, lng=worker.longitude
        )

        avg_income = worker.avg_daily_income
        if avg_income <= 0:
            working_days = len(worker.working_days) if worker.working_days else 6
            avg_income = worker.weekly_earnings // max(working_days, 1)

        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=avg_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk,
            platform=worker.platform
        )

        new_policy = Policy.objects.create(
            worker=worker,
            platform=worker.platform,
            weekly_premium=quote['premium'],
            coverage_limit=quote['coverage'],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7),
            next_payment_date=date.today() + timedelta(days=7),
            status='ACTIVE'
        )

        return Response({
            "message": "Policy renewed successfully",
            "policy_id": new_policy.policy_id,
            "policy_number": new_policy.policy_number,
            "weekly_premium": new_policy.weekly_premium,
            "coverage_limit": new_policy.coverage_limit,
            "valid_until": new_policy.end_date,
            "risks_assessed": quote['risks'],
        }, status=status.HTTP_201_CREATED)


class PolicyStatusView(APIView):
    """
    GET /api/policy/status/?worker_id=<uuid>
    Check a worker's current policy status.
    """

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('worker_id', openapi.IN_QUERY, description="Worker UUID", type=openapi.TYPE_STRING),
        ],
        responses={200: "Policy status"}
    )
    def get(self, request):
        worker_id = request.query_params.get('worker_id')
        if not worker_id:
            return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        active_policy = Policy.objects.filter(
            worker=worker, status='ACTIVE', end_date__gte=date.today()
        ).first()

        all_policies = Policy.objects.filter(worker=worker).values(
            'policy_id', 'policy_number', 'plan_type', 'weekly_premium',
            'coverage_limit', 'start_date', 'end_date', 'status', 'payment_method'
        )

        return Response({
            "worker_id": str(worker_id),
            "has_active_policy": active_policy is not None,
            "active_policy": {
                "policy_id": str(active_policy.policy_id),
                "policy_number": active_policy.policy_number,
                "plan_type": active_policy.plan_type,
                "weekly_premium": active_policy.weekly_premium,
                "coverage_limit": active_policy.coverage_limit,
                "valid_until": active_policy.end_date,
                "days_remaining": (active_policy.end_date - date.today()).days,
            } if active_policy else None,
            "all_policies": list(all_policies),
        })
