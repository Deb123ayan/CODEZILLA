from django.urls import path
from users.views import WorkerRegisterView
from policies.views import PolicyQuoteView, PolicyPurchaseView
from api.admin_views import AdminWorkerListView, AdminRiskHeatmapView, AdminClaimsMonitoringView
from payments.views import PayoutProcessView
from api.risk_views import RealTimeRiskPredictionView

urlpatterns = [
    # Worker Registration (Step 1)
    path('workers/register/', WorkerRegisterView.as_view(), name='worker-register'),
    
    # Policy Quote (Step 2)
    path('policy/quote/', PolicyQuoteView.as_view(), name='policy-quote'),
    
    # Buy Policy (Step 3)
    path('policy/purchase/', PolicyPurchaseView.as_view(), name='policy-purchase'),

    # Payout (Step 11)
    path('payout/process/', PayoutProcessView.as_view(), name='payout-process'),

    # Admin Dashboard APIs (Step 12)
    path('admin/workers/', AdminWorkerListView.as_view(), name='admin-workers'),
    path('admin/risk-zones/', AdminRiskHeatmapView.as_view(), name='admin-risk-zones'),
    path('admin/claims/', AdminClaimsMonitoringView.as_view(), name='admin-claims-monitoring'),

    # Real-Time Risk Prediction (Step 15)
    path('risk/predict/', RealTimeRiskPredictionView.as_view(), name='risk-predict'),
]
