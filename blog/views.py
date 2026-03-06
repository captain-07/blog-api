from .models import Post
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import PostSerializer
from .permissions import IsAdminOrReadOnly


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.filter(
        status=Post.Status.PUBLISHED
    )

    serializer_class = PostSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = ["title", "content"]

    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    lookup_field = "slug"