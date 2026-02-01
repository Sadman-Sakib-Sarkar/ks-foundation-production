from django.db import models
from django.conf import settings
from core.utils import get_file_path
from core.validators import validate_file_size

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField() # Rich text content
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    author_name = models.CharField(max_length=255, blank=True, help_text="Override author name for display purposes")
    image = models.ImageField(upload_to=get_file_path, blank=True, null=True, validators=[validate_file_size])
    read_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(BlogPost, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"
