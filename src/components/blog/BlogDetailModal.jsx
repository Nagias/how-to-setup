import React from 'react';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './BlogDetailModal.css';

const BlogDetailModal = () => {
    const { selectedBlog, setSelectedBlog } = useApp();

    if (!selectedBlog) return null;

    const handleClose = () => {
        setSelectedBlog(null);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": selectedBlog.title,
        "image": selectedBlog.coverImage,
        "author": {
            "@type": "Person",
            "name": selectedBlog.author.name
        },
        "publisher": {
            "@type": "Organization",
            "name": "DeskHub",
            "logo": {
                "@type": "ImageObject",
                "url": "https://deskhub.demo/logo.png"
            }
        },
        "datePublished": selectedBlog.publishedAt,
        "description": selectedBlog.excerpt
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <SeoHead
                title={selectedBlog.title}
                description={selectedBlog.excerpt}
                image={selectedBlog.coverImage}
                type="article"
                schema={schema}
            />
            <div className="blog-detail-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <article className="blog-article">
                    {/* Cover Image */}
                    <div className="blog-cover">
                        <img src={selectedBlog.coverImage} alt={selectedBlog.title} />
                        <div className="blog-cover-overlay">
                            <span className="blog-category-large">{selectedBlog.category}</span>
                        </div>
                    </div>

                    {/* Article Header */}
                    <header className="blog-header">
                        <h1 className="blog-title">{selectedBlog.title}</h1>
                        <div className="blog-meta-large">
                            <div className="blog-author-large">
                                <img src={selectedBlog.author.avatar} alt={selectedBlog.author.name} />
                                <div>
                                    <p className="author-name">{selectedBlog.author.name}</p>
                                    <p className="publish-date">
                                        {new Date(selectedBlog.publishedAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="blog-stats-large">
                                <span className="stat">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {selectedBlog.readTime} phút đọc
                                </span>
                                <span className="stat">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    {selectedBlog.views} lượt xem
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Article Content */}
                    <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                    />

                    {/* Tags */}
                    <div className="blog-tags">
                        {selectedBlog.tags.map(tag => (
                            <span key={tag} className="blog-tag">#{tag}</span>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogDetailModal;
