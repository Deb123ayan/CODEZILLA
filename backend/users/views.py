from rest_framework import status, generics, views
from rest_framework.response import Response
from .models import Worker, OTP
from .serializers import WorkerSerializer, OTPSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
import secrets
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class GenerateOTPView(views.APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['phone'],
            properties={
                'phone': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        responses={200: "OTP Sent"}
    )
    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error": "Phone is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 6-digit OTP
        code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + timedelta(minutes=5)
        
        OTP.objects.create(phone=phone, code=code, expires_at=expires_at)
        
        # In real world, send SMS here. For demo, we just return it or log it.
        print(f"DEBUG: OTP for {phone} is {code}")
        
        return Response({"message": "OTP sent successfully", "code": code if "test" in phone else "******"}, status=status.HTTP_200_OK)

class VerifyOTPView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        code = request.data.get('code')
        
        otp = OTP.objects.filter(phone=phone, code=code).last()
        
        if not otp or otp.is_expired():
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp.is_verified = True
        otp.save()
        
        # Check if user exists, if not create a partial one or just return success
        user, created = User.objects.get_or_create(username=phone)
        if created:
            user.set_password(secrets.token_urlsafe(16))
            user.save()
        
        worker, _ = Worker.objects.get_or_create(phone=phone, user=user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "OTP verified",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_new_user": created,
            "onboarding_completed": worker.onboarding_completed
        }, status=status.HTTP_200_OK)

class MockPlatformConnectView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        platform = request.data.get('platform', 'Zomato')
        
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Mocking data generation
        partner_id = f"{platform[:3].upper()}{random.randint(100000, 999999)}"
        mock_name = "Rajesh Kumar" # In real app, might come from platform
        mock_earnings = random.randint(3500, 5500)
        mock_zone = "Koramangala, Bangalore"
        
        worker.name = mock_name
        worker.platform = platform
        worker.partner_id = partner_id
        worker.weekly_earnings = mock_earnings
        worker.zone = mock_zone
        worker.is_verified = True
        worker.save()
        
        return Response({
            "message": "Connected to platform successfully",
            "data": {
                "partner_id": partner_id,
                "name": mock_name,
                "weekly_earnings": mock_earnings,
                "zone": mock_zone
            }
        }, status=status.HTTP_200_OK)

class UpdateWorkDetailsView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
            
        worker.weekly_earnings = request.data.get('weekly_earnings', worker.weekly_earnings)
        worker.working_hours = request.data.get('working_hours', worker.working_hours)
        worker.working_days = request.data.get('working_days', worker.working_days)
        worker.vehicle_type = request.data.get('vehicle_type', worker.vehicle_type)
        
        # Auto-calculate avg_daily_income from weekly earnings
        working_days_count = len(worker.working_days) if worker.working_days else 6
        worker.avg_daily_income = worker.weekly_earnings // max(working_days_count, 1)
        worker.save()
        
        return Response({"message": "Work details updated"}, status=status.HTTP_200_OK)

class FinalizeOnboardingView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        plan_type = request.data.get('plan_type', 'STANDARD')
        payment_method = request.data.get('payment_method', 'MANUAL')
        
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Auto-calculate avg_daily_income from weekly earnings
        working_days_count = len(worker.working_days) if worker.working_days else 6
        worker.avg_daily_income = worker.weekly_earnings // max(working_days_count, 1)
        worker.onboarding_completed = True
        worker.save()
        
        # Create Policy with dynamic risk-based premium
        from policies.models import Policy
        from ai_engine.risk_calculator import calculate_risk_and_premium, compute_dynamic_risk
        
        weather_risk, pollution_risk = compute_dynamic_risk(
            zone=worker.zone, lat=worker.latitude, lng=worker.longitude
        )
        
        quote = calculate_risk_and_premium(
            zone=worker.zone,
            avg_income=worker.avg_daily_income,
            weather_risk=weather_risk,
            pollution_risk=pollution_risk,
            platform=worker.platform
        )
        
        premium = max(int(quote['premium']), 30)  # Minimum ₹30/week
        if worker.is_verified:
            premium = int(premium * 0.9)  # 10% verified discount
        
        coverage = max(int(quote['coverage']), 500)  # Minimum ₹500 coverage
        if plan_type == 'PREMIUM':
            premium = int(premium * 1.5)
            coverage = int(coverage * 1.5)
            
        Policy.objects.create(
            worker=worker,
            plan_type=plan_type,
            weekly_premium=premium,
            coverage_limit=coverage,
            payment_method=payment_method,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=7),
            next_payment_date=timezone.now().date() + timedelta(days=7),
        )
        
        return Response({
            "message": "Onboarding finalized and protection started",
            "weekly_premium": premium,
            "coverage_limit": coverage,
            "risks_assessed": {"weather": weather_risk, "pollution": pollution_risk},
        }, status=status.HTTP_200_OK)

