import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './BlogView.css';

const BlogView = () => {
    const { blogs } = useApp();
    const [displayedBlogs, setDisplayedBlogs] = useState([]);
    const [page, setPage] = useState(1);
    const BLOGS_PER_PAGE = 5;

    useEffect(() => {
        // Initial load or when blogs change
        setDisplayedBlogs(blogs.slice(0, page * BLOGS_PER_PAGE));
    }, [blogs, page]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const hasMore = displayedBlogs.length < blogs.length;

    return (
        <div className="blog-view">
            <SeoHead
                title="Blog DeskHub - Kinh Nghiệm & Cảm Hứng"
                description="Tổng hợp các bài viết hướng dẫn setup, review gear, và xu hướng thiết kế góc làm việc mới nhất."
            />
            <div className="blog-hero">
                <h1>Góc Nhìn Desk Setup</h1>
                <p>Mẹo, xu hướng và cảm hứng cho góc làm việc hoàn hảo của bạn</p>
            </div>

            <div className="blog-grid">
                {displayedBlogs.map(blog => (
                    <Link to={`/blog/${blog.slug || blog.id}`} key={blog.id} className="blog-card-link">
                        <article className="blog-card">
                            <div className="blog-card-image">
                                <img src={blog.coverImage} alt={blog.title} />
                                <span className="blog-category">{blog.category}</span>
                            </div>
                            <div className="blog-card-content">
                                <h3 className="blog-card-title">{blog.title}</h3>
                                <p className="blog-card-excerpt">{blog.excerpt}</p>
                                <div className="blog-card-meta">
                                    <div className="blog-author">
                                        <img src={blog.author.avatar} alt={blog.author.name} />
                                        <span>{blog.author.name}</span>
                                    </div>
                                    <div className="blog-stats">
                                        <span className="read-time">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            {blog.readTime} min
                                        </span>
                                        <span className="views">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke="currentColor" strokeWidth="1.5" />
                                                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            {blog.views}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button className="load-more-btn" onClick={handleLoadMore}>
                        Xem thêm
                        <span className="chevron-icon">»</span>
                    </button>
                </div>
            )}
        </div>
    );
};


export default BlogView;
