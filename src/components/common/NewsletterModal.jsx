import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './NewsletterModal.css';

const NewsletterModal = () => {
    const { showNewsletterModal, setShowNewsletterModal, subscribeNewsletter } = useApp();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!showNewsletterModal) return null;

    const handleClose = () => {
        setShowNewsletterModal(false);
        setEmail('');
        setName('');
        setMessage('');
        setIsSuccess(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = subscribeNewsletter(email, name);
        setMessage(result.message);
        setIsSuccess(result.success);

        if (result.success) {
            setTimeout(() => {
                handleClose();
            }, 2000);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="newsletter-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="newsletter-content">
                    <div className="newsletter-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="32" r="30" fill="url(#newsletter-gradient)" opacity="0.1" />
                            <path d="M16 24l16 12 16-12M16 24v24h32V24M16 24h32" stroke="url(#newsletter-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="newsletter-gradient" x1="0" y1="0" x2="64" y2="64">
                                    <stop offset="0%" stopColor="hsl(220, 90%, 56%)" />
                                    <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2>Đăng Ký Newsletter</h2>
                    <p className="newsletter-subtitle">
                        Nhận những setup đẹp nhất mỗi tuần và tips thiết kế workspace từ DeskHub
                    </p>

                    {message && (
                        <div className={`newsletter-message ${isSuccess ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="newsletter-form">
                        <div className="form-group">
                            <label>Tên của bạn</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary newsletter-submit">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M18 2L9 11M18 2l-7 16-2-7-7-2 16-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Đăng Ký Ngay
                        </button>
                    </form>

                    <p className="newsletter-note">
                        <small>
                            Chúng tôi sẽ gửi email mỗi tuần về những setup được bình chọn đẹp nhất.
                            Bạn có thể hủy đăng ký bất cứ lúc nào.
                        </small>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsletterModal;
