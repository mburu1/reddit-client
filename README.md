# 📱 Reddit Client - Multi-Lane Browser

A modern, browser-based Reddit client that allows you to browse multiple subreddits simultaneously in customizable lanes. Built with vanilla HTML, CSS, and JavaScript.

![Reddit Client](https://img.shields.io/badge/Reddit-Client-FF4500?style=for-the-badge&logo=reddit)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌟 Features

### Core Features
- ✅ **Multi-Lane Layout** - Browse multiple subreddits side-by-side
- ✅ **Real-Time Data** - Fetches live posts from Reddit JSON API
- ✅ **Subreddit Verification** - Validates subreddit existence before adding
- ✅ **Local Storage** - Saves your lanes and restores them on reload
- ✅ **Responsive Design** - Works perfectly on desktop and mobile devices
- ✅ **Loading States** - Beautiful loading animations while fetching data
- ✅ **Error Handling** - Comprehensive error messages for all scenarios

### Lane Management
- ➕ **Add Lanes** - Add any public subreddit by name
- 🔄 **Refresh Lanes** - Update posts in individual lanes
- ✖️ **Remove Lanes** - Delete individual lanes
- 🗑️ **Clear All** - Remove all lanes at once
- 💾 **Auto-Save** - Automatically saves your configuration

### Post Display
- 📝 **Post Title** - Full post titles
- 👤 **Author** - Username of the poster
- ⬆️ **Upvotes** - Vote count with formatting (1.2k, 45.6M)
- 💬 **Comments** - Number of comments
- ⏰ **Time** - Relative time (5m ago, 2h ago, 3d ago)
- 🔗 **Direct Links** - Click any post to open on Reddit

### User Experience
- 🎨 **Reddit-Inspired Design** - Familiar orange and blue color scheme
- ✨ **Smooth Animations** - Fade-in, slide-in, and hover effects
- 🎯 **Quick Suggestions** - Popular subreddit chips for easy start
- 📱 **Mobile Optimized** - Touch-friendly interface
- ⌨️ **Keyboard Support** - Press Enter to add lanes

---

## 🚀 Quick Start

### 1. Open the Application
Simply open `index.html` in your web browser:
```bash
# Double-click index.html, or
# Right-click → Open with → Your Browser
```

### 2. Add Your First Lane
- Type a subreddit name (e.g., "javascript", "funny", "pics")
- Click "Add Lane" or press Enter
- Wait for the posts to load

### 3. Explore
- Click on any post to open it on Reddit
- Use the refresh button (🔄) to update posts
- Use the remove button (✖️) to delete a lane
- Add more lanes to browse multiple subreddits

---

## 📁 Project Structure

```
reddit-client/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and animations
├── script.js           # All JavaScript functionality
├── README.md           # This file
├── QUICK_START.md      # Quick start guide
├── FEATURES.md         # Detailed feature list
└── TESTING_GUIDE.md    # Testing instructions
```

---

## 🔧 How It Works

### Reddit JSON API
The application uses Reddit's public JSON feed:
```
https://www.reddit.com/r/{subreddit}.json?limit=25
```

**Example:**
```javascript
// Fetch posts from r/javascript
fetch('https://www.reddit.com/r/javascript.json?limit=25')
    .then(response => response.json())
    .then(data => {
        const posts = data.data.children;
        // Process posts...
    });
```

### Data Flow
```
User Input → Validate → Fetch from Reddit → Parse JSON → Display Posts → Save to LocalStorage
```

### State Management
```javascript
// Global state
let lanes = [
    {
        id: 1234567890,
        subreddit: 'javascript',
        posts: [...]
    },
    // ... more lanes
];

// Saved to localStorage
localStorage.setItem('reddit_client_lanes', JSON.stringify(lanes));
```

---

## 🎨 Design Specifications

### Color Palette
```css
--reddit-orange: #ff4500;   /* Primary brand color */
--reddit-blue: #0079d3;     /* Secondary color */
--reddit-dark: #1a1a1b;     /* Text color */
--reddit-gray: #343536;     /* Secondary text */
--reddit-bg: #dae0e6;       /* Background */
--reddit-card: #ffffff;     /* Card background */
```

### Layout
- **Header**: Sticky header with logo and clear all button
- **Add Lane Section**: Input field and add button
- **Lanes Container**: Horizontal scrolling container
- **Lane**: 350-400px wide, full height cards
- **Footer**: Credits and API information

### Responsive Breakpoints
- **Desktop**: > 768px (full layout)
- **Mobile**: ≤ 768px (stacked layout)

---

## 🔌 API Integration

### Endpoints Used
```
GET https://www.reddit.com/r/{subreddit}.json?limit=25
```

### Response Structure
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

### Error Handling
- **404**: Subreddit not found
- **403**: Private or banned subreddit
- **429**: Rate limit exceeded
- **Network Error**: Connection issues

---

## 💾 Local Storage

### Storage Key
```javascript
const STORAGE_KEY = 'reddit_client_lanes';
```

### Stored Data
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

### Persistence
- Automatically saves when lanes are added/removed
- Automatically loads on page load
- Survives browser refresh
- Cleared when browser data is cleared

---

## 🎯 Key Functions

### Core Functions

#### `fetchSubredditPosts(subreddit)`
Fetches posts from a subreddit using Reddit JSON API.
```javascript
const posts = await fetchSubredditPosts('javascript');
```

#### `handleAddLane()`
Validates input, fetches posts, and adds a new lane.

#### `handleRefreshLane(laneId)`
Refreshes posts in a specific lane.

#### `handleRemoveLane(laneId)`
Removes a lane from the UI and storage.

#### `saveLanesToStorage()`
Saves current lanes to localStorage.

#### `loadLanesFromStorage()`
Loads lanes from localStorage on init.

### Utility Functions

#### `formatTimeAgo(timestamp)`
Converts Unix timestamp to relative time.
```javascript
formatTimeAgo(1234567890) // "5m ago"
```

#### `formatNumber(num)`
Formats large numbers with k/M suffixes.
```javascript
formatNumber(1234) // "1.2k"
formatNumber(1234567) // "1.2M"
```

#### `escapeHtml(text)`
Escapes HTML to prevent XSS attacks.

---

## 🛡️ Security Features

### XSS Prevention
- All user input is escaped before rendering
- Post titles are sanitized using `escapeHtml()`
- No `innerHTML` with unsanitized data

### CORS Handling
- Uses Reddit's public JSON API (CORS-enabled)
- No authentication required
- Read-only access

### Rate Limiting
- Detects 429 status codes
- Shows user-friendly error messages
- Suggests waiting before retry

---

## 🐛 Known Limitations

### Reddit API Limitations
- **Rate Limit**: ~60 requests per minute (unauthenticated)
- **Post Limit**: Maximum 25 posts per request
- **No Authentication**: Cannot access private subreddits
- **Read-Only**: Cannot post, comment, or vote

### Browser Limitations
- **LocalStorage**: ~5-10MB limit (sufficient for ~50 lanes)
- **CORS**: Must use Reddit's JSON endpoint (not API v2)
- **No Real-Time**: Posts don't auto-refresh (manual refresh required)

### Feature Limitations
- No post thumbnails/images (can be added)
- No comment viewing (opens Reddit for comments)
- No sorting options (uses Reddit's default "hot")
- No filtering by time period

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Post thumbnails and images
- [ ] Sorting options (hot, new, top, rising)
- [ ] Time period filters (hour, day, week, month)
- [ ] Search within subreddit
- [ ] Dark mode toggle
- [ ] Export/import lane configuration
- [ ] Keyboard shortcuts
- [ ] Auto-refresh option
- [ ] Infinite scroll
- [ ] Post preview modal

### Advanced Features
- [ ] Multi-subreddit search
- [ ] Custom lane colors
- [ ] Drag-and-drop lane reordering
- [ ] Lane width customization
- [ ] Compact/expanded view toggle
- [ ] Reddit authentication (OAuth)
- [ ] Save posts for later
- [ ] Filter by flair

---

## 📚 Learning Outcomes

By studying this project, you'll learn:

### JavaScript Concepts
- ✅ Async/await and Promises
- ✅ Fetch API and HTTP requests
- ✅ Error handling (try/catch)
- ✅ LocalStorage API
- ✅ DOM manipulation
- ✅ Event handling
- ✅ State management
- ✅ Array methods (map, filter, find)

### API Integration
- ✅ RESTful API consumption
- ✅ JSON parsing
- ✅ Error status handling
- ✅ Rate limiting
- ✅ CORS understanding

### UI/UX Design
- ✅ Responsive design
- ✅ CSS animations
- ✅ Loading states
- ✅ Error states
- ✅ Empty states
- ✅ User feedback

### Best Practices
- ✅ Code organization
- ✅ Separation of concerns
- ✅ DRY principle
- ✅ Security (XSS prevention)
- ✅ Performance optimization

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork and modify
- Add new features
- Improve the design
- Fix bugs
- Enhance documentation

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Credits

- **Reddit API**: https://www.reddit.com
- **Design Inspiration**: Reddit's official design
- **Icons**: Unicode emoji characters

---

## 📞 Support

### Common Issues

**Q: Subreddit not loading?**  
A: Check if the subreddit name is correct and the subreddit is public.

**Q: Rate limit error?**  
A: Wait a few minutes before adding more lanes.

**Q: Lanes not saving?**  
A: Check if localStorage is enabled in your browser.

**Q: Posts not refreshing?**  
A: Click the refresh button (🔄) on individual lanes.

---

**Happy Browsing! 🎉**

Built with ❤️ using vanilla JavaScript

