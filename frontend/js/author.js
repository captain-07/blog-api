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
    const bio = author.bio || author.description || '';
    const email = author.email || '';
    const avatar = author.avatar || author.profile_image || '';

    // Create initials for avatar if no image provided
    const initials = name.slice(0, 2).toUpperCase();

    authorSection.innerHTML = `
        <div class="author-header">
            <div class="author-avatar">
                ${avatar ? `<img src="${avatar}" alt="${escapeHtml(name)}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : initials}
            </div>
            <h1 class="author-name">${escapeHtml(name)}</h1>
            ${bio ? `<p class="author-bio">${escapeHtml(bio)}</p>` : ''}
            ${email ? `<p class="text-muted"><small>📧 ${escapeHtml(email)}</small></p>` : ''}
        </div>
    `;
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
    const authorName = post.author?.username || post.author_name || currentAuthor?.username || currentAuthor?.name || 'Unknown Author';
    const authorId = post.author?.id || post.author_id || currentAuthor?.id;
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
