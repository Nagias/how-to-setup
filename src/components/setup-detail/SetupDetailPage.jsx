import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './SetupDetailPage.css';

// ProductMarker Component with tooltip (same as SetupDetailModal)
const ProductMarker = ({ product, isActive, onActivate }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClick = (e) => {
        e.stopPropagation();
        onActivate(isActive ? null : product);
    };

    return (
        <div
            className="product-marker"
            style={{ left: `${product.x}%`, top: `${product.y}%` }}
            onClick={handleClick}
        >
            <button className={`marker-btn ${isActive ? 'active' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" fill="var(--color-primary)" />
                    <path d="M10 6v8M6 10h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Desktop Tooltip - Show inline next to marker */}
            {!isMobile && isActive && (
                <div
                    className="product-tooltip-desktop"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '100%',
                        transform: 'translateX(-50%) translateY(-8px)',
                        marginBottom: '8px',
                        background: 'white',
                        color: '#333',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
                        minWidth: '280px',
                        maxWidth: '320px',
                        zIndex: 10000,
                        animation: 'fadeIn 0.2s ease-out',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#333',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                    }}>
                        {product.name}
                    </h3>

                    <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#ff6b35',
                        margin: '0 0 12px 0',
                        lineHeight: '1.2'
                    }}>
                        {product.price}
                    </div>

                    {product.link && (
                        <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'white',
                                textDecoration: 'none',
                                background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                                transition: 'all 0.2s',
                                border: 'none'
                            }}
                        >
                            <span>Xem sản phẩm</span>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    )}

                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid white'
                    }}></div>
                </div>
            )}
        </div>
    );
};

const SetupDetailPage = () => {
    const { setupId } = useParams();
    const navigate = useNavigate();
    const {
        setups,
        toggleLike,
        toggleSave,
        addComment,
        getComments,
        fetchCommentsForSetup,
        hasUserLiked,
        hasUserSaved,
        getSimilarSetups,
        currentUser,
        setShowAuthModal,
        loading
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
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showZoomControls, setShowZoomControls] = useState(false);

    const minSwipeDistance = 50;

    // Get setup by ID
    const setup = setups.find(s => s.id === setupId);

    // Build media items - safe even if setup is undefined
    const mediaItems = setup?.images?.length > 0
        ? [
            ...setup.images.map(img => ({
                type: 'image',
                url: img.url,
                products: img.products || []
            })),
            ...(setup.youtubeVideo ? [{ type: 'youtube', url: setup.youtubeVideo, poster: setup.mainImage }] : [])
        ]
        : setup
            ? [
                { type: 'image', url: setup.mainImage, products: setup.products || [] },
                ...(setup.moreImages || []).map(img => ({ type: 'image', url: img })),
                ...(setup.youtubeVideo ? [{ type: 'youtube', url: setup.youtubeVideo, poster: setup.mainImage }] : [])
            ]
            : [];

    // ALL HOOKS MUST BE CALLED BEFORE ANY RETURNS - React Rules of Hooks!

    // Fetch comments when setup is loaded
    useEffect(() => {
        if (setupId) {
            fetchCommentsForSetup(setupId);
        }
    }, [setupId, fetchCommentsForSetup]);

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

    // NOW we can have conditional returns AFTER all hooks

    // Show loading if data is still being fetched OR if we have no setups yet
    if (loading || (setups.length === 0 && !setup)) {
        return (
            <div className="setup-detail-page" style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ color: 'var(--color-text-primary)', fontSize: '18px' }}>Đang tải...</div>
            </div>
        );
    }

    // Only show "not found" if loading is done AND we have setups but this specific one isn't found
    if (!loading && setups.length > 0 && !setup) {
        return (
            <div className="setup-not-found" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h2>Setup không tồn tại</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Quay về trang chủ</button>
            </div>
        );
    }

    // Edge case: if somehow we still don't have setup, show loading
    if (!setup) {
        return (
            <div className="setup-detail-page" style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ color: 'var(--color-text-primary)' }}>Đang tải...</div>
            </div>
        );
    }

    // Safe to use setup now
    const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];
    const isLiked = hasUserLiked(setup.id);
    const isSaved = hasUserSaved(setup.id);
    const comments = getComments(setup.id);
    const similarSetups = getSimilarSetups(setup.id, 16);

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
            // Ensure avatar has a fallback - Firebase doesn't accept undefined values
            const userAvatar = currentUser.photoURL || currentUser.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=random`;
            addComment(setup.id, {
                text: commentText,
                author: currentUser.displayName,
                userId: currentUser.id,
                avatar: userAvatar
            });
            setCommentText('');
        }
    };

    // Close active product when clicking outside
    const handleImageClick = () => {
        if (activeProduct) {
            setActiveProduct(null);
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
                    {/* LEFT COLUMN: Image + Details Below */}
                    <div className="setup-left-column">
                        {/* Image Gallery Section */}
                        <div className="setup-gallery-section">
                            <div
                                className="setup-main-image-container"
                                onTouchStart={isMobile ? onTouchStart : undefined}
                                onTouchMove={isMobile ? onTouchMove : undefined}
                                onTouchEnd={isMobile ? onTouchEnd : undefined}
                                onClick={handleImageClick}
                                onMouseEnter={() => !isMobile && setShowZoomControls(true)}
                                onMouseLeave={() => !isMobile && setShowZoomControls(false)}
                            >
                                {/* Back button - INSIDE image container for mobile positioning */}
                                <button className="back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                <img
                                    src={currentMedia.url}
                                    alt={setup.title}
                                    className="setup-main-image"
                                    style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                                />

                                {/* Product Markers with full tooltip functionality */}
                                {showProducts && currentMedia.products && currentMedia.products.map((product, index) => (
                                    <ProductMarker
                                        key={index}
                                        product={product}
                                        isActive={activeProduct === product}
                                        onActivate={setActiveProduct}
                                    />
                                ))}

                                {/* Toggle Products Button - Bottom Right with Text */}
                                {currentMedia.products && currentMedia.products.length > 0 && (
                                    <button
                                        className="toggle-products-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowProducts(!showProducts);
                                        }}
                                    >
                                        <div className="toggle-content">
                                            <span>{showProducts ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}</span>
                                        </div>
                                    </button>
                                )}

                                {/* Zoom Controls - Desktop only, show on hover */}
                                {!isMobile && showZoomControls && (
                                    <div className="zoom-controls">
                                        <button
                                            className="zoom-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomLevel(prev => Math.min(prev + 0.25, 3));
                                            }}
                                            title="Phóng to"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                        <button
                                            className="zoom-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
                                            }}
                                            title="Thu nhỏ"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                        {zoomLevel !== 1 && (
                                            <button
                                                className="zoom-btn zoom-reset"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setZoomLevel(1);
                                                }}
                                                title="Reset"
                                            >
                                                {Math.round(zoomLevel * 100)}%
                                            </button>
                                        )}
                                    </div>
                                )}

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

                        {/* Details Section - Below Image on Desktop */}
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

                                {/* Action buttons - Like, Save, Share with counts */}
                                <div className="setup-actions-row">
                                    <button className={`action-btn-icon ${isLiked ? 'active' : ''}`} onClick={handleLike} title="Thích">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        <span className="action-count">{setup.likes?.length || 0}</span>
                                    </button>
                                    <button className={`action-btn-icon ${isSaved ? 'active' : ''}`} onClick={handleSave} title="Lưu">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span className="action-count">{setup.saves?.length || 0}</span>
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
                                            {comments.slice(0, showAllComments ? comments.length : 2).map(comment => {
                                                // Ensure comment fields are strings, not objects
                                                const commentText = typeof comment.text === 'string' ? comment.text :
                                                    (comment.text?.text || JSON.stringify(comment.text) || '');
                                                const commentAuthor = typeof comment.author === 'string' ? comment.author :
                                                    (comment.author?.name || comment.author?.displayName || 'Ẩn danh');
                                                const commentAvatar = typeof comment.avatar === 'string' ? comment.avatar :
                                                    (comment.avatar?.url || 'https://ui-avatars.com/api/?name=User&background=random');

                                                return (
                                                    <div key={comment.id} className="comment">
                                                        <img src={commentAvatar} alt={commentAuthor} className="comment-avatar" />
                                                        <div className="comment-content">
                                                            <p className="comment-author">{commentAuthor}</p>
                                                            <p className="comment-text">{commentText}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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

                            {/* Similar Setups - MOBILE ONLY (shows below comments on mobile) */}
                            {isMobile && similarSetups.length > 0 && (
                                <div className="similar-setups-section mobile-similar">
                                    <div className="similar-setups-grid">
                                        {similarSetups.slice(0, 6).map(similar => (
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

                    {/* RIGHT COLUMN: Similar Setups - DESKTOP ONLY */}
                    {!isMobile && similarSetups.length > 0 && (
                        <div className="setup-right-column">
                            <div className="similar-setups-section-desktop">
                                <div className="similar-setups-grid-desktop">
                                    {similarSetups.map(similar => (
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
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Product Tooltip Portal */}
            {isMobile && activeProduct && ReactDOM.createPortal(
                <div
                    className="product-tooltip-portal"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '380px',
                        background: 'rgba(20, 20, 20, 0.95)',
                        backdropFilter: 'blur(12px)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '20px',
                        zIndex: 100000,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        animation: 'slideUpFade 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '20px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => setActiveProduct(null)}
                    >×</button>

                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'white',
                        margin: '0 24px 0 0',
                        lineHeight: '1.4'
                    }}>
                        {activeProduct.name}
                    </h3>

                    <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#ff6b35',
                        margin: '4px 0',
                        lineHeight: '1.2'
                    }}>
                        {activeProduct.price}
                    </div>

                    {activeProduct.link && (
                        <a
                            href={activeProduct.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: 'white',
                                textDecoration: 'none',
                                background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '8px',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
                            }}
                        >
                            <span>Xem sản phẩm</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

export default SetupDetailPage;
