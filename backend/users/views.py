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
            
        worker.onboarding_completed = True
        worker.save()
        
        # Create Policy
        from policies.models import Policy
        premium = 52 if plan_type == 'STANDARD' else 78
        if worker.is_verified:
            premium -= 5 # Verified discount
            
        Policy.objects.create(
            worker=worker,
            plan_type=plan_type,
            weekly_premium=premium,
            coverage_limit=800 if plan_type == 'STANDARD' else 1200,
            payment_method=payment_method,
            end_date=timezone.now().date() + timedelta(days=7)
        )
        
        return Response({"message": "Onboarding finalized and protection started"}, status=status.HTTP_200_OK)

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
