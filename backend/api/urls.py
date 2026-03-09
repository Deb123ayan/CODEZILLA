from django.urls import path
from users.views import (
    WorkerRegisterView, 
    GenerateOTPView, 
    VerifyOTPView, 
    MockPlatformConnectView, 
    UpdateWorkDetailsView, 
    FinalizeOnboardingView,
    UpdateLocationView,
    WeatherCheckView,
    VerifyClaimWeatherView,
)
from fraud_detection.views import VerifyScreenshotView
from policies.views import PolicyQuoteView, PolicyPurchaseView, PolicyRenewView, PolicyStatusView
from api.admin_views import (
    AdminWorkerListView, AdminRiskHeatmapView, AdminClaimsMonitoringView,
    AdminAnalyticsView, AdminFraudStatsView,
)
from payments.views import PayoutProcessView
from api.risk_views import RealTimeRiskPredictionView
from claims.views import ClaimSubmitView, ClaimHistoryView
from events.views import ReportDisruptionView, ListEventsView

urlpatterns = [
    # ── Onboarding Flow ────────────────────────────────────────────────
    path('auth/otp/generate/', GenerateOTPView.as_view(), name='otp-generate'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),
    path('auth/platform/connect/', MockPlatformConnectView.as_view(), name='platform-connect'),
    path('auth/screenshot/verify/', VerifyScreenshotView.as_view(), name='screenshot-verify'),
    path('auth/work-details/', UpdateWorkDetailsView.as_view(), name='update-work-details'),
    path('auth/finalize/', FinalizeOnboardingView.as_view(), name='finalize-onboarding'),

    # ── Worker ─────────────────────────────────────────────────────────
    path('workers/register/', WorkerRegisterView.as_view(), name='worker-register'),
    path('workers/location/', UpdateLocationView.as_view(), name='update-location'),
    
    # ── Policy Management ──────────────────────────────────────────────
    path('policy/quote/', PolicyQuoteView.as_view(), name='policy-quote'),
    path('policy/purchase/', PolicyPurchaseView.as_view(), name='policy-purchase'),
    path('policy/renew/', PolicyRenewView.as_view(), name='policy-renew'),
    path('policy/status/', PolicyStatusView.as_view(), name='policy-status'),

    # ── Claims ─────────────────────────────────────────────────────────
    path('claims/submit/', ClaimSubmitView.as_view(), name='claim-submit'),
    path('claims/history/', ClaimHistoryView.as_view(), name='claim-history'),

    # ── Weather Verification ───────────────────────────────────────────
    path('weather/check/', WeatherCheckView.as_view(), name='weather-check'),
    path('weather/verify-claim/', VerifyClaimWeatherView.as_view(), name='verify-claim-weather'),

    # ── Events / Disruptions ───────────────────────────────────────────
    path('events/report/', ReportDisruptionView.as_view(), name='report-disruption'),
    path('events/', ListEventsView.as_view(), name='list-events'),

    # ── Payout ─────────────────────────────────────────────────────────
    path('payout/process/', PayoutProcessView.as_view(), name='payout-process'),

    # ── Admin Dashboard ────────────────────────────────────────────────
    path('admin/workers/', AdminWorkerListView.as_view(), name='admin-workers'),
    path('admin/risk-zones/', AdminRiskHeatmapView.as_view(), name='admin-risk-zones'),
    path('admin/claims/', AdminClaimsMonitoringView.as_view(), name='admin-claims-monitoring'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/fraud-stats/', AdminFraudStatsView.as_view(), name='admin-fraud-stats'),

    # ── AI Risk Prediction ─────────────────────────────────────────────
    path('risk/predict/', RealTimeRiskPredictionView.as_view(), name='risk-predict'),
]
