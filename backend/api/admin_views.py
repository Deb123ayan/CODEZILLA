from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.models import Worker
from claims.models import Claim
from events.models import Event
from django.db.models import Count, Sum

class AdminWorkerListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        workers = Worker.objects.all().values(
            'id', 'name', 'platform', 'partner_id', 'city', 'zone',
            'avg_daily_income', 'weekly_earnings', 'vehicle_type',
            'is_verified', 'onboarding_completed', 'created_at'
        )
        return Response(list(workers))

class AdminRiskHeatmapView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        heatmap = Event.objects.values('zone').annotate(event_count=Count('event_id'))
        return Response(list(heatmap))

class AdminClaimsMonitoringView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stats = {
            "total_claims": Claim.objects.count(),
            "paid_claims": Claim.objects.filter(status='PAID').count(),
            "pending_claims": Claim.objects.filter(status='PENDING').count(),
            "total_payout": Claim.objects.aggregate(Sum('compensation'))['compensation__sum'] or 0
        }
        return Response(stats)
