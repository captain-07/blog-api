/**
 * Home Page JavaScript
 */

// State management
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

// DOM elements
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const postsList = document.getElementById('postsList');
const pagination = document.getElementById('pagination');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInfo = document.getElementById('pageInfo');

/**
 * Initialize
 */
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
});

function setupEventListeners() {
    // Pagination
    prevButton.addEventListener('click', () => {
        if (currentPage > 1 && !isLoading) {
            currentPage--;
            loadPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

async function loadPosts() {
    if (isLoading) return;
    isLoading = true;
    showLoading();

    try {
        // Fetch posts without search or specific ordering to keep it minimalist
        const response = await window.BlogAPI.getPosts(currentPage);
        const posts = response.results || [];
        const totalCount = response.count || 0;
        totalPages = Math.ceil(totalCount / 10);

        if (posts.length > 0) {
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

function renderPosts(posts) {
    postsList.innerHTML = '';
    posts.forEach(post => {
        const card = createPostCard(post);
        postsList.appendChild(card);
    });
}

function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    
    const title = post.title || 'Untitled';
    const content = post.content || '';
    const authorName = post.author?.username || 'Unknown';
    const authorId = post.author?.id;
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

function updatePagination() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    if (totalPages > 1) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pagination.style.display = 'block';
    } else {
        pagination.style.display = 'none';
    }
}

function showLoading() {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

function showPosts() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    postsList.style.display = 'grid';
}

function showEmpty() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

function showError() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.innerHTML = '<p class="text-muted">Error loading posts. Please try again.</p>';
    postsList.style.display = 'none';
    pagination.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
