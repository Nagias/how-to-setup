import React, { useMemo } from 'react';

/**
 * Schema Generator - Generates JSON-LD structured data for SEO
 */
const SchemaGenerator = ({ blogData }) => {
    const articleSchema = useMemo(() => {
        if (!blogData) return null;

        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": blogData.seo?.seoTitle || blogData.title,
            "description": blogData.seo?.metaDescription || blogData.excerpt,
            "image": blogData.coverImage || blogData.seo?.ogImage,
            "datePublished": blogData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            "dateModified": blogData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            "author": blogData.author ? {
                "@type": "Person",
                "name": blogData.author.name,
                "description": blogData.author.bio || '',
                "url": blogData.author.avatar || ''
            } : undefined,
            "publisher": {
                "@type": "Organization",
                "name": "DeskHub",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://deskhub.vn/logo.png"
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": blogData.canonicalUrl || `https://deskhub.vn/blog/${blogData.slug}`
            },
            "keywords": [
                blogData.keywords?.primaryKeyword,
                ...(blogData.keywords?.secondaryKeywords || []),
                ...(blogData.keywords?.lsiKeywords || [])
            ].filter(Boolean).join(", ")
        };
    }, [blogData]);

    const faqSchema = useMemo(() => {
        if (!blogData?.schema?.enableFaqSchema || !blogData?.faqItems?.length) return null;

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": blogData.faqItems.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        };
    }, [blogData]);

    const reviewSchema = useMemo(() => {
        if (!blogData?.schema?.enableReviewSchema || !blogData?.schema?.reviewData) return null;

        const { reviewData } = blogData.schema;
        return {
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
                "@type": reviewData.itemType || "Product",
                "name": reviewData.itemName
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": reviewData.rating,
                "bestRating": reviewData.maxRating || 5
            },
            "author": {
                "@type": "Person",
                "name": blogData.author?.name || "Anonymous"
            },
            "reviewBody": reviewData.summary || blogData.excerpt
        };
    }, [blogData]);

    if (!articleSchema) return null;

    return (
        <>
            {/* Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema, null, 2) }}
            />

            {/* FAQ Schema (if enabled) */}
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema, null, 2) }}
                />
            )}

            {/* Review Schema (if enabled) */}
            {reviewSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema, null, 2) }}
                />
            )}
        </>
    );
};

/**
 * Generate meta tags for SEO
 */
export const generateMetaTags = (blogData) => {
    if (!blogData) return [];

    const tags = [
        // Basic SEO
        { name: 'description', content: blogData.seo?.metaDescription || blogData.excerpt },
        {
            name: 'keywords', content: [
                blogData.keywords?.primaryKeyword,
                ...(blogData.keywords?.secondaryKeywords || [])
            ].filter(Boolean).join(', ')
        },

        // Robots
        { name: 'robots', content: blogData.noIndex ? 'noindex, nofollow' : 'index, follow' },

        // Open Graph
        { property: 'og:title', content: blogData.seo?.ogTitle || blogData.seo?.seoTitle || blogData.title },
        { property: 'og:description', content: blogData.seo?.ogDescription || blogData.seo?.metaDescription },
        { property: 'og:image', content: blogData.seo?.ogImage || blogData.coverImage },
        { property: 'og:url', content: blogData.canonicalUrl },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'DeskHub' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: blogData.seo?.ogTitle || blogData.seo?.seoTitle || blogData.title },
        { name: 'twitter:description', content: blogData.seo?.ogDescription || blogData.seo?.metaDescription },
        { name: 'twitter:image', content: blogData.seo?.ogImage || blogData.coverImage },

        // Article specific
        { property: 'article:published_time', content: blogData.createdAt?.toDate?.()?.toISOString() },
        { property: 'article:modified_time', content: blogData.updatedAt?.toDate?.()?.toISOString() },
        { property: 'article:author', content: blogData.author?.name },
        { property: 'article:section', content: blogData.category },
        ...(blogData.tags || []).map(tag => ({ property: 'article:tag', content: tag }))
    ];

    return tags.filter(tag => tag.content);
};

/**
 * Generate canonical link
 */
export const generateCanonicalLink = (blogData) => {
    if (!blogData) return null;
    return blogData.canonicalUrl || `https://deskhub.vn/blog/${blogData.slug}`;
};

export default SchemaGenerator;
