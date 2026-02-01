from django.contrib import admin
from django.utils.html import format_html
from .models import HealthCamp

@admin.register(HealthCamp)
class HealthCampAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'title', 'doctor_name', 'date_time', 'location')
    list_filter = ('date_time', 'doctor_name')
    search_fields = ('title', 'location', 'doctor_name', 'description')
    ordering = ('-date_time',)
    readonly_fields = ('created_at', 'updated_at')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image'

    fieldsets = (
        ('Camp Information', {
            'fields': ('title', 'doctor_name', 'description')
        }),
        ('Schedule & Location', {
            'fields': ('date_time', 'location', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
