/**
 * Home Page JavaScript
 * Handles post listing, pagination, and search functionality
 */

// State management
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let searchQuery = '';

// DOM elements
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const postsList = document.getElementById('postsList');
const pagination = document.getElementById('pagination');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInfo = document.getElementById('pageInfo');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearch = document.getElementById('clearSearch');

/**
 * Initialize the home page
 */
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Pagination
    prevButton.addEventListener('click', () => {
        if (currentPage > 1 && !isLoading) {
            currentPage--;
            loadPosts();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadPosts();
        }
    });

    // Search functionality
    searchToggle.addEventListener('click', () => {
        searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
        if (searchBar.style.display === 'block') {
            searchInput.focus();
        }
    });

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    clearSearch.addEventListener('click', clearSearchQuery);
}

/**
 * Load posts from API
 */
async function loadPosts() {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    try {
        let response;
        if (searchQuery) {
            response = await window.BlogAPI.searchPosts(searchQuery, currentPage, 10);
        } else {
            response = await window.BlogAPI.getPosts(currentPage, 10);
        }

        // Handle different API response structures
        const posts = response.results || response.data || response;
        const totalCount = response.count || response.total || (Array.isArray(posts) ? posts.length : 0);
        
        totalPages = Math.ceil(totalCount / 10);

        if (posts && posts.length > 0) {
            renderPosts(posts);
            updatePagination();
            showPosts();
        } else {
            showEmpty();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showError();
    } finally {
        isLoading = false;
    }
}

/**
 * Render posts to the DOM
 */
function renderPosts(posts) {
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });
}

/**
 * Create a post card element
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    // Handle different data structures
    const title = post.title || 'Untitled';
    const content = post.content || post.body || '';
    const authorName = post.author?.username || post.author_name || 'Unknown Author';
    const authorId = post.author?.id || post.author_id;
    const date = post.created_at || post.published_date || post.date;
    const slug = post.slug || post.id;

    // Create preview (first 150 characters)
    const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;
    
    // Format date
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    card.innerHTML = `
        <h2 class="post-title">${escapeHtml(title)}</h2>
        <p class="post-preview">${escapeHtml(preview)}</p>
        <div class="post-meta">
            <span class="post-author">
                <a href="author.html?id=${authorId}" onclick="event.stopPropagation()">
                    ${escapeHtml(authorName)}
                </a>
            </span>
            ${formattedDate ? `<span class="post-date">${formattedDate}</span>` : ''}
        </div>
    `;

    // Add click handler to navigate to post detail
    card.addEventListener('click', () => {
        window.location.href = `post.html?slug=${slug}`;
    });

    return card;
}

/**
 * Update pagination controls
 */
function updatePagination() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    if (totalPages > 0) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pagination.style.display = 'flex';
    } else {
        pagination.style.display = 'none';
    }
}

/**
 * Perform search
 */
function performSearch() {
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    loadPosts();
}

/**
 * Clear search query
 */
function clearSearchQuery() {
    searchQuery = '';
    searchInput.value = '';
    currentPage = 1;
    loadPosts();
}

/**
 * Show loading state
 */
function showLoading() {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

/**
 * Show posts
 */
function showPosts() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    postsList.style.display = 'block';
}

/**
 * Show empty state
 */
function showEmpty() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

/**
 * Show error state
 */
function showError() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('.empty-state-text').textContent = 'Error loading posts';
    emptyState.querySelector('.empty-state-subtext').textContent = 'Please try again later';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions for testing if needed
window.HomePage = {
    loadPosts,
    performSearch,
    clearSearchQuery
};
