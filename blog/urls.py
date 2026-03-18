from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PostViewSet, CommentViewSet, RegisterView, AuthorViewSet, like_post, unlike_post

router = DefaultRouter()
router.register("posts", PostViewSet)
router.register("comments", CommentViewSet)
router.register("authors", AuthorViewSet)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("posts/<slug:slug>/like/", like_post),
    path("posts/<slug:slug>/unlike/", unlike_post),
]

urlpatterns += router.urls
