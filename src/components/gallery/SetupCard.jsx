import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './SetupCard.css';

const SetupCard = ({ setup, index }) => {
    const { toggleLike, toggleSave, hasUserLiked, hasUserSaved } = useApp();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const videoRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const isLiked = hasUserLiked(setup.id);
    const isSaved = hasUserSaved(setup.id);

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(setup.id);
        setShowMobileMenu(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(setup.id);
        setShowMobileMenu(false);
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const setupUrl = `${window.location.origin}/setup/${setup.id}`;
        if (navigator.share) {
            navigator.share({
                title: setup.title,
                text: setup.caption,
                url: setupUrl
            });
        } else {
            navigator.clipboard.writeText(setupUrl);
            alert('Đã copy link!');
        }
        setShowMobileMenu(false);
    };

    const toggleMobileMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close all other menus first
        document.querySelectorAll('.mobile-menu-backdrop').forEach(backdrop => {
            backdrop.click();
        });

        setShowMobileMenu(!showMobileMenu);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        if (showMobileMenu) {
            const handleClickOutside = (e) => {
                if (!e.target.closest('.mobile-menu-popup') && !e.target.closest('.mobile-menu-btn')) {
                    setShowMobileMenu(false);
                }
            };

            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMobileMenu]);

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
        <>
            <Link
                to={`/setup/${setup.id}`}
                className="setup-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Image Container */}
                <div className="setup-card-image-container">
                    {/* Thumbnail Video (if exists) */}
                    {setup.thumbnailVideo && (
                        <video
                            ref={videoRef}
                            className="setup-card-image"
                            muted
                            loop
                            playsInline
                            style={{
                                display: isVideoPlaying ? 'block' : 'none'
                            }}
                        >
                            <source src={setup.thumbnailVideo} type="video/mp4" />
                        </video>
                    )}

                    {/* Main Image */}
                    {setup.images && setup.images.length > 0 ? (
                        <img
                            src={setup.images[0]}
                            alt={setup.title || 'Setup image'}
                            className={`setup-card-image ${imageLoaded ? 'loaded' : ''}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                console.error('Image load error:', setup.images[0]);
                                setImageError(true);
                            }}
                            style={{
                                display: setup.thumbnailVideo && isVideoPlaying ? 'none' : 'block'
                            }}
                        />
                    ) : (
                        <div className="image-error">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4L4 44h40L24 4z" stroke="currentColor" strokeWidth="2" />
                                <path d="M24 18v12M24 34v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>Không có ảnh</span>
                        </div>
                    )}

                    {/* Loading Skeleton */}
                    {!imageLoaded && !imageError && (
                        <div className="skeleton-image-placeholder"></div>
                    )}

                    {/* Video Play Indicator */}
                    {setup.thumbnailVideo && !isVideoPlaying && (
                        <div className="video-play-indicator">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="white">
                                <circle cx="24" cy="24" r="24" opacity="0.9" />
                                <path d="M18 14l16 10-16 10V14z" fill="black" />
                            </svg>
                        </div>
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

                    {/* Mobile Menu Button - Pinterest style */}
                    <button
                        className="mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        style={{ zIndex: 6 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                            <circle cx="10" cy="16" r="1.5" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </Link>

            {/* Mobile Menu Portal - Render at document root */}
            {showMobileMenu && ReactDOM.createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="mobile-menu-backdrop"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMobileMenu(false);
                        }}
                    />

                    {/* Bottom Sheet */}
                    <div className="mobile-menu-popup">
                        {/* Header */}
                        <div className="mobile-menu-header">
                            <button
                                className="mobile-menu-close"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMobileMenu(false);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <h3>Tùy chọn</h3>
                            <div style={{ width: '24px' }}></div>
                        </div>

                        {/* Actions */}
                        <div className="mobile-menu-actions">
                            <button onClick={handleLike} className={isLiked ? 'active' : ''}>
                                <svg width="24" height="24" viewBox="0 0 20 20" fill={isLiked ? 'currentColor' : 'none'}>
                                    <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41.81 4.5 2.09C11.09 4.81 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                <span>{isLiked ? 'Bỏ thích' : 'Thích'}</span>
                            </button>
                            <button onClick={handleSave} className={isSaved ? 'active' : ''}>
                                <svg width="24" height="24" viewBox="0 0 20 20" fill={isSaved ? 'currentColor' : 'none'}>
                                    <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                            </button>
                            <button onClick={handleShare}>
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 13v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3M10 3v10M10 3l-3 3M10 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span>Chia sẻ</span>
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default SetupCard;
