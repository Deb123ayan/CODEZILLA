from django.db import models
from django.utils import timezone
import uuid

class Claim(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('AUTO_APPROVED', 'Auto Approved'),
        ('PAID', 'Paid'),
        ('REJECTED', 'Rejected'),
        ('FRAUD_FLAGGED', 'Fraud Flagged'),
    ]

    REASON_CHOICES = [
        ('WEATHER', 'Weather Disruption'),
        ('RAIN', 'Heavy Rain'),
        ('HEAT', 'Extreme Heat'),
        ('AQI', 'Air Quality'),
        ('POLLUTION', 'Severe Pollution'),
        ('STORM', 'Storm/Cyclone'),
        ('FLOOD', 'Flood'),
        ('CURFEW', 'Curfew'),
        ('STRIKE', 'Strike'),
        ('ZONE_CLOSURE', 'Zone Closure'),
        ('DELIVERY_CANCELLED', 'Delivery Cancelled'),
    ]

    claim_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey('users.Worker', on_delete=models.CASCADE, related_name='claims')
    policy = models.ForeignKey('policies.Policy', on_delete=models.SET_NULL, null=True, blank=True, related_name='claims')
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='claims')
    
    claim_reason = models.CharField(max_length=20, choices=REASON_CHOICES, default='WEATHER')
    claim_date = models.DateField(default=timezone.now)
    
    lost_hours = models.IntegerField()
    compensation = models.IntegerField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    # Fraud detection data
    fraud_score = models.FloatField(default=0.0)
    verification_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('worker', 'claim_date', 'claim_reason')
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim {self.claim_id} for {self.worker.name} ({self.claim_reason} - {self.status})"
