import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './Header.css';

const Header = () => {
    const {
        theme,
        toggleTheme,
        filters,
        setFilters,
        currentUser,
        setShowAuthModal,
        setShowProfileModal,
        setShowNewsletterModal,
        setShowCollectionsModal,
        setShowAddSetupModal
    } = useApp();
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value });
        if (location.pathname !== '/' && location.pathname !== '/gallery') {
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="container header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
                        <path d="M8 12h16M8 16h16M8 20h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <defs>
                            <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                                <stop offset="0%" stopColor="hsl(220, 90%, 56%)" />
                                <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="header-logo-text">DeskHub</span>
                </Link>

                {/* Navigation */}
                <nav className="header-nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '/gallery' ? 'active' : ''}`}>
                        Bộ Sưu Tập
                    </Link>
                    <Link to="/blog" className={`nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`}>
                        Blog
                    </Link>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    {/* Admin Post Button */}
                    {currentUser?.role === 'admin' && (
                        <>
                            <Link
                                to="/blog/new"
                                className="btn"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    marginRight: '0.5rem',
                                    textDecoration: 'none',
                                    borderRadius: '8px'
                                }}
                            >
                                ✍️ Blog
                            </Link>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => setShowAddSetupModal(true)}
                            >
                                <span>+</span> Đăng Góc
                            </button>
                        </>
                    )}

                    {/* Search */}
                    <div className={`search-container ${searchExpanded ? 'expanded' : ''}`}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm setup..."
                            value={filters.search}
                            onChange={handleSearch}
                            onFocus={() => setSearchExpanded(true)}
                            onBlur={() => !filters.search && setSearchExpanded(false)}
                        />
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Collections */}
                    <button
                        className="btn btn-icon"
                        onClick={() => setShowCollectionsModal(true)}
                        title="Setup đã lưu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>

                    {/* Theme Toggle */}
                    <button className="btn btn-icon theme-toggle" onClick={toggleTheme} title="Đổi theme">
                        {theme === 'light' ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3V1M10 19v-2M17 10h2M1 10h2M15.657 4.343l1.414-1.414M3.343 16.657l1.414-1.414M15.657 15.657l1.414 1.414M3.343 3.343l1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    {/* User Menu */}
                    <div className="user-menu-container">
                        <button
                            className="user-avatar-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Guest'}`} alt="" />
                            {/* <span className="user-name">{currentUser?.displayName}</span> */}
                        </button>

                        {showUserMenu && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Guest'}`} alt="" />
                                    <div>
                                        <p className="user-menu-name">{currentUser?.displayName || 'Khách'}</p>
                                        <p className="user-menu-role">
                                            {/* Logic for role display */}
                                            {!currentUser ? 'Chưa đăng nhập' :
                                                currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                        </p>
                                    </div>
                                </div>

                                <div className="user-menu-items">
                                    <button onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM3 18a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Hồ Sơ
                                    </button>
                                    {currentUser?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setShowUserMenu(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.75rem 1rem',
                                                color: 'var(--color-text-primary)',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-hover)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                                <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            Dashboard
                                        </Link>
                                    )}
                                    <button onClick={() => { setShowCollectionsModal(true); setShowUserMenu(false); }}>
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                            <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        Setup Đã Lưu
                                    </button>
                                    {!currentUser && (
                                        <button onClick={() => { setShowAuthModal(true); setShowUserMenu(false); }}>
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                                <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            Đăng Nhập / Đăng Ký
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showUserMenu && (
                <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)} />
            )}
        </header>
    );
};

export default Header;

