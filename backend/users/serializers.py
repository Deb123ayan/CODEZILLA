from rest_framework import serializers
from .models import Worker, OTP

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['phone', 'code']
