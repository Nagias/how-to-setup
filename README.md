# DeskHub - Inspiring Desk Setup Gallery

A modern, scalable web application for discovering, saving, and sharing inspiring desk setup ideas. Built with React and Vite.

![DeskHub](https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200)

## 🎯 Features

### Core Features
- **Pinterest-Style Masonry Gallery** - Responsive grid layout with lazy loading
- **Advanced Filtering System** - Filter by color tone, budget, style, purpose, and desk size
- **Interactive Setup Details** - Fullscreen modal with image albums and clickable product markers
- **Social Interactions** - Like, save, comment, and share desk setups
- **Blog Platform** - Read and write desk setup tips and guides
- **Rich Text Editor** - Vietnamese-friendly blog editor with formatting tools
- **Dark/Light Mode** - Persistent theme preference
- **Infinite Scroll** - Performance-optimized progressive loading
- **Similar Recommendations** - AI-powered similar setup suggestions
- **Newsletter Subscription** - Email collection for updates
- **Search Functionality** - Keyword search across setups and blogs

### Technical Features
- Component-based architecture
- React Context API for state management
- Local Storage persistence
- Responsive design (mobile, tablet, desktop)
- SEO-optimized
- Accessibility features
- Premium UI/UX with animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## 📁 Project Structure

```
desk-setup-web/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── gallery/       # MasonryGallery, SetupCard
│   │   ├── filters/       # FilterSidebar
│   │   ├── setup-detail/  # SetupDetailModal
│   │   └── blog/          # BlogView, BlogEditor, BlogDetailModal
│   ├── contexts/          # React Context (AppContext)
│   ├── data/              # Sample data and configurations
│   ├── styles/            # Global CSS
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Entry point
│   └── index.css          # Design system
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## 🎨 Design System

### Color Palette
- **Primary**: HSL(220, 90%, 56%) - Vibrant blue
- **Secondary**: HSL(280, 70%, 60%) - Purple
- **Accent**: HSL(340, 85%, 55%) - Pink/Red
- **Gradients**: Modern gradient combinations

### Typography
- **Primary Font**: Inter (body text)
- **Display Font**: Outfit (headings)
- **Sizes**: Responsive scale from 0.75rem to 3rem

### Spacing
- Consistent spacing scale using CSS variables
- Range: 0.25rem to 4rem

## 🔧 Configuration

### Filter Categories

The application includes 5 main filter categories:

1. **Color Tone**
   - Warm (wood, beige, soft lighting)
   - Cool (white, gray, blue lighting)
   - Neutral/Minimal

2. **Budget Range**
   - Budget (Under $500)
   - Mid-range ($500 - $2000)
   - Premium ($2000+)

3. **Style**
   - Masculine
   - Feminine
   - Neutral

4. **Setup Purpose**
   - Work from Home
   - Gaming
   - Creative/Designer
   - Productivity-focused

5. **Desk Size**
   - Small Space
   - Medium
   - Large/Studio

### Data Structure

#### Setup Object
```javascript
{
  id: number,
  title: string,
  caption: string,
  mainImage: string (URL),
  images: [
    {
      url: string,
      products: [
        {
          x: number (percentage),
          y: number (percentage),
          name: string,
          link: string,
          price: string
        }
      ]
    }
  ],
  filters: {
    colorTone: string,
    budget: string,
    gender: string,
    purpose: string,
    size: string
  },
  likes: number,
  comments: number,
  saves: number,
  tags: string[],
  author: {
    name: string,
    avatar: string (URL)
  },
  createdAt: string (ISO date)
}
```

#### Blog Post Object
```javascript
{
  id: number,
  title: string,
  slug: string,
  excerpt: string,
  coverImage: string (URL),
  content: string (HTML),
  author: {
    name: string,
    avatar: string (URL)
  },
  category: string,
  tags: string[],
  readTime: number (minutes),
  publishedAt: string (ISO date),
  views: number
}
```

## 💾 Local Storage

The application uses localStorage for data persistence:

- `deskhub_setups` - All desk setups
- `deskhub_blogs` - All blog posts
- `deskhub_user_data` - User interactions (likes, saves, comments)
- `deskhub_theme` - Theme preference (light/dark)

## 🎯 Key Components

### MasonryGallery
- Responsive grid layout
- Infinite scroll with Intersection Observer
- Lazy image loading
- Empty state handling

### SetupCard
- Hover animations
- Quick action buttons (like, save, share)
- Image lazy loading with error handling
- Tag display

### SetupDetailModal
- Image gallery with thumbnails
- Interactive product markers
- Comments section
- Similar setup recommendations
- Social actions

### BlogEditor
- Rich text editing with contentEditable
- Formatting toolbar (headings, bold, italic, lists)
- Image and video insertion
- Vietnamese-friendly
- Form validation

### FilterSidebar
- Collapsible filter groups
- Active filter count
- Clear all functionality
- Mobile-responsive drawer

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Customization

### Adding New Setups

Edit `src/data/sampleData.js` and add to the `sampleSetups` array:

```javascript
{
  id: 7,
  title: "Your Setup Title",
  caption: "Description",
  mainImage: "image-url",
  // ... rest of the structure
}
```

### Adding Filter Categories

1. Update `filterOptions` in `src/data/sampleData.js`
2. Update filter state in `src/contexts/AppContext.jsx`
3. Update filtering logic in `getFilteredSetups()`

### Customizing Theme

Edit CSS variables in `src/index.css`:

```css
:root {
  --color-primary: hsl(220, 90%, 56%);
  /* ... other variables */
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 📝 Future Enhancements

- [ ] User authentication
- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] Advanced search with filters
- [ ] Setup comparison tool
- [ ] Product price tracking
- [ ] Community voting system
- [ ] Export collections as PDF
- [ ] Mobile app (React Native)
- [ ] AI-powered setup recommendations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Built With

- **React 18** - UI library
- **Vite** - Build tool
- **Vanilla CSS** - Styling
- **Local Storage** - Data persistence
- **Google Fonts** - Typography (Inter, Outfit)

## 🙏 Acknowledgments

- Images from Unsplash
- Icons designed in-house
- Inspired by Pinterest and Behance

---

**Built with ❤️ using Google Antigravity**

For questions or support, please open an issue on GitHub.
