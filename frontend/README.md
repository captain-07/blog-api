# Blog Frontend

A clean, minimal blog frontend built with vanilla JavaScript, Bootstrap, and Apple-inspired design principles.

## Features

- **Clean Design**: Apple-inspired minimal interface with lots of whitespace
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Fast Loading**: Optimized for performance with lazy loading
- **Search**: Built-in search functionality for posts
- **Pagination**: Efficient post navigation with pagination
- **Like System**: Interactive like buttons with optimistic updates
- **Author Pages**: Dedicated pages for each author with their posts

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom styles with CSS variables
- **Bootstrap 5**: Responsive grid and components
- **Vanilla JavaScript**: No frameworks, pure JS with modern ES6+ features
- **Fetch API**: For API communication

## Project Structure

```
frontend/
├── index.html              # Home page with post listing
├── post.html               # Post detail page
├── author.html             # Author profile and posts page
├── README.md               # This file
├── css/
│   └── style.css           # Custom styles (Apple-inspired design)
├── js/
│   ├── api.js              # API integration module
│   ├── home.js             # Home page functionality
│   ├── post.js             # Post detail functionality
│   └── author.js           # Author page functionality
└── images/                 # Static images (empty)
```

## API Integration

The frontend connects to a Django REST API at:
```
Base URL: http://127.0.0.1:8000/api/
```

### Available Endpoints

- `GET /posts/` - List all posts (with pagination)
- `GET /posts/{slug}/` - Get single post by slug
- `GET /posts/?author={id}` - Get posts by author
- `GET /authors/{id}/` - Get author details
- `POST /posts/{id}/like/` - Like a post
- `GET /posts/?search={query}` - Search posts

## Design Principles

### Apple-Inspired Minimal Design

- **Typography**: Clean, readable fonts with proper hierarchy
- **Colors**: Limited palette (black, white, gray tones)
- **Spacing**: Generous whitespace and consistent padding
- **Shadows**: Subtle, soft shadows for depth
- **Borders**: Soft borders with rounded corners
- **Transitions**: Smooth, subtle animations

### Visual Elements

- **Cards**: Clean post cards with hover effects
- **Buttons**: Minimal buttons with subtle interactions
- **Loading States**: Elegant loading spinners
- **Empty States**: Friendly messages for no content
- **Error Handling**: Graceful error messages

## Usage

### Local Development

1. Make sure your Django backend is running on `http://127.0.0.1:8000`
2. Open `index.html` in your browser
3. Navigate through the application

### Navigation

- **Home**: View all posts with pagination
- **Post Detail**: Click any post to read full content
- **Author Pages**: Click author names to view their profile
- **Search**: Use the search functionality to find posts
- **Like**: Interact with posts using the like button

### URL Structure

- Home: `index.html`
- Post Detail: `post.html?slug={post-slug}`
- Author Page: `author.html?id={author-id}`

## JavaScript Architecture

### Modular Structure

Each page has its own JavaScript module:
- `api.js`: Shared API integration functions
- `home.js`: Home page logic (post listing, search, pagination)
- `post.js`: Post detail logic (like functionality)
- `author.js`: Author page logic (author info, posts by author)

### Key Features

- **Async/Await**: Modern async patterns for API calls
- **Error Handling**: Comprehensive error handling with user feedback
- **State Management**: Simple state management for UI updates
- **Optimistic Updates**: Instant UI feedback for like actions
- **XSS Protection**: HTML escaping for user-generated content

## Responsive Design

### Breakpoints

- **Desktop**: 1200px and up
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px
- **Small Mobile**: Up to 479px

### Mobile Optimizations

- Touch-friendly buttons and links
- Optimized typography for smaller screens
- Simplified navigation
- Responsive images and layouts

## Performance Considerations

- **Minimal Dependencies**: Only Bootstrap CSS and JS
- **Efficient DOM Manipulation**: Batch updates and minimal reflows
- **Lazy Loading**: Content loaded as needed
- **Optimized Animations**: CSS transitions for smooth performance
- **Error Recovery**: Graceful handling of API failures

## Browser Compatibility

- **Chrome/Chromium**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile Browsers**: iOS Safari, Chrome Mobile

## Customization

### Colors

Edit CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #000000;
    --secondary-color: #666666;
    --accent-color: #007AFF;
    --background-color: #FFFFFF;
    /* ... more variables */
}
```

### Typography

Font families and sizes can be customized in the CSS file. The design uses system fonts for optimal performance and consistency.

### API Configuration

Update the API base URL in `js/api.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

## Contributing

When making changes:

1. **Maintain Design Consistency**: Follow the Apple-inspired minimal design principles
2. **Keep Code Clean**: Use meaningful variable names and proper comments
3. **Test Responsiveness**: Ensure changes work on all screen sizes
4. **Handle Errors**: Always include proper error handling
5. **Performance First**: Consider performance impact of changes

## License

This project is part of a Django blog application. Use according to your project's license.
