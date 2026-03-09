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
        forensics = ScreenshotForensics()
        total_score = 0
        docs_count = 0

        for key, file_obj in [('aadhar', aadhar), ('pan', pan)]:
            if file_obj:
                docs_count += 1
                image_bytes = file_obj.read()
                
                m_score, m_findings = forensics.check_metadata(image_bytes)
                i_score, i_findings = forensics.check_image_integrity(image_bytes)
                ai_score, ai_findings = forensics.check_ai_and_editing(image_bytes)
                
                doc_score = m_score + i_score + ai_score
                total_score += doc_score
                
                results[key] = {
                    "score": doc_score,
                    "findings": m_findings + i_findings + ai_findings,
                    "status": "PASS" if doc_score >= 20 else "FAIL" if doc_score < 5 else "REVIEW"
                }
                
                # Save record
                ScreenshotVerification.objects.create(
                    worker=worker,
                    screenshot=file_obj,
                    forensics_score=doc_score,
                    forensics_report=results[key],
                    status=results[key].get('status', 'PENDING')
                )

        # Average score and final verdict
        final_avg = total_score / docs_count if docs_count > 0 else 0
        
        if final_avg >= 20:
            worker.is_verified = True
            worker.save()
            verdict = "VERIFIED"
        elif final_avg >= 10:
            verdict = "HUMAN_REVIEW_REQUIRED"
        else:
            verdict = "REJECTED"

        return Response({
            "message": "Documents processed",
            "verdict": verdict,
            "average_trust_score": final_avg,
            "details": results
        }, status=status.HTTP_200_OK)

