# Database Schema Design for DeskHub

## Overview
This document outlines the recommended database schema for when you're ready to migrate from localStorage to a proper backend database (PostgreSQL, MongoDB, etc.).

## Entity Relationship Diagram (ERD)

```
Users ──< Setups
Users ──< Blogs
Users ──< Comments
Users ──< Likes
Users ──< Saves
Users ──< Collections
Setups ──< SetupImages
Setups ──< Comments
Setups ──< Likes
Setups ──< Saves
SetupImages ──< Products
Collections ──< CollectionItems
```

## Tables/Collections

### 1. Users
Stores user account information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB,
  role VARCHAR(20) DEFAULT 'user', -- user, admin, moderator
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### 2. Setups
Main desk setup posts.

```sql
CREATE TABLE setups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  caption TEXT,
  slug VARCHAR(250) UNIQUE NOT NULL,
  main_image_url TEXT NOT NULL,
  
  -- Filter attributes
  color_tone VARCHAR(20), -- warm, cool, neutral
  budget_range VARCHAR(20), -- budget, mid-range, premium
  style VARCHAR(20), -- masculine, feminine, neutral
  purpose VARCHAR(30), -- work-from-home, gaming, creative, productivity
  desk_size VARCHAR(20), -- small, medium, large
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
  featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_setups_user_id ON setups(user_id);
CREATE INDEX idx_setups_slug ON setups(slug);
CREATE INDEX idx_setups_status ON setups(status);
CREATE INDEX idx_setups_created_at ON setups(created_at DESC);
CREATE INDEX idx_setups_color_tone ON setups(color_tone);
CREATE INDEX idx_setups_budget_range ON setups(budget_range);
CREATE INDEX idx_setups_purpose ON setups(purpose);
```

### 3. Setup Images
Multiple images for each setup.

```sql
CREATE TABLE setup_images (
  id SERIAL PRIMARY KEY,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_setup_images_setup_id ON setup_images(setup_id);
```

