from django.db import models
from core.utils import get_file_path
from core.validators import validate_file_size

class HealthCamp(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    date_time = models.DateTimeField()
    doctor_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to=get_file_path, blank=True, null=True, validators=[validate_file_size])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.date_time.date()}"
