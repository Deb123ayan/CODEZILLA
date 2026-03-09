from rest_framework.views import APIView
from rest_framework.response import Response
import re
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers, generics


class RiskPredictionQuerySerializer(serializers.Serializer):
    zone = serializers.CharField(required=False, default='Salt Lake')


class RealTimeRiskPredictionView(generics.GenericAPIView):
    """
    GET /api/risk/predict/?zone=<zone_name>
    AI-powered disruption forecast using real weather data.
    """
    @swagger_auto_schema(
        query_serializer=RiskPredictionQuerySerializer,
        responses={200: "Prediction returned"}
    )
    def get(self, request):
        from ai_engine.weather_service import WeatherService
        from ai_engine.risk_calculator import get_realtime_risk_alert

        zone = request.query_params.get('zone', 'Salt Lake')

        # Security: prevent injection
        zone = re.sub(r'[^a-zA-Z0-9 ]', '', zone)[:50]

        # Fetch real weather data instead of random
        coords = WeatherService.get_coordinates_for_zone(zone)
        if coords:
            lat, lng = coords
            weather = WeatherService.fetch_current_weather(lat, lng)
            aqi_data = WeatherService.fetch_air_quality(lat, lng)

            forecast_data = {
                "forecast_rain": weather.get('rain_3h_mm', 0) + weather.get('rain_1h_mm', 0),
                "forecast_wind": weather.get('wind_speed_kmh', 0),
                "aqi": aqi_data.get('aqi', 100),
                "temperature_c": weather.get('temperature_c', 30),
                "description": weather.get('description', 'unknown'),
                "source": weather.get('source', 'unknown'),
            }
        else:
            # Fallback for unknown zones
            import random
            forecast_data = {
                "forecast_rain": random.randint(50, 150),
                "forecast_wind": random.randint(5, 40),
                "aqi": random.randint(50, 500),
                "source": "simulated_fallback",
            }

        # AI Prediction
        prediction = get_realtime_risk_alert(
            zone=zone,
            forecast_rain=forecast_data['forecast_rain'],
            forecast_wind=forecast_data['forecast_wind'],
            aqi=forecast_data['aqi']
        )

        from datetime import datetime
        return Response({
            "zone": zone,
            "forecast_data": forecast_data,
            "ai_analysis": {
                "disruption_probability": prediction['probability'],
                "risk_level": prediction['risk_level'],
                "alert": prediction['alert_message'],
            },
            "timestamp": datetime.now().isoformat(),
        })
