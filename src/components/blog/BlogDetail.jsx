
import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './BlogDetail.css';

import { api } from '../../utils/api';

const BlogDetail = () => {
    const { selectedBlog, setSelectedBlog, setCurrentView, setBlogs, deleteBlog, currentUser } = useApp();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Increment View Count after 5 seconds
    useEffect(() => {
        if (!selectedBlog) return;

        console.log('BlogDetail: Setting up view timer for blog:', selectedBlog.id);

        const timer = setTimeout(async () => {
            console.log('BlogDetail: 5 seconds elapsed, incrementing view for blog:', selectedBlog.id);
            try {
                const res = await api.incrementBlogView(selectedBlog.id);
                console.log('BlogDetail: View increment response:', res);

                if (res.success && res.views !== undefined) {
                    console.log('BlogDetail: Updating views from', selectedBlog.views, 'to', res.views);
                    // Update Current View immediately
                    setSelectedBlog(prev => ({ ...prev, views: res.views }));
                    // Update Global List (works for all users, no auth needed)
                    setBlogs(prev => prev.map(b =>
                        b.id === selectedBlog.id ? { ...b, views: res.views } : b
                    ));
                } else {
                    console.error('BlogDetail: Failed to increment view:', res);
                }
            } catch (error) {
                console.error('BlogDetail: Error incrementing view:', error);
            }
        }, 5000);

        return () => {
            console.log('BlogDetail: Clearing view timer for blog:', selectedBlog.id);
            clearTimeout(timer);
        };
    }, [selectedBlog?.id]);

    if (!selectedBlog) {
        // Fallback if no blog is selected, go back to list
        setCurrentView('blog');
        return null;
    }

    const handleBack = () => {
        setCurrentView('blog');
        setSelectedBlog(null);
    };

    const handleEdit = () => {
        // Navigate to blog editor with the current blog data
        setCurrentView('blog-editor');
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
            const res = await deleteBlog(selectedBlog.id);
            if (res.success) {
                handleBack();
            } else {
                alert(res.message || 'Có lỗi xảy ra');
            }
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
        <div className="blog-detail-page">
            <SeoHead
                title={selectedBlog.title}
                description={selectedBlog.excerpt}
                image={selectedBlog.coverImage}
                type="article"
                schema={schema}
            />

            <div className="blog-detail-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                <button className="back-btn" onClick={handleBack}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Quay lại
                </button>

                {currentUser && currentUser.role === 'admin' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="back-btn" style={{ color: '#3b82f6', borderColor: '#3b82f6' }} onClick={handleEdit}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Chỉnh sửa
                        </button>
                        <button className="back-btn" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleDelete}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5 7h10M8 7V5a1 1 0 011-1h2a1 1 0 011 1v2m-5 0h6M6 7v10a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Xóa bài viết
                        </button>
                    </div>
                )}
            </div>

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
    );
};

export default BlogDetail;
