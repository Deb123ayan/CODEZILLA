from django.contrib import admin
from .models import Policy


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('policy_number', 'worker', 'plan_type', 'weekly_premium', 'coverage_limit', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'plan_type', 'payment_method')
    search_fields = ('policy_number', 'worker__name', 'worker__phone')
