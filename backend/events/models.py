from django.db import models
import uuid

class Event(models.Model):
    EVENT_TYPES = [
        ('WEATHER', 'Weather'),
        ('AQI', 'AQI'),
        ('CURFEW', 'Curfew'),
    ]

    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    zone = models.CharField(max_length=100)
    severity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} Event in {self.zone} (Severity: {self.severity})"
