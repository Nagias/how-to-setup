# DeskHub - System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │   Gallery    │  │     Blog     │  │  Blog Editor │     │ │
│  │  │     View     │  │     View     │  │              │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              AppContext (State Management)            │  │ │
│  │  │  - Setups, Blogs, User Data, Filters, Theme          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │                  Local Storage                        │  │ │
│  │  │  - deskhub_setups                                     │  │ │
│  │  │  - deskhub_blogs                                      │  │ │
│  │  │  - deskhub_user_data                                  │  │ │
│  │  │  - deskhub_theme                                      │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── AppProvider (Context)
│   └── AppContent
│       ├── Header
│       │   ├── Logo
│       │   ├── Navigation
│       │   ├── Search
│       │   ├── ThemeToggle
│       │   └── NewsletterButton
│       │
│       ├── MainContent
│       │   │
│       │   ├── GalleryView
│       │   │   ├── FilterSidebar
│       │   │   │   └── FilterGroup[]
│       │   │   │       └── FilterOption[]
│       │   │   │
│       │   │   └── MasonryGallery
│       │   │       └── SetupCard[]
│       │   │           ├── Image
│       │   │           ├── QuickActions
│       │   │           ├── Tags
│       │   │           ├── Content
│       │   │           └── Meta
│       │   │
│       │   ├── BlogView
│       │   │   └── BlogCard[]
│       │   │       ├── Image
│       │   │       ├── Category
│       │   │       ├── Content
│       │   │       └── Meta
│       │   │
│       │   └── BlogEditor
│       │       ├── BasicInfoForm
│       │       ├── RichTextToolbar
│       │       ├── ContentEditor
│       │       └── ActionButtons
│       │
│       ├── Modals
│       │   ├── SetupDetailModal
│       │   │   ├── ImageGallery
│       │   │   │   ├── MainImage
│       │   │   │   │   └── ProductMarker[]
│       │   │   │   │       └── ProductTooltip
│       │   │   │   └── Thumbnails[]
│       │   │   │
│       │   │   └── Details
│       │   │       ├── Header
│       │   │       ├── Actions
│       │   │       ├── Caption
│       │   │       ├── Tags
│       │   │       ├── Filters
│       │   │       ├── Comments
│       │   │       │   ├── CommentForm
│       │   │       │   └── CommentList
│       │   │       └── SimilarSetups
│       │   │
│       │   └── BlogDetailModal
│       │       ├── CoverImage
│       │       ├── Header
│       │       ├── Meta
│       │       ├── Content
│       │       └── Tags
│       │
│       └── Footer
│           ├── About
│           ├── Links
│           └── Social
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                              │
│  (SetupCard, FilterSidebar, BlogEditor, etc.)                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APP CONTEXT                                  │
│  - State: setups, blogs, userData, filters, theme               │
│  - Actions: toggleLike, addComment, addBlog, etc.               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL STORAGE                                 │
│  - Persist data across sessions                                 │
│  - Initialize on first load                                     │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Interaction
      │
      ▼
Component Handler
      │
      ▼
Context Action
      │
      ├─────────────────┐
      │                 │
      ▼                 ▼
Update State    Update localStorage
      │                 │
      └────────┬────────┘
               │
               ▼
        Re-render Components
               │
               ▼
         Updated UI
```

## Filter System Flow

```
User Selects Filter
      │
      ▼
Update filters state in Context
      │
      ▼
getFilteredSetups() runs
      │
      ├─── Check search query
      ├─── Check colorTone filter
      ├─── Check budget filter
      ├─── Check gender filter
      ├─── Check purpose filter
      └─── Check size filter
      │
      ▼
Return filtered array
      │
      ▼
MasonryGallery re-renders
      │
      ▼
Display filtered setups
```

## Image Loading Strategy

```
Setup Card Rendered
      │
      ▼
Show skeleton placeholder
      │
      ▼
Image starts loading (lazy)
      │
      ├─── Success ──────┐
      │                  │
      │                  ▼
      │         Fade in image
      │         Remove skeleton
      │
      └─── Error ────────┐
                         │
                         ▼
                  Show error icon
                  Keep placeholder
```

## Infinite Scroll Implementation

```
User scrolls down
      │
      ▼
Intersection Observer detects
"Load More Trigger" in viewport
      │
      ▼
Check if more items available
      │
      ├─── Yes ──────────┐
      │                  │
      │                  ▼
      │         Increment page
      │         Slice more items
      │         Update state
      │         Show loading skeletons
      │                  │
      │                  ▼
      │         Render new items
      │
      └─── No ───────────┐
                         │
                         ▼
                  Show "End" message
```

## Theme System

```
User clicks theme toggle
      │
      ▼
