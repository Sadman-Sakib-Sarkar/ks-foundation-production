from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, MemberViewSet, CarouselItemViewSet, ContactMessageViewSet

router = DefaultRouter()
router.register(r'notices', NoticeViewSet)
router.register(r'members', MemberViewSet)
router.register(r'carousel', CarouselItemViewSet)
router.register(r'contact', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
