from rest_framework import serializers
from .models import ScreenshotVerification

class ScreenshotVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenshotVerification
        fields = '__all__'
        read_only_fields = ['forensics_score', 'ocr_score', 'platform_score', 
                           'cross_check_score', 'total_trust_score', 
                           'forensics_report', 'extracted_data', 'status']
