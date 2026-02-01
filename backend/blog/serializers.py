from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BlogPost, Comment

User = get_user_model()

class CommentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_picture']

class CommentSerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'created_at']

class BlogPostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    # author_name is now handled by ModelSerializer default (writable)
    
    display_author = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    def get_display_author(self, obj):
        if obj.author_name:
            return obj.author_name
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.author.email

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'author', 'author_name', 'display_author', 'image', 'read_count', 'created_at', 'comments']
