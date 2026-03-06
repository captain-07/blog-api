from django.contrib import admin
from .models import Post


# Register your models here.
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at', 'published_at')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'content')
