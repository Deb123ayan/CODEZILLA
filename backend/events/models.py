from django.db import models
import uuid

class Event(models.Model):
    EVENT_TYPES = [
        ('WEATHER', 'Weather'),
        ('AQI', 'AQI'),
        ('CURFEW', 'Curfew'),
        ('STORM', 'Storm'),
        ('FLOOD', 'Flood'),
        ('HEAT', 'Extreme Heat'),
        ('STRIKE', 'Strike'),
        ('ZONE_CLOSURE', 'Zone Closure'),
        ('DELIVERY_CANCELLED', 'Delivery Cancelled'),
    ]

    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    zone = models.CharField(max_length=100)
    severity = models.IntegerField()
    description = models.TextField(blank=True, default='')
    reported_by = models.CharField(max_length=100, blank=True, default='system')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.type} Event in {self.zone} (Severity: {self.severity})"
