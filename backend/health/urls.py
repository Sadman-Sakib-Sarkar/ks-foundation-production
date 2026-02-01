from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthCampViewSet

router = DefaultRouter()
router.register(r'camps', HealthCampViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
