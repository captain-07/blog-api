# Deb Blogs API

A RESTful blog API built with Django and Django REST Framework for Deb Blogs.

## Features

- **Post Management**: Create, read, update, and delete blog posts
- **Comments**: Add comments to posts
- **Likes**: Like/unlike posts
- **User Authentication**: JWT-based authentication system
- **Image Upload**: Cloudinary integration for featured images
- **Search & Filtering**: Search posts by title and content
- **Pagination**: Efficient pagination for post listings

## Tech Stack

- **Backend**: Django 6.0.2
- **API**: Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: SQLite (development)
- **File Storage**: Cloudinary
- **Environment Management**: python-dotenv

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bfy/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser** (optional)
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## API Documentation

Your API includes automatic interactive documentation:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

These provide interactive API exploration with testing capabilities.

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT token
- `POST /api/auth/refresh/` - Refresh JWT token

### Posts
- `GET /api/posts/` - List all published posts
- `POST /api/posts/` - Create new post (admin only)
- `GET /api/posts/<slug>/` - Get specific post
- `PUT /api/posts/<slug>/` - Update post (admin only)
- `DELETE /api/posts/<slug>/` - Delete post (admin only)
- `POST /api/posts/<slug>/like/` - Like a post (authenticated)
- `DELETE /api/posts/<slug>/unlike/` - Unlike a post (authenticated)

### Comments
- `GET /api/comments/` - List all comments
- `POST /api/comments/` - Create new comment (authenticated)
- `GET /api/comments/<id>/` - Get specific comment
- `PUT /api/comments/<id>/` - Update comment (author only)
- `DELETE /api/comments/<id>/` - Delete comment (author only)

## Environment Variables

See `.env.example` for all required environment variables:

- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

### Login and get token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

### Get all posts
```bash
curl -X GET http://localhost:8000/api/posts/
```

### Like a post
```bash
curl -X POST http://localhost:8000/api/posts/my-first-post/like/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Running Tests
```bash
python manage.py test
```

### Creating New Migrations
```bash
python manage.py makemigrations
```

### Django Admin
Access the admin panel at `http://localhost:8000/admin/`

## Deployment

1. Set `DEBUG=False` in production
2. Configure `ALLOWED_HOSTS` with your domain(s)
3. Use a production database (PostgreSQL recommended)
4. Set up proper static file serving
5. Configure CORS if needed
6. Use environment variables for all sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
