from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book, BorrowedBook
from .serializers import BookSerializer, BorrowedBookSerializer
from users.permissions import IsAdminOrStaffOrReadOnly
from django.utils import timezone
from core.pagination import StandardPagination

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'bengali_title', 'serial_number', 'category']

    def get_queryset(self):
        queryset = Book.objects.all().order_by('-created_at')
        
        category = self.request.query_params.get('category')
        if category and category != 'All':
            queryset = queryset.filter(category=category)
            
        status_param = self.request.query_params.get('status')
        if status_param == 'available':
            queryset = queryset.filter(is_available=True)
        elif status_param == 'unavailable':
            queryset = queryset.filter(is_available=False)
            
        return queryset

class BorrowedBookViewSet(viewsets.ModelViewSet):
    queryset = BorrowedBook.objects.all().order_by('-borrow_date')
    serializer_class = BorrowedBookSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['borrower_name', 'book__title', 'book__serial_number']

    def get_queryset(self):
        queryset = BorrowedBook.objects.all().order_by('-borrow_date')
        status_param = self.request.query_params.get('status')
        
        if status_param == 'returned':
            queryset = queryset.filter(is_returned=True)
        elif status_param == 'borrowed':
            queryset = queryset.filter(is_returned=False)
            
        return queryset

    @action(detail=True, methods=['post'])
    def mark_returned(self, request, pk=None):
        instance = self.get_object()
        if instance.is_returned:
            return Response({'status': 'already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.is_returned = True
        instance.returned_date = timezone.now().date()
        instance.save()
        return Response({'status': 'marked as returned'})
