import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useApp } from '../../contexts/AppContext';
import { updateGuestProfile, getCurrentUser } from '../../utils/ipUtils';
import './ProfileModal.css';

const ProfileModal = () => {
    const { showProfileModal, setShowProfileModal, refreshUser, currentUser, logout } = useApp();
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || '');
    const [message, setMessage] = useState('');

    if (!showProfileModal) return null;

    const handleClose = () => {
        setShowProfileModal(false);
        setMessage('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (currentUser?.isGuest) {
            updateGuestProfile(displayName);
            refreshUser();
            setMessage('Đã cập nhật tên hiển thị!');
            setTimeout(() => handleClose(), 1500);
        } else {
            try {
                // Check for Base64 image (too long for Firebase Auth profile, limit ~2kb)
                const isBase64 = avatar && avatar.startsWith('data:');

                if (auth.currentUser) {
                    const authUpdates = { displayName };
                    // Skip photoURL update in Auth if it's Base64
                    if (!isBase64) {
                        authUpdates.photoURL = avatar;
                    }
                    await updateProfile(auth.currentUser, authUpdates);
                }

                // Update Firestore (supports large Base64 strings)
                const userRef = doc(db, 'users', currentUser.id);
                await updateDoc(userRef, {
                    displayName: displayName,
                    avatar: avatar
                });

                setMessage('Cập nhật thành công! Đang tải lại...');
                setTimeout(() => window.location.reload(), 500); // Faster reload
            } catch (error) {
                console.error(error);
                setMessage('Lỗi: ' + error.message);
            }
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) return alert('File quá lớn (>2MB)');
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = async () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            await logout();
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
                        <form onSubmit={handleSave} className="profile-form">
                            <div className="form-group profile-avatar-edit">
                                <label>Ảnh Đại Diện</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={avatar || currentUser.photoURL} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} alt="Avatar" />
                                    <div>
                                        <label htmlFor="avatar-upload" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Thay đổi</label>
                                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>
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

                            <div className="profile-info-readonly" style={{ margin: '1rem 0', opacity: 0.8, fontSize: '0.9rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {currentUser.email}</div>
                                <div><strong>Vai trò:</strong> {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Lưu Thay Đổi
                            </button>
                        </form>
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
