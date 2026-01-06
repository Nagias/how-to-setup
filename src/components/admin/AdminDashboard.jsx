import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import AddSetupModal from './AddSetupModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { setups, blogs, getComments, currentUser, addSetup, deleteSetup } = useApp();
    const [showAddModal, setShowAddModal] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const handleSaveSetup = async (setupData) => {
        const res = await addSetup(setupData);
        if (res.success) {
            setShowAddModal(false);
            alert('Đã thêm setup thành công!');
        } else {
            alert(res.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteSetup = async (id, title) => {
        if (window.confirm(`Bạn có chắc muốn xóa setup "${title}" không?`)) {
            const res = await deleteSetup(id);
            if (res.success) {
                // UI updates automatically via context
            } else {
                alert(res.message || 'Xóa thất bại');
            }
        }
    };

    const isDateInRange = (dateStr) => {
        if (!dateStr) return false;
        const itemDate = new Date(dateStr);

        if (dateRange.startDate) {
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

    // Calculate Stats
    const stats = useMemo(() => {
        const totalSetups = setups.filter(s => isDateInRange(s.createdAt)).length;
        const totalBlogs = blogs.filter(b => isDateInRange(b.publishedAt)).length;

        let totalLikes = 0;
        let totalSaves = 0;
        let totalComments = 0;

        setups.forEach(setup => {
            if (Array.isArray(setup.likes)) {
                totalLikes += setup.likes.filter(l =>
                    typeof l === 'object' ? isDateInRange(l.timestamp) : true
                ).length;
            }

            if (Array.isArray(setup.saves)) {
                totalSaves += setup.saves.filter(s =>
                    typeof s === 'object' ? isDateInRange(s.timestamp) : true
                ).length;
            }

            const comments = getComments(setup.id);
            totalComments += comments.filter(c => isDateInRange(c.timestamp)).length;
        });

        return { totalSetups, totalBlogs, totalLikes, totalSaves, totalComments };
    }, [setups, blogs, dateRange, getComments]);

    // Ranking Logic
    const topSetups = useMemo(() => {
        return setups.map(setup => {
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

    // Category Stats
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

                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn-add-setup"
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '0.75rem 1.25rem',
                            backgroundColor: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>+</span> Mới
                    </button>

                    <div className="dashboard-filter">
                        <span className="filter-label">Lọc:</span>
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
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tổng Lượt Thích</h3>
                    <div className="stat-value">{stats.totalLikes}</div>
                    <div className="stat-trend positive">❤️ {dateRange.startDate || dateRange.endDate ? 'Trong khoảng' : 'Tất cả'}</div>
                </div>
                <div className="stat-card">
                    <h3>Tổng Lượt Lưu</h3>
                    <div className="stat-value">{stats.totalSaves}</div>
                    <div className="stat-trend positive">📌 {dateRange.startDate || dateRange.endDate ? 'Trong khoảng' : 'Tất cả'}</div>
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
                {/* MANAGE ALL SETUPS SECTION (NEW) */}
                <div className="dashboard-section manage-section">
                    <h2>📁 Quản Lý Tất Cả Setup ({setups.length})</h2>
                    <div className="ranking-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>Setup</th>
                                    <th>Ngày tạo</th>
                                    <th>Thống kê (Like/Save/Cmt)</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {setups.map((setup) => (
                                    <tr key={setup.id}>
                                        <td>
                                            <div className="setup-cell">
                                                <img src={setup.mainImage} alt="" className="setup-thumb" />
                                                <span className="setup-title" title={setup.title}>{setup.title}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(setup.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {setup.likes?.length || 0} / {setup.saves?.length || 0} / {setup.comments || 0}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteSetup(setup.id, setup.title)}
                                                title="Xóa setup này"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ranking Section */}
                <div className="dashboard-section ranking-section">
                    <h2>🏆 BXH Tương Tác Top 5</h2>
                    <div className="ranking-table-wrapper">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Setup</th>
                                    <th>Điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSetups.map((setup, index) => (
                                    <tr key={setup.id}>
                                        <td><span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span></td>
                                        <td>
                                            <div className="setup-cell">
                                                <img src={setup.mainImage} alt="" className="setup-thumb" />
                                                <span className="setup-title">{setup.title}</span>
                                            </div>
                                        </td>
                                        <td><strong>{setup.engagement}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="dashboard-section insights-section">
                    <h2>📊 Xu Hướng</h2>
                    <div className="insights-card">
                        <h3>Danh Mục Phổ Biến</h3>
                        {categoryStats.length > 0 ? (
                            <ul className="category-list">
                                {categoryStats.map(([category, count]) => (
                                    <li key={category} className="category-item">
                                        <span className="category-name">{category.replace('-', ' ')}</span>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${(count / stats.totalSetups) * 100}%` }}></div>
                                        </div>
                                        <span className="category-count">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">Không có dữ liệu.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Setup Modal */}
            {showAddModal && (
                <AddSetupModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveSetup}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