### 4. Products
Products featured in setup images.

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  setup_image_id INTEGER REFERENCES setup_images(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  purchase_url TEXT,
  affiliate_link TEXT,
  brand VARCHAR(100),
  category VARCHAR(50),
  
  -- Position on image (percentage)
  position_x DECIMAL(5, 2), -- 0-100
  position_y DECIMAL(5, 2), -- 0-100
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_setup_image_id ON products(setup_image_id);
CREATE INDEX idx_products_category ON products(category);
```

### 5. Tags
Flexible tagging system.

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE setup_tags (
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (setup_id, tag_id)
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_setup_tags_setup_id ON setup_tags(setup_id);
CREATE INDEX idx_setup_tags_tag_id ON setup_tags(tag_id);
```

### 6. Likes
User likes on setups.

```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setup_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_setup_id ON likes(setup_id);
```

### 7. Saves
User saves/bookmarks.

```sql
CREATE TABLE saves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setup_id)
);

CREATE INDEX idx_saves_user_id ON saves(user_id);
CREATE INDEX idx_saves_setup_id ON saves(setup_id);
```

### 8. Comments
User comments on setups.

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- for replies
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published', -- published, hidden, flagged
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_setup_id ON comments(setup_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

### 9. Collections
User-created collections/boards.

```sql
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(120) NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_items (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(collection_id, setup_id)
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
```

### 10. Blogs
Blog posts.

```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category VARCHAR(50),
  read_time INTEGER, -- minutes
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  seo_title VARCHAR(200),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE blog_tags (
  blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);
```

### 11. Newsletter Subscribers
Email newsletter subscriptions.

```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  verification_token VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
```

### 12. Follows
User following system.

```sql
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

### 13. Notifications
User notifications.

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- like, comment, follow, mention
  title VARCHAR(200),
  message TEXT,
  link_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### 14. Analytics
Track user behavior and engagement.

```sql
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- view, click, search, share
  entity_type VARCHAR(50), -- setup, blog, product
  entity_id INTEGER,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
```

## MongoDB Alternative Schema

If using MongoDB, here's the document structure:

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  profile: {
    displayName: String,
    avatar: String,
    bio: String,
    website: String,
    socialLinks: {
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  role: String,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}

// Setups Collection
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  caption: String,
  slug: String,
  images: [
    {
      url: String,
      caption: String,
      order: Number,
      products: [
        {
          name: String,
          price: Number,
          currency: String,
          purchaseUrl: String,
          position: { x: Number, y: Number }
        }
      ]
    }
  ],
  filters: {
    colorTone: String,
    budget: String,
    style: String,
    purpose: String,
    size: String
  },
  tags: [String],
  metrics: {
    likes: Number,
    comments: Number,
    saves: Number,
    views: Number
  },
  status: String,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}

// Comments Collection
{
  _id: ObjectId,
  userId: ObjectId,
  setupId: ObjectId,
  parentId: ObjectId, // null for top-level
  content: String,
  likes: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}

// Collections Collection
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  slug: String,
  coverImage: String,
  isPublic: Boolean,
  setups: [ObjectId], // array of setup IDs
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Design

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Setups
- `GET /api/setups` - List setups (with filters, pagination)
- `GET /api/setups/:id` - Get single setup
- `POST /api/setups` - Create setup (auth required)
- `PUT /api/setups/:id` - Update setup (auth required)
- `DELETE /api/setups/:id` - Delete setup (auth required)
- `GET /api/setups/:id/similar` - Get similar setups

### Interactions
- `POST /api/setups/:id/like` - Like setup
- `DELETE /api/setups/:id/like` - Unlike setup
- `POST /api/setups/:id/save` - Save setup
- `DELETE /api/setups/:id/save` - Unsave setup
- `POST /api/setups/:id/comments` - Add comment
- `GET /api/setups/:id/comments` - Get comments

### Blogs
- `GET /api/blogs` - List blogs
- `GET /api/blogs/:slug` - Get single blog
- `POST /api/blogs` - Create blog (auth required)
- `PUT /api/blogs/:id` - Update blog (auth required)
- `DELETE /api/blogs/:id` - Delete blog (auth required)

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/me` - Update own profile
- `GET /api/users/:username/setups` - User's setups
- `GET /api/users/:username/collections` - User's collections

### Collections
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get collection
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/items` - Add item to collection
- `DELETE /api/collections/:id/items/:setupId` - Remove item

### Search
- `GET /api/search?q=query&type=setups|blogs` - Search

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe
- `POST /api/newsletter/unsubscribe` - Unsubscribe

## Migration Strategy

### Phase 1: Setup Backend
1. Choose stack (Node.js + Express + PostgreSQL recommended)
2. Set up database
3. Create API endpoints
4. Implement authentication

### Phase 2: Migrate Data
1. Export localStorage data
2. Transform to match schema
3. Import to database
4. Verify data integrity

### Phase 3: Update Frontend
1. Create API service layer
2. Replace localStorage calls with API calls
3. Add loading states
4. Handle errors
5. Add optimistic updates

### Phase 4: Deploy
1. Deploy backend (Heroku, Railway, AWS)
2. Deploy database (Supabase, PlanetScale, AWS RDS)
3. Update frontend to use production API
4. Set up monitoring and analytics

## Security Considerations

1. **Authentication**: Use JWT tokens with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize HTML content
6. **CSRF Protection**: Implement CSRF tokens
7. **Rate Limiting**: Prevent abuse
8. **File Upload**: Validate file types and sizes
9. **HTTPS**: Enforce SSL/TLS
10. **Environment Variables**: Store secrets securely

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Use Redis for frequently accessed data
3. **CDN**: Serve images from CDN (Cloudinary, AWS S3)
4. **Pagination**: Limit results per page
5. **Lazy Loading**: Load data on demand
6. **Database Connection Pooling**: Reuse connections
7. **Query Optimization**: Use EXPLAIN to optimize queries
8. **Compression**: Gzip responses
9. **Image Optimization**: Compress and resize images
10. **Background Jobs**: Process heavy tasks asynchronously

---

This schema is production-ready and scalable for thousands of users and millions of setups!
