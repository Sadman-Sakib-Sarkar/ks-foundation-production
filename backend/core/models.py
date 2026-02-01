from django.db import models
import uuid
import os

from .utils import get_file_path
from .validators import validate_file_size, validate_large_file_size

# Legacy path functions for migration compatibility
def notice_file_path(instance, filename):
    return get_file_path(instance, filename)

def member_image_path(instance, filename):
    return get_file_path(instance, filename)

class Notice(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    attachment = models.FileField(upload_to=get_file_path, blank=True, null=True, validators=[validate_large_file_size])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Member(models.Model):
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to=get_file_path, blank=True, null=True, validators=[validate_file_size])
    contact_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name

class CarouselItem(models.Model):
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to=get_file_path, validators=[validate_file_size])
    caption = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title or "Carousel Item"

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.email}"
