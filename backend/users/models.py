from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from core.utils import get_file_path
from core.validators import validate_file_size

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
        ('USER', 'Registered User'),
    )

    username = None
    email = models.EmailField('email address', unique=True)
    first_name = models.CharField('first name', max_length=150, blank=True)
    last_name = models.CharField('last name', max_length=150, blank=True)
    
    # Detailed Address Fields
    village_street = models.CharField(max_length=255, blank=True, null=True)
    upazilla = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    division = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='Bangladesh', blank=True, null=True)
    
    # Legacy field - keeping for safety, or we can just remove it. 
    # Let's keep separate fields as primary.
    address = models.TextField(blank=True, null=True) 
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to=get_file_path, blank=True, null=True, validators=[validate_file_size])
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    is_verified = models.BooleanField(default=False)
    is_approved_staff = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email
