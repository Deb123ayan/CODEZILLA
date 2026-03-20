from django.db import models
from django.utils import timezone
import uuid
from users.models import Worker
from math import radians, cos, sin, asin, sqrt

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('ONGOING', 'In Progress'),
        ('RETRYING', 'Retrying (3-day window)'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    CANCELLATION_CHOICES = [
        ('RAIN', 'Heavy Rain'),
        ('CURFEW', 'Curfew/Lockdown'),
        ('TRAFFIC', 'Severe Traffic'),
        ('OTHER', 'Other (View custom reason)'),
    ]

    CATEGORY_CHOICES = [
        ('QUICK_COMMERCE', 'Quick Commerce (Food/Instant)'),
        ('GROCERY', 'Grocery'),
        ('PARCEL', 'Parcel (Ecommerce)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='FOOD')
    products = models.JSONField(default=list)
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=255) # Nearest location name or address
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    cancellation_type = models.CharField(max_length=20, choices=CANCELLATION_CHOICES, null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True) # Used for custom text when type is 'OTHER'
    
    # Platform-specific handling
    agent_can_keep_items = models.BooleanField(default=False)
    retail_retry_deadline = models.DateTimeField(null=True, blank=True) # For Amazon/Flipkart 3-day rule
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        old_status = None
        if not self._state.adding:
            try:
                old_status = Delivery.objects.get(pk=self.pk).status
            except Delivery.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

        # Update worker stats if status changed to COMPLETED or CANCELLED
        if self.worker and self.status != old_status:
            if self.status == 'COMPLETED':
                self.worker.total_deliveries += 1
                
                # Cashback logic: if completion rate >= 90%, reward the worker
                # rate = (completed / total_attempted) * 100
                total_attempts = self.worker.total_deliveries + self.worker.total_cancelled
                if total_attempts > 0:
                    completion_rate = (self.worker.total_deliveries / total_attempts) * 100
                    if completion_rate >= 90:
                        from decimal import Decimal
                        self.worker.wallet_savings += Decimal('50.00')
                
                self.worker.save(update_fields=['total_deliveries', 'wallet_savings'])
            elif self.status == 'CANCELLED':
                self.worker.total_cancelled += 1
                self.worker.save(update_fields=['total_cancelled'])

    def assign_to_nearest_active_worker(self):
        """
        Assigns delivery to the nearest active worker.
        """
        if self.latitude is None or self.longitude is None:
            return None

        # Filter active workers in the same city for better accuracy/performance
        active_workers = Worker.objects.filter(is_active=True, city=self.city)
        
        if not active_workers.exists():
            # fallback to all active workers if none in city
            active_workers = Worker.objects.filter(is_active=True)

        best_worker = None
        min_distance = float('inf')

        for worker in active_workers:
            if worker.latitude is not None and worker.longitude is not None:
                dist = self.calculate_distance(self.latitude, self.longitude, worker.latitude, worker.longitude)
                if dist < min_distance:
                    min_distance = dist
                    best_worker = worker
        
        if best_worker:
            self.worker = best_worker
            self.status = 'ASSIGNED'
            self.save()
        return best_worker

    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        # Haversine formula
        R = 6371 # Earth radius in km
        dLat = radians(lat2 - lat1)
        dLon = radians(lon2 - lon1)
        lat1 = radians(lat1)
        lat2 = radians(lat2)

        a = sin(dLat/2)**2 + cos(lat1)*cos(lat2)*sin(dLon/2)**2
        c = 2*asin(sqrt(a))
        return R * c

    def cancel_and_enable_claim(self, cancel_type=None, reason=None):
        """
        If delivery isn't completed, it will be cancelled and the agent (worker) can claim for it.
        This method marks it as cancelled.
        """
        if self.status != 'COMPLETED':
            self.status = 'CANCELLED'
            self.cancellation_type = cancel_type
            self.cancellation_reason = reason
            self.save()
            return True
        return False

    def __str__(self):
        return f"Delivery {self.id} - {self.status} (Worker: {self.worker.name if self.worker else 'None'})"

    class Meta:
        verbose_name_plural = "Deliveries"
