import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import SetupCard from './SetupCard';
import SeoHead from '../common/SeoHead';
import './MasonryGallery.css';


const MasonryGallery = () => {
    const { getFilteredSetups, loading, filters, setups, galleryPage, setGalleryPage } = useApp();
    const [displayedSetups, setDisplayedSetups] = useState([]);
    // Local page state removed in favor of context state

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    const ITEMS_PER_PAGE = 12;

    // Memoize filtered setups to prevent unnecessary re-renders
    const filteredSetups = useMemo(() => getFilteredSetups(), [getFilteredSetups]);

    useEffect(() => {
        // Load based on current galleryPage from context
        // This ensures when we return, we render up to the saved page
        loadSetups(galleryPage);
    }, [filteredSetups, galleryPage]);

    // Infinite scroll observer removed in favor of manual "Load More" button
    // useEffect(() => { ... }) replaced by manual button click

    const loadSetups = (pageNum) => {
        // We don't set loading true here to avoid flickering on back navigation
        // setIsLoadingMore(true); 

        const startIndex = 0;
        // Load ALL items up to the current page (e.g., page 3 = load 36 items)
        const endIndex = pageNum * ITEMS_PER_PAGE;
        const newSetups = filteredSetups.slice(startIndex, endIndex);

        setDisplayedSetups(newSetups);
        // setGalleryPage(pageNum); // Already set in context
        // setIsLoadingMore(false);
    };

    const loadMore = () => {
        const nextPage = galleryPage + 1;
        const endIndex = nextPage * ITEMS_PER_PAGE;

        if (displayedSetups.length < filteredSetups.length) {
            setIsLoadingMore(true);

            // Execute immediately without artificial delay
            requestAnimationFrame(() => {
                const newSetups = filteredSetups.slice(0, endIndex);
                setDisplayedSetups(newSetups);
                setGalleryPage(nextPage); // Update context
                setIsLoadingMore(false);
            });
        }
    };

    const hasMore = displayedSetups.length < filteredSetups.length;

    // Check if any filter is active (search or category filters)
    const hasActiveFilters = filters.search ||
        filters.colorTone?.length > 0 ||
        filters.budget?.length > 0 ||
        filters.gender?.length > 0 ||
        filters.purpose?.length > 0 ||
        filters.size?.length > 0;

    // Show loading ONLY when actively fetching data (not based on setups.length to avoid flash)
    const isLoading = loading;

    // Empty state: ONLY show when NOT loading AND has active filters AND no results
    const showEmptyState = !isLoading && hasActiveFilters && filteredSetups.length === 0;

    return (
        <div className="masonry-gallery">
            <SeoHead
                title="Khám Phá Góc Làm Việc - DeskHub"
                description="Bộ sưu tập những góc làm việc, setup bàn phím, màn hình đẹp nhất được chia sẻ bởi cộng đồng."
            />

            {/* Loading State - Skeleton Grid */}
            {isLoading && (
                <div className="masonry-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-caption"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State - Only show if loading finished AND truly no results from filter/search */}
            {showEmptyState && (
                <div className="empty-state">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <path d="M60 20L20 100h80L60 20z" stroke="currentColor" strokeWidth="4" />
                        <path d="M60 45v30M60 85v4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <h3>Không tìm thấy setup nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                </div>
            )}

            {/* Main Gallery Content */}
            {!isLoading && displayedSetups.length > 0 && (
                <>
                    <div className="masonry-grid">
                        {displayedSetups.map((setup, index) => (
                            <SetupCard key={setup.id} setup={setup} index={index} />
                        ))}
                    </div>

                    {/* Load More Button - Replaces Infinite Scroll */}
                    {hasMore && (
                        <div className="load-more-container">
                            <button className="load-more-btn" onClick={loadMore} disabled={isLoadingMore}>
                                {isLoadingMore ? (
                                    'Đang tải...'
                                ) : (
                                    <>
                                        Xem thêm
                                        <span className="chevron-icon">»</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* End Message */}
                    {!hasMore && displayedSetups.length > 0 && (
                        <div className="end-message">
                            🎉 Bạn đã xem hết tất cả!
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MasonryGallery;
