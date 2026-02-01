from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BorrowedBookViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'borrowed-books', BorrowedBookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
