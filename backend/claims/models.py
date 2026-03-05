from django.db import models
import uuid

class Claim(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
    ]

    claim_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey('users.Worker', on_delete=models.CASCADE, related_name='claims')
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='claims')
    lost_hours = models.IntegerField()
    compensation = models.IntegerField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"Claim {self.claim_id} for {self.worker.name} (Status: {self.status})"
