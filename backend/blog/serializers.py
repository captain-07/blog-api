from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth.models import User
from rest_framework.serializers import IntegerField


class CommentSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "post", "user", "content", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class PostSerializer(serializers.ModelSerializer):

    comments = CommentSerializer(many=True, read_only=True)
    likes_count = IntegerField(read_only=True)
    author = UserSerializer(read_only=True)
    featured_image = serializers.SerializerMethodField()

    def get_featured_image(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return ""
        
    is_liked = serializers.SerializerMethodField()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    class Meta:
        model = Post
        fields = ["id", "title", "slug", "content", "featured_image", "status", 
                  "created_at", "updated_at", "published_at", "comments", "likes_count", "author", "is_liked"]
        read_only_fields = ["slug", "author", "created_at", "updated_at", "published_at"]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user
