from django.contrib import admin
from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('claim_id', 'worker', 'claim_reason', 'claim_date', 'compensation', 'status', 'fraud_score')
    list_filter = ('status', 'claim_reason', 'claim_date')
    search_fields = ('worker__name', 'worker__phone')
