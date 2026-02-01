from django.contrib import admin
from django.utils.html import format_html
from .models import BlogPost, Comment

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('user', 'text', 'created_at')
    can_delete = True

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'title', 'author_name_display', 'read_count', 'created_at')
    list_filter = ('author', 'created_at')
    search_fields = ('title', 'content', 'author__email', 'author_name')
    readonly_fields = ('read_count', 'created_at', 'updated_at')
    inlines = [CommentInline]
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image'
    
    def author_name_display(self, obj):
        return obj.author_name if obj.author_name else obj.author.get_full_name()
    author_name_display.short_description = 'Author'
    
    fieldsets = (
        ('Article', {
            'fields': ('title', 'author', 'author_name', 'content', 'image')
        }),
        ('Stats', {
            'fields': ('read_count',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'short_text', 'created_at')
    list_filter = ('created_at', 'post')
    search_fields = ('text', 'user__email', 'post__title')
    readonly_fields = ('created_at',)

    def short_text(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text
    short_text.short_description = 'Comment'
