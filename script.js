// ===== Configuration =====
const REDDIT_API_BASE = 'https://www.reddit.com';
const STORAGE_KEY = 'reddit_client_lanes';
const POSTS_LIMIT = 25;

// CORS proxy options (fallback if direct access fails)
const CORS_PROXIES = [
    '', // Try direct first
    'https://corsproxy.io/?', // Fallback 1
    'https://api.allorigins.win/raw?url=' // Fallback 2
];

// ===== State Management =====
let lanes = [];

// ===== DOM Elements =====
const subredditInput = document.getElementById('subreddit-input');
const addLaneBtn = document.getElementById('add-lane-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const addLaneMessage = document.getElementById('add-lane-message');
const emptyState = document.getElementById('empty-state');
const lanesContainer = document.getElementById('lanes-container');
const loadingOverlay = document.getElementById('loading-overlay');

// ===== Initialization =====
function init() {
    setupEventListeners();
    loadLanesFromStorage();
    
    // If no lanes, show empty state
    if (lanes.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
        renderAllLanes();
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    addLaneBtn.addEventListener('click', handleAddLane);
    clearAllBtn.addEventListener('click', handleClearAll);
    
    // Enter key to add lane
    subredditInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddLane();
        }
    });
    
    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const subreddit = chip.dataset.subreddit;
            subredditInput.value = subreddit;
            handleAddLane();
        });
    });
}

// ===== Add Lane Handler =====
async function handleAddLane() {
    const subreddit = subredditInput.value.trim();
    
    // Validation
    if (!subreddit) {
        showMessage('Please enter a subreddit name', 'error');
        return;
    }
    
    // Check if lane already exists
    if (lanes.some(lane => lane.subreddit.toLowerCase() === subreddit.toLowerCase())) {
        showMessage(`r/${subreddit} is already added`, 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        // Verify subreddit exists and fetch posts
        const posts = await fetchSubredditPosts(subreddit);
        
        if (posts.length === 0) {
            showMessage(`r/${subreddit} has no posts or doesn't exist`, 'error');
            hideLoading();
            return;
        }
        
        // Add lane to state
        const newLane = {
            id: Date.now(),
            subreddit: subreddit,
            posts: posts
        };
        
        lanes.push(newLane);
        saveLanesToStorage();
        
        // Update UI
        hideEmptyState();
        renderLane(newLane);
        
        // Clear input and show success
        subredditInput.value = '';
        showMessage(`Successfully added r/${subreddit}`, 'success');
        
        hideLoading();
        
    } catch (error) {
        console.error('Error adding lane:', error);
        showMessage(error.message || 'Failed to add subreddit. Please try again.', 'error');
        hideLoading();
    }
}

// ===== Fetch Subreddit Posts =====
async function fetchSubredditPosts(subreddit) {
    // Try different methods to fetch data
    let lastError = null;

    // Method 1: Try direct Reddit API with proper headers
    try {
        const url = `${REDDIT_API_BASE}/r/${subreddit}.json?limit=${POSTS_LIMIT}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache'
        });

        // Handle different error cases
        if (response.status === 404) {
            throw new Error(`Subreddit r/${subreddit} not found`);
        }

        if (response.status === 403) {
            throw new Error(`Access to r/${subreddit} is forbidden (private or banned)`);
        }

        if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch r/${subreddit} (Status: ${response.status})`);
        }

        const data = await response.json();

        // Check if data is valid
        if (!data.data || !data.data.children) {
            throw new Error(`Invalid data received from r/${subreddit}`);
        }

        // Extract posts
        const posts = data.data.children.map(child => ({
            id: child.data.id,
            title: child.data.title,
            author: child.data.author,
            score: child.data.score,
            num_comments: child.data.num_comments,
            created_utc: child.data.created_utc,
            permalink: child.data.permalink,
            url: child.data.url,
            subreddit: child.data.subreddit
        }));

        return posts;

    } catch (error) {
        lastError = error;

        // If it's a CORS or network error, try with CORS proxy
        if (error.name === 'TypeError' || error.message.includes('CORS') || error.message.includes('Network')) {
            console.log('Direct access failed, trying CORS proxy...');

            // Try CORS proxy
            for (let i = 1; i < CORS_PROXIES.length; i++) {
                try {
                    const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(`${REDDIT_API_BASE}/r/${subreddit}.json?limit=${POSTS_LIMIT}`);
                    console.log(`Trying proxy ${i}: ${CORS_PROXIES[i]}`);

                    const response = await fetch(proxyUrl);

                    if (!response.ok) {
                        continue; // Try next proxy
                    }

                    const data = await response.json();

                    // Check if data is valid
                    if (!data.data || !data.data.children) {
                        continue; // Try next proxy
                    }

                    // Extract posts
                    const posts = data.data.children.map(child => ({
                        id: child.data.id,
                        title: child.data.title,
                        author: child.data.author,
                        score: child.data.score,
                        num_comments: child.data.num_comments,
                        created_utc: child.data.created_utc,
                        permalink: child.data.permalink,
                        url: child.data.url,
                        subreddit: child.data.subreddit
                    }));

                    console.log(`Successfully fetched via proxy ${i}`);
                    return posts;

                } catch (proxyError) {
                    console.log(`Proxy ${i} failed:`, proxyError.message);
                    continue; // Try next proxy
                }
            }

            // All proxies failed
            throw new Error('Unable to fetch data. This may be due to CORS restrictions. Try opening the file from a local server (e.g., using Live Server extension in VS Code).');
        }

        // Re-throw other errors
        throw lastError;
    }
}

