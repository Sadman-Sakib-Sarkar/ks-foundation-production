from rest_framework import viewsets, permissions, filters
from .models import HealthCamp
from .serializers import HealthCampSerializer
from users.permissions import IsAdminOrStaffOrReadOnly
from core.pagination import StandardPagination
from django.utils import timezone

class HealthCampViewSet(viewsets.ModelViewSet):
    queryset = HealthCamp.objects.all().order_by('-date_time')
    serializer_class = HealthCampSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'location', 'doctor_name']

    def get_queryset(self):
        queryset = HealthCamp.objects.all().order_by('-date_time')
        time_filter = self.request.query_params.get('time')
        
        if time_filter == 'upcoming':
            queryset = queryset.filter(date_time__gt=timezone.now())
        elif time_filter == 'past':
            queryset = queryset.filter(date_time__lte=timezone.now())
        
        return queryset
