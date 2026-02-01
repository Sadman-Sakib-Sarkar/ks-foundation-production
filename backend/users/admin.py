from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('profile_preview', 'email', 'get_full_name', 'role', 'is_verified', 'is_approved_staff', 'is_active')
    list_filter = ('role', 'is_verified', 'is_approved_staff', 'is_active', 'district', 'division')
    search_fields = ('email', 'first_name', 'last_name', 'mobile_number')
    ordering = ('email',)
    
    def profile_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;" />', obj.profile_picture.url)
        return format_html('<div style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555;">{}</div>', obj.email[0].upper())
    profile_preview.short_description = 'Avatar'
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Name'

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'mobile_number', 'profile_picture')
        }),
        ('Address', {
            'fields': ('village_street', 'upazilla', 'district', 'division', 'country'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('role', 'is_verified', 'is_approved_staff', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
