import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import SeoHead from '../common/SeoHead';
import './SetupDetailPage.css';

// ProductMarker Component with tooltip (same as SetupDetailModal)
const ProductMarker = ({ product, isActive, onActivate }) => {
    const [isMobile, setIsMobile] = useState(false);
    const tooltipRef = useRef(null);
    const markerRef = useRef(null);
    const [tooltipPosition, setTooltipPosition] = useState({ horizontal: 'center', vertical: 'top' });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate optimal tooltip position based on marker location in image
    useEffect(() => {
        if (!isActive || isMobile) return;

        // Use product.x and product.y percentages to determine position
        const x = product.x;
        const y = product.y;

        // Determine horizontal position
        let horizontal = 'center';
        if (x < 25) {
            horizontal = 'left'; // Marker is near left edge, show tooltip to the right
        } else if (x > 75) {
            horizontal = 'right'; // Marker is near right edge, show tooltip to the left
        }

        // Determine vertical position
        let vertical = 'top';
        if (y < 30) {
            vertical = 'bottom'; // Marker is near top edge, show tooltip below
        }

        setTooltipPosition({ horizontal, vertical });
    }, [isActive, isMobile, product.x, product.y]);

    const handleClick = (e) => {
        e.stopPropagation();
        onActivate(isActive ? null : product);
    };

    // Calculate tooltip styles based on position
    const getTooltipStyles = () => {
        const baseStyles = {
            position: 'absolute',
            background: 'white',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: '260px',
            maxWidth: '300px',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            whiteSpace: 'normal'
        };

        // Vertical positioning
        if (tooltipPosition.vertical === 'top') {
            baseStyles.bottom = '100%';
            baseStyles.marginBottom = '12px';
        } else {
            baseStyles.top = '100%';
            baseStyles.marginTop = '12px';
        }

        // Horizontal positioning
        if (tooltipPosition.horizontal === 'center') {
            baseStyles.left = '50%';
            baseStyles.transform = 'translateX(-50%)';
        } else if (tooltipPosition.horizontal === 'left') {
            baseStyles.left = '0';
            baseStyles.transform = 'translateX(0)';
        } else {
            baseStyles.right = '0';
            baseStyles.left = 'auto';
            baseStyles.transform = 'translateX(0)';
        }

        return baseStyles;
    };

    // Get arrow styles based on tooltip position
    const getArrowStyles = () => {
        const baseArrow = {
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent'
        };

        // Arrow position depends on tooltip position
        if (tooltipPosition.vertical === 'top') {
            // Arrow at bottom of tooltip pointing down
            baseArrow.top = '100%';
            baseArrow.borderTop = '8px solid white';
        } else {
            // Arrow at top of tooltip pointing up
            baseArrow.bottom = '100%';
            baseArrow.borderBottom = '8px solid white';
        }

        // Horizontal arrow position
        if (tooltipPosition.horizontal === 'center') {
            baseArrow.left = '50%';
            baseArrow.transform = 'translateX(-50%)';
        } else if (tooltipPosition.horizontal === 'left') {
            baseArrow.left = '16px';
        } else {
            baseArrow.right = '16px';
            baseArrow.left = 'auto';
        }

        return baseArrow;
    };

    return (
        <div
            className="product-marker"
            ref={markerRef}
            style={{ left: `${product.x}%`, top: `${product.y}%` }}
            onClick={handleClick}
        >
            <button className={`marker-btn ${isActive ? 'active' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" fill="var(--color-primary)" />
                    <path d="M10 6v8M6 10h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Desktop Tooltip - Dynamically positioned */}
            {!isMobile && isActive && (
                <div
                    ref={tooltipRef}
                    className="product-tooltip-desktop"
                    style={getTooltipStyles()}
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

                    {/* Dynamic arrow */}
                    <div style={getArrowStyles()}></div>
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
    const [replyingTo, setReplyingTo] = useState(null); // { id, author } of comment being replied to
    const commentInputRef = useRef(null);

    // Pan/drag state for zoomed images
    const [isPanning, setIsPanning] = useState(false);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);

    const minSwipeDistance = 50;

    // Get setup by ID
    const setup = setups.find(s => s.id === setupId);

    // Build media items - safe even if setup is undefined
    // Detect video-only: either has flag, or has no images but has video
    const isVideoOnlySetup = setup?.isVideoOnly ||
        (setup?.thumbnailVideo && (!setup?.images || setup?.images?.length === 0));

    // Use setup.media if available (keeps original upload order), otherwise fallback to legacy format
    const mediaItems = isVideoOnlySetup
        // Video-only setup: Only show the video
        ? [{
            type: 'video',
            url: setup.thumbnailVideo,
            products: []
        }]
        // Use media array if available (preserves upload order)
        : setup?.media?.length > 0
            ? setup.media.map(item => ({
                type: item.type,
                url: item.url,
                products: item.products || []
            }))
            // Fallback: Legacy format with separate images array
            : setup?.images?.length > 0
                ? [
                    ...setup.images.map(img => ({
                        type: 'image',
                        url: img.url,
                        products: img.products || []
                    })),
                    ...(setup.thumbnailVideo ? [{
                        type: 'video',
                        url: setup.thumbnailVideo,
                        products: []
                    }] : []),
                    ...(setup.youtubeVideo ? [{ type: 'youtube', url: setup.youtubeVideo, poster: setup.mainImage }] : [])
                ]
                : setup
                    ? [
                        { type: 'image', url: setup.mainImage, products: setup.products || [] },
                        ...(setup.moreImages || []).map(img => ({ type: 'image', url: img })),
                        ...(setup.thumbnailVideo ? [{
                            type: 'video',
                            url: setup.thumbnailVideo,
                            products: []
                        }] : []),
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

    // Handle wheel zoom with non-passive event listener to prevent page scroll
    useEffect(() => {
        const container = imageContainerRef.current;
        if (!container || isMobile) return;

        const handleWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            setZoomLevel(prev => {
                const newZoom = Math.max(1, Math.min(3, prev + delta));
                if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
                return newZoom;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isMobile]);

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

            const commentData = {
                text: commentText,
                author: currentUser.displayName,
                userId: currentUser.id,
                avatar: userAvatar
            };

            // Add replyTo info if replying to someone
            if (replyingTo) {
                commentData.replyTo = {
                    commentId: replyingTo.id,
                    author: replyingTo.author
                };
            }

            addComment(setup.id, commentData);
            setCommentText('');
            setReplyingTo(null);
        }
    };

    // Handle reply to a comment
    const handleReply = (comment) => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        const authorName = typeof comment.author === 'string' ? comment.author :
            (comment.author?.name || comment.author?.displayName || 'Ẩn danh');
        setReplyingTo({ id: comment.id, author: authorName });
        setCommentText(`@${authorName} `);
        // Focus the input
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    // Cancel reply
    const cancelReply = () => {
        setReplyingTo(null);
        setCommentText('');
    };

    // Close active product when clicking outside
    const handleImageClick = () => {
        if (activeProduct) {
            setActiveProduct(null);
        }
    };

    // Helper function to convert URLs to clickable links
    const renderTextWithLinks = (text) => {
        if (!text || typeof text !== 'string') return text;

        const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
        const parts = [];
        let lastIndex = 0;
        let match;
        let keyIndex = 0;

        while ((match = urlRegex.exec(text)) !== null) {
            // Add text before URL
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            // Add clickable link
            parts.push(
                <a
                    key={`caption-link-${keyIndex++}`}
                    href={match[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    onClick={(e) => e.stopPropagation()}
                >
                    {match[1]}
                </a>
            );
            lastIndex = match.index + match[0].length;
        }
        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return parts.length > 0 ? parts : text;
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

                                ref={imageContainerRef}
                                onMouseDown={(e) => {
                                    if (zoomLevel > 1 && !isMobile) {
                                        e.preventDefault();
                                        setIsPanning(true);
                                        setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isPanning && zoomLevel > 1) {
                                        const newX = e.clientX - panStart.x;
                                        const newY = e.clientY - panStart.y;
                                        // Limit pan range based on zoom level
                                        const maxPan = (zoomLevel - 1) * 200;
                                        setPanPosition({
                                            x: Math.max(-maxPan, Math.min(maxPan, newX)),
                                            y: Math.max(-maxPan, Math.min(maxPan, newY))
                                        });
                                    }
                                }}
                                onMouseUp={() => setIsPanning(false)}
                                onMouseLeave={() => setIsPanning(false)}
                                style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                            >
                                {/* Back button - INSIDE image container for mobile positioning */}
                                <button className="setup-back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Quay lại</span>
                                </button>

                                {/* Zoomable wrapper - contains both image AND markers OR video player */}
                                {currentMedia.type === 'video' ? (
                                    /* Video Player - simple display like images, no zoom/markers */
                                    <div className="video-player-wrapper">
                                        <video
                                            src={currentMedia.url}
                                            controls
                                            playsInline
                                            autoPlay
                                            className="setup-main-video"
                                        >
                                            <source src={currentMedia.url} type="video/mp4" />
                                            Trình duyệt của bạn không hỗ trợ video.
                                        </video>
                                    </div>
                                ) : (
                                    /* Image with zoom and product markers */
                                    <div
                                        className="zoomable-wrapper"
                                        style={{
                                            transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                                            transition: isPanning ? 'none' : 'transform 0.2s ease',
                                            transformOrigin: 'center center',
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    >
                                        <img
                                            src={currentMedia.url}
                                            alt={setup.title}
                                            className="setup-main-image"
                                            style={{ pointerEvents: 'none' }}
                                        />

                                        {/* Product Markers - now inside zoomable wrapper */}
                                        {showProducts && currentMedia.products && currentMedia.products.map((product, index) => (
                                            <ProductMarker
                                                key={index}
                                                product={product}
                                                isActive={activeProduct === product}
                                                onActivate={setActiveProduct}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Image Controls Stack - Bottom Right */}
                                {!isMobile && (
                                    <div className="image-controls-stack">
                                        {/* Zoom Controls */}
                                        <div className="zoom-controls-vertical">
                                            <button
                                                className="control-btn zoom-in"
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
                                                className="control-btn zoom-out"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setZoomLevel(prev => {
                                                        const newZoom = Math.max(prev - 0.25, 1);
                                                        if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
                                                        return newZoom;
                                                    });
                                                }}
                                                title="Thu nhỏ"
                                                disabled={zoomLevel <= 1}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Toggle Products Button */}
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
                                    </div>
                                )}

                                {/* Mobile Toggle Products Button - Eye Icon */}
                                {isMobile && currentMedia.products && currentMedia.products.length > 0 && (
                                    <button
                                        className="toggle-products-btn-mobile"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowProducts(!showProducts);
                                        }}
                                        aria-label={showProducts ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                    >
                                        {showProducts ? (
                                            // Eye icon - products visible
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        ) : (
                                            // Eye-off icon - products hidden
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        )}
                                    </button>
                                )}

                                {/* Navigation Arrows - Desktop only */}
                                {!isMobile && mediaItems.length > 1 && (
                                    <>
                                        <button
                                            className="nav-arrow prev"
                                            onClick={() => {
                                                setCurrentImageIndex(prev => Math.max(0, prev - 1));
                                                setZoomLevel(1);
                                                setPanPosition({ x: 0, y: 0 });
                                            }}
                                            disabled={currentImageIndex === 0}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            className="nav-arrow next"
                                            onClick={() => {
                                                setCurrentImageIndex(prev => Math.min(mediaItems.length - 1, prev + 1));
                                                setZoomLevel(1);
                                                setPanPosition({ x: 0, y: 0 });
                                            }}
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

                            <p className="setup-caption">{renderTextWithLinks(setup.caption)}</p>

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

                                {/* Reply indicator */}
                                {replyingTo && (
                                    <div className="reply-indicator">
                                        <span>Đang trả lời <strong>@{replyingTo.author}</strong></span>
                                        <button type="button" className="cancel-reply-btn" onClick={cancelReply}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                <form className="comment-form" onSubmit={handleComment}>
                                    <input
                                        ref={commentInputRef}
                                        type="text"
                                        placeholder={replyingTo ? `Trả lời @${replyingTo.author}...` : "Thêm bình luận..."}
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
                                                const rawText = typeof comment.text === 'string' ? comment.text :
                                                    (comment.text?.text || JSON.stringify(comment.text) || '');
                                                const commentAuthor = typeof comment.author === 'string' ? comment.author :
                                                    (comment.author?.name || comment.author?.displayName || 'Ẩn danh');
                                                const commentAvatar = typeof comment.avatar === 'string' ? comment.avatar :
                                                    (comment.avatar?.url || 'https://ui-avatars.com/api/?name=User&background=random');

                                                // Parse @mentions and links in comment text
                                                const renderTextWithMentionsAndLinks = (text) => {
                                                    // Combined regex for URLs and @mentions
                                                    const combinedRegex = /(https?:\/\/[^\s<>"']+)|(@\S+)/gi;
                                                    const parts = [];
                                                    let lastIndex = 0;
                                                    let match;
                                                    let keyIndex = 0;

                                                    while ((match = combinedRegex.exec(text)) !== null) {
                                                        // Add text before match
                                                        if (match.index > lastIndex) {
                                                            parts.push(text.substring(lastIndex, match.index));
                                                        }

                                                        if (match[1]) {
                                                            // It's a URL
                                                            parts.push(
                                                                <a
                                                                    key={`link-${keyIndex++}`}
                                                                    href={match[1]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-link"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {match[1]}
                                                                </a>
                                                            );
                                                        } else if (match[2]) {
                                                            // It's a @mention
                                                            parts.push(
                                                                <span key={`mention-${keyIndex++}`} className="mention-tag">{match[2]}</span>
                                                            );
                                                        }
                                                        lastIndex = match.index + match[0].length;
                                                    }
                                                    // Add remaining text
                                                    if (lastIndex < text.length) {
                                                        parts.push(text.substring(lastIndex));
                                                    }
                                                    return parts.length > 0 ? parts : text;
                                                };

                                                return (
                                                    <div key={comment.id} className="comment">
                                                        <img src={commentAvatar} alt={commentAuthor} className="comment-avatar" />
                                                        <div className="comment-content">
                                                            <div className="comment-header">
                                                                <p className="comment-author">{commentAuthor}</p>
                                                                <button
                                                                    type="button"
                                                                    className="reply-btn"
                                                                    onClick={() => handleReply(comment)}
                                                                >
                                                                    Trả lời
                                                                </button>
                                                            </div>
                                                            {comment.replyTo && (
                                                                <p className="reply-to-indicator">
                                                                    ↳ Trả lời <span className="mention-tag">@{comment.replyTo.author}</span>
                                                                </p>
                                                            )}
                                                            <p className="comment-text">{renderTextWithMentionsAndLinks(rawText)}</p>
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
