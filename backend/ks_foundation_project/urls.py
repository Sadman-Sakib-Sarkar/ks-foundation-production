from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('ksf_super_admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/library/', include('library.urls')),
    path('api/health/', include('health.urls')),
    path('api/core/', include('core.urls')),
    path('api/blog/', include('blog.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
