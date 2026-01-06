import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../utils/api';
import './AuthModal.css';

const AuthModal = () => {
    const { showAuthModal, setShowAuthModal } = useApp();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    if (!showAuthModal) return null;

    const handleClose = () => {
        setShowAuthModal(false);
        setError('');
        setEmail('');
        setPassword('');
        setDisplayName('');
        setUsername('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'login') {
                await api.login(email, password);
                handleClose();
                alert('Đăng nhập thành công!');
            } else {
                if (!displayName) {
                    setError('Vui lòng nhập tên hiển thị');
                    return;
                }
                const result = await api.register({ email, password, displayName, username });
                handleClose();
                alert('Đăng ký thành công!');
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Email hoặc mật khẩu không đúng');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email đã được sử dụng');
            } else {
                setError('Đã có lỗi xảy ra: ' + err.message);
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="auth-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="auth-content">
                    <h2>{mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
                    <p className="auth-subtitle">
                        {mode === 'login'
                            ? 'Đăng nhập để lưu setup yêu thích và viết bình luận'
                            : 'Tạo tài khoản mới để tham gia cộng đồng DeskHub'}
                    </p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {mode === 'register' && (
                            <>
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
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        required
                                        pattern="[a-zA-Z0-9_-]+"
                                        title="Chỉ chứa chữ cái, số, gạch ngang và gạch dưới"
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn btn-primary auth-submit">
                            {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {mode === 'login' ? (
                            <p>
                                Chưa có tài khoản?{' '}
                                <button onClick={() => setMode('register')} className="link-btn">
                                    Đăng ký ngay
                                </button>
                            </p>
                        ) : (
                            <p>
                                Đã có tài khoản?{' '}
                                <button onClick={() => setMode('login')} className="link-btn">
                                    Đăng nhập
                                </button>
                            </p>
                        )}
                    </div>

                    <div className="auth-divider">
                        <span>hoặc</span>
                    </div>

                    <button className="btn btn-secondary" onClick={handleClose}>
                        Tiếp tục với tài khoản Khách
                    </button>

                    <p className="auth-note">
                        <small>
                            Tài khoản Khách sử dụng IP máy để lưu dữ liệu. Dữ liệu sẽ được giữ trên thiết bị này.
                        </small>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
