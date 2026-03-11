from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone

class Worker(models.Model):
    PLATFORM_CHOICES = [
        ('Zomato', 'Zomato'),
        ('Swiggy', 'Swiggy'),
        ('Blinkit', 'Blinkit'),
        ('Amazon', 'Amazon'),
        ('Flipkart', 'Flipkart'),
        ('Zepto', 'Zepto'),
    ]
    
    VEHICLE_CHOICES = [
        ('Bike', 'Bike'),
        ('Scooter', 'Scooter'),
        ('Cycle', 'Cycle'),
        ('Car', 'Car'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    partner_id = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=100)
    zone = models.CharField(max_length=100)
    security_key = models.CharField(max_length=6, blank=True, null=True)
    govt_id = models.CharField(max_length=20, blank=True, null=True)
    
    # Policy Summary in Worker profile
    pricing_plan = models.CharField(max_length=20, default='STANDARD')
    renewal_date = models.DateField(null=True, blank=True)
    
    # Onboarding Data
    weekly_earnings = models.IntegerField(default=0)
    working_hours = models.IntegerField(default=8)
    working_days = models.JSONField(default=list) # e.g., ["Mon", "Tue"]
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES, default='Bike')
    
    # Status
    is_verified = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Location (for real weather verification)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    avg_daily_income = models.IntegerField(default=0) # Legacy support or calculated
    
    # Delivery Stats
    total_deliveries = models.IntegerField(default=0)
    total_cancelled = models.IntegerField(default=0)
    wallet_savings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.platform} - {self.zone})"

class OTP(models.Model):
    phone = models.CharField(max_length=15)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP for {self.phone} - {self.code}"
