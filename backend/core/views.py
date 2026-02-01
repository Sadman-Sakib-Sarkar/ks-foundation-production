from rest_framework import viewsets, permissions, filters
from .models import Notice, Member, CarouselItem, ContactMessage
from .serializers import NoticeSerializer, MemberSerializer, CarouselItemSerializer, ContactMessageSerializer
from users.permissions import IsAdminOrStaffOrReadOnly, IsAdminOrStaff
from django.core.mail import send_mail
from django.conf import settings
from .pagination import StandardPagination

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']

    def get_queryset(self):
        queryset = Notice.objects.all().order_by('-created_at')
        attachment_filter = self.request.query_params.get('has_attachment')
        
        if attachment_filter == 'yes':
            queryset = queryset.exclude(attachment='').exclude(attachment__isnull=True)
        elif attachment_filter == 'no':
            queryset = queryset.filter(attachment='') | queryset.filter(attachment__isnull=True)
        
        return queryset

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('order')
    serializer_class = MemberSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'contact_number']

class CarouselItemViewSet(viewsets.ModelViewSet):
    queryset = CarouselItem.objects.all().order_by('order')
    serializer_class = CarouselItemSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]

from .pagination import StandardPagination
from rest_framework import filters

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'subject']
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()] # Only admins/staff can view/delete
    
    def create(self, request, *args, **kwargs):
        # Verify reCAPTCHA
        from .recaptcha import verify_recaptcha
        from rest_framework.response import Response
        from rest_framework import status
        
        recaptcha_token = request.data.get('recaptcha_token')
        success, score, error = verify_recaptcha(recaptcha_token, action='contact')
        
        if not success:
            return Response(
                {'recaptcha': error or 'reCAPTCHA verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
        
    def perform_create(self, serializer):
        instance = serializer.save()
        # Send email notification to all admins and staff
        try:
            from users.models import CustomUser
            # Get all admin and staff emails
            admin_staff_emails = list(
                CustomUser.objects.filter(
                    role__in=['ADMIN', 'STAFF'],
                    is_verified=True
                ).values_list('email', flat=True)
            )
            
            if admin_staff_emails:
                subject = f"New Contact Message: {instance.subject}"
                message = f"""You received a new contact message from your website.

From: {instance.name}
Email: {instance.email}
Subject: {instance.subject}

Message:
{instance.message}

---
This is an automated notification from the KS Foundation website.
"""
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    admin_staff_emails,
                    fail_silently=True,
                )
        except Exception as e:
            print(f"Failed to send email notification: {e}")

