import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import SetupCard from './SetupCard';
import SeoHead from '../common/SeoHead';
import './MasonryGallery.css';


const MasonryGallery = () => {
    const { getFilteredSetups, loading, filters, setups } = useApp();
    const [displayedSetups, setDisplayedSetups] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const ITEMS_PER_PAGE = 12;

    // Memoize filtered setups to prevent unnecessary re-renders
    const filteredSetups = useMemo(() => getFilteredSetups(), [getFilteredSetups]);

    useEffect(() => {
        loadSetups(1);
    }, [filteredSetups]);

    useEffect(() => {
        // Intersection Observer for infinite scroll
        const options = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoadingMore) {
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
    }, [isLoadingMore, page]);

    const loadSetups = (pageNum) => {
        setIsLoadingMore(true);
        const startIndex = 0;
        const endIndex = pageNum * ITEMS_PER_PAGE;
        const newSetups = filteredSetups.slice(startIndex, endIndex);

        setDisplayedSetups(newSetups);
        setPage(pageNum);
        setIsLoadingMore(false);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        const endIndex = nextPage * ITEMS_PER_PAGE;

        if (displayedSetups.length < filteredSetups.length) {
            setIsLoadingMore(true);
            const newSetups = filteredSetups.slice(0, endIndex);
            setDisplayedSetups(newSetups);
            setPage(nextPage);
            setIsLoadingMore(false);
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

    // Show loading when fetching data OR when we have no setups yet (first load)
    const isLoading = loading || setups.length === 0;

    // Empty state: ONLY show when NOT loading AND has active filters AND no results
    const showEmptyState = !isLoading && hasActiveFilters && filteredSetups.length === 0;

    return (
        <div className="masonry-gallery">
            <SeoHead
                title="Khám Phá Góc Làm Việc - DeskHub"
                description="Bộ sưu tập những góc làm việc, setup bàn phím, màn hình đẹp nhất được chia sẻ bởi cộng đồng."
            />

            {/* Loading State with friendly message */}
            {isLoading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Sắp load xong các góc setup, bạn đừng thoát nhé 🥺</h3>
                    <p>Đang tải dữ liệu từ server...</p>
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

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="load-more-trigger">
                            {isLoadingMore && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p>Đang tải...</p>
                                </div>
                            )}
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
