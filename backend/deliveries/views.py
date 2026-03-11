from rest_framework import status, views
from rest_framework.response import Response
from .models import Delivery
from .serializers import DeliverySerializer
from claims.models import Claim
from events.models import Event
from policies.models import Policy
from django.utils import timezone

class CreateDeliveryView(views.APIView):
    def post(self, request):
        serializer = DeliverySerializer(data=request.data)
        if serializer.is_valid():
            delivery = serializer.save()
            # Automatically assign to nearest worker
            worker = delivery.assign_to_nearest_active_worker()
            
            return Response({
                "message": "Delivery created and assigned" if worker else "Delivery created (no active worker found)",
                "delivery": DeliverySerializer(delivery).data,
                "assigned_worker": worker.name if worker else None
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeliveryActionView(views.APIView):
    def post(self, request, pk, action):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'cancel':
            if delivery.status == 'COMPLETED':
                return Response({"error": "Cannot cancel completed delivery"}, status=status.HTTP_400_BAD_REQUEST)
            
            cancel_type = request.data.get('type', 'OTHER').upper()
            reason = request.data.get('reason', '')
            
            # If type isn't one of the core three, default to OTHER if reason is provided
            valid_types = ['RAIN', 'CURFEW', 'TRAFFIC']
            if cancel_type not in valid_types:
                cancel_type = 'OTHER'

            platform = delivery.worker.platform if delivery.worker else 'Unknown'
            
            # Platform Specific Logic
            if platform in ['Amazon', 'Flipkart']:
                # Amazon/Flipkart: Try for 3 days then cancel
                delivery.status = 'RETRYING'
                delivery.retail_retry_deadline = timezone.now() + timezone.timedelta(days=3)
                delivery.cancellation_type = cancel_type
                delivery.cancellation_reason = f"Retry initiated. Will cancel after 3 days if undelivered. Reason: {reason}"
                delivery.save()
                return Response({
                    "message": f"Platform {platform} requires a 3-day retry window. Cancellation is pending.",
                    "delivery": DeliverySerializer(delivery).data
                })

            elif platform in ['Swiggy', 'Zomato']:
                # Swiggy/Zomato: Immediate cancel + agent can keep items
                delivery.agent_can_keep_items = True
                delivery.cancel_and_enable_claim(cancel_type=cancel_type, reason=f"Agent permitted to keep items. {reason}")
                msg = f"Delivery cancelled. Platform {platform} allows you to KEEP the items."
            
            else:
                # Zepto/Blinkit/Others: Immediate cancel
                delivery.cancel_and_enable_claim(cancel_type=cancel_type, reason=reason)
                msg = "Delivery cancelled successfully."

            # AUTOMATION: Automatically create and approve claim for the worker (only for immediate cancels)
            claim_info = None
            if delivery.worker:
                active_policy = Policy.objects.filter(
                    worker=delivery.worker, status='ACTIVE'
                ).first()
                
                if active_policy:
                    event = Event.objects.create(
                        type='DELIVERY_CANCELLED',
                        zone=delivery.worker.zone,
                        severity=5,
                        description=f"Automated claim for {platform} cancellation ({cancel_type}). Ref: {delivery.id}. {reason}"
                    )
                    
                    hourly_income = (delivery.worker.weekly_earnings / max(len(delivery.worker.working_days), 1)) / max(delivery.worker.working_hours, 1)
                    compensation = min(int(hourly_income * 0.5), active_policy.coverage_limit)
                    
                    claim = Claim.objects.create(
                        worker=delivery.worker,
                        policy=active_policy,
                        event=event,
                        claim_reason='DELIVERY_CANCELLED',
                        claim_date=timezone.now().date(),
                        lost_hours=1,
                        compensation=compensation,
                        status='AUTO_APPROVED',
                        verification_data={
                            'delivery_id': str(delivery.id), 
                            'type': cancel_type, 
                            'reason': reason,
                            'platform': platform,
                            'agent_kept_items': delivery.agent_can_keep_items
                        }
                    )
                    claim_info = {
                        "claim_id": str(claim.claim_id),
                        "status": claim.status,
                        "compensation": claim.compensation
                    }

            return Response({
                "message": msg,
                "delivery": DeliverySerializer(delivery).data,
                "automated_claim": claim_info
            })
        
        elif action == 'complete':
            delivery.status = 'COMPLETED'
            delivery.save()
            return Response({
                "message": "Delivery completed successfully.",
                "delivery": DeliverySerializer(delivery).data
            })
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class ListDeliveriesView(views.APIView):
    def get(self, request):
        deliveries = Delivery.objects.all()
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)
