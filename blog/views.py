from .models import Post, Comment, Like
from rest_framework import viewsets, filters, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import PostSerializer, CommentSerializer, RegisterSerializer, UserSerializer
from .permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.filter(status=Post.Status.PUBLISHED
                ).select_related("author").prefetch_related("comments__user"
                ).annotate(likes_count=Count("likes"))

    serializer_class = PostSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    search_fields = ["title", "content"]

    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    lookup_field = "slug"

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all().order_by("-created_at")
        post_slug = self.request.query_params.get('post_slug')
        if post_slug:
            queryset = queryset.filter(post__slug=post_slug)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = []


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_post(request, slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)

    like, created = Like.objects.get_or_create(
        user=request.user,
        post=post
    )

    if created:
        return Response({"message": "Post liked"})
    else:
        return Response({"message": "Already liked"}, status=400)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unlike_post(request, slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)

    deleted_count, _ = Like.objects.filter(
        user=request.user,
        post=post
    ).delete()

    if deleted_count > 0:
        return Response({"message": "Like removed"})
    else:
        return Response({"message": "No like to remove"}, status=400)
