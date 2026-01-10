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

    // Memoize filtered setups to prevent unnecessary re-renders
    const filteredSetups = React.useMemo(() => getFilteredSetups(), [getFilteredSetups]);

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
        const startIndex = 0;
        const endIndex = pageNum * ITEMS_PER_PAGE;
        const newSetups = filteredSetups.slice(startIndex, endIndex);

        setDisplayedSetups(newSetups);
        setPage(pageNum);
        setLoading(false);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        const endIndex = nextPage * ITEMS_PER_PAGE;

        if (displayedSetups.length < filteredSetups.length) {
            setLoading(true);
            const newSetups = filteredSetups.slice(0, endIndex);
            setDisplayedSetups(newSetups);
            setPage(nextPage);
            setLoading(false);
        }
    };

    const hasMore = displayedSetups.length < filteredSetups.length;

    return (
        <div className="masonry-gallery">
            <SeoHead
                title="Khám Phá Góc Làm Việc - DeskHub"
                description="Bộ sưu tập những góc làm việc, setup bàn phím, màn hình đẹp nhất được chia sẻ bởi cộng đồng."
            />
            {displayedSetups.length === 0 && !loading ? (
                <div className="empty-state">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <path d="M60 20L20 100h80L60 20z" stroke="currentColor" strokeWidth="4" />
                        <path d="M60 45v30M60 85v4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <h3>Không tìm thấy setup nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                </div>
            ) : (
                <>
                    <div className="masonry-grid">
                        {displayedSetups.map((setup, index) => (
                            <SetupCard key={setup.id} setup={setup} index={index} />
                        ))}
                    </div>

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="load-more-trigger">
                            {loading && (
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
