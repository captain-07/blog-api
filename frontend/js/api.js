/**
 * API Integration Module
 * Handles all communication with Django REST API
 * Base URL: http://127.0.0.1:8000/api/
 */

// API Configuration
const API_BASE_URL = 'https://my-blog-evfv.onrender.com/api/';

/**
 * Generic API request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Get all blog posts with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 * @returns {Promise} Posts data
 */
async function getPosts(page = 1, pageSize = 10) {
    return apiRequest(`posts/?page=${page}&page_size=${pageSize}`);
}

/**
 * Get single post by slug
 * @param {string} slug - Post slug
 * @returns {Promise} Post data
 */
async function getPost(slug) {
    return apiRequest(`posts/${slug}/`);
}

/**
 * Get posts by author
 * @param {number} authorId - Author ID
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 * @returns {Promise} Author posts data
 */
async function getPostsByAuthor(authorId, page = 1, pageSize = 10) {
    return apiRequest(`posts/?author=${authorId}&page=${page}&page_size=${pageSize}`);
}

/**
 * Get author details
 * @param {number} authorId - Author ID
 * @returns {Promise} Author data
 */
async function getAuthor(authorId) {
    return apiRequest(`authors/${authorId}/`);
}

/**
 * Like a post
 * @param {string} slug - Post slug
 * @returns {Promise} Updated post data
 */
async function likePost(slug) {
    return apiRequest(`posts/${slug}/like/`, {
        method: 'POST',
    });
}

/**
 * Search posts
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 * @returns {Promise} Search results
 */
async function searchPosts(query, page = 1, pageSize = 10) {
    return apiRequest(`posts/?search=${query}&page=${page}&page_size=${pageSize}`);
}

// Export for use in other modules
window.BlogAPI = {
    getPosts,
    getPost,
    getPostsByAuthor,
    getAuthor,
    likePost,
    searchPosts,
};
