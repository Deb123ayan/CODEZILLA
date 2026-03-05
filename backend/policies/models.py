from django.db import models
import uuid

class Policy(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
    ]

    policy_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey('users.Worker', on_delete=models.CASCADE, related_name='policies')
    weekly_premium = models.IntegerField()
    coverage_limit = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"Policy {self.policy_id} for {self.worker.name} (Status: {self.status})"
