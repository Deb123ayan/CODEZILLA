from django.contrib import admin
from .models import ScreenshotVerification


@admin.register(ScreenshotVerification)
class ScreenshotVerificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'worker', 'status', 'forensics_score', 'total_trust_score', 'created_at')
    list_filter = ('status',)
    search_fields = ('worker__name', 'worker__phone')