class WorkerRegisterView(generics.CreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

    def create(self, request, *args, **kwargs):
        # Fallback for old manual flow or direct API usage
        phone = request.data.get('phone')
        if not phone:
             return Response({"error": "Phone is required"}, status=status.HTTP_400_BAD_REQUEST)
             
        user, created = User.objects.get_or_create(username=phone)
        if created:
            user.set_password(secrets.token_urlsafe(16))
            user.save()
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        worker = serializer.save(user=user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Worker account created",
            "worker": serializer.data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class UpdateLocationView(views.APIView):
    """Save worker's GPS coordinates for weather-based fraud prevention."""
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['phone', 'latitude', 'longitude'],
            properties={
                'phone': openapi.Schema(type=openapi.TYPE_STRING, description="Worker phone number"),
                'latitude': openapi.Schema(type=openapi.TYPE_NUMBER, description="GPS latitude"),
                'longitude': openapi.Schema(type=openapi.TYPE_NUMBER, description="GPS longitude"),
            }
        ),
        responses={200: "Location updated"}
    )
    def post(self, request):
        phone = request.data.get('phone')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not phone or latitude is None or longitude is None:
            return Response({"error": "phone, latitude, and longitude are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
        
        worker.latitude = float(latitude)
        worker.longitude = float(longitude)
        worker.save()
        
        return Response({
            "message": "Location updated successfully",
            "latitude": worker.latitude,
            "longitude": worker.longitude,
        }, status=status.HTTP_200_OK)


class WeatherCheckView(views.APIView):
    """
    Check real-time weather & AQI at a worker's location.
    Uses worker's saved GPS or zone name to fetch actual conditions.
    """

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('phone', openapi.IN_QUERY, description="Worker phone number", type=openapi.TYPE_STRING),
            openapi.Parameter('lat', openapi.IN_QUERY, description="Override latitude", type=openapi.TYPE_NUMBER, required=False),
            openapi.Parameter('lng', openapi.IN_QUERY, description="Override longitude", type=openapi.TYPE_NUMBER, required=False),
        ],
        responses={200: "Weather data returned"}
    )
    def get(self, request):
        from ai_engine.weather_service import WeatherService
        
        phone = request.query_params.get('phone')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        # Option 1: Use provided lat/lng
        if lat and lng:
            lat, lng = float(lat), float(lng)
        # Option 2: Use worker's saved location
        elif phone:
            try:
                worker = Worker.objects.get(phone=phone)
            except Worker.DoesNotExist:
                return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if worker.latitude and worker.longitude:
                lat, lng = worker.latitude, worker.longitude
            else:
                # Fallback: try zone name
                coords = WeatherService.get_coordinates_for_zone(worker.zone)
                if coords:
                    lat, lng = coords
                else:
                    return Response({"error": "No location data. Ask worker to share GPS."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Provide 'phone' or 'lat'+'lng' query params"}, status=status.HTTP_400_BAD_REQUEST)
        
        conditions = WeatherService.check_disruption_conditions(lat, lng)
        
        return Response(conditions, status=status.HTTP_200_OK)


class VerifyClaimWeatherView(views.APIView):
    """
    Anti-fraud: Verify a worker's claim against REAL weather data.
    
    If worker says 'heavy rain' but weather API says clear skies → FRAUD.
    This is the core parametric insurance verification.
    """
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['phone', 'claimed_reason'],
            properties={
                'phone': openapi.Schema(type=openapi.TYPE_STRING, description="Worker phone number"),
                'claimed_reason': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Reason for claim: WEATHER, RAIN, HEAT, AQI, POLLUTION, STORM"
                ),
            }
        ),
        responses={200: "Verification result"}
    )
    def post(self, request):
        from ai_engine.weather_service import WeatherService
        
        phone = request.data.get('phone')
        claimed_reason = request.data.get('claimed_reason', 'WEATHER')
        
        if not phone:
            return Response({"error": "phone is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get worker's location
        lat, lng = worker.latitude, worker.longitude
        if not lat or not lng:
            coords = WeatherService.get_coordinates_for_zone(worker.zone)
            if coords:
                lat, lng = coords
            else:
                return Response({"error": "No location data for this worker"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify claim against real weather
        result = WeatherService.verify_claim(lat, lng, claimed_reason)
        
        return Response({
            "worker_phone": phone,
            "worker_zone": worker.zone,
            "claim_verified": result['claim_verified'],
            "fraud_flag": result['fraud_flag'],
            "fraud_reason": result['fraud_reason'],
            "claimed_reason": result['claimed_reason'],
            "actual_weather": result['actual_conditions']['weather'],
            "actual_air_quality": result['actual_conditions']['air_quality'],
            "disruption_triggers": result['actual_conditions']['triggers'],
            "verdict": result['actual_conditions']['verdict'],
        }, status=status.HTTP_200_OK)

