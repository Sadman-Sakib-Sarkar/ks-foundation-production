from django.contrib import admin
from django.utils.html import format_html
from .models import Book, BorrowedBook

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('cover_preview', 'title', 'category', 'author', 'serial_number', 'is_available', 'quantity')
    list_filter = ('category', 'is_available', 'created_at')
    search_fields = ('title', 'bengali_title', 'author', 'serial_number', 'description')
    ordering = ('serial_number', 'title')
    list_editable = ('is_available', 'quantity')
    readonly_fields = ('created_at', 'updated_at')
    
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 2px;" />', obj.cover_image.url)
        return "-"
    cover_preview.short_description = 'Cover'
    
    fieldsets = (
        ('Book Details', {
            'fields': ('serial_number', 'title', 'bengali_title', 'author', 'category', 'description')
        }),
        ('Inventory', {
            'fields': ('is_available', 'quantity', 'cover_image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(BorrowedBook)
class BorrowedBookAdmin(admin.ModelAdmin):
    list_display = ('borrower_name', 'book', 'borrow_date', 'return_date', 'returned_date', 'is_returned', 'status_colored')
    list_filter = ('is_returned', 'borrow_date', 'return_date')
    search_fields = ('borrower_name', 'book__title', 'book__serial_number')
    autocomplete_fields = ('book',)
    
    def status_colored(self, obj):
        from django.utils import timezone
        from django.utils.safestring import mark_safe
        if obj.is_returned:
            return mark_safe('<span style="color: green;">Returned</span>')
        # return_date is the due date
        if obj.return_date < timezone.now().date():
            return mark_safe('<span style="color: red; font-weight: bold;">Overdue</span>')
        return mark_safe('<span style="color: orange;">Borrowed</span>')
    status_colored.short_description = 'Status'
