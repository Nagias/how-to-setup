import React, { useState, useMemo } from 'react';
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
        setups
    } = useApp();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [showProducts, setShowProducts] = useState(true);

    if (!selectedSetup) return null;

    // Data reactive
    const currentSetup = setups.find(s => s.id === selectedSetup.id) || selectedSetup;

    // DEBUG: Check data structure
    console.log('🔍 SetupDetailModal - currentSetup:', currentSetup);
    console.log('🔍 SetupDetailModal - youtubeVideoId:', currentSetup?.youtubeVideoId);
    console.log('🔍 SetupDetailModal - media array:', currentSetup?.media);

    // Logic gộp Video và Ảnh thành list media
    // Support both old format (images[]) and new format (media[])
    const mediaItems = useMemo(() => {
        let items = [];

        // Support YouTube video (NEW FORMAT)
        if (currentSetup.youtubeVideoId) {
            items.push({
                type: 'youtube',
                videoId: currentSetup.youtubeVideoId,
                url: `https://www.youtube.com/embed/${currentSetup.youtubeVideoId}`,
                poster: currentSetup.videoThumbnail || `https://img.youtube.com/vi/${currentSetup.youtubeVideoId}/maxresdefault.jpg`,
                products: []
            });
        }
        // Fallback: Support old thumbnailVideo field (demo data)
        else if (currentSetup.thumbnailVideo) {
            items.push({
                type: 'video',
                url: currentSetup.thumbnailVideo,
                poster: currentSetup.mainImage,
                products: []
            });
        }

        // Support media array (new format) - check this first
        if (currentSetup.media && Array.isArray(currentSetup.media)) {
            // Filter out video types (we handle YouTube separately) and old 'video' items
            const imageMedia = currentSetup.media.filter(m => m.type === 'image');
            items = [...items, ...imageMedia];
        }
        // Fallback to images array (old format - sample data)
        else if (currentSetup.images && Array.isArray(currentSetup.images)) {
            items = [...items, ...currentSetup.images.map(img => ({
                ...img,
                type: 'image',
                products: img.products || []
            }))];
        }

        return items;
    }, [currentSetup]);

    // Handle index overflow if media list changes
    const activeIndex = currentImageIndex >= mediaItems.length ? 0 : currentImageIndex;
    // Add fallback to prevent crashes if mediaItems is empty
    const currentMedia = mediaItems[activeIndex] || {
        type: 'image',
        url: currentSetup.mainImage || '',
        products: []
    };

    const isLiked = hasUserLiked(currentSetup.id);
    const isSaved = hasUserSaved(currentSetup.id);
    const setupComments = getComments(currentSetup.id);
    const similarSetups = getSimilarSetups(currentSetup.id);

    const handleClose = () => {
        setSelectedSetup(null);
        setCurrentImageIndex(0);
        setCommentText('');
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
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

                <div className="modal-layout">
                    {/* Left: Media Gallery */}
                    <div className="modal-gallery">
                        <div className="main-image-container">
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
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={currentMedia.url}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ aspectRatio: '16/9', borderRadius: '8px', minHeight: '400px' }}
                                />
                            ) : (
                                <>
                                    <img
                                        src={currentMedia.url}
                                        alt={currentSetup.title}
                                        className="main-image"
                                    />
                                    {/* Product Markers (Only for images) */}
                                    {showProducts && currentMedia.products && Array.isArray(currentMedia.products) && currentMedia.products.map((product, index) => (
                                        <ProductMarker key={index} product={product} />
                                    ))}

                                    <button
                                        className="toggle-products-btn"
                                        onClick={() => setShowProducts(!showProducts)}
                                    >
                                        {showProducts ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                    </button>
                                </>
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
                                    onClick={() => toggleLike(currentSetup.id)}
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

                        {/* Comments */}
                        <div className="comments-section">
                            <h4>Bình Luận ({setupComments.length})</h4>
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                <div className="comment-input-wrapper">
                                    <img src={currentUser?.avatar} alt="Avatar" className="comment-user-avatar" />
                                    <input
                                        type="text"
                                        className="input comment-input"
                                        placeholder={`Bình luận với tên ${currentUser?.displayName}...`}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>Gửi</button>
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
        </div>
    );
};

const ProductMarker = ({ product }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="product-marker"
            style={{ left: `${product.x}%`, top: `${product.y}%` }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button className="marker-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" fill="var(--color-primary)" />
                    <path d="M10 6v8M6 10h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {showTooltip && (
                <div className="product-tooltip">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">{product.price}</p>
                    <a href={product.link} className="product-link" onClick={(e) => e.stopPropagation()}>
                        Xem sản phẩm →
                    </a>
                </div>
            )}
        </div>
    );
};

export default SetupDetailModal;
