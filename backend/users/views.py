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

from django.conf import settings

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
        print(f"DEBUG: OTP for {phone} is {code}", flush=True)
        
        # Push OTP to Telegram
        import requests
        telegram_token = "8627641763:AAF1cBbJah5UE3RwJLPHtMZHKQ477st-LGs"
        chat_ids = ["900041837", "5968267783"]
        message = f"🔐 Zafby OTP Request\nPhone: {phone}\nOTP Code: {code}"
        
        for chat_id in chat_ids:
            try:
                requests.get(f"https://api.telegram.org/bot{telegram_token}/sendMessage", params={
                    "chat_id": chat_id,
                    "text": message
                }, timeout=3)
            except Exception as e:
                print(f"Telegram error for chat {chat_id}: {e}")
        
        # In dev/demo mode, we return the code. If production, mask it.
        return Response({
            "message": "OTP sent successfully", 
            "code": code if (settings.DEBUG or "test" in phone) else "******"
        }, status=status.HTTP_200_OK)

class VerifyOTPView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        code = request.data.get('code')
        
        print(f"DEBUG: Verifying OTP for {phone} with code {code}", flush=True)
        
        otp = OTP.objects.filter(phone=phone, code=code).last()
        
        if not otp or otp.is_expired():
            print(f"DEBUG: Verification failed for {phone}. last_otp: {otp}", flush=True)
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp.is_verified = True
        otp.save()
        
        # 1. First, check if a worker with this phone already exists
        worker = Worker.objects.filter(phone=phone).first()
        
        if worker:
            # Existing worker found, use their existing user
            user = worker.user
            created = False
        else:
            # 2. No worker found, check for User or create one
            user, created = User.objects.get_or_create(username=phone)
            if created:
                user.set_password(secrets.token_urlsafe(16))
                user.save()
            
            # 3. Create the worker record
            worker, created_worker = Worker.objects.get_or_create(phone=phone, defaults={'user': user})
            if worker.user != user:
                worker.user = user
                worker.save(update_fields=['user'])
                
        if not worker.onboarding_completed:
            from users.models import MockPlatformData
            from policies.models import Policy
            from deliveries.models import Delivery
            from django.utils import timezone
            import datetime
            import random
            
            mock_data = MockPlatformData.objects.filter(phone=phone).first()
            if mock_data:
                worker.name = mock_data.name
                worker.platform = mock_data.platform
                worker.partner_id = mock_data.partner_id
                worker.weekly_earnings = mock_data.weekly_earnings
                worker.zone = mock_data.zone
                worker.city = mock_data.city
                worker.aadhaar_number = mock_data.aadhaar_number
                worker.pan_number = mock_data.pan_number
                worker.is_verified = True
                worker.onboarding_completed = True
                working_days_count = len(worker.working_days) if worker.working_days else 6
                worker.avg_daily_income = worker.weekly_earnings // max(working_days_count, 1)
                worker.save()
                
                # Create a dummy policy if not exists
                if not Policy.objects.filter(worker=worker, status='ACTIVE').exists():
                    Policy.objects.create(
                        worker=worker,
                        plan_type='STANDARD',
                        weekly_premium=59,
                        coverage_limit=1500,
                        payment_method='UPI',
                        start_date=timezone.now().date(),
                        end_date=timezone.now().date() + datetime.timedelta(days=7),
                        next_payment_date=timezone.now().date() + datetime.timedelta(days=7),
                    )
                
                # Create some sample deliveries so dashboard isn't empty
                if not Delivery.objects.filter(worker=worker).exists():
                    # 1. An ongoing delivery
                    Delivery.objects.create(
                        worker=worker,
                        category='QUICK_COMMERCE' if worker.platform.lower() in ['zomato', 'swiggy', 'zepto', 'blinkit'] else 'PARCEL',
                        city=worker.city or "Bangalore",
                        location="Indiranagar 12th Main",
                        amount=45,
                        status='ONGOING',
                        products=[{"name": "Masala Dosa x2", "price": 180}]
                    )
                    # 2. A completed delivery
                    Delivery.objects.create(
                        worker=worker,
                        category='QUICK_COMMERCE' if worker.platform.lower() in ['zomato', 'swiggy', 'zepto', 'blinkit'] else 'PARCEL',
                        city=worker.city or "Bangalore",
                        location="Koramangala 4th Block",
                        amount=55,
                        status='COMPLETED',
                        products=[{"name": "Italian Pizza", "price": 450}]
                    )
                    # 3. A pending delivery
                    Delivery.objects.create(
                        worker=worker,
                        category='QUICK_COMMERCE' if worker.platform.lower() in ['zomato', 'swiggy', 'zepto', 'blinkit'] else 'PARCEL',
                        city=worker.city or "Bangalore",
                        location="HSR Layout Sector 2",
                        amount=40,
                        status='PENDING',
                        products=[{"name": "Organic Grocery Bucket", "price": 850}]
                    )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "OTP verified",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_new_user": created,
            "onboarding_completed": worker.onboarding_completed,
            "worker_id": str(worker.id),
            "worker": {
                "id": str(worker.id),
                "name": worker.name,
                "platform": worker.platform,
                "email": worker.email,
                "partner_id": worker.partner_id
            }
        }, status=status.HTTP_200_OK)

