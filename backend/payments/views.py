from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from claims.models import Claim

class PayoutProcessView(APIView):
    def post(self, request, *args, **kwargs):
        claim_id = request.data.get('claim_id')
        if not claim_id:
            return Response({"error": "claim_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            claim = Claim.objects.get(claim_id=claim_id)
        except Claim.DoesNotExist:
            return Response({"error": "Claim not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Call Actual Payment Gateway (e.g. Razorpay, Stripe, UPI Transfer)
        # For Demo: Assume Success
        claim.status = 'PAID'
        claim.save()
        
        return Response({
            "message": "Payout successful",
            "claim_id": claim_id,
            "amount": claim.compensation,
            "status": "PAID"
        })