toggleTheme() in Context
      │
      ├─── Get current theme
      ├─── Calculate new theme
      ├─── Update state
      ├─── Save to localStorage
      └─── Set data-theme attribute
      │
      ▼
CSS variables update
      │
      ▼
Smooth transition to new theme
```

## Blog Editor Workflow

```
User opens Blog Editor
      │
      ▼
Empty form displayed
      │
      ▼
User fills in fields
      │
      ├─── Title
      ├─── Excerpt
      ├─── Category
      ├─── Cover Image URL
      ├─── Tags
      └─── Content (Rich Text)
      │
      ▼
User clicks toolbar buttons
      │
      ├─── Bold/Italic/Underline
      ├─── Headings (H2, H3)
      ├─── Lists (Bullet, Numbered)
      ├─── Insert Image
      └─── Insert Video
      │
      ▼
Content updates in real-time
      │
      ▼
User clicks "Publish"
      │
      ▼
Form validation
      │
      ├─── Valid ────────┐
      │                  │
      │                  ▼
      │         Create blog object
      │         Add to blogs array
      │         Save to localStorage
      │         Navigate to Blog view
      │
      └─── Invalid ──────┐
                         │
                         ▼
                  Show error message
```

## Setup Detail Modal Flow

```
User clicks Setup Card
      │
      ▼
setSelectedSetup(setup)
      │
      ▼
SetupDetailModal renders
      │
      ├─── Load first image
      ├─── Show thumbnails
      ├─── Render product markers
      ├─── Load comments
      ├─── Calculate similar setups
      └─── Display metadata
      │
      ▼
User interacts
      │
      ├─── Click thumbnail ──────► Change main image
      ├─── Hover product marker ─► Show tooltip
      ├─── Click Like ───────────► Toggle like state
      ├─── Click Save ───────────► Toggle save state
      ├─── Add comment ──────────► Update comments
      └─── Click similar setup ──► Load new setup
```

## Performance Optimization Points

```
1. Component Level
   ├─── React.memo for expensive components
   ├─── useMemo for computed values
   ├─── useCallback for event handlers
   └─── Lazy loading for images

2. Rendering
   ├─── Virtual scrolling (future)
   ├─── Pagination/Infinite scroll
   ├─── Skeleton loading states
   └─── Debounced search

3. Data
   ├─── Local storage caching
   ├─── Derived state (filters)
   ├─── Minimal re-renders
   └─── Optimistic updates

4. Assets
   ├─── Image lazy loading
   ├─── CDN for external images
   ├─── CSS animations (GPU accelerated)
   └─── Code splitting (future)
```

## Security Layers (Future Backend)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  - Input validation                                          │
│  - XSS prevention (sanitize HTML)                           │
│  - CSRF tokens                                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│  - Rate limiting                                             │
│  - Request validation                                        │
│  - Authentication check                                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                              │
│  - JWT verification                                          │
│  - Authorization (RBAC)                                      │
│  - Input sanitization                                        │
│  - SQL injection prevention                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                 │
│  - Encrypted at rest                                         │
│  - Parameterized queries                                     │
│  - Access control                                            │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN (Cloudflare)                        │
│  - Static assets (JS, CSS, Images)                          │
│  - DDoS protection                                           │
│  - SSL/TLS                                                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Vercel/Netlify)                   │
│  - React SPA                                                 │
│  - Automatic deployments                                     │
│  - Edge functions                                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (Railway/Heroku)                │
│  - Node.js + Express                                         │
│  - Authentication                                            │
│  - Business logic                                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────┬──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    DATABASE      │  │  FILE STORAGE    │  │  CACHE (Redis)   │
│  (PostgreSQL)    │  │  (AWS S3/        │  │  - Sessions      │
│  - User data     │  │   Cloudinary)    │  │  - Frequent data │
│  - Setups        │  │  - Images        │  │  - Rate limiting │
│  - Blogs         │  │  - Uploads       │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React 18          - UI Library                         │ │
│  │ Vite              - Build Tool                         │ │
│  │ Vanilla CSS       - Styling                            │ │
│  │ Context API       - State Management                   │ │
│  │ Local Storage     - Data Persistence                   │ │
│  │ Intersection      - Infinite Scroll                    │ │
│  │ Observer API                                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FUTURE BACKEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Node.js + Express - Server                             │ │
│  │ PostgreSQL        - Database                           │ │
│  │ JWT               - Authentication                     │ │
│  │ Bcrypt            - Password Hashing                   │ │
│  │ Cloudinary        - Image Storage                      │ │
│  │ Redis             - Caching                            │ │
│  │ SendGrid          - Email Service                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture is designed to be:
- ✅ Scalable (can handle millions of users)
- ✅ Maintainable (clear separation of concerns)
- ✅ Performant (optimized rendering and data flow)
- ✅ Secure (multiple security layers)
- ✅ Extensible (easy to add new features)
