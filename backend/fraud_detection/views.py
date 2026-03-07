from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ScreenshotVerification
from .serializers import ScreenshotVerificationSerializer
from .services import ScreenshotForensics
from users.models import Worker
from django.utils import timezone

class VerifyScreenshotView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        phone = request.data.get('phone')
        file_obj = request.FILES.get('screenshot')
        
        if not phone or not file_obj:
            return Response({"error": "Phone and screenshot are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Save initial record
        verification = ScreenshotVerification.objects.create(
            worker=worker,
            screenshot=file_obj
        )

        # 2. Run Forensics
        image_bytes = file_obj.read()
        forensics = ScreenshotForensics()
        
        metadata_score, metadata_findings = forensics.check_metadata(image_bytes)
        integrity_score, integrity_findings = forensics.check_image_integrity(image_bytes)
        
        forensics_score = metadata_score + integrity_score
        forensics_report = {
            "metadata": metadata_findings,
            "integrity": integrity_findings
        }

        # 3. Update Verification
        verification.forensics_score = forensics_score
        verification.forensics_report = forensics_report
        
        # Simple status logic for now (mocking OCR/Platform checks as 0 for this step)
        verification.total_trust_score = forensics_score
        if forensics_score >= 20:
            verification.status = 'VERIFIED'
            verification.verified_at = timezone.now()
            # Update worker status
            worker.is_verified = True
            worker.save()
        elif forensics_score >= 10:
            verification.status = 'REVIEW'
        else:
            verification.status = 'FAILED'
            
        verification.save()

        serializer = ScreenshotVerificationSerializer(verification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