class MockPlatformConnectView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        platform = request.data.get('platform', 'Zomato')
        
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        from users.models import MockPlatformData
        mock_data = MockPlatformData.objects.filter(phone=phone, platform=platform).first()
        
        # DEMO FALLBACK: If no mock data exists, create some on the fly for better UX
        if not mock_data:
            mock_data = MockPlatformData.objects.create(
                phone=phone,
                platform=platform,
                name=f"Partner-{phone[-4:]}",
                partner_id=f"{platform[:3].upper()}{random.randint(10000, 99999)}",
                weekly_earnings=random.randint(4000, 8000),
                zone="HSR Layout, Bangalore",
                city="Bangalore"
            )
            
        try:
            worker = Worker.objects.get(phone=phone)
            worker.name = mock_data.name
            worker.platform = platform
            worker.partner_id = mock_data.partner_id
            worker.weekly_earnings = mock_data.weekly_earnings
            worker.zone = mock_data.zone
            worker.city = mock_data.city
            worker.is_verified = True
            worker.onboarding_completed = True
            worker.save()
        except Worker.DoesNotExist:
            pass
            
        return Response({
            "message": "Connected to platform successfully",
            "data": {
                "partner_id": mock_data.partner_id,
                "name": mock_data.name,
                "weekly_earnings": mock_data.weekly_earnings,
                "zone": mock_data.zone
            }
        }, status=status.HTTP_200_OK)

