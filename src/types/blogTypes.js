/**
 * SEO Blog CMS - Type Definitions
 * These JSDoc types define the structure for SEO-optimized blog posts
 */

/**
 * @typedef {Object} AuthorProfile
 * @property {string} id - Unique author ID
 * @property {string} name - Author display name
 * @property {string} bio - Short biography
 * @property {string} expertise - Area of expertise
 * @property {string} avatar - Profile image URL
 * @property {string[]} [socialLinks] - Optional social media links
 */

/**
 * @typedef {Object} ExternalReference
 * @property {string} url - Source URL
 * @property {string} title - Reference title
 * @property {boolean} nofollow - If true, add rel="nofollow"
 */

/**
 * @typedef {Object} BlogImage
 * @property {string} url - Image URL
 * @property {string} alt - Alt text (required for SEO)
 * @property {string} [caption] - Optional caption
 * @property {string} [sourceUrl] - Optional source URL
 */

/**
 * @typedef {'informational'|'navigational'|'transactional'|'commercial'} SearchIntent
 */

/**
 * @typedef {Object} SeoMeta
 * @property {string} seoTitle - SEO title (65-70 chars ideal)
 * @property {string} metaDescription - Meta description (150-160 chars ideal)
 * @property {string} ogTitle - Open Graph title
 * @property {string} ogDescription - Open Graph description
 * @property {string} ogImage - Open Graph image URL
 */

/**
 * @typedef {Object} KeywordData
 * @property {string} primaryKeyword - Main target keyword (required)
 * @property {string[]} secondaryKeywords - Supporting keywords
 * @property {string[]} lsiKeywords - LSI/semantic keywords
 */

/**
 * @typedef {Object} SchemaSettings
 * @property {boolean} enableArticleSchema - Always true for blog posts
 * @property {boolean} enableFaqSchema - Enable FAQ schema
 * @property {boolean} enableReviewSchema - Enable review schema
 * @property {Object} [reviewData] - Review data if enabled
 */

/**
 * @typedef {Object} SeoBlogPost
 * @property {string} id - Unique post ID
 * 
 * // Content & Structure
 * @property {string} title - H1 title (only one allowed)
 * @property {string} slug - URL slug (auto-generated, editable)
 * @property {string} canonicalUrl - Full canonical URL
 * @property {string[]} redirectsFrom - Previous slugs for 301 redirects
 * @property {boolean} noIndex - If true, add noindex meta tag
 * 
 * // SEO Meta
 * @property {SeoMeta} seo - SEO meta fields
 * 
 * // Keywords
 * @property {KeywordData} keywords - Keyword configuration
 * 
 * // Search Intent
 * @property {SearchIntent} searchIntent - User search intent
 * 
 * // Content
 * @property {Object} content - TipTap JSON document
 * @property {string} contentHtml - Rendered HTML for display
 * @property {string} excerpt - Short description/summary
 * @property {BlogImage[]} images - All images with SEO data
 * 
 * // Author & E.E.A.T
 * @property {AuthorProfile} author - Author profile
 * @property {ExternalReference[]} references - External sources
 * 
 * // Schema
 * @property {SchemaSettings} schema - Schema markup settings
 * 
 * // Metadata
 * @property {string} category - Post category
 * @property {string[]} tags - Post tags
 * @property {number} readTime - Estimated read time in minutes
 * @property {string} coverImage - Cover image URL
 * @property {string} status - 'draft' | 'published'
 * 
 * // Timestamps
 * @property {Object} createdAt - Firebase timestamp
 * @property {Object} updatedAt - Firebase timestamp
 * @property {number} views - View count
 */

/**
 * Default values for a new SEO blog post
 */
export const defaultSeoBlogPost = {
    title: '',
    slug: '',
    canonicalUrl: '',
    redirectsFrom: [],
    noIndex: false,
    seo: {
        seoTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: ''
    },
    keywords: {
        primaryKeyword: '',
        secondaryKeywords: [],
        lsiKeywords: []
    },
    searchIntent: 'informational',
    content: null,
    contentHtml: '',
    excerpt: '',
    images: [],
    author: null,
    references: [],
    schema: {
        enableArticleSchema: true,
        enableFaqSchema: false,
        enableReviewSchema: false,
        reviewData: null
    },
    category: 'Hướng Dẫn',
    tags: [],
    readTime: 5,
    coverImage: '',
    status: 'draft',
    views: 0
};

/**
 * SEO Validation Rules
 */
export const seoRules = {
    seoTitle: {
        minLength: 30,
        maxLength: 70,
        idealLength: { min: 50, max: 60 }
    },
    metaDescription: {
        minLength: 120,
        maxLength: 160,
        idealLength: { min: 150, max: 155 }
    },
    content: {
        minH2Count: 1,
        maxKeywordDensity: 0.03, // 3%
        maxParagraphLength: 300, // words
        keywordLocations: ['first150', 'last150', 'h1', 'h2']
    }
};

/**
 * Search Intent Configurations
 */
export const searchIntentConfig = {
    informational: {
        label: 'Thông tin (Informational)',
        description: 'Người dùng muốn tìm hiểu, học hỏi',
        suggestedCTA: 'Đọc thêm, Tìm hiểu thêm',
        suggestedStructure: ['Giới thiệu', 'Các phần chi tiết', 'Kết luận']
    },
    navigational: {
        label: 'Điều hướng (Navigational)',
        description: 'Người dùng muốn tìm trang/nguồn cụ thể',
        suggestedCTA: 'Truy cập, Đến trang',
        suggestedStructure: ['Thông tin nhanh', 'Link trực tiếp']
    },
    transactional: {
        label: 'Giao dịch (Transactional)',
        description: 'Người dùng muốn mua/đăng ký',
        suggestedCTA: 'Mua ngay, Đăng ký, Thêm vào giỏ',
        suggestedStructure: ['Lợi ích', 'Tính năng', 'Giá', 'CTA']
    },
    commercial: {
        label: 'Thương mại (Commercial Investigation)',
        description: 'Người dùng so sánh trước khi mua',
        suggestedCTA: 'So sánh, Xem đánh giá',
        suggestedStructure: ['Tổng quan', 'So sánh', 'Ưu/Nhược điểm', 'Kết luận']
    }
};

export default { defaultSeoBlogPost, seoRules, searchIntentConfig };
