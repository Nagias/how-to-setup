import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { updateGuestProfile, logoutUser, getCurrentUser } from '../../utils/ipUtils';
import './ProfileModal.css';

const ProfileModal = () => {
    const { showProfileModal, setShowProfileModal, refreshUser, currentUser } = useApp();
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [message, setMessage] = useState('');

    if (!showProfileModal) return null;

    const handleClose = () => {
        setShowProfileModal(false);
        setMessage('');
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (currentUser?.isGuest) {
            updateGuestProfile(displayName);
            refreshUser();
            setMessage('Đã cập nhật tên hiển thị!');
            setTimeout(() => handleClose(), 1500);
        }
    };

    const handleLogout = () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            logoutUser();
            refreshUser();
            handleClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="profile-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="profile-content">
                    <div className="profile-header">
                        <img src={currentUser?.avatar} alt={currentUser?.displayName} className="profile-avatar-large" />
                        <h2>{currentUser?.displayName}</h2>
                        <p className="profile-role">
                            {currentUser?.isGuest ? '👤 Tài khoản Khách' : '✨ Thành viên'}
                        </p>
                    </div>

                    {message && <div className="profile-message success">{message}</div>}

                    {currentUser?.isGuest ? (
                        <form onSubmit={handleSave} className="profile-form">
                            <div className="form-group">
                                <label>Tên hiển thị</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Tên của bạn"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Lưu Thay Đổi
                            </button>
                        </form>
                    ) : (
                        <div className="profile-info">
                            <div className="info-item">
                                <span className="info-label">Tên đăng nhập:</span>
                                <span className="info-value">{currentUser?.username}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Vai trò:</span>
                                <span className="info-value">
                                    {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                </span>
                            </div>
                        </div>
                    )}

                    {!currentUser?.isGuest && (
                        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
                            Đăng Xuất
                        </button>
                    )}

                    <div className="profile-note">
                        <small>
                            {currentUser?.isGuest
                                ? 'Dữ liệu của bạn được lưu trên thiết bị này. Tạo tài khoản để đồng bộ trên nhiều thiết bị.'
                                : 'Tài khoản của bạn đã được đăng ký và có thể sử dụng trên nhiều thiết bị.'}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
