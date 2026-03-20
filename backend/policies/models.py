from django.db import models
from django.utils import timezone
import uuid

class Policy(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PENDING', 'Pending Payment'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PLAN_CHOICES = [
        ('BASIC', 'Basic Plan'),
        ('PRO', 'Pro Plan'),
        ('PREMIUM_PLUS', 'Premium Plus'),
    ]
    
    PAYMENT_CHOICES = [
        ('UPI_AUTOPAY', 'UPI AutoPay'),
        ('MANUAL', 'Manual Payment'),
        ('WALLET', 'Wallet'),
    ]

    policy_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    worker = models.ForeignKey('users.Worker', on_delete=models.CASCADE, related_name='policies')
    
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default='BASIC')
    weekly_premium = models.IntegerField()
    coverage_limit = models.IntegerField()
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='MANUAL')
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField()
    next_payment_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.policy_number:
            self.policy_number = f"IGW-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Policy {self.policy_number} for {self.worker.name} (Status: {self.status})"
