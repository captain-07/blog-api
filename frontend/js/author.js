/**
 * Author Page JavaScript
 * Handles author information display and posts by author
 */

// State management
let currentAuthor = null;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const authorSection = document.getElementById('authorSection');
const postsSection = document.getElementById('postsSection');
const postsLoadingState = document.getElementById('postsLoadingState');
const postsEmptyState = document.getElementById('postsEmptyState');
const postsList = document.getElementById('postsList');
const pagination = document.getElementById('pagination');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInfo = document.getElementById('pageInfo');
const backButton = document.getElementById('backButton');

/**
 * Initialize the author page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get author ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = urlParams.get('id');
    
    if (!authorId) {
        showError();
        return;
    }
    
    loadAuthor(authorId);
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Back button functionality
    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Try to go back in history, otherwise go to home
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

    // Pagination
    prevButton.addEventListener('click', () => {
        if (currentPage > 1 && !isLoading) {
            currentPage--;
            loadAuthorPosts();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadAuthorPosts();
        }
    });
}

/**
 * Load author information and posts
 */
async function loadAuthor(authorId) {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    try {
        // Load author information
        const author = await window.BlogAPI.getAuthor(authorId);
        currentAuthor = author;
        renderAuthor(author);
        
        // Load author's posts
        await loadAuthorPosts();
        
        showAuthorSection();
    } catch (error) {
        console.error('Error loading author:', error);
        showError();
    } finally {
        isLoading = false;
    }
}

/**
 * Load posts by current author
 */
async function loadAuthorPosts() {
    if (!currentAuthor || isLoading) return;

    showPostsLoading();

    try {
        const response = await window.BlogAPI.getPostsByAuthor(currentAuthor.id, currentPage, 10);
        
        // Handle different API response structures
        const posts = response.results || response.data || response;
        const totalCount = response.count || response.total || (Array.isArray(posts) ? posts.length : 0);
        
        totalPages = Math.ceil(totalCount / 10);

        if (posts && posts.length > 0) {
            renderPosts(posts);
            updatePagination();
            showPosts();
        } else {
            showPostsEmpty();
        }
    } catch (error) {
        console.error('Error loading author posts:', error);
        showPostsError();
    }
}

/**
 * Render author information
 */
function renderAuthor(author) {
    // Handle different data structures
    const name = author.username || author.name || 'Unknown Author';
    const bio = author.bio || author.description || 'Contributing writer and enthusiast.';

    document.getElementById('authorName').textContent = name;
    document.getElementById('authorBio').textContent = bio;
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
    const card = document.createElement('article');
    card.className = 'post-card';
    
    const title = post.title || 'Untitled';
    const content = post.content || '';
    const authorName = post.author?.username || currentAuthor?.username || 'Unknown';
    const authorId = post.author?.id || currentAuthor?.id;
    const date = post.created_at || post.published_at;
    const slug = post.slug;
    const image = post.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800';

    const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : '';

    card.innerHTML = `
        <a href="post.html?slug=${slug}" class="post-card-image">
            <img src="${image}" alt="${escapeHtml(title)}">
        </a>
        <div class="post-card-category">Journal</div>
        <h2 class="post-card-title">
            <a href="post.html?slug=${slug}">${escapeHtml(title)}</a>
        </h2>
        <p class="post-card-excerpt">${escapeHtml(preview)}</p>
        <div class="post-card-meta">
            <span class="post-author">
                <a href="author.html?id=${authorId}">By ${escapeHtml(authorName)}</a>
            </span>
            <div class="dot"></div>
            ${formattedDate ? `<span class="post-date">${formattedDate}</span>` : ''}
            <div class="dot"></div>
            <span style="font-size: 0.8rem; opacity: 0.7;">💬 ${post.comments?.length || 0}</span>
            <span style="font-size: 0.8rem; opacity: 0.7; margin-left: 0.5rem;">❤️ ${post.likes_count || 0}</span>
        </div>
    `;

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
 * Show loading state for author
 */
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    authorSection.style.display = 'none';
    postsSection.style.display = 'none';
}

/**
 * Show author section
 */
function showAuthorSection() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    authorSection.style.display = 'block';
    postsSection.style.display = 'block';
}

/**
 * Show error state
 */
function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    authorSection.style.display = 'none';
    postsSection.style.display = 'none';
}

/**
 * Show loading state for posts
 */
function showPostsLoading() {
    postsLoadingState.style.display = 'block';
    postsEmptyState.style.display = 'none';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

/**
 * Show posts
 */
function showPosts() {
    postsLoadingState.style.display = 'none';
    postsEmptyState.style.display = 'none';
    postsList.style.display = 'block';
}

/**
 * Show empty state for posts
 */
function showPostsEmpty() {
    postsLoadingState.style.display = 'none';
    postsEmptyState.style.display = 'block';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

/**
 * Show error state for posts
 */
function showPostsError() {
    postsLoadingState.style.display = 'none';
    postsEmptyState.style.display = 'block';
    postsEmptyState.querySelector('.empty-state-text').textContent = 'Error loading posts';
    postsEmptyState.querySelector('.empty-state-subtext').textContent = 'Please try again later';
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
window.AuthorPage = {
    loadAuthor,
    loadAuthorPosts
};
