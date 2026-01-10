import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './SetupDetailModal.css';

const SetupDetailModal = () => {
    const {
        selectedSetup,
        setSelectedSetup,
        toggleLike,
        toggleSave,
        addComment,
        getComments,
        hasUserLiked,
        hasUserSaved,
        getSimilarSetups,
        currentUser,
        setups,
        setShowAuthModal
    } = useApp();
    const [activeProduct, setActiveProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [showProducts, setShowProducts] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Detect mobile viewport
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show swipe hint on mobile when modal opens
    React.useEffect(() => {
        if (isMobile && selectedSetup && mediaItems.length > 1) {
            const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
            if (!hasSeenHint) {
                setShowSwipeHint(true);
                setTimeout(() => {
                    setShowSwipeHint(false);
                    localStorage.setItem('hasSeenSwipeHint', 'true');
                }, 3000);
            }
        }
    }, [isMobile, selectedSetup]);

    // Early return if no setup is selected
    if (!selectedSetup) return null;

    // All currentSetup-dependent variables MUST be declared after the early return check
    const currentSetup = selectedSetup;

    // Build media items from images array (new format) or fallback to legacy format
    const mediaItems = currentSetup.images?.length > 0
        ? [
            ...currentSetup.images.map(img => ({
                type: 'image',
                url: img.url,
                products: img.products || []
            })),
            ...(currentSetup.youtubeVideo ? [{ type: 'youtube', url: currentSetup.youtubeVideo, poster: currentSetup.mainImage }] : [])
        ]
        : [
            { type: 'image', url: currentSetup.mainImage, products: currentSetup.products || [] },
            ...(currentSetup.moreImages || []).map(img => ({ type: 'image', url: img })),
            ...(currentSetup.youtubeVideo ? [{ type: 'youtube', url: currentSetup.youtubeVideo, poster: currentSetup.mainImage }] : [])
        ];
    const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];

    const isLiked = hasUserLiked(currentSetup.id);
    const isSaved = hasUserSaved(currentSetup.id);
    const setupComments = getComments(currentSetup.id);
    const similarSetups = getSimilarSetups(currentSetup.id);

    // Close tooltip when clicking background or image
    const handleImageAreaClick = () => {
        if (activeProduct) setActiveProduct(null);
    };

    const handleClose = () => {
        setSelectedSetup(null);
        setCommentText(''); // Reset comment text on close
    };

    // Wrapper to enforce auth for Like
    const handleLike = () => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        toggleLike(currentSetup.id);
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        if (commentText.trim()) {
            addComment(currentSetup.id, commentText);
            setCommentText('');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Schema SEO
    const schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": currentSetup.title,
        "image": currentSetup.mainImage,
        "creator": {
            "@type": "Person",
            "name": currentSetup.author.name
        },
        "description": currentSetup.caption,
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": currentSetup.likes?.length || 0
            }
        ]
    };

    // Swipe handlers for mobile
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

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <SeoHead
                title={currentSetup.title}
                description={currentSetup.caption}
                image={currentSetup.mainImage}
                type="article"
                schema={schema}
            />
            <div className="setup-detail-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

                <div className="modal-layout">
                    {/* Left: Media Gallery */}
                    <div className="modal-gallery">
                        <div
                            className="main-image-container"
                            onClick={handleImageAreaClick}
                            onTouchStart={isMobile ? onTouchStart : undefined}
                            onTouchMove={isMobile ? onTouchMove : undefined}
                            onTouchEnd={isMobile ? onTouchEnd : undefined}
                        >
                            {currentMedia.type === 'video' ? (
                                <video
                                    src={currentMedia.url}
                                    className="main-image" // Reuse style class for layout
                                    controls
                                    autoPlay
                                    muted={false}
                                    poster={currentMedia.poster}
                                    style={{ objectFit: 'contain', background: '#000' }}
                                />
                            ) : currentMedia.type === 'youtube' ? (
                                <YouTubePlayer url={currentMedia.url} poster={currentMedia.poster} />
                            ) : (
                                <div className="image-wrapper-relative">
                                    <img
                                        src={currentMedia.url}
                                        alt={currentSetup.title}
                                        className="main-image"
                                    />
                                    {/* Product Markers (Only for images) */}
                                    {showProducts && currentMedia.products && Array.isArray(currentMedia.products) && currentMedia.products.map((product, index) => (
                                        <ProductMarker
                                            key={index}
                                            product={product}
                                            isActive={activeProduct === product}
                                            onActivate={setActiveProduct}
                                        />
                                    ))}

                                    <button
                                        className="toggle-products-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowProducts(!showProducts);
                                        }}
                                    >
                                        {showProducts ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                    </button>

                                    {/* Navigation Arrows */}
                                    {mediaItems.length > 1 && (
                                        <>
                                            <button
                                                className="nav-arrow prev"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => Math.max(0, prev - 1));
                                                }}
                                                disabled={currentImageIndex === 0}
                                                aria-label="Previous image"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className="nav-arrow next"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => Math.min(mediaItems.length - 1, prev + 1));
                                                }}
                                                disabled={currentImageIndex === mediaItems.length - 1}
                                                aria-label="Next image"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {mediaItems.length > 1 && (
                            <div className="image-thumbnails">
                                {mediaItems.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="thumbnail-video-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <img src={item.poster} alt="Video" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                        ) : item.type === 'youtube' ? (
                                            <div className="thumbnail-video-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <img src={item.poster} alt="YouTube" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="red">
                                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={`View ${index + 1}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="modal-details">
                        {/* ... Header & Info ... */}
                        <div className="detail-header">
                            <div className="author-info">
                                <img src={currentSetup.author.avatar} alt={currentSetup.author.name} className="author-avatar-large" />
                                <div>
                                    <h2 className="detail-title">{currentSetup.title}</h2>
                                    <p className="author-name-large">{currentSetup.author.name}</p>
                                </div>
                            </div>

                            <div className="detail-actions">
                                <button
                                    className={`action-btn-large ${isLiked ? 'active' : ''}`}
                                    onClick={handleLike}
                                >
                                    <svg width="24" height="24" viewBox="0 0 20 20" fill={isLiked ? 'currentColor' : 'none'}>
                                        <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41.81 4.5 2.09C11.09 4.81 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    <span>{(currentSetup.likes?.length || 0).toLocaleString()}</span>
                                </button>
                                <button
                                    className={`action-btn-large ${isSaved ? 'active' : ''}`}
                                    onClick={() => toggleSave(currentSetup.id)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 20 20" fill={isSaved ? 'currentColor' : 'none'}>
                                        <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    <span>{isSaved ? 'Đã Lưu' : 'Lưu'}</span>
                                </button>
                            </div>
                        </div>

                        <p className="detail-caption">{currentSetup.caption}</p>

                        <div className="detail-tags">
                            {currentSetup.tags && Array.isArray(currentSetup.tags) && currentSetup.tags.map(tag => (
                                <span key={tag} className="detail-tag">#{tag}</span>
                            ))}
                        </div>

                        <div className="detail-filters">
                            <h4>Chi Tiết Setup</h4>
                            <div className="filter-badges">
                                {Object.entries(currentSetup.filters).map(([key, value]) => (
                                    <span key={key} className="filter-badge">
                                        {value.replace('-', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="comments-section">
                            <h4>Bình Luận ({setupComments.length})</h4>
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                <div className="comment-input-wrapper">
                                    <img
                                        src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'}
                                        alt="Avatar"
                                        className="comment-user-avatar"
                                    />
                                    <input
                                        type="text"
                                        className="input comment-input"
                                        placeholder={currentUser ? `Bình luận với tên ${currentUser.displayName}...` : "Đăng nhập để bình luận..."}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onClick={() => !currentUser && setShowAuthModal(true)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!commentText.trim()}
                                    onClick={(e) => {
                                        if (!currentUser) {
                                            e.preventDefault();
                                            setShowAuthModal(true);
                                        }
                                    }}
                                >
                                    Gửi
                                </button>
                            </form>
                            <div className="comments-list">
                                {setupComments.length === 0 ? (
                                    <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                ) : (
                                    setupComments.map(comment => (
                                        <div key={comment.id} className="comment">
                                            <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.author}</span>
                                                    <span className="comment-time">{new Date(comment.timestamp).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Similar Setups */}
                        {similarSetups.length > 0 && (
                            <div className="similar-setups">
                                <h4>Setup Tương Tự</h4>
                                <div className="similar-grid">
                                    {similarSetups.map(setup => (
                                        <div
                                            key={setup.id}
                                            className="similar-card"
                                            onClick={() => {
                                                setSelectedSetup(setup);
                                                setCurrentImageIndex(0);
                                                setCommentText(''); // Clear comment input
                                            }}
                                        >
                                            <img src={setup.mainImage} alt={setup.title} />
                                            <p className="similar-title">{setup.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Tooltip Portal - Mobile Only - E-commerce Style UI */}
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
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        animation: 'slideUpFade 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
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
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            lineHeight: '1'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveProduct(null);
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >×</button>

                    {/* Product Name */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'white',
                        margin: '0 24px 0 0',
                        lineHeight: '1.4',
                        paddingRight: '8px'
                    }}>
                        {activeProduct.name}
                    </h3>

                    {/* Price - Large and Orange */}
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#ff6b35',
                        margin: '4px 0',
                        lineHeight: '1.2'
                    }}>
                        {activeProduct.price}
                    </div>

                    {/* CTA Button - Orange */}
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
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                                transition: 'all 0.2s',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4)';
                            }}
                        >
                            <span>Xem sản phẩm</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: '1px' }}>
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    )}
                </div>,
                document.body
            )}
        </div >
    );
};

// YouTube Player Component (extracted to avoid hooks in IIFE)
const YouTubePlayer = ({ url, poster }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Reset playing state when URL changes
    React.useEffect(() => {
        setIsPlaying(false);
    }, [url]);

    if (isPlaying) {
        return (
            <iframe
                width="100%"
                height="100%"
                src={`${url}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ aspectRatio: '16/9', borderRadius: '8px', minHeight: '400px' }}
            />
        );
    }

    return (
        <div
            className="youtube-placeholder"
            onClick={() => setIsPlaying(true)}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '400px',
                cursor: 'pointer',
                backgroundImage: `url(${poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div style={{
                background: 'red',
                width: '60px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '16px solid white'
                }}></div>
            </div>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                Click để phát video
            </div>
        </div>
    );
};

const ProductMarker = ({ product, isActive, onActivate }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Toggle on click for mobile mainly
    const handleClick = (e) => {
        e.stopPropagation(); // Prevent image click handling
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
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: '12px',
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
                    {/* Product Name */}
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#333',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                    }}>
                        {product.name}
                    </h3>

                    {/* Price - Large and Orange */}
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#ff6b35',
                        margin: '0 0 12px 0',
                        lineHeight: '1.2'
                    }}>
                        {product.price}
                    </div>

                    {/* CTA Button - Orange */}
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
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
                            }}
                        >
                            <span>Xem sản phẩm</span>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    )}

                    {/* Arrow pointing to marker */}
                    <div style={{
                        position: 'absolute',
                        right: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '8px solid white',
                        filter: 'drop-shadow(-1px 0 1px rgba(0, 0, 0, 0.05))'
                    }}></div>
                </div>
            )}
        </div>
    );
};

export default SetupDetailModal;
