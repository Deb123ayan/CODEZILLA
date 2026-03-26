from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ScreenshotVerification
from .serializers import ScreenshotVerificationSerializer
from .services import ScreenshotForensics
from users.models import Worker
from django.utils import timezone
from ai_engine.kyc_service import KYCVerification
import tempfile
import os

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
        ai_score, ai_findings = forensics.check_ai_and_editing(image_bytes)
        
        forensics_score = metadata_score + integrity_score + ai_score
        forensics_report = {
            "metadata": metadata_findings,
            "integrity": integrity_findings,
            "ai_forensics": ai_findings
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

class VerifyDocumentView(views.APIView):
    """
    Specifically for Aadhaar and PAN uploads during Profile Setup.
    Runs deep forensics on both documents.
    """
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        phone = request.data.get('phone')
        aadhar = request.FILES.get('aadhar')
        pan = request.FILES.get('pan')
        
        if not phone or (not aadhar and not pan):
            return Response({"error": "Phone and at least one document required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            worker = Worker.objects.get(phone=phone)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        results = {}
        kyc_service = KYCVerification()
        total_score = 0
        docs_count = 0

        # Process Aadhaar
        if aadhar:
            docs_count += 1
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                for chunk in aadhar.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            # Part 1: Classifier (Is it an Aadhar card?)
            is_valid_type, confidence, pred_type = kyc_service.verify_document(tmp_path, expected_type='Aadhar')
            
            # Part 2: Forensics (Is it edited/fake?)
            forensics = ScreenshotForensics()
            with open(tmp_path, 'rb') as f:
                image_bytes = f.read()
            ai_score, ai_findings = forensics.check_ai_and_editing(image_bytes)
            os.unlink(tmp_path)

            is_authentic = (ai_score >= 0)
            is_verified = is_valid_type and is_authentic

            results['aadhar'] = {
                "verified": is_verified,
                "confidence": confidence,
                "detected_type": pred_type,
                "tampering_detected": not is_authentic,
                "forensics_findings": ai_findings,
                "status": "PASS" if is_verified else "FAIL"
            }
            if is_verified:
                worker.aadhar_front = aadhar
                worker.is_aadhar_verified = True

        # Process PAN
        if pan:
            docs_count += 1
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                for chunk in pan.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            # Part 1: Classifier
            is_valid_type, confidence, pred_type = kyc_service.verify_document(tmp_path, expected_type='PAN')
            
            # Part 2: Forensics
            with open(tmp_path, 'rb') as f:
                image_bytes = f.read()
            ai_score, ai_findings = forensics.check_ai_and_editing(image_bytes)
            os.unlink(tmp_path)

            is_authentic = (ai_score >= 0)
            is_verified = is_valid_type and is_authentic

            results['pan'] = {
                "verified": is_verified,
                "confidence": confidence,
                "detected_type": pred_type,
                "tampering_detected": not is_authentic,
                "forensics_findings": ai_findings,
                "status": "PASS" if is_verified else "FAIL"
            }
            if is_verified:
                worker.pan_card = pan
                worker.is_pan_verified = True

        # Final Verdict
        if worker.is_aadhar_verified and worker.is_pan_verified:
            worker.is_verified = True
            worker.kyc_submitted_at = timezone.now()
            verdict = "VERIFIED"
        elif docs_count > 0:
            verdict = "PARTIAL_OR_FAILED"
        else:
            verdict = "REJECTED"

        worker.save()

        return Response({
            "message": "KYC processing complete",
            "verdict": verdict,
            "details": results
        }, status=status.HTTP_200_OK)