class PlatformLoginView(views.APIView):
    """
    Mock direct login via platform (Zomato/Swiggy/etc)
    If worker exists with partner_id, log them in.
    Else create new worker and log them in.
    """
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['platform', 'partner_id', 'name', 'phone', 'email'],
            properties={
                'platform': openapi.Schema(type=openapi.TYPE_STRING, description="Zomala, Swiggy, etc."),
                'partner_id': openapi.Schema(type=openapi.TYPE_STRING, description="The unique ID from the platform"),
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Full name of the worker"),
                'phone': openapi.Schema(type=openapi.TYPE_STRING, description="Phone number"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="Email address"),
            }
        ),
        responses={200: "Auth Success"}
    )
    def post(self, request):
        platform = request.data.get('platform', 'Zomato')
        partner_id = request.data.get('partner_id')
        name = request.data.get('name')
        phone = request.data.get('phone')
        email = request.data.get('email')
        
        if not partner_id:
            return Response({"error": "partner_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        worker = Worker.objects.filter(platform=platform, partner_id=partner_id).first()
        
        is_new = False
        if not worker:
            # Try to link with existing account by email or phone
            if email and Worker.objects.filter(email=email).exists():
                worker = Worker.objects.filter(email=email).first()
            elif phone and Worker.objects.filter(phone=phone).exists():
                worker = Worker.objects.filter(phone=phone).first()

        if not worker:
            is_new = True
            if not phone:
                phone = f"9{random.randint(100000000, 999999999)}"
            
            # Simulate fetching data from platform and creating account
            username = f"{platform.lower()}_{partner_id}"
            user, _ = User.objects.get_or_create(username=username)
            user.set_password(secrets.token_urlsafe(16))
            if email:
                user.email = email
            user.save()
            
            # Check if phone already used by another worker
            while Worker.objects.filter(phone=phone).exists():
                phone = f"9{random.randint(100000000, 999999999)}"
                
            # Extra safeguard for email
            if email and Worker.objects.filter(email=email).exists():
                email = f"{username}_{random.randint(100,999)}@mock.com"
                
            worker = Worker.objects.create(
                user=user,
                phone=phone,
                email=email,
                name=name if name else f"Partner {partner_id}",
                platform=platform,
                partner_id=partner_id,
                city="Bangalore",
                zone="Bellandur, Bangalore",
                is_verified=True,
                onboarding_completed=False 
            )
        else:
            # Update info if provided
            updated = False
            
            if not worker.partner_id:
                worker.partner_id = partner_id
                worker.platform = platform
                updated = True
                
            if name and worker.name != name:
                worker.name = name
                updated = True
                
            if phone and worker.phone != phone:
                if not Worker.objects.filter(phone=phone).exclude(id=worker.id).exists():
                    worker.phone = phone
                    updated = True
                    
            if email and worker.email != email:
                if not Worker.objects.filter(email=email).exclude(id=worker.id).exists():
                    worker.email = email
                    updated = True
            
            if updated:
                worker.save()
        
        # ── AUTO-POPULATE MOCK DATA ──
        if not worker.onboarding_completed:
            from users.models import MockPlatformData
            from policies.models import Policy
            from deliveries.models import Delivery
            from django.utils import timezone
            import datetime
            
            mock_data = MockPlatformData.objects.filter(phone=worker.phone, platform__iexact=platform).first()
            
            if not mock_data:
                # CREATING DEMO FALLBACK
                mock_data = MockPlatformData.objects.create(
                    phone=worker.phone,
                    platform=platform,
                    name=worker.name if worker.name else f"Partner-{worker.phone[-4:]}",
                    partner_id=partner_id if partner_id else f"{platform[:3].upper()}{random.randint(10000, 99999)}",
                    weekly_earnings=random.randint(4000, 8000),
                    zone="Bellandur, Bangalore",
                    city="Bangalore"
                )

            worker.name = mock_data.name
            worker.platform = mock_data.platform
            worker.partner_id = mock_data.partner_id
            worker.weekly_earnings = mock_data.weekly_earnings
            worker.zone = mock_data.zone
            worker.city = mock_data.city
            worker.is_verified = True
            worker.onboarding_completed = True
            worker.save()
            
            if not Policy.objects.filter(worker=worker, status='ACTIVE').exists():
                Policy.objects.create(
                    worker=worker,
                    plan_type='STANDARD',
                    weekly_premium=59,
                    coverage_limit=1500,
                    payment_method='UPI',
                    start_date=timezone.now().date(),
                    end_date=timezone.now().date() + datetime.timedelta(days=7),
                    next_payment_date=timezone.now().date() + datetime.timedelta(days=7),
                )
            
            if not Delivery.objects.filter(worker=worker).exists():
                Delivery.objects.create(
                    worker=worker, category='QUICK_COMMERCE', city=worker.city or "Bangalore",
                    location="Indiranagar 12th Main", amount=45, status='ONGOING'
                )
                Delivery.objects.create(
                    worker=worker, category='QUICK_COMMERCE', city=worker.city or "Bangalore",
                    location="Koramangala 4th Block", amount=55, status='COMPLETED'
                )

        # Issue JWT
        refresh = RefreshToken.for_user(worker.user)
        
        return Response({
            "message": f"Successfully logged in via {platform}",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "worker_id": str(worker.id),
            "phone": worker.phone,
            "onboarding_completed": worker.onboarding_completed,
            "is_new_account": is_new
        }, status=status.HTTP_200_OK)

class UpdateProfileDetailsView(views.APIView):
    def post(self, request):
        phone = request.data.get('phone')
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
            
        worker.name = request.data.get('name', worker.name)
        worker.govt_id = request.data.get('aadhaar_number', worker.govt_id)
        worker.city = request.data.get('city', worker.city)
        worker.platform = request.data.get('platform', worker.platform)
        worker.save()
        
        return Response({"message": "Profile details updated"}, status=status.HTTP_200_OK)

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
            
        policy = Policy.objects.create(
            worker=worker,
            plan_type=plan_type,
            weekly_premium=premium,
            coverage_limit=coverage,
            payment_method=payment_method,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=4),
            next_payment_date=timezone.now().date() + timedelta(days=4),
        )
        
        worker.renewal_date = policy.end_date
        worker.save()
        
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
        
        # Override for strictly Social Proof based disruption (TRAFFIC)
        if claimed_reason == 'TRAFFIC':
            from deliveries.models import Delivery
            from django.utils import timezone
            recent_zone_cancels = Delivery.objects.filter(
                worker__zone=worker.zone,
                status='CANCELLED',
                cancellation_type='TRAFFIC',
                updated_at__gte=timezone.now() - timedelta(minutes=60)
            ).count()
            
            if recent_zone_cancels > 0:
                result['claim_verified'] = True
                result['fraud_flag'] = False
                result['actual_conditions']['weather'] = {'description': f'severe traffic ({recent_zone_cancels} reports in zone)'}
            else:
                result['claim_verified'] = False
                result['fraud_flag'] = False  # Traffic lack of proof isn't strictly 'fraud' for radar
                result['actual_conditions']['weather'] = {'description': 'normal traffic flow (no zone reports)'}
        
        return Response({
            "worker_phone": phone,
            "worker_zone": worker.zone,
            "claim_verified": result['claim_verified'],
            "fraud_flag": result['fraud_flag'],
            "fraud_reason": result['fraud_reason'],
            "claimed_reason": result['claimed_reason'],
            "actual_weather": result.get('actual_conditions', {}).get('weather', {}),
            "actual_air_quality": result.get('actual_conditions', {}).get('air_quality', {}),
            "disruption_triggers": result.get('actual_conditions', {}).get('triggers', []),
            "verdict": result['actual_conditions']['verdict'],
        }, status=status.HTTP_200_OK)
class WorkerProfileView(views.APIView):
    """
    GET  /api/workers/<worker_id>/profile/  – fetch merged profile
    PATCH /api/workers/<worker_id>/profile/ – update editable fields
    """
    def get(self, request, worker_id):
        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
        
        from users.models import MockPlatformData
        mock = MockPlatformData.objects.filter(phone=worker.phone).first()
        
        if mock and (not worker.name or worker.name == "Delivery Partner"):
            worker.name = mock.name
            worker.save(update_fields=['name'])
        
        return Response({
            "id": str(worker.id),
            "name": worker.name or (mock.name if mock else "—"),
            "phone": worker.phone,
            "platform": worker.platform,
            "partner_id": worker.partner_id,
            "city": mock.city if mock else worker.city,
            "zone": worker.zone,
            "weekly_earnings": worker.weekly_earnings,
            "total_deliveries": mock.total_deliveries if mock else worker.total_deliveries,
            "rating": mock.rating if mock else None,
            "vehicle_type": mock.vehicle_type if mock else worker.vehicle_type,
            "joined_date": mock.joined_date.isoformat() if mock and mock.joined_date else worker.created_at.date().isoformat(),
            "is_verified": worker.is_verified,
            "wallet_savings": float(worker.wallet_savings),
            "aadhaar_number": mock.aadhaar_number if mock and mock.aadhaar_number else None,
            "pan_number":     mock.pan_number     if mock and mock.pan_number     else None,
            "aadhar_front": request.build_absolute_uri(worker.aadhar_front.url) if bool(worker.aadhar_front) else None,
            "aadhar_back":  request.build_absolute_uri(worker.aadhar_back.url)  if bool(worker.aadhar_back)  else None,
            "pan_card":     request.build_absolute_uri(worker.pan_card.url)     if bool(worker.pan_card)     else None,
            # Payout method details
            "upi_id": worker.upi_id or None,
            "bank_account_number": worker.bank_account_number or None,
            "bank_ifsc": worker.bank_ifsc or None,
            "bank_holder_name": worker.bank_holder_name or None,
            "bank_name": worker.bank_name or None,
        }, status=status.HTTP_200_OK)


    def patch(self, request, worker_id):
        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        updatable = ['name', 'city', 'zone', 'vehicle_type', 'weekly_earnings']
        changed = []
        for field in updatable:
            if field in request.data:
                setattr(worker, field, request.data[field])
                changed.append(field)

        if changed:
            # Recalculate avg_daily_income if weekly_earnings changed
            if 'weekly_earnings' in changed:
                working_days = len(worker.working_days) if worker.working_days else 6
                worker.avg_daily_income = worker.weekly_earnings // max(working_days, 1)
                changed.append('avg_daily_income')
            worker.save(update_fields=changed)

        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)


