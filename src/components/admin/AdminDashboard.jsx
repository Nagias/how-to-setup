import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../utils/api';
import AddSetupModal from './AddSetupModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { setups, blogs, getComments, currentUser, addSetup, updateSetup, deleteSetup, refreshData } = useApp();
    const [editingSetup, setEditingSetup] = useState(null);
    const [selectedSetups, setSelectedSetups] = useState(new Set());
    const [isClaiming, setIsClaiming] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Claim tất cả blogs/setups cũ không có userId
    const handleClaimContent = async () => {
        if (!confirm('Gán userId của bạn vào TẤT CẢ blogs/setups chưa có userId?\n\nĐiều này sẽ cập nhật avatar và tên tác giả cho các bài viết cũ.')) {
            return;
        }

        setIsClaiming(true);
        try {
            const result = await api.claimAllContent(currentUser.id, {
                displayName: currentUser.displayName,
                avatar: currentUser.avatar || currentUser.photoURL
            });

            if (result.success) {
                alert(`✅ Đã claim ${result.count} bài viết!\n\nTải lại trang để thấy thay đổi.`);
                window.location.reload();
            } else {
                alert('❌ Lỗi: ' + result.error);
            }
        } catch (error) {
            alert('❌ Lỗi: ' + error.message);
        } finally {
            setIsClaiming(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSetups(new Set(setups.map(s => s.id)));
        } else {
            setSelectedSetups(new Set());
        }
    };

    const handleToggleSelect = (id) => {
        const newSelected = new Set(selectedSetups);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedSetups(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedSetups.size === 0) return;

        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedSetups.size} setup đã chọn không?`)) {
            try {
                // Execute deletes in parallel
                const deletePromises = Array.from(selectedSetups).map(id => deleteSetup(id));
                await Promise.all(deletePromises);

                setSelectedSetups(new Set());
                alert('Đã xóa các setup đã chọn!');
            } catch (error) {
                console.error('Bulk delete failed:', error);
                alert('Có lỗi xảy ra khi xóa hàng loạt.');
            }
        }
    };

    const handleSaveSetup = async (idOrData, data) => {
        // If data is present, it's an update (id, data)
        // If only idOrData is present, it's a create (data)
        if (data) {
            const res = await updateSetup(idOrData, data);
            if (res.success) {
                setEditingSetup(null);
                alert('Đã cập nhật setup thành công!');
            } else {
                alert(res.message || 'Lỗi cập nhật');
            }
        } else {
            const res = await addSetup(idOrData);
            if (res.success) {
                // setShowAddModal(false); // remove if not used or define it
                alert('Đã thêm setup thành công!');
            } else {
                alert(res.message || 'Có lỗi xảy ra');
            }
        }
    };

    const handleEditSetup = (setup) => {
        setEditingSetup(setup);
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

                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn"
                        onClick={handleClaimContent}
                        disabled={isClaiming}
                        style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: isClaiming ? 'not-allowed' : 'pointer', opacity: isClaiming ? 0.6 : 1 }}
                    >
                        {isClaiming ? '⏳ Đang xử lý...' : '🔧 Claim Bài Viết Cũ'}
                    </button>
                    <button className="btn" onClick={async () => { if (confirm('Tải lại dữ liệu từ server/local?')) { await refreshData(); alert('Đã cập nhật!'); } }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>🔄 Khôi phục Dữ liệu</button>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>📁 Quản Lý Tất Cả Setup ({setups.length})</h2>
                        {selectedSetups.size > 0 && (
                            <div className="bulk-actions" style={{ margin: 0 }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Đã chọn {selectedSetups.size}</span>
                                <button onClick={handleBulkDelete} className="btn-bulk-delete">
                                    🗑️ Xóa {selectedSetups.size} Setup
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="ranking-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-col">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={setups.length > 0 && selectedSetups.size === setups.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Setup</th>
                                    <th>Ngày tạo</th>
                                    <th>Thống kê (Like/Save/Cmt)</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {setups.map((setup) => (
                                    <tr key={setup.id} style={{ background: selectedSetups.has(setup.id) ? 'var(--bg-secondary)' : 'transparent' }}>
                                        <td className="checkbox-col">
                                            <input
                                                type="checkbox"
                                                className="custom-checkbox"
                                                checked={selectedSetups.has(setup.id)}
                                                onChange={() => handleToggleSelect(setup.id)}
                                            />
                                        </td>
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
                                                className="btn-edit"
                                                onClick={() => handleEditSetup(setup)}
                                                title="Sửa setup này"
                                                style={{ marginRight: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                ✏️
                                            </button>
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

            {/* Edit Setup Modal */}
            {editingSetup && (
                <AddSetupModal
                    initialData={editingSetup}
                    onClose={() => setEditingSetup(null)}
                    onSave={handleSaveSetup}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
