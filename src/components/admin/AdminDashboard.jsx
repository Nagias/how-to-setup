import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { setups, blogs, getComments, currentUser } = useApp();
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const isDateInRange = (dateStr) => {
        if (!dateStr) return false;
        const itemDate = new Date(dateStr);

        if (dateRange.startDate) {
            // Create start date at 00:00:00 local time
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);

            // Note: dateRange.startDate from input is YYYY-MM-DD.
            // new Date("YYYY-MM-DD") is UTC.
            // new Date("YYYY-MM-DD" + "T00:00:00") is local.
            // Let's rely on string parsing safely or use UTC normalization?
            // Safer: Compare timestamps or standardize everything to start of day.
            // Since input is local date, let's treat it as local.
            const parts = dateRange.startDate.split('-');
            const localStart = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);

            if (itemDate < localStart) return false;
        }

        if (dateRange.endDate) {
            const parts = dateRange.endDate.split('-');
            const localEnd = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);

            if (itemDate > localEnd) return false;
        }
        return true;
    };

    // Calculate Stats based on Interaction Timestamps (More accurate)
    const stats = useMemo(() => {
        // 1. Total Setups (Created in range)
        const totalSetups = setups.filter(s => isDateInRange(s.createdAt)).length;

        // 2. Total Blogs (Created in range)
        const totalBlogs = blogs.filter(b => isDateInRange(b.publishedAt)).length;

        // 3. Interactions in range
        let totalLikes = 0;
        let totalSaves = 0;
        let totalComments = 0;

        setups.forEach(setup => {
            // Count Likes in range
            if (Array.isArray(setup.likes)) {
                totalLikes += setup.likes.filter(l =>
                    typeof l === 'object' ? isDateInRange(l.timestamp) : true // Old format fallback: assuming all if no filter, or none? Let's assume none if strict, or all if we can't tell.
                ).length;
            }

            // Count Saves in range
            if (Array.isArray(setup.saves)) {
                totalSaves += setup.saves.filter(s =>
                    typeof s === 'object' ? isDateInRange(s.timestamp) : true
                ).length;
            }

            // Count Comments in range
            const comments = getComments(setup.id);
            totalComments += comments.filter(c => isDateInRange(c.timestamp)).length;
        });

        return { totalSetups, totalBlogs, totalLikes, totalSaves, totalComments };
    }, [setups, blogs, dateRange, getComments]);

    // Ranking Logic (Interactions in Range)
    const topSetups = useMemo(() => {
        return setups.map(setup => {
            // Interactions count *for this specific setup* within the date range
            const comments = getComments(setup.id);

            const likeCount = (setup.likes || []).filter(l => typeof l === 'object' ? isDateInRange(l.timestamp) : true).length;
            const saveCount = (setup.saves || []).filter(s => typeof s === 'object' ? isDateInRange(s.timestamp) : true).length;
            const commentCount = comments.filter(c => isDateInRange(c.timestamp)).length;

            return {
                ...setup,
                rangeLikeCount: likeCount,
                rangeSaveCount: saveCount,
                rangeCommentCount: commentCount,
                engagement: (likeCount * 2) + (saveCount * 3) + (commentCount * 1)
            };
        })
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, 5);
    }, [setups, dateRange, getComments]);

    // Category Stats (Based on Setups created in range)
    const categoryStats = useMemo(() => {
        const _stats = {};
        const setupsInRange = setups.filter(s => isDateInRange(s.createdAt));

        setupsInRange.forEach(setup => {
            const key = setup.filters.purpose || 'Other';
            if (!_stats[key]) _stats[key] = 0;
            _stats[key]++;
        });
        return Object.entries(_stats).sort((a, b) => b[1] - a[1]);
    }, [setups, dateRange]);

    if (!currentUser || currentUser.role !== 'admin') {
        return <div className="admin-dashboard-error">Access Denied</div>;
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {currentUser.displayName}</p>
                </div>

                <div className="dashboard-filter">
                    <span className="filter-label">Lọc theo ngày:</span>
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <span className="filter-separator">-</span>
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button
                            className="btn-clear"
                            onClick={() => setDateRange({ startDate: '', endDate: '' })}
                        >
                            Xóa lọc
                        </button>
                    )}
                </div>
            </header>

            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tổng Lượt Thích</h3>
                    <div className="stat-value">{stats.totalLikes}</div>
                    <div className="stat-trend positive">❤️ {dateRange.startDate || dateRange.endDate ? 'Trong khoảng thời gian này' : 'Toàn thời gian'}</div>
                </div>
                <div className="stat-card">
                    <h3>Tổng Lượt Lưu</h3>
                    <div className="stat-value">{stats.totalSaves}</div>
                    <div className="stat-trend positive">📌 {dateRange.startDate || dateRange.endDate ? 'Trong khoảng thời gian này' : 'Toàn thời gian'}</div>
                </div>
                <div className="stat-card">
                    <h3>Tổng Bình Luận</h3>
                    <div className="stat-value">{stats.totalComments}</div>
                    <div className="stat-trend">💬 Thảo luận</div>
                </div>
                <div className="stat-card">
                    <h3>Tổng Setup Mới</h3>
                    <div className="stat-value">{stats.totalSetups}</div>
                    <div className="stat-trend">🖥️ Bài đăng</div>
                </div>
            </div>

            <div className="dashboard-layout">
                {/* Top Ranking */}
                <div className="dashboard-section ranking-section">
                    <h2>🏆 BXH Tương Tác (Theo bộ lọc)</h2>
                    <p className="section-desc">Các setup có tương tác cao nhất trong thời gian đã chọn.</p>

                    <div className="ranking-table-wrapper">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Setup</th>
                                    <th>Thích</th>
                                    <th>Lưu</th>
                                    <th>Bình luận</th>
                                    <th>Điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSetups.map((setup, index) => (
                                    <tr key={setup.id}>
                                        <td>
                                            <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                                        </td>
                                        <td>
                                            <div className="setup-cell">
                                                <img src={setup.mainImage} alt="" className="setup-thumb" />
                                                <span className="setup-title">{setup.title}</span>
                                            </div>
                                        </td>
                                        <td>{setup.rangeLikeCount}</td>
                                        <td>{setup.rangeSaveCount}</td>
                                        <td>{setup.rangeCommentCount}</td>
                                        <td><strong>{setup.engagement}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Newsletter Insights */}
                <div className="dashboard-section insights-section">
                    <h2>📊 Xu Hướng</h2>
                    <div className="insights-card">
                        <h3>Danh Mục Phổ Biến (Setup Mới)</h3>
                        {categoryStats.length > 0 ? (
                            <ul className="category-list">
                                {categoryStats.map(([category, count]) => (
                                    <li key={category} className="category-item">
                                        <span className="category-name">{category.replace('-', ' ')}</span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(count / stats.totalSetups) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="category-count">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">Không có setup nào trong khoảng thời gian này.</p>
                        )}
                    </div>

                    <div className="insights-card">
                        <h3>Gợi Ý Newsletter</h3>
                        <div className="newsletter-suggestion">
                            <p>Tóm tắt trong khoảng thời gian này:</p>
                            <ul>
                                <li>✨ Top 1: <strong>{topSetups[0]?.engagement > 0 ? topSetups[0].title : 'Chưa có tương tác'}</strong></li>
                                <li>📈 Trend Mới: <strong>{categoryStats[0]?.[0] || 'N/A'}</strong></li>
                                <li>💡 Blog Mới: {blogs.filter(b => isDateInRange(b.publishedAt))[0]?.title || 'Không có'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
