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

            # ── FRAUD DETECTION / VERIFICATION ENGINE ──
            # Step 1: Default to Review if verification fails
            claim_status = 'PENDING_REVIEW'
            verification_note = "Awaiting verification..."
            v_data = {
                'delivery_id': str(delivery.id), 
                'type': cancel_type, 
                'reason': reason,
                'platform': platform,
                'agent_kept_items': delivery.agent_can_keep_items,
                'audit_trail': []
            }

            if delivery.worker:
                from ai_engine.weather_service import WeatherService
                
                # Check 1: Weather Verification
                if delivery.worker.latitude and delivery.worker.longitude:
                    if cancel_type == 'TRAFFIC':
                        # Traffic: bypass weather fraud checks, trust social proof
                        v_data['weather_check'] = {'fraud_flag': False, 'ignored': True}
                        v_data['audit_trail'].append("INFO: Traffic claim strictly checked via Social Proof.")
                    else:
                        v_res = WeatherService.verify_claim(
                            delivery.worker.latitude, 
                            delivery.worker.longitude, 
                            cancel_type
                        )
                        v_data['weather_check'] = v_res
                        
                        if v_res.get('claim_verified'):
                            claim_status = 'AUTO_APPROVED'
                            verification_note = "Weather verified at location."
                            v_data['audit_trail'].append("PASSED: Weather verified.")
                        elif v_res.get('fraud_flag'):
                            claim_status = 'PENDING_REVIEW' # Flag for review
                            verification_note = "Weather discrepancy detected."
                            v_data['audit_trail'].append(f"FLAGGED: {v_res.get('fraud_reason')}")
                        else:
                            v_data['audit_trail'].append("UNCERTAIN: Weather data inconclusive.")

                # Check 2: Neighborhood Consensus (Social Verification)
                # Traffic uses pure social proof, others use it as fallback
                if cancel_type == 'TRAFFIC':
                    recent_zone_cancels = Delivery.objects.filter(
                        worker__zone=delivery.worker.zone,
                        status='CANCELLED',
                        cancellation_type='TRAFFIC',
                        updated_at__gte=timezone.now() - timezone.timedelta(minutes=60)
                    ).exclude(pk=delivery.pk).count()
                    req_consensus = 1
                else:
                    recent_zone_cancels = Delivery.objects.filter(
                        worker__zone=delivery.worker.zone,
                        status='CANCELLED',
                        updated_at__gte=timezone.now() - timezone.timedelta(minutes=60)
                    ).exclude(pk=delivery.pk).count()
                    req_consensus = 2
                
                v_data['neighborhood_consensus'] = recent_zone_cancels
                if recent_zone_cancels >= req_consensus: # High correlation
                    v_data['audit_trail'].append(f"PASSED: {recent_zone_cancels} other agent reports found in {delivery.worker.zone}.")
                    if claim_status != 'AUTO_APPROVED' and not v_data.get('weather_check', {}).get('fraud_flag'):
                        claim_status = 'AUTO_APPROVED'
                        verification_note = "Consensus reached in zone."
                elif cancel_type == 'TRAFFIC':
                    v_data['audit_trail'].append(f"FAILED: No other agents reported traffic in {delivery.worker.zone}.")

                # Step 2: Finalize Claim
                active_policy = Policy.objects.filter(
                    worker=delivery.worker, status='ACTIVE'
                ).first()
                
                if active_policy:
                    event = Event.objects.create(
                        type='DELIVERY_CANCELLED',
                        zone=delivery.worker.zone,
                        severity=5 if claim_status == 'AUTO_APPROVED' else 3,
                        description=f"Automated claim for {platform} cancellation ({cancel_type}). Ref: {delivery.id}. {verification_note}"
                    )
                    
                    hourly_income = (delivery.worker.weekly_earnings / max(len(delivery.worker.working_days), 1)) / max(delivery.worker.working_hours, 1)
                    # Reduced compensation if pending review
                    base_comp = min(int(hourly_income * 0.5), active_policy.coverage_limit)
                    compensation = base_comp if claim_status == 'AUTO_APPROVED' else 0
                    
                    try:
                        claim = Claim.objects.create(
                            worker=delivery.worker,
                            policy=active_policy,
                            event=event,
                            claim_reason='DELIVERY_CANCELLED',
                            claim_date=timezone.now().date(),
                            lost_hours=1,
                            compensation=compensation,
                            status=claim_status,
                            verification_data=v_data
                        )
                        claim_info = {
                            "claim_id": str(claim.claim_id),
                            "status": claim.status,
                            "compensation": claim.compensation,
                            "audit_summary": v_data['audit_trail']
                        }
                    except Exception as e:
                        print(f"Error creating automated claim: {e}")

            return Response({
                "message": msg,
                "verification": verification_note,
                "delivery": DeliverySerializer(delivery).data,
                "automated_claim": claim_info
            })
        
        elif action == 'start':
            # Check if worker already has an ongoing delivery
            ongoing = Delivery.objects.filter(worker=delivery.worker, status='ONGOING').exists()
            if ongoing:
                return Response({"error": "You already have an ongoing delivery. Complete it first!"}, status=status.HTTP_400_BAD_REQUEST)
                
            delivery.status = 'ONGOING'
            delivery.save()
            return Response({
                "message": "Delivery started. Good luck!",
                "delivery": DeliverySerializer(delivery).data
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
        worker_id = request.query_params.get('worker_id')
        if worker_id:
            deliveries = Delivery.objects.filter(worker_id=worker_id)
        else:
            deliveries = Delivery.objects.all()
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)
