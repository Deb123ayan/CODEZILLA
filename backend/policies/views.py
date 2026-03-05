from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import Worker
from ai_engine.risk_calculator import calculate_risk_and_premium
from .models import Policy
from datetime import date, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers

class PolicyQuoteQuerySerializer(serializers.Serializer):
    worker_id = serializers.UUIDField(help_text="UUID of the worker")

from rest_framework import status, generics

class PolicyQuoteView(generics.GenericAPIView):
    serializer_class = PolicyQuoteQuerySerializer # Use for validation & docs
    
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
            
        # Mock weather risk and pollution risk (real scenario: fetch from external/DB)
        weather_risk = 0.4 
        pollution_risk = 0.3
        
        # Calculate premium
        quote = calculate_risk_and_premium(
            zone=worker.zone, 
            avg_income=worker.avg_daily_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk
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

        # Mock weather risk and pollution risk
        weather_risk = 0.4 
        pollution_risk = 0.3
        quote = calculate_risk_and_premium(
            zone=worker.zone, 
            avg_income=worker.avg_daily_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk
        )

        # Create policy
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
            "worker": worker.name,
            "valid_until": policy.end_date
        }, status=status.HTTP_201_CREATED)