// ===== Render Lane =====
function renderLane(lane) {
    const laneElement = document.createElement('div');
    laneElement.className = 'lane';
    laneElement.dataset.laneId = lane.id;
    
    laneElement.innerHTML = `
        <div class="lane-header">
            <h2 class="lane-title">
                <span>📋</span>
                r/${lane.subreddit}
            </h2>
            <div class="lane-actions">
                <button class="lane-btn refresh-btn" title="Refresh" data-lane-id="${lane.id}">
                    🔄
                </button>
                <button class="lane-btn remove-btn" title="Remove" data-lane-id="${lane.id}">
                    ✖️
                </button>
            </div>
        </div>
        <div class="lane-content" id="lane-content-${lane.id}">
            ${renderPosts(lane.posts)}
        </div>
    `;
    
    lanesContainer.appendChild(laneElement);
    
    // Add event listeners
    laneElement.querySelector('.refresh-btn').addEventListener('click', () => handleRefreshLane(lane.id));
    laneElement.querySelector('.remove-btn').addEventListener('click', () => handleRemoveLane(lane.id));
}

// ===== Render Posts =====
function renderPosts(posts) {
    if (posts.length === 0) {
        return '<div class="lane-loading">No posts found</div>';
    }
    
    return posts.map(post => `
        <div class="post-card" onclick="window.open('${REDDIT_API_BASE}${post.permalink}', '_blank')">
            <div class="post-header">
                <span class="post-author">u/${post.author}</span>
                <span class="post-time">• ${formatTimeAgo(post.created_utc)}</span>
            </div>
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-footer">
                <div class="post-votes ${post.score > 0 ? 'positive' : ''}">
                    <span>⬆️</span>
                    <span>${formatNumber(post.score)}</span>
                </div>
                <div class="post-comments">
                    <span>💬</span>
                    <span>${formatNumber(post.num_comments)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Render All Lanes =====
function renderAllLanes() {
    lanesContainer.innerHTML = '';
    lanes.forEach(lane => renderLane(lane));
}

// ===== Refresh Lane =====
async function handleRefreshLane(laneId) {
    const lane = lanes.find(l => l.id === laneId);
    if (!lane) return;
    
    const laneContent = document.getElementById(`lane-content-${laneId}`);
    
    // Show loading in lane
    laneContent.innerHTML = `
        <div class="lane-loading">
            <div class="spinner"></div>
            <p>Refreshing...</p>
        </div>
    `;
    
    try {
        const posts = await fetchSubredditPosts(lane.subreddit);
        lane.posts = posts;
        saveLanesToStorage();
        
        // Update lane content
        laneContent.innerHTML = renderPosts(posts);
        
    } catch (error) {
        console.error('Error refreshing lane:', error);
        laneContent.innerHTML = `
            <div class="lane-loading">
                <p style="color: var(--danger);">Failed to refresh</p>
                <p style="font-size: 0.85rem;">${error.message}</p>
            </div>
        `;
    }
}

// ===== Remove Lane =====
function handleRemoveLane(laneId) {
    // Remove from state
    lanes = lanes.filter(lane => lane.id !== laneId);
    saveLanesToStorage();
    
    // Remove from DOM
    const laneElement = document.querySelector(`[data-lane-id="${laneId}"]`);
    if (laneElement) {
        laneElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            laneElement.remove();
            
            // Show empty state if no lanes
            if (lanes.length === 0) {
                showEmptyState();
            }
        }, 300);
    }
}

// ===== Clear All Lanes =====
function handleClearAll() {
    if (lanes.length === 0) return;
    
    if (confirm('Are you sure you want to remove all lanes?')) {
        lanes = [];
        saveLanesToStorage();
        lanesContainer.innerHTML = '';
        showEmptyState();
        showMessage('All lanes cleared', 'success');
    }
}

// ===== Local Storage =====
function saveLanesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lanes));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadLanesFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            lanes = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        lanes = [];
    }
}

// ===== UI Helper Functions =====
function showMessage(message, type) {
    addLaneMessage.textContent = message;
    addLaneMessage.className = `add-lane-message ${type}`;
    addLaneMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        addLaneMessage.classList.add('hidden');
    }, 5000);
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    lanesContainer.classList.add('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
    lanesContainer.classList.remove('hidden');
}

// ===== Utility Functions =====
function formatTimeAgo(timestamp) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', init);

