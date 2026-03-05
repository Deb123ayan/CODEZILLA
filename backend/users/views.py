from rest_framework import status, generics
from rest_framework.response import Response
from .models import Worker
from .serializers import WorkerSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User
import secrets

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class WorkerRegisterView(generics.CreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

    @swagger_auto_schema(
        request_body=WorkerSerializer,
        responses={201: openapi.Response("Worker created", WorkerSerializer)}
    )
    def create(self, request, *args, **kwargs):
        # We'll create a User object along with Worker
        phone = request.data.get('phone')
        name = request.data.get('name')
        
        if not phone:
             return Response({"error": "Phone is required"}, status=status.HTTP_400_BAD_REQUEST)
             
        # Check if user already exists
        if User.objects.filter(username=phone).exists():
             return Response({"error": "Phone already registered"}, status=status.HTTP_400_BAD_REQUEST)
             
        user = User.objects.create_user(
            username=phone,
            password=secrets.token_urlsafe(16),
            first_name=name
        )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        worker = serializer.save(user=user)
        
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Worker account created",
            "worker": serializer.data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
