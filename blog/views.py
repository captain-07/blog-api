from .models import Post
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.filter(
        status=Post.Status.PUBLISHED
    ).order_by("-created_at")

    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]