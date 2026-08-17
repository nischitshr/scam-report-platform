from django.db import models
from django.conf import settings

SCAM_TYPES = (
    ('phishing', 'Phishing'),
    ('fake_job', 'Fake Job'),
    ('catfish', 'Catfish'),
    ('investment', 'Investment Fraud'),
    ('shopping', 'Online Shopping'),
    ('tech_support', 'Tech Support'),
    ('other', 'Other'),
)

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)

class ScamReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=2000)
    scam_type = models.CharField(max_length=50, choices=SCAM_TYPES)
    contact_used = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    report_count = models.IntegerField(default=0)
    evidence_file = models.URLField(max_length=1000, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class ScamFile(models.Model):
    report = models.ForeignKey(ScamReport, on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField(max_length=1000)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # size in bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name
