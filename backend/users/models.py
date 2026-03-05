from django.db import models
from django.contrib.auth.models import User
import uuid

class Worker(models.Model):
    PLATFORM_CHOICES = [
        ('Zomato', 'Zomato'),
        ('Swiggy', 'Swiggy'),
        ('Blinkit', 'Blinkit'),
        ('Amazon', 'Amazon'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, unique=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    city = models.CharField(max_length=100)
    zone = models.CharField(max_length=100)
    avg_daily_income = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.platform} - {self.zone})"
