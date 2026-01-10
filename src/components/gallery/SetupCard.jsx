import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import './SetupCard.css';

const SetupCard = ({ setup, index }) => {
    const { setSelectedSetup, toggleLike, toggleSave, hasUserLiked, hasUserSaved } = useApp();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const videoRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const isLiked = hasUserLiked(setup.id);
    const isSaved = hasUserSaved(setup.id);

    const handleCardClick = () => {
        setSelectedSetup(setup);
    };

    const handleLike = (e) => {
        e.stopPropagation();
        toggleLike(setup.id);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        toggleSave(setup.id);
    };

    const handleShare = (e) => {
        e.stopPropagation();
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
    };

    const handleMouseEnter = () => {
        if (setup.thumbnailVideo && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsVideoPlaying(true))
                    .catch(() => { });
            }
        }
    };

    const handleMouseLeave = () => {
        if (setup.thumbnailVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsVideoPlaying(false);
        }
    };

    return (
        <article
            className="setup-card"
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="setup-card-image-container">
                {/* Skeleton */}
                {!imageLoaded && !imageError && !setup.thumbnailVideo && (
                    <div className="skeleton skeleton-image-placeholder"></div>
                )}

                {/* Media Layer */}
                {setup.thumbnailVideo ? (
                    <>
                        <video
                            ref={videoRef}
                            src={setup.thumbnailVideo}
                            className="setup-card-video"
                            poster={setup.mainImage}
                            muted
                            loop
                            playsInline
                            style={{
                                opacity: isVideoPlaying ? 1 : 0,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                zIndex: 2,
                                transition: 'opacity 0.3s ease'
                            }}
                        />
                        <img
                            src={setup.mainImage}
                            alt={setup.title}
                            className={`setup-card-image ${imageLoaded ? 'loaded' : ''}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            style={{ opacity: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                        />
                        {/* Play Indicator */}
                        <div className="video-indicator" style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3,
                            opacity: isVideoPlaying ? 0 : 1,
                            transition: 'opacity 0.3s',
                            pointerEvents: 'none'
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </>
                ) : (
                    <img
                        src={setup.mainImage}
                        alt={setup.title}
                        className={`setup-card-image ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                )}

                {imageError && !setup.thumbnailVideo && (
                    <div className="image-error">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M24 4L4 44h40L24 4z" stroke="currentColor" strokeWidth="2" />
                            <path d="M24 18v12M24 34v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span>Ảnh lỗi</span>
                    </div>
                )}

                <div className="setup-card-overlay" style={{ zIndex: 4 }}></div>

                {/* Quick Actions */}
                <div className="setup-card-actions" style={{ zIndex: 5 }}>
                    <button
                        className={`action-btn ${isLiked ? 'active' : ''}`}
                        onClick={handleLike}
                        title={isLiked ? 'Bỏ thích' : 'Thích'}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill={isLiked ? 'currentColor' : 'none'}>
                            <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41.81 4.5 2.09C11.09 4.81 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                    <button
                        className={`action-btn ${isSaved ? 'active' : ''}`}
                        onClick={handleSave}
                        title={isSaved ? 'Bỏ lưu' : 'Lưu'}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill={isSaved ? 'currentColor' : 'none'}>
                            <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                    <button
                        className="action-btn"
                        onClick={handleShare}
                        title="Chia sẻ"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 13v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3M10 3v10M10 3l-3 3M10 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Tags (Absolute) */}
                <div className="setup-card-tags" style={{ zIndex: 5 }}>
                    {setup.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="setup-card-content">
                <h3 className="setup-card-title">{setup.title}</h3>

                {/* NEW: Caption */}
                <p className="setup-card-caption">{setup.caption}</p>

                {/* NEW: Meta & Stats Layout */}
                <div className="setup-card-meta" style={{ justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                    <div className="setup-card-author">
                        <img
                            src={setup.author.avatar}
                            alt={setup.author.name}
                            className="author-avatar"
                        />
                        <span className="author-name">{setup.author.name}</span>
                    </div>

                    {/* Stats */}
                    <div className="setup-card-stats-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Likes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41.81 4.5 2.09C11.09 4.81 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" />
                            </svg>
                            <span>{setup.likes.length}</span>
                        </div>
                        {/* Saves */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" />
                            </svg>
                            <span>{setup.saves.length}</span>
                        </div>
                        {/* Shares (Fake count as requested 'số đếm share') */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 13v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3M10 3v10M10 3l-3 3M10 3l3 3" strokeLinecap="round" />
                            </svg>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default SetupCard;
