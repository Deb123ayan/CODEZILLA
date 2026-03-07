from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.models import Worker
from ai_engine.risk_calculator import calculate_risk_and_premium
from .models import Policy
from datetime import date, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class PolicyQuoteQuerySerializer(serializers.Serializer):
    worker_id = serializers.UUIDField(help_text="UUID of the worker")


class PolicyQuoteView(generics.GenericAPIView):
    """
    GET /api/policy/quote/?worker_id=<uuid>
    Requires: Bearer <worker_jwt_token>
    Workers can only see their own quote. Staff can see any.
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

        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=worker.avg_daily_income,
            weather_risk=0.4,
            pollution_risk=0.3
        )

        return Response({
            "worker_id": worker_id,
            "zone": worker.zone,
            "avg_income": worker.avg_daily_income,
            "premium": quote['premium'],
            "coverage": quote['coverage'],
            "risks": quote['risks']
        })


class PolicyPurchaseView(APIView):
    """
    POST /api/policy/purchase/
    Requires: Bearer <worker_jwt_token>
    Workers can only purchase for themselves. Staff can purchase for any worker.
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

        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=worker.avg_daily_income,
            weather_risk=0.4,
            pollution_risk=0.3
        )

        policy = Policy.objects.create(
            worker=worker,
            weekly_premium=quote['premium'],
            coverage_limit=quote['coverage'],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7),
            status='ACTIVE'
        )

        return Response({
            "message": "Policy activated successfully",
            "policy_id": policy.policy_id,
            "policy_number": policy.policy_number,
            "worker": worker.name,
            "valid_until": policy.end_date
        }, status=status.HTTP_201_CREATED)
