import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './SetupDetailPage.css';

const SetupDetailPage = () => {
    const { setupId } = useParams();
    const navigate = useNavigate();
    const {
        setups,
        toggleLike,
        toggleSave,
        addComment,
        getComments,
        hasUserLiked,
        hasUserSaved,
        getSimilarSetups,
        currentUser,
        setShowAuthModal
    } = useApp();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [showProducts, setShowProducts] = useState(true);
    const [activeProduct, setActiveProduct] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [showAllComments, setShowAllComments] = useState(false);

    const minSwipeDistance = 50;

    // Get setup by ID
    const setup = setups.find(s => s.id === setupId);

    // Redirect if setup not found
    if (!setup) {
        return (
            <div className="setup-not-found">
                <h2>Setup không tồn tại</h2>
                <button onClick={() => navigate('/')}>Quay về trang chủ</button>
            </div>
        );
    }

    // Build media items - MUST be before useEffect
    const mediaItems = setup.images?.length > 0
        ? [
            ...setup.images.map(img => ({
                type: 'image',
                url: img.url,
                products: img.products || []
            })),
            ...(setup.youtubeVideo ? [{ type: 'youtube', url: setup.youtubeVideo, poster: setup.mainImage }] : [])
        ]
        : [
            { type: 'image', url: setup.mainImage, products: setup.products || [] },
            ...(setup.moreImages || []).map(img => ({ type: 'image', url: img })),
            ...(setup.youtubeVideo ? [{ type: 'youtube', url: setup.youtubeVideo, poster: setup.mainImage }] : [])
        ];

    const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];
    const isLiked = hasUserLiked(setup.id);
    const isSaved = hasUserSaved(setup.id);
    const comments = getComments(setup.id);
    const similarSetups = getSimilarSetups(setup.id, 4);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show swipe hint on mobile
    useEffect(() => {
        if (isMobile && setup && mediaItems.length > 1) {
            const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
            if (!hasSeenHint) {
                setShowSwipeHint(true);
                setTimeout(() => {
                    setShowSwipeHint(false);
                    localStorage.setItem('hasSeenSwipeHint', 'true');
                }, 3000);
            }
        }
    }, [isMobile, setup, mediaItems.length]);

    // Swipe handlers
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentImageIndex < mediaItems.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
        if (isRightSwipe && currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleLike = () => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        toggleLike(setup.id);
    };

    const handleSave = () => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        toggleSave(setup.id);
    };

    const handleComment = (e) => {
        e.preventDefault();
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        if (commentText.trim()) {
            addComment(setup.id, {
                text: commentText,
                author: currentUser.displayName,
                userId: currentUser.id,
                avatar: currentUser.photoURL
            });
            setCommentText('');
        }
    };

    // SEO Schema
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: setup.title,
        image: setup.mainImage,
        author: {
            '@type': 'Person',
            name: setup.author
        },
        datePublished: setup.createdAt
    };

    return (
        <>
            <SeoHead
                title={`${setup.title} | DeskHub`}
                description={setup.caption}
                image={setup.mainImage}
                type="article"
                schema={schema}
            />

            <div className="setup-detail-page">
                {/* Back button - Icon only, overlays on image */}
                <button className="back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Swipe hint popup for mobile */}
                {showSwipeHint && isMobile && (
                    <div className="swipe-hint-popup">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Vuốt để xem ảnh tiếp theo</p>
                    </div>
                )}

                <div className="setup-content">
                    {/* Image Gallery Section */}
                    <div className="setup-gallery-section">
                        <div
                            className="setup-main-image-container"
                            onTouchStart={isMobile ? onTouchStart : undefined}
                            onTouchMove={isMobile ? onTouchMove : undefined}
                            onTouchEnd={isMobile ? onTouchEnd : undefined}
                        >
                            <img
                                src={currentMedia.url}
                                alt={setup.title}
                                className="setup-main-image"
                            />

                            {/* Product Markers - Will add ProductMarker component */}
                            {showProducts && currentMedia.products && currentMedia.products.map((product, index) => (
                                <div
                                    key={index}
                                    className="product-marker"
                                    style={{ left: `${product.x}%`, top: `${product.y}%` }}
                                    onClick={() => setActiveProduct(activeProduct === product ? null : product)}
                                >
                                    <button className="marker-btn">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <circle cx="10" cy="10" r="8" fill="var(--color-primary)" />
                                            <path d="M10 6v8M6 10h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            {/* Navigation Arrows - Desktop only */}
                            {!isMobile && mediaItems.length > 1 && (
                                <>
                                    <button
                                        className="nav-arrow prev"
                                        onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentImageIndex === 0}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button
                                        className="nav-arrow next"
                                        onClick={() => setCurrentImageIndex(prev => Math.min(mediaItems.length - 1, prev + 1))}
                                        disabled={currentImageIndex === mediaItems.length - 1}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Pagination dots */}
                            {mediaItems.length > 1 && (
                                <div className="image-pagination-dots">
                                    {mediaItems.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`pagination-dot ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Sidebar - Pinterest style */}
                    <div className="setup-details-section">
                        {/* Author info + Action buttons in same row */}
                        <div className="setup-header-row">
                            <div className="setup-author-simple">
                                <img
                                    src={typeof setup.author === 'object' ? setup.author.avatar : setup.avatar}
                                    alt={typeof setup.author === 'object' ? setup.author.name : setup.author}
                                    className="author-avatar-small"
                                />
                                <span className="author-name-simple">
                                    {typeof setup.author === 'object' ? setup.author.name : setup.author}
                                </span>
                            </div>

                            {/* Action buttons - Like, Save, Share */}
                            <div className="setup-actions-row">
                                <button className={`action-btn-icon ${isLiked ? 'active' : ''}`} onClick={handleLike} title="Thích">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                                <button className={`action-btn-icon ${isSaved ? 'active' : ''}`} onClick={handleSave} title="Lưu">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                    </svg>
                                </button>
                                <button
                                    className="action-btn-icon"
                                    title="Chia sẻ"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: setup.title,
                                                text: setup.caption,
                                                url: window.location.href
                                            });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Đã copy link!');
                                        }
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="18" cy="5" r="3" />
                                        <circle cx="6" cy="12" r="3" />
                                        <circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <h2 className="setup-title-text">{setup.title}</h2>
                        <p className="setup-caption">{setup.caption}</p>

                        {/* Tags */}
                        {setup.tags && setup.tags.length > 0 && (
                            <div className="setup-tags">
                                {setup.tags.map((tag, i) => (
                                    <span key={i} className="setup-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Comments - Preview mode */}
                        <div className="comments-section">
                            <h4>Bình luận ({comments.length})</h4>

                            <form className="comment-form" onSubmit={handleComment}>
                                <input
                                    type="text"
                                    placeholder="Thêm bình luận..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="comment-input"
                                />
                                <button type="submit" className="btn-primary">Gửi</button>
                            </form>

                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <p className="no-comments">Chưa có bình luận nào</p>
                                ) : (
                                    <>
                                        {comments.slice(0, showAllComments ? comments.length : 2).map(comment => (
                                            <div key={comment.id} className="comment">
                                                <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                                                <div className="comment-content">
                                                    <p className="comment-author">{comment.author}</p>
                                                    <p className="comment-text">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {comments.length > 2 && !showAllComments && (
                                            <button
                                                className="show-more-comments"
                                                onClick={() => setShowAllComments(true)}
                                            >
                                                Xem thêm {comments.length - 2} bình luận
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Similar Setups */}
                        {similarSetups.length > 0 && (
                            <div className="similar-setups-section">
                                <h4>Setup tương tự</h4>
                                <div className="similar-setups-grid">
                                    {similarSetups.slice(0, 4).map(similar => (
                                        <div
                                            key={similar.id}
                                            className="similar-setup-card"
                                            onClick={() => navigate(`/setup/${similar.id}`)}
                                        >
                                            <img src={similar.mainImage} alt={similar.title} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SetupDetailPage;
