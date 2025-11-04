# ✨ Features - Reddit Client

Complete feature list with technical details and usage examples.

---

## 🎯 Core Features

### 1. Multi-Lane Layout
**Description:** Browse multiple subreddits simultaneously in separate lanes.

**Technical Details:**
- Horizontal scrolling container
- Each lane is 350-400px wide
- Smooth scroll behavior
- Custom scrollbar styling
- Responsive on mobile (vertical stacking)

**Usage:**
```javascript
// Lanes are stored in an array
lanes = [
    { id: 1, subreddit: 'javascript', posts: [...] },
    { id: 2, subreddit: 'webdev', posts: [...] }
];
```

**Benefits:**
- Compare content across subreddits
- Monitor multiple topics simultaneously
- Efficient content consumption
- Customizable layout

---

### 2. Reddit API Integration
**Description:** Fetches real-time data from Reddit's public JSON API.

**Technical Details:**
- Endpoint: `https://www.reddit.com/r/{subreddit}.json`
- Limit: 25 posts per request
- No authentication required
- CORS-enabled
- Rate limit: ~60 requests/minute

**API Response:**
```json
{
    "data": {
        "children": [
            {
                "data": {
                    "id": "abc123",
                    "title": "Post title",
                    "author": "username",
                    "score": 1234,
                    "num_comments": 56,
                    "created_utc": 1234567890,
                    "permalink": "/r/subreddit/comments/...",
                    "url": "https://..."
                }
            }
        ]
    }
}
```

**Error Handling:**
- 404: Subreddit not found
- 403: Private/banned subreddit
- 429: Rate limit exceeded
- Network errors: Connection issues

---

### 3. Subreddit Verification
**Description:** Validates subreddit existence before adding lanes.

**Validation Steps:**
1. Check if input is not empty
2. Check if lane already exists
3. Fetch from Reddit API
4. Verify response status
5. Check if posts exist
6. Add lane if valid

**Error Messages:**
- "Please enter a subreddit name"
- "r/subreddit is already added"
- "Subreddit r/subreddit not found"
- "Access to r/subreddit is forbidden"
- "r/subreddit has no posts or doesn't exist"

**Code Example:**
```javascript
async function handleAddLane() {
    const subreddit = subredditInput.value.trim();
    
    if (!subreddit) {
        showMessage('Please enter a subreddit name', 'error');
        return;
    }
    
    if (lanes.some(lane => lane.subreddit.toLowerCase() === subreddit.toLowerCase())) {
        showMessage(`r/${subreddit} is already added`, 'error');
        return;
    }
    
    const posts = await fetchSubredditPosts(subreddit);
    // ... add lane
}
```

---

### 4. Local Storage Persistence
**Description:** Automatically saves and restores lanes using browser localStorage.

**Storage Key:**
```javascript
const STORAGE_KEY = 'reddit_client_lanes';
```

**Stored Data Structure:**
```json
[
    {
        "id": 1234567890,
        "subreddit": "javascript",
        "posts": [
            {
                "id": "abc123",
                "title": "Post title",
                "author": "username",
                "score": 1234,
                "num_comments": 56,
                "created_utc": 1234567890,
                "permalink": "/r/javascript/comments/...",
                "url": "https://..."
            }
        ]
    }
]
```

**Features:**
- Auto-save on add/remove
- Auto-load on page load
- Survives browser refresh
- ~5-10MB storage limit
- Handles storage errors gracefully

**Code Example:**
```javascript
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
```

---

### 5. Loading States
**Description:** Visual feedback during asynchronous operations.

**Loading Indicators:**

**Global Loading Overlay:**
```html
<div class="loading-overlay">
    <div class="spinner-large"></div>
    <p>Loading subreddit...</p>
</div>
```

**Lane Loading:**
```html
<div class="lane-loading">
    <div class="spinner"></div>
    <p>Refreshing...</p>
</div>
```

**CSS Animation:**
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.spinner {
    animation: spin 1s linear infinite;
}
```

**When Shown:**
- Adding new lane
- Refreshing lane posts
- Initial data fetch

---

### 6. Error Handling
**Description:** Comprehensive error handling for all scenarios.

**Error Types:**

**1. Validation Errors:**
- Empty input
- Duplicate lane
- Invalid subreddit name

**2. API Errors:**
- 404: Not found
- 403: Forbidden
- 429: Rate limit
- 500: Server error

**3. Network Errors:**
- Connection timeout
- No internet
- CORS issues

**4. Storage Errors:**
- localStorage full
- localStorage disabled
- JSON parse errors

**Error Display:**
```javascript
function showMessage(message, type) {
    addLaneMessage.textContent = message;
    addLaneMessage.className = `add-lane-message ${type}`;
    addLaneMessage.classList.remove('hidden');
    
    setTimeout(() => {
        addLaneMessage.classList.add('hidden');
    }, 5000);
}
```

**Error Styling:**
```css
.add-lane-message.error {
    background: #ffebee;
    color: #c62828;
    border-left: 4px solid var(--danger);
}
```

---

### 7. Responsive Design
**Description:** Adapts to different screen sizes and devices.

**Breakpoints:**
```css
/* Desktop: > 768px */
.lane {
    min-width: 350px;
    max-width: 400px;
}

