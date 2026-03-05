from rest_framework.views import APIView
from rest_framework.response import Response
import random
import re
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers, generics

class RiskPredictionQuerySerializer(serializers.Serializer):
    zone = serializers.CharField(required=False, default='Salt Lake')

class RealTimeRiskPredictionView(generics.GenericAPIView):
    """
    Winning Feature: AI Predication of upcoming risks based on forecasts.
    """
    @swagger_auto_schema(
        query_serializer=RiskPredictionQuerySerializer,
        responses={200: "Prediction returned"}
    )
    def get(self, request):
        zone = request.query_params.get('zone', 'Salt Lake')
        
        # Security: Prevent path traversal or shell characters in 'zone'
        import re
        zone = re.sub(r'[^a-zA-Z0-9 ]', '', zone)[:50] 
        
        # In a real scenario, this data comes from a weather forecast API like OpenWeatherMap
        simulated_data = {
            "forecast_rain": random.randint(50, 150),
            "forecast_wind": random.randint(5, 40),
            "aqi": random.randint(50, 500)
        }
        
        # Step 15: AI Prediction logic (Actual ML call)
        from ai_engine.risk_calculator import get_realtime_risk_alert
        prediction = get_realtime_risk_alert(
            zone=zone,
            forecast_rain=simulated_data['forecast_rain'],
            forecast_wind=simulated_data['forecast_wind'],
            aqi=simulated_data['aqi']
        )
        
        return Response({
            "zone": zone,
            "forecast_data": simulated_data,
            "ai_analysis": {
                "disruption_probability": prediction['probability'],
                "risk_level": prediction['risk_level'],
                "alert": prediction['alert_message']
            },
            "timestamp": "2026-03-07T00:00:00Z"
        })
