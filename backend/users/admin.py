from django.contrib import admin
from .models import Worker, OTP


@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'platform', 'zone', 'is_verified', 'onboarding_completed', 'weekly_earnings')
    list_filter = ('platform', 'is_verified', 'onboarding_completed', 'vehicle_type')
    search_fields = ('name', 'phone', 'zone', 'partner_id')


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_verified', 'created_at', 'expires_at')
    list_filter = ('is_verified',)
