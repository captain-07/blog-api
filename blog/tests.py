from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Post, Comment, Like


class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            slug='test-post',
            content='This is test content',
            author=self.user,
            status=Post.Status.PUBLISHED
        )

    def test_post_creation(self):
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.slug, 'test-post')
        self.assertEqual(self.post.status, Post.Status.PUBLISHED)
        self.assertEqual(str(self.post), 'Test Post')

    def test_post_slug_generation(self):
        post = Post.objects.create(
            title='Another Test Post',
            content='Content here',
            author=self.user
        )
        self.assertEqual(post.slug, 'another-test-post')

    def test_post_unique_slug(self):
        post2 = Post.objects.create(
            title='Test Post',
            content='Different content',
            author=self.user
        )
        self.assertEqual(post2.slug, 'test-post-1')


class PostAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
        )
        self.post = Post.objects.create(
            title='Test Post',
            slug='test-post',
            content='Test content',
            author=self.user,
            status=Post.Status.PUBLISHED
        )

    def test_get_posts_list(self):
        url = '/api/posts/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_single_post(self):
        url = f'/api/posts/{self.post.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Post')

    def test_create_post_unauthorized(self):
        url = '/api/posts/'
        data = {
            'title': 'New Post',
            'content': 'New content',
            'status': 'published'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_post_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = '/api/posts/'
        data = {
            'title': 'Admin Post',
            'content': 'Admin content',
            'status': 'published'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_search_posts(self):
        url = '/api/posts/?search=Test'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class CommentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            slug='test-post',
            content='Test content',
            author=self.user,
            status=Post.Status.PUBLISHED
        )

    def test_create_comment_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/comments/'
        data = {
            'post': self.post.id,
            'content': 'Great post!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

    def test_create_comment_unauthenticated(self):
        url = '/api/comments/'
        data = {
            'post': self.post.id,
            'content': 'Great post!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_comments_list(self):
        Comment.objects.create(
            post=self.post,
            user=self.user,
            content='Test comment'
        )
        url = '/api/comments/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_comments_filtered_by_post_slug(self):
        # Create another post and comment
        other_post = Post.objects.create(
            title='Other Post',
            slug='other-post',
            content='Other content',
            author=self.user,
            status=Post.Status.PUBLISHED
        )
        Comment.objects.create(
            post=self.post,
            user=self.user,
            content='Comment on first post'
        )
        Comment.objects.create(
            post=other_post,
            user=self.user,
            content='Comment on other post'
        )
        
        # Test filtering by first post slug
        url = f'/api/comments/?post_slug={self.post.slug}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['content'], 'Comment on first post')


class LikeAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            slug='test-post',
            content='Test content',
            author=self.user,
            status=Post.Status.PUBLISHED
        )

    def test_like_post_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/posts/{self.post.slug}/like/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 1)
        self.assertEqual(response.data['message'], 'Post liked')

    def test_like_post_unauthenticated(self):
        url = f'/api/posts/{self.post.slug}/like/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_like_post_already_liked(self):
        self.client.force_authenticate(user=self.user)
        Like.objects.create(user=self.user, post=self.post)
        url = f'/api/posts/{self.post.slug}/like/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Already liked')

    def test_unlike_post(self):
        self.client.force_authenticate(user=self.user)
        Like.objects.create(user=self.user, post=self.post)
        url = f'/api/posts/{self.post.slug}/unlike/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 0)
        self.assertEqual(response.data['message'], 'Like removed')

    def test_unlike_post_not_liked(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/posts/{self.post.slug}/unlike/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No like to remove')

    def test_like_nonexistent_post(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/posts/nonexistent-slug/like/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Post not found')


class UserRegistrationTest(APITestCase):
    def test_user_registration(self):
        url = '/api/auth/register/'
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'newuser')

    def test_user_registration_missing_data(self):
        url = '/api/auth/register/'
        data = {
            'username': 'newuser',
            'password': 'newpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