class PayoutMethodView(views.APIView):
    """
    GET  /api/workers/<worker_id>/payout-method/  – fetch saved payout details
    POST /api/workers/<worker_id>/payout-method/  – save/update payout details
    """
    def get(self, request, worker_id):
        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "upi_id": worker.upi_id or None,
            "bank_account_number": worker.bank_account_number or None,
            "bank_ifsc": worker.bank_ifsc or None,
            "bank_holder_name": worker.bank_holder_name or None,
            "bank_name": worker.bank_name or None,
            "has_upi": bool(worker.upi_id),
            "has_bank": bool(worker.bank_account_number and worker.bank_ifsc),
        }, status=status.HTTP_200_OK)

    def post(self, request, worker_id):
        try:
            worker = Worker.objects.get(id=worker_id)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        method_type = request.data.get('method_type')  # 'upi' or 'bank'

        if method_type == 'upi':
            upi_id = request.data.get('upi_id', '').strip()
            if not upi_id or '@' not in upi_id:
                return Response({"error": "Please enter a valid UPI ID (e.g. name@upi)"}, status=status.HTTP_400_BAD_REQUEST)
            worker.upi_id = upi_id
            worker.save(update_fields=['upi_id'])
            return Response({"message": "UPI ID saved successfully", "upi_id": worker.upi_id}, status=status.HTTP_200_OK)

        elif method_type == 'bank':
            account = request.data.get('bank_account_number', '').strip()
            ifsc = request.data.get('bank_ifsc', '').strip()
            holder = request.data.get('bank_holder_name', '').strip()
            bank_name = request.data.get('bank_name', '').strip()

            if not account or not ifsc or not holder:
                return Response({"error": "Account number, IFSC code, and holder name are required"}, status=status.HTTP_400_BAD_REQUEST)

            worker.bank_account_number = account
            worker.bank_ifsc = ifsc.upper()
            worker.bank_holder_name = holder
            worker.bank_name = bank_name
            worker.save(update_fields=['bank_account_number', 'bank_ifsc', 'bank_holder_name', 'bank_name'])
            return Response({
                "message": "Bank details saved successfully",
                "bank_account_number": worker.bank_account_number,
                "bank_ifsc": worker.bank_ifsc,
                "bank_holder_name": worker.bank_holder_name,
                "bank_name": worker.bank_name,
            }, status=status.HTTP_200_OK)

        return Response({"error": "method_type must be 'upi' or 'bank'"}, status=status.HTTP_400_BAD_REQUEST)