/* Mobile: ≤ 768px */
@media (max-width: 768px) {
    .lane {
        min-width: 300px;
    }
    
    .header-content {
        flex-direction: column;
    }
    
    .add-lane-form {
        flex-direction: column;
    }
}
```

**Mobile Optimizations:**
- Touch-friendly buttons (min 44px)
- Vertical lane stacking
- Simplified header
- Larger tap targets
- Optimized font sizes

---

## 🎨 UI Features

### 1. Post Cards
**Description:** Beautiful cards displaying post information.

**Card Structure:**
```html
<div class="post-card">
    <div class="post-header">
        <span class="post-author">u/username</span>
        <span class="post-time">• 2h ago</span>
    </div>
    <div class="post-title">Post Title Here</div>
    <div class="post-footer">
        <div class="post-votes">⬆️ 1.2k</div>
        <div class="post-comments">💬 45</div>
    </div>
</div>
```

**Displayed Information:**
- Author username
- Relative time (5m ago, 2h ago, 3d ago)
- Post title (full text)
- Upvote count (formatted)
- Comment count (formatted)

**Interactions:**
- Hover effect (lift + shadow)
- Click to open on Reddit
- Smooth animations

---

### 2. Lane Controls
**Description:** Action buttons for each lane.

**Controls:**
- 🔄 **Refresh**: Update posts
- ✖️ **Remove**: Delete lane

**Button Styling:**
```css
.lane-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
}

.lane-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}
```

---

### 3. Empty State
**Description:** Welcoming screen when no lanes exist.

**Elements:**
- Large emoji icon (🚀)
- Welcome message
- Instructions
- Suggestion chips

**Suggestion Chips:**
```html
<button class="chip" data-subreddit="javascript">
    javascript
</button>
```

**Interaction:**
- Click chip to auto-fill input
- Animated bounce effect
- Hover scale effect

---

### 4. Animations
**Description:** Smooth transitions and effects.

**Animation Types:**

**Fade In:**
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

**Fade In Up:**
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

**Slide In Right:**
```css
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```

**Spin:**
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

**Bounce:**
```css
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
```

---

## 🔧 Functional Features

### 1. Add Lane
**Function:** `handleAddLane()`

**Process:**
1. Get input value
2. Validate input
3. Check for duplicates
4. Show loading overlay
5. Fetch posts from Reddit
6. Validate response
7. Add to state
8. Save to localStorage
9. Render lane
10. Clear input
11. Show success message
12. Hide loading

**Keyboard Support:**
- Press Enter to add

---

### 2. Refresh Lane
**Function:** `handleRefreshLane(laneId)`

**Process:**
1. Find lane by ID
2. Show loading in lane
3. Fetch new posts
4. Update state
5. Save to localStorage
6. Re-render posts
7. Handle errors

**Benefits:**
- Get latest posts
- Update vote counts
- See new content

---

### 3. Remove Lane
**Function:** `handleRemoveLane(laneId)`

**Process:**
1. Filter lane from state
2. Save to localStorage
3. Animate removal
4. Remove from DOM
5. Show empty state if needed

**Animation:**
```javascript
laneElement.style.animation = 'fadeOut 0.3s ease';
setTimeout(() => {
    laneElement.remove();
}, 300);
```

---

### 4. Clear All
**Function:** `handleClearAll()`

**Process:**
1. Confirm with user
2. Clear lanes array
3. Save to localStorage
4. Clear DOM
5. Show empty state
6. Show success message

**Confirmation:**
```javascript
if (confirm('Are you sure you want to remove all lanes?')) {
    // Clear all
}
```

---

## 🛠️ Utility Features

### 1. Time Formatting
**Function:** `formatTimeAgo(timestamp)`

**Conversions:**
- < 60s: "just now"
- < 1h: "5m ago"
- < 24h: "2h ago"
- < 7d: "3d ago"
- ≥ 7d: "2w ago"

**Code:**
```javascript
function formatTimeAgo(timestamp) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}
```

---

### 2. Number Formatting
**Function:** `formatNumber(num)`

**Conversions:**
- 1234 → "1.2k"
- 1234567 → "1.2M"
- 123 → "123"

**Code:**
```javascript
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}
```

---

### 3. HTML Escaping
**Function:** `escapeHtml(text)`

**Purpose:** Prevent XSS attacks

**Code:**
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

**Example:**
```javascript
escapeHtml('<script>alert("XSS")</script>')
// Returns: "&lt;script&gt;alert("XSS")&lt;/script&gt;"
```

---

## 🎨 Design Features

### Color Scheme
- **Primary**: Reddit Orange (#ff4500)
- **Secondary**: Reddit Blue (#0079d3)
- **Background**: Light Gray (#dae0e6)
- **Cards**: White (#ffffff)
- **Text**: Dark Gray (#1a1a1b)

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, Roboto)
- **Sizes**: 0.85rem - 2.5rem
- **Weights**: 400 (normal), 600 (semi-bold), 700 (bold)

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

### Shadows
- **SM**: 0 1px 3px rgba(0,0,0,0.1)
- **MD**: 0 4px 6px rgba(0,0,0,0.1)
- **LG**: 0 10px 20px rgba(0,0,0,0.15)

---

**Complete feature documentation! 🎉**

