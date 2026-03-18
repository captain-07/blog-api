/**
 * Post Detail Page JavaScript
 * Handles individual post display and like functionality
 */

// State management
let currentPost = null;
let isLoading = false;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const postDetail = document.getElementById('postDetail');
const backButton = document.getElementById('backButton');

/**
 * Initialize the post detail page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get post slug from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        showError();
        return;
    }
    
    loadPost(slug);
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
}

/**
 * Load post from API
 */
async function loadPost(slug) {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    try {
        const post = await window.BlogAPI.getPost(slug);
        currentPost = post;
        renderPost(post);
        showPost();
    } catch (error) {
        console.error('Error loading post:', error);
        showError();
    } finally {
        isLoading = false;
    }
}

/**
 * Render post to the DOM
 */
function renderPost(post) {
    // Handle different data structures
    const title = post.title || 'Untitled';
    const content = post.content || post.body || '';
    const authorName = post.author?.username || post.author_name || 'Unknown Author';
    const authorId = post.author?.id || post.author_id;
    const date = post.created_at || post.published_date || post.date;
    const postId = post.id;
    const likeCount = post.likes || post.like_count || 0;
    const isLiked = post.is_liked || false;

    // Format date
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    // Process content (convert line breaks to paragraphs if needed)
    const processedContent = processContent(content);

    postDetail.innerHTML = `
        <h1 class="post-detail-title">${escapeHtml(title)}</h1>
        
        <div class="post-detail-meta">
            <div class="post-author">
                <a href="author.html?id=${authorId}" class="post-author">
                    ${escapeHtml(authorName)}
                </a>
            </div>
            ${formattedDate ? `<div class="post-date">${formattedDate}</div>` : ''}
            <div class="like-section">
                <button class="like-button ${isLiked ? 'liked' : ''}" id="likeButton" data-post-id="${postId}">
                    <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                    <span class="like-count">${likeCount}</span>
                    <span class="like-text">${likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>
            </div>
        </div>
        
        <div class="post-detail-content">
            ${processedContent}
        </div>
    `;

    // Setup like button event listener
    const likeButton = document.getElementById('likeButton');
    if (likeButton) {
        likeButton.addEventListener('click', handleLike);
    }
}

/**
 * Process content for display
 */
function processContent(content) {
    if (!content) return '';
    
    // If content contains HTML tags, use as-is
    if (/<[^>]+>/.test(content)) {
        return content;
    }
    
    // Convert plain text to paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map(paragraph => {
        // Convert single line breaks to <br> within paragraphs
        const processedParagraph = paragraph.replace(/\n/g, '<br>');
        return `<p>${escapeHtml(processedParagraph)}</p>`;
    }).join('');
}

/**
 * Handle like button click
 */
async function handleLike(event) {
    event.preventDefault();
    
    if (!currentPost || isLoading) return;
    
    const likeButton = event.currentTarget;
    const wasLiked = likeButton.classList.contains('liked');
    
    // Optimistic UI update
    const likeCount = likeButton.querySelector('.like-count');
    const likeIcon = likeButton.querySelector('.like-icon');
    const likeText = likeButton.querySelector('.like-text');
    
    const currentCount = parseInt(likeCount.textContent);
    const newCount = wasLiked ? currentCount - 1 : currentCount + 1;
    
    likeButton.classList.toggle('liked');
    likeIcon.textContent = wasLiked ? '🤍' : '❤️';
    likeCount.textContent = newCount;
    likeText.textContent = newCount === 1 ? 'Like' : 'Likes';
    
    // Disable button temporarily
    likeButton.disabled = true;
    
    try {
        await window.BlogAPI.likePost(currentPost.slug);
        
        // Update the current post data
        currentPost.likes = newCount;
        currentPost.is_liked = !wasLiked;
        
    } catch (error) {
        console.error('Error liking post:', error);
        
        // Revert optimistic update on error
        likeButton.classList.toggle('liked');
        likeIcon.textContent = wasLiked ? '❤️' : '🤍';
        likeCount.textContent = currentCount;
        likeText.textContent = currentCount === 1 ? 'Like' : 'Likes';
        
        // Show error message (optional)
        showLikeError();
    } finally {
        likeButton.disabled = false;
    }
}

/**
 * Show like error message
 */
function showLikeError() {
    // Create a temporary error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-warning alert-dismissible fade show position-fixed';
    errorMessage.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
    errorMessage.innerHTML = `
        <strong>Oops!</strong> Unable to update like. Please try again.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(errorMessage);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 3000);
}

/**
 * Show loading state
 */
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    postDetail.style.display = 'none';
}

/**
 * Show post
 */
function showPost() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    postDetail.style.display = 'block';
}

/**
 * Show error state
 */
function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    postDetail.style.display = 'none';
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
window.PostDetail = {
    loadPost,
    handleLike
};
