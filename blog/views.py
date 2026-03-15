from .models import Post, Comment, Like
from rest_framework import viewsets, filters, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import PostSerializer, CommentSerializer, RegisterSerializer
from .permissions import IsAdminOrReadOnly
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.filter(status=Post.Status.PUBLISHED)

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

    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = []

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