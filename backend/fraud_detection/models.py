from django.db import models
import uuid

class ScreenshotVerification(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('FAILED', 'Failed'),
        ('REVIEW', 'Manual Review Required'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey('users.Worker', on_delete=models.CASCADE, related_name='verifications')
    
    screenshot = models.ImageField(upload_to='screenshots/%Y/%m/%d/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    # Scores (0-25 each as per doc)
    forensics_score = models.IntegerField(default=0)
    ocr_score = models.IntegerField(default=0)
    platform_score = models.IntegerField(default=0)
    cross_check_score = models.IntegerField(default=0)
    
    total_trust_score = models.IntegerField(default=0)
    
    # JSON Data
    forensics_report = models.JSONField(default=dict)
    extracted_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Verification for {self.worker.name} - Score: {self.total_trust_score}"
