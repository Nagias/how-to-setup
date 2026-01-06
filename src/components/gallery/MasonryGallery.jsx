import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import SetupCard from './SetupCard';
import SeoHead from '../common/SeoHead';
import './MasonryGallery.css';

const MasonryGallery = () => {
    const { getFilteredSetups } = useApp();
    const [displayedSetups, setDisplayedSetups] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        loadSetups(1);
    }, [getFilteredSetups]);

    useEffect(() => {
        // Intersection Observer for infinite scroll
        const options = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading) {
                loadMore();
            }
        }, options);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, page]);

    const loadSetups = (pageNum) => {
        setLoading(true);
        const filteredSetups = getFilteredSetups();
        const startIndex = 0;
        const endIndex = pageNum * ITEMS_PER_PAGE;
        const newSetups = filteredSetups.slice(startIndex, endIndex);

        setTimeout(() => {
            setDisplayedSetups(newSetups);
            setPage(pageNum);
            setLoading(false);
        }, 300);
    };

    const loadMore = () => {
        const filteredSetups = getFilteredSetups();
        const nextPage = page + 1;
        const endIndex = nextPage * ITEMS_PER_PAGE;

        if (displayedSetups.length < filteredSetups.length) {
            setLoading(true);
            setTimeout(() => {
                const newSetups = filteredSetups.slice(0, endIndex);
                setDisplayedSetups(newSetups);
                setPage(nextPage);
                setLoading(false);
            }, 500);
        }
    };

    const hasMore = displayedSetups.length < getFilteredSetups().length;

    return (
        <div className="masonry-gallery">
            <SeoHead
                title="Khám Phá Góc Làm Việc - DeskHub"
                description="Bộ sưu tập những góc làm việc, setup bàn phím, màn hình đẹp nhất được chia sẻ bởi cộng đồng."
            />
            {displayedSetups.length === 0 && !loading ? (
                <div className="empty-state">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" stroke="var(--color-border)" strokeWidth="2" />
                        <path d="M60 40v40M40 60h40" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <h3>Không tìm thấy setup nào</h3>
                    <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            ) : (
                <>
                    <div className="masonry-grid">
                        {displayedSetups.map((setup, index) => (
                            <SetupCard key={setup.id} setup={setup} index={index} />
                        ))}
                    </div>

                    {/* Loading Skeletons */}
                    {loading && (
                        <div className="masonry-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="setup-card skeleton-card">
                                    <div className="skeleton skeleton-image"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton skeleton-title"></div>
                                        <div className="skeleton skeleton-caption"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More Trigger */}
                    {hasMore && <div ref={loadMoreRef} className="load-more-trigger"></div>}

                    {/* End Message */}
                    {!hasMore && displayedSetups.length > 0 && (
                        <div className="end-message">
                            <p>You've reached the end! 🎉</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MasonryGallery;
