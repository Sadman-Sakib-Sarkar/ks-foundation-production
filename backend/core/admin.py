from django.contrib import admin
from django.utils.html import format_html
from .models import Notice, Member, CarouselItem, ContactMessage

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'has_attachment', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)
    list_editable = ('is_active',)
    readonly_fields = ('created_at', 'updated_at')
    
    def has_attachment(self, obj):
        return bool(obj.attachment)
    has_attachment.boolean = True
    has_attachment.short_description = 'Attachment'

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'designation', 'email', 'order')
    list_filter = ('designation',)
    search_fields = ('name', 'designation', 'email')
    ordering = ('order', 'name')
    list_editable = ('order',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image'

@admin.register(CarouselItem)
class CarouselItemAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'title', 'is_active', 'order')
    list_filter = ('is_active',)
    search_fields = ('title', 'caption')
    ordering = ('order',)
    list_editable = ('order', 'is_active')
    
    def image_preview(self, obj):
        if obj.image:
            # Aspect ratio for carousel usually landscape
            return format_html('<img src="{}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Slide'

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    ordering = ('-created_at',)
    
    def has_add_permission(self, request):
        return False
