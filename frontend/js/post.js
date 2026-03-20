/**
 * Post Detail Page JavaScript
 * Handles individual post display, likes, and comments
 */

// State management
let currentPost = null;
let isLoading = false;
let isLiked = false;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const postDetail = document.getElementById('postDetail');
const likeBtn = document.getElementById('likeBtn');
const likeIcon = document.getElementById('likeIcon');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const commentInput = document.getElementById('commentInput');
const submitComment = document.getElementById('submitComment');
const commentsList = document.getElementById('commentsList');
const commentFormContainer = document.getElementById('commentFormContainer');
const loginToComment = document.getElementById('loginToComment');

/**
 * Initialize the post detail page
 */
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        showError();
        return;
    }
    
    // Auth check for comment form
    if (localStorage.getItem('access_token')) {
        commentFormContainer.style.display = 'block';
        loginToComment.style.display = 'none';
    }

    loadPost(slug);
    setupEventListeners();
});

function setupEventListeners() {
    likeBtn.addEventListener('click', handleLike);
    submitComment.addEventListener('click', handleSubmitComment);
}

async function loadPost(slug) {
    if (isLoading) return;
    isLoading = true;
    showLoading();

    try {
        const post = await window.BlogAPI.getPost(slug);
        currentPost = post;
        renderPost(post);
        await loadComments(slug);
        showPost();
    } catch (error) {
        console.error('Error loading post:', error);
        showError();
    } finally {
        isLoading = false;
    }
}

function renderPost(post) {
    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postAuthor').innerHTML = `By <a href="author.html?id=${post.author.id}">${escapeHtml(post.author.username)}</a>`;
    document.getElementById('postMeta').textContent = `Journal — ${new Date(post.created_at).toLocaleDateString()}`;
    
    const image = post.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200';
    document.getElementById('postFeaturedImage').src = image;
    document.getElementById('postContent').innerHTML = processContent(post.content);
    
    likeCount.textContent = post.likes_count || 0;
    
    // Check if liked (backend would ideally provide this, but we can check local storage or similar)
    // For now, let's assume we can hit the endpoint and handle the error if already liked
}

async function handleLike() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        if (!isLiked) {
            await window.BlogAPI.likePost(currentPost.slug);
            isLiked = true;
            likeIcon.textContent = '❤️';
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        } else {
            await window.BlogAPI.unlikePost(currentPost.slug);
            isLiked = false;
            likeIcon.textContent = '🤍';
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        }
    } catch (error) {
        console.error('Like error:', error);
        // If error is "Already liked", sync UI
        if (error.status === 400) {
            isLiked = true;
            likeIcon.textContent = '❤️';
        }
    }
}

async function loadComments(slug) {
    try {
        const comments = await window.BlogAPI.getComments(slug);
        renderComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function renderComments(comments) {
    commentCount.textContent = comments.length;
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-muted">No comments yet. Be the first to share your thoughts.</p>';
        return;
    }

    comments.forEach(comment => {
        const div = document.createElement('div');
        div.style.marginBottom = '2rem';
        div.style.paddingBottom = '1.5rem';
        div.style.borderBottom = '1px solid #f5f5f5';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(comment.user)}</span>
                <span style="font-size: 0.8rem; color: #999;">${new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p style="font-size: 1rem; color: #444; line-height: 1.5;">${escapeHtml(comment.content)}</p>
        `;
        commentsList.appendChild(div);
    });
}

async function handleSubmitComment() {
    const content = commentInput.value.trim();
    if (!content) return;

    submitComment.disabled = true;
    submitComment.textContent = 'Posting...';

    try {
        await window.BlogAPI.createComment(currentPost.slug, content);
        commentInput.value = '';
        await loadComments(currentPost.slug);
    } catch (error) {
        console.error('Comment error:', error);
        alert('Failed to post comment. Please try again.');
    } finally {
        submitComment.disabled = false;
        submitComment.textContent = 'Post Comment';
    }
}

function processContent(content) {
    if (!content) return '';
    return content.split('\n\n').map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    postDetail.style.display = 'none';
}

function showPost() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    postDetail.style.display = 'block';
}

function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    postDetail.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
