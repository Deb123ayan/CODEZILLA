from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.models import Worker
from claims.models import Claim
from policies.models import Policy
from events.models import Event
from fraud_detection.models import ScreenshotVerification
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import date, timedelta


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
        heatmap = Event.objects.values('zone').annotate(
            event_count=Count('event_id'),
            avg_severity=Avg('severity'),
        ).order_by('-event_count')
        return Response(list(heatmap))


class AdminClaimsMonitoringView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_compensation = Claim.objects.aggregate(Sum('compensation'))['compensation__sum'] or 0
        paid_compensation = Claim.objects.filter(
            status__in=['PAID', 'AUTO_APPROVED']
        ).aggregate(Sum('compensation'))['compensation__sum'] or 0

        stats = {
            "total_claims": Claim.objects.count(),
            "auto_approved_claims": Claim.objects.filter(status='AUTO_APPROVED').count(),
            "paid_claims": Claim.objects.filter(status='PAID').count(),
            "pending_claims": Claim.objects.filter(status='PENDING').count(),
            "rejected_claims": Claim.objects.filter(status='REJECTED').count(),
            "fraud_flagged_claims": Claim.objects.filter(status='FRAUD_FLAGGED').count(),
            "total_compensation": total_compensation,
            "paid_compensation": paid_compensation,
            # Breakdown by claim reason
            "by_reason": list(
                Claim.objects.values('claim_reason').annotate(
                    count=Count('claim_id'),
                    total_payout=Sum('compensation'),
                ).order_by('-count')
            ),
        }
        return Response(stats)


class AdminAnalyticsView(APIView):
    """
    GET /api/admin/analytics/
    Revenue metrics, worker growth, policy stats, and loss ratios.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        today = date.today()
        week_ago = today - timedelta(days=7)

        # Revenue: premiums collected
        total_premiums = Policy.objects.aggregate(Sum('weekly_premium'))['weekly_premium__sum'] or 0
        active_premiums = Policy.objects.filter(status='ACTIVE').aggregate(Sum('weekly_premium'))['weekly_premium__sum'] or 0

        # Payouts
        total_payouts = Claim.objects.filter(
            status__in=['PAID', 'AUTO_APPROVED']
        ).aggregate(Sum('compensation'))['compensation__sum'] or 0

        # Loss ratio
        loss_ratio = round(total_payouts / max(total_premiums, 1) * 100, 2)

        # Policy stats
        active_policies = Policy.objects.filter(status='ACTIVE', end_date__gte=today).count()
        expired_policies = Policy.objects.filter(Q(status='EXPIRED') | Q(end_date__lt=today)).count()
        total_policies = Policy.objects.count()

        # Worker growth
        total_workers = Worker.objects.count()
        new_workers_this_week = Worker.objects.filter(created_at__date__gte=week_ago).count()
        verified_workers = Worker.objects.filter(is_verified=True).count()
        onboarded_workers = Worker.objects.filter(onboarding_completed=True).count()

        # Weekly trend
        weekly_claims = Claim.objects.filter(created_at__date__gte=week_ago).count()
        weekly_payouts = Claim.objects.filter(
            created_at__date__gte=week_ago, status__in=['PAID', 'AUTO_APPROVED']
        ).aggregate(Sum('compensation'))['compensation__sum'] or 0

        return Response({
            "revenue": {
                "total_premiums_collected": total_premiums,
                "active_premiums_weekly": active_premiums,
                "total_payouts": total_payouts,
                "loss_ratio_percent": loss_ratio,
                "net_revenue": total_premiums - total_payouts,
            },
            "policies": {
                "total": total_policies,
                "active": active_policies,
                "expired": expired_policies,
            },
            "workers": {
                "total": total_workers,
                "verified": verified_workers,
                "onboarded": onboarded_workers,
                "new_this_week": new_workers_this_week,
            },
            "weekly_trend": {
                "claims_this_week": weekly_claims,
                "payouts_this_week": weekly_payouts,
            },
            "platform_breakdown": list(
                Worker.objects.values('platform').annotate(
                    count=Count('id')
                ).order_by('-count')
            ),
        })


class AdminFraudStatsView(APIView):
    """
    GET /api/admin/fraud-stats/
    Fraud detection statistics and verification scores.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        fraud_flagged = Claim.objects.filter(status='FRAUD_FLAGGED').count()
        total_claims = Claim.objects.count()
        fraud_rate = round(fraud_flagged / max(total_claims, 1) * 100, 2)

        # Screenshot verification stats
        total_verifications = ScreenshotVerification.objects.count()
        verified = ScreenshotVerification.objects.filter(status='VERIFIED').count()
        failed = ScreenshotVerification.objects.filter(status='FAILED').count()
        review = ScreenshotVerification.objects.filter(status='REVIEW').count()
        avg_trust_score = ScreenshotVerification.objects.aggregate(
            Avg('total_trust_score')
        )['total_trust_score__avg'] or 0

        # High-risk claims (fraud score > 0.5)
        high_risk_claims = Claim.objects.filter(fraud_score__gt=0.5).count()

        return Response({
            "claim_fraud": {
                "total_claims": total_claims,
                "fraud_flagged": fraud_flagged,
                "fraud_rate_percent": fraud_rate,
                "high_risk_claims": high_risk_claims,
            },
            "screenshot_verification": {
                "total_verifications": total_verifications,
                "verified": verified,
                "failed": failed,
                "under_review": review,
                "avg_trust_score": round(avg_trust_score, 1),
            },
            "fraud_by_reason": list(
                Claim.objects.filter(status='FRAUD_FLAGGED').values('claim_reason').annotate(
                    count=Count('claim_id')
                ).order_by('-count')
            ),
        })


class AdminClaimListView(APIView):
    """
    GET /api/admin/claims/list/
    Lists all claims for admin review.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # We need more details like worker name
        claims = Claim.objects.all().values(
            'claim_id', 'claim_reason', 'claim_date', 'lost_hours',
            'compensation', 'status', 'fraud_score', 'created_at',
            'worker__name', 'worker__platform', 'worker__partner_id',
            'policy__policy_number', 'policy__plan_type'
        ).order_by('-created_at')
        return Response(list(claims))


class AdminClaimActionView(APIView):
    """
    POST /api/admin/claims/<uuid:claim_id>/action/
    { "action": "APPROVE" | "REJECT" }
    """
    permission_classes = [AllowAny]

    def post(self, request, claim_id):
        action = request.data.get('action')
        if action not in ['APPROVE', 'REJECT']:
            return Response({"error": "Invalid action. Use APPROVE or REJECT."}, status=400)

        try:
            claim = Claim.objects.get(claim_id=claim_id)
        except Claim.DoesNotExist:
            return Response({"error": "Claim not found."}, status=404)

        if action == 'APPROVE':
            claim.status = 'PAID'
            if claim.compensation == 0 and claim.lost_hours > 0:
                worker = claim.worker
                active_policy = claim.policy
                # Re-calc: average daily / hours
                hourly_income = (worker.weekly_earnings / max(len(worker.working_days), 1)) / max(worker.working_hours, 1)
                claim.compensation = min(int(hourly_income * claim.lost_hours), active_policy.coverage_limit)
        else:
            claim.status = 'REJECTED'

        claim.save()
        return Response({"message": f"Claim {action.lower()}ed successfully.", "status": claim.status})
