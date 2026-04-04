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
    aadhaar_number = models.CharField(max_length=14, blank=True, null=True) # Format: XXXX XXXX XXXX
    pan_number = models.CharField(max_length=10, blank=True, null=True)     # Format: ABCDE1234F
    
    # KYC Documents
    aadhar_front = models.ImageField(upload_to='kyc/aadhar/', null=True, blank=True)
    aadhar_back = models.ImageField(upload_to='kyc/aadhar/', null=True, blank=True)
    pan_card = models.ImageField(upload_to='kyc/pan/', null=True, blank=True)
    
    # Verification Status
    is_aadhar_verified = models.BooleanField(default=False)
    is_pan_verified = models.BooleanField(default=False)
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    
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
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Payment / Payout Details
    upi_id = models.CharField(max_length=100, blank=True, null=True)  # e.g. name@upi
    bank_account_number = models.CharField(max_length=20, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=11, blank=True, null=True)
    bank_holder_name = models.CharField(max_length=255, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    
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

class MockPlatformData(models.Model):
    # Core Identifiers
    platform = models.CharField(max_length=50) # Zomato, Swiggy, Zepto, Blinkit, Amazon, Flipkart
    phone = models.CharField(max_length=15, unique=True)
    partner_id = models.CharField(max_length=50)
    
    # Personal Info
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100, default='Bangalore')
    zone = models.CharField(max_length=100)
    
    # Platform Metrics (Useful for Insurance Risk Engine & Dashboards)
    weekly_earnings = models.IntegerField()
    total_deliveries = models.IntegerField(default=50) # To simulate experience level
    rating = models.FloatField(default=4.5) # Fake rating 1.0 to 5.0
    vehicle_type = models.CharField(max_length=20, default='Bike')
    joined_date = models.DateField(default=timezone.now) # Time on platform affects risk 
    is_active = models.BooleanField(default=True) # Check if banned/active
    
    # Identity Verification
    aadhaar_number = models.CharField(max_length=14, blank=True, null=True)  # Format: XXXX XXXX XXXX
    pan_number     = models.CharField(max_length=10, blank=True, null=True)  # Format: ABCDE1234F

    
    def __str__(self):
        return f"{self.name} ({self.platform} - {self.partner_id})"
