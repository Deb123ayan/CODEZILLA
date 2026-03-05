from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import Worker
from claims.models import Claim
from events.models import Event
from django.db.models import Count, Sum

class AdminWorkerListView(APIView):
    def get(self, request):
        workers = Worker.objects.all().values('name', 'platform', 'city', 'zone', 'avg_daily_income')
        return Response(workers)

class AdminRiskHeatmapView(APIView):
    def get(self, request):
        # Count events per zone for heatmap
        heatmap = Event.objects.values('zone').annotate(event_count=Count('event_id'))
        return Response(heatmap)

class AdminClaimsMonitoringView(APIView):
    def get(self, request):
        stats = {
            "total_claims": Claim.objects.count(),
            "paid_claims": Claim.objects.filter(status='PAID').count(),
            "pending_claims": Claim.objects.filter(status='PENDING').count(),
            "total_payout": Claim.objects.aggregate(Sum('compensation'))['compensation__sum'] or 0
        }
        return Response(stats)
