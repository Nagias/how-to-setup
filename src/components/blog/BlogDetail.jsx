
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { sampleBlogs } from '../../data/sampleData';
import { Helmet } from 'react-helmet';
import SchemaGenerator, { generateMetaTags, generateCanonicalLink } from './seo/SchemaGenerator';
import './BlogDetail.css';

import { api } from '../../utils/api';

const BlogDetail = () => {
    // Changed id to slug to support both
    const { slug } = useParams();
    const navigate = useNavigate();
    const { blogs, setBlogs, deleteBlog, currentUser } = useApp();
    const [blog, setBlog] = useState(null);

    // Find blog from Slug or ID
    useEffect(() => {
        // Try to find in current blogs state
        let foundBlog = blogs.find(b => b.slug === slug || b.id == slug);

        // If not found in state, try looking directly in sampleBlogs (fallback)
        if (!foundBlog) {
            foundBlog = sampleBlogs.find(b => b.slug === slug || b.id == slug);
        }

        if (foundBlog) {
            setBlog(foundBlog);
        }
    }, [slug, blogs]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Increment View Count after 5 seconds
    useEffect(() => {
        if (!blog) return;

        console.log('BlogDetail: Setting up view timer for blog:', blog.id);

        const timer = setTimeout(async () => {
            console.log('BlogDetail: 5 seconds elapsed, incrementing view for blog:', blog.id);
            try {
                const res = await api.incrementBlogView(blog.id);
                // View increment logic...
            } catch (error) {
                console.error('BlogDetail: Error incrementing view:', error);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [blog?.id]);

    if (!blog) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Đang tải bài viết...</h3>
                <div style={{ color: '#666', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'left', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                    <p><strong>Debug Info:</strong></p>
                    <p>Requested Slug/ID: {slug}</p>
                    <p>Context Blogs Loaded: {blogs.length}</p>
                    <p>Sample Data Size: {sampleBlogs?.length || 'undefined'}</p>
                    <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>Nếu số liệu trên = 0, vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.</p>
                </div>
            </div>
        );
    }

    const handleBack = () => {
        navigate('/blog');
    };

    const handleEdit = () => {
        // Check if it's an SEO-style blog (has 'seo' field)
        if (blog.seo) {
            navigate(`/blog/seo-edit/${blog.id}`);
        } else {
            navigate(`/blog/edit/${blog.id}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
            const res = await deleteBlog(blog.id);
            if (res.success) {
                navigate('/blog');
            } else {
                alert(res.message || 'Có lỗi xảy ra');
            }
        }
    };

    // Prepare SEO components
    const metaTags = generateMetaTags(blog);
    const canonicalLink = generateCanonicalLink(blog);

    // Determine content to render (prefer contentHtml from TipTap, fallback to content)
    const contentToRender = blog.contentHtml || blog.content;

    return (
        <div className="blog-detail-page">
            <Helmet>
                <title>{blog.seo?.seoTitle || blog.title} | DeskHub</title>
                {metaTags.map((tag, i) => (
                    <meta key={i} {...tag} />
                ))}
                {canonicalLink && <link rel="canonical" href={canonicalLink} />}
            </Helmet>

            <SchemaGenerator blogData={blog} />

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
                    <img src={blog.coverImage} alt={blog.title} />
                    <div className="blog-cover-overlay">
                        <span className="blog-category-large">{blog.category}</span>
                    </div>
                </div>

                {/* Article Header */}
                <header className="blog-header">
                    <h1 className="blog-title">{blog.title}</h1>
                    <div className="blog-meta-large">
                        <div className="blog-author-large">
                            <img src={blog.author.avatar} alt={blog.author.name} />
                            <div>
                                <p className="author-name">{blog.author.name}</p>
                                <p className="publish-date">
                                    {new Date(blog.publishedAt).toLocaleDateString('vi-VN', {
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
                                {blog.readTime} phút đọc
                            </span>
                            <span className="stat">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                {blog.views} lượt xem
                            </span>
                        </div>
                    </div>
                </header>

                {/* Article Content */}
                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: contentToRender }}
                />

                {/* Tags */}
                <div className="blog-tags">
                    {blog.tags?.map(tag => (
                        <span key={tag} className="blog-tag">#{tag}</span>
                    ))}
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;
