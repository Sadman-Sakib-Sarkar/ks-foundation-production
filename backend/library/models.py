from django.db import models
import uuid
import os

from core.utils import get_file_path
from core.validators import validate_file_size

# Legacy path function for migration compatibility
def book_image_path(instance, filename):
    return get_file_path(instance, filename)

class Book(models.Model):
    CATEGORY_CHOICES = [
        ('Novel', 'Novel'),
        ('Children', 'Children'),
        ('Academic', 'Academic'),
        ('Islamic', 'Islamic'),
        ('Fiction', 'Fiction'),
        ('Non-Fiction', 'Non-Fiction'),
        ('General Knowledge', 'General Knowledge'),
        ('Science Fiction', 'Science Fiction'),
        ('Self Help', 'Self Help'),
        ('History', 'History'),
        ('Poetry', 'Poetry'),
        ('Biography', 'Biography'),
        ('Other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    bengali_title = models.CharField(max_length=255, blank=True, null=True)
    author = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    serial_number = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to=get_file_path, blank=True, null=True, validators=[validate_file_size])
    is_available = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class BorrowedBook(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowed_records')
    borrower_name = models.CharField(max_length=255)
    borrow_date = models.DateField()
    return_date = models.DateField()
    is_returned = models.BooleanField(default=False)
    returned_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} - {self.borrower_name}"
