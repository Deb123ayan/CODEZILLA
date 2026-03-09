from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'type', 'zone', 'severity', 'reported_by', 'timestamp')
    list_filter = ('type', 'zone')
    search_fields = ('zone', 'description')
