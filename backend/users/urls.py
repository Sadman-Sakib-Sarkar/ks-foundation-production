from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, 
    RegisterUserView, 
    RegisterStaffView, 
    UserDetailView,
    DashboardStatsView,
    UserListView,
    ToggleStaffRoleView,
    UserAdminDetailView,
    VerifyEmailView,
    ResendVerificationView,
    ChangePasswordView,
    RequestPasswordResetView,
    PasswordResetConfirmView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('register/staff/', RegisterStaffView.as_view(), name='register_staff'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', RequestPasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('manage/', UserListView.as_view(), name='user-list'),
    path('manage/<int:pk>/', UserAdminDetailView.as_view(), name='user-admin-detail'),
    path('manage/<int:pk>/toggle-staff/', ToggleStaffRoleView.as_view(), name='toggle-staff-role'),
]
