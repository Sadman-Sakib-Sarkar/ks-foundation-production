from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BlogPost, Comment
from .serializers import BlogPostSerializer, CommentSerializer
from users.permissions import IsAdminOrStaffOrReadOnly
from core.pagination import StandardPagination

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostSerializer
    permission_classes = [IsAdminOrStaffOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author__email', 'author__first_name', 'author__last_name', 'author_name']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_read(self, request, pk=None):
        instance = self.get_object()
        instance.read_count += 1
        instance.save()
        return Response({'status': 'read count incremented', 'read_count': instance.read_count})

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all().order_by('-created_at')
        post_id = self.request.query_params.get('post')
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        comment = self.get_object()
        if self.request.user == comment.user or self.request.user.role == 'ADMIN':
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to edit this comment.")

    def perform_destroy(self, instance):
        if self.request.user == instance.user or self.request.user.role == 'ADMIN':
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this comment.")
