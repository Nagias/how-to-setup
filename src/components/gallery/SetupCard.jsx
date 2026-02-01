import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './SetupCard.css';

const SetupCard = ({ setup, index }) => {
    const { toggleLike, toggleSave, hasUserLiked, hasUserSaved } = useApp();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect video-only setup: either has flag, or has no images but has video
    const isVideoOnlySetup = setup.isVideoOnly ||
        (setup.thumbnailVideo && (!setup.images || setup.images.length === 0));

    const isLiked = hasUserLiked(setup.id);
    const isSaved = hasUserSaved(setup.id);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Mobile: Intersection Observer for scroll-based autoplay
    useEffect(() => {
        if (!isMobile || !setup.thumbnailVideo || !cardRef.current) return;

        const options = {
            root: null, // viewport
            rootMargin: '-20% 0px -20% 0px', // Play when card is in center 60% of screen
            threshold: 0.5 // 50% of card visible
        };

        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Card is in view - play video
                    if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        const playPromise = videoRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => setIsVideoPlaying(true))
                                .catch(() => { });
                        }
                    }
                } else {
                    // Card is out of view - pause video
                    if (videoRef.current) {
                        setIsVideoPlaying(false);
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0;
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        observer.observe(cardRef.current);

        return () => observer.disconnect();
    }, [isMobile, setup.thumbnailVideo]);

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

        // Close ALL other menus first by setting their state
        if (!showMobileMenu) {
            // Before opening this menu, close all others
            const allCards = document.querySelectorAll('.setup-card');
            allCards.forEach(card => {
                // Trigger a custom event to close other menus
                card.dispatchEvent(new CustomEvent('closeOtherMenus', {
                    detail: { exceptId: setup.id }
                }));
            });
        }

        setShowMobileMenu(!showMobileMenu);
    };

    // Listen for close event from other cards
    React.useEffect(() => {
        const cardElement = document.querySelector(`[data-setup-id="${setup.id}"]`);
        if (cardElement) {
            const handleCloseOthers = (e) => {
                if (e.detail.exceptId !== setup.id) {
                    setShowMobileMenu(false);
                }
            };
            cardElement.addEventListener('closeOtherMenus', handleCloseOthers);
            return () => cardElement.removeEventListener('closeOtherMenus', handleCloseOthers);
        }
    }, [setup.id]);

    // Close menu when clicking outside OR scrolling
    React.useEffect(() => {
        if (showMobileMenu) {
            const handleClickOutside = (e) => {
                if (!e.target.closest('.mobile-menu-popup') && !e.target.closest('.mobile-menu-btn')) {
                    setShowMobileMenu(false);
                }
            };

            const handleScroll = () => {
                setShowMobileMenu(false);
            };

            document.addEventListener('click', handleClickOutside);
            window.addEventListener('scroll', handleScroll, { passive: true });

            return () => {
                document.removeEventListener('click', handleClickOutside);
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, [showMobileMenu]);

    // Desktop: Mouse hover handlers (only for desktop)
    const handleMouseEnter = () => {
        if (isMobile) return; // Mobile uses Intersection Observer
        if (setup.thumbnailVideo && videoRef.current) {
            // Reset video to beginning for smooth preview
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsVideoPlaying(true))
                    .catch(() => { });
            }
        }
    };

    const handleMouseLeave = () => {
        if (isMobile) return; // Mobile uses Intersection Observer
        if (setup.thumbnailVideo && videoRef.current) {
            // Smooth fade out before pausing
            setIsVideoPlaying(false);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                }
            }, 200); // Match CSS transition duration
        }
    };

    return (
        <>
            <Link
                ref={cardRef}
                to={`/setup/${setup.id}`}
                className="setup-card"
                data-setup-id={setup.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Image Container */}
                <div className="setup-card-image-container">
                    {/* If has video (either video-only or mixed), show video as thumbnail */}
                    {setup.thumbnailVideo && (
                        <video
                            ref={videoRef}
                            className={`setup-card-video ${isVideoOnlySetup ? 'video-only' : ''} ${isVideoPlaying ? 'playing' : ''}`}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            autoPlay={isMobile && isVideoOnlySetup ? undefined : false}
                        >
                            <source src={setup.thumbnailVideo} type="video/mp4" />
                        </video>
                    )}

                    {/* Only show image if NO video exists */}
                    {!setup.thumbnailVideo && (
                        <>
                            {setup.images && setup.images.length > 0 ? (
                                <img
                                    src={typeof setup.images[0] === 'string' ? setup.images[0] : setup.images[0]?.url || setup.images[0]?.src}
                                    alt={setup.title || 'Setup image'}
                                    className={`setup-card-image ${imageLoaded ? 'loaded' : ''}`}
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={(e) => {
                                        console.error('Image load error:', {
                                            raw: setup.images[0],
                                            type: typeof setup.images[0],
                                            url: typeof setup.images[0] === 'string' ? setup.images[0] : setup.images[0]?.url
                                        });
                                        setImageError(true);
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
                        </>
                    )}

                    {/* Loading Skeleton */}
                    {!imageLoaded && !imageError && !isVideoOnlySetup && (
                        <div className="skeleton-image-placeholder"></div>
                    )}

                    {/* Video Play Indicator - Shows when video exists and not playing */}
                    {setup.thumbnailVideo && !isVideoPlaying && !isVideoOnlySetup && (
                        <div className="video-play-indicator">
                            <div className="video-play-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M8 5v14l11-7L8 5z" />
                                </svg>
                            </div>
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

            {/* Mobile Menu - Render inside card, not portal */}
            {showMobileMenu && (
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
            )}
        </>
    );
};

export default SetupCard;
