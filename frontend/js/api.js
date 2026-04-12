/**
 * API Integration Module
 * Handles all communication with Django REST API
 */

// API Configuration
const API_BASE_URL = 'https://my-blog-evfv.onrender.com/api/';

/**
 * Generic API request helper
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        
        if (response.status === 204) return null;
        
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.detail || data.error || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Post Endpoints
const getPosts = (page = 1, search = '', ordering = '-created_at') => 
    apiRequest(`posts/?page=${page}&search=${search}&ordering=${ordering}`);

const getPost = (slug) => apiRequest(`posts/${slug}/`);

const likePost = (slug) => apiRequest(`posts/${slug}/like/`, { method: 'POST' });

const unlikePost = (slug) => apiRequest(`posts/${slug}/unlike/`, { method: 'DELETE' });

// Comment Endpoints
const getComments = (postSlug) => apiRequest(`comments/?post_slug=${postSlug}`);

const createComment = (postSlug, content) => apiRequest(`comments/`, {
    method: 'POST',
    body: JSON.stringify({ post_slug: postSlug, content: content })
});

// Author Endpoints
const getAuthors = () => apiRequest(`authors/`);
const getAuthor = (id) => apiRequest(`authors/${id}/`);
const getPostsByAuthor = (authorId, page = 1) => apiRequest(`posts/?author=${authorId}&page=${page}`);

// Auth Endpoints
const login = (username, password) => apiRequest(`auth/login/`, {
    method: 'POST',
    body: JSON.stringify({ username, password })
});

const register = (username, email, password) => apiRequest(`auth/register/`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
});

const refreshToken = (refresh) => apiRequest(`auth/refresh/`, {
    method: 'POST',
    body: JSON.stringify({ refresh })
});

// Export
window.BlogAPI = {
    getPosts,
    getPost,
    likePost,
    unlikePost,
    getComments,
    createComment,
    getAuthors,
    getAuthor,
    getPostsByAuthor,
    login,
    register,
    refreshToken
};
