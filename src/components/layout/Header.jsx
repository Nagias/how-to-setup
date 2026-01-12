import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { filterOptions } from '../../data/sampleData';
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
        setShowAddSetupModal,
        setShowMobileFilter
    } = useApp();
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isGalleryPage = location.pathname === '/' || location.pathname === '/gallery';

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value });
        if (location.pathname !== '/' && location.pathname !== '/gallery') {
            navigate('/');
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);
    const getActiveFilterCount = () => {
        return Object.keys(filters).reduce((count, key) => {
            if (key === 'search') return count;
            return count + filters[key].length;
        }, 0);
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <header className="header">
            <div className="container header-container">
                {/* Logo */}
                <Link to="/" className="header-logo" onClick={closeMobileMenu}>
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


                {/* Desktop Navigation */}
                <nav className="header-nav desktop-only">
                    <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '/gallery' ? 'active' : ''}`}>
                        Bộ Sưu Tập
                    </Link>
                    <Link to="/blog" className={`nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`}>
                        Blog
                    </Link>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    {/* Admin Post Button (Desktop) */}
                    {currentUser?.role === 'admin' && (
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                            <Link
                                to="/blog/seo-new"
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
                        </div>
                    )}

                    {/* Search */}
                    <div className={`search-container ${searchExpanded ? 'expanded' : ''}`}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={handleSearch}
                            onFocus={() => setSearchExpanded(true)}
                            onBlur={() => !filters.search && setSearchExpanded(false)}
                        />
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Mobile: Filter Button - Only on Gallery Page */}
                    {isGalleryPage && (
                        <button
                            className="btn-icon mobile-filter-btn mobile-only"
                            onClick={() => setShowMobileFilter(true)}
                            title="Bộ lọc"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            {activeFilterCount > 0 && (
                                <span className="filter-badge">{activeFilterCount}</span>
                            )}
                        </button>
                    )}

                    {/* Mobile: User/Avatar Button */}
                    <button
                        className="btn-icon mobile-menu-toggle mobile-only"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        {currentUser ? (
                            <img
                                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.displayName}`}
                                alt=""
                                className="mobile-avatar-btn"
                            />
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        )}
                    </button>

                    {/* Collections (Desktop) */}
                    <button
                        className="btn btn-icon desktop-only"
                        onClick={() => setShowCollectionsModal(true)}
                        title="Setup đã lưu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 3h10a2 2 0 012 2v14l-7-4-7 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>

                    {/* Theme Toggle (Desktop) */}
                    <button className="btn btn-icon theme-toggle desktop-only" onClick={toggleTheme} title="Đổi theme">
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

                    {/* User Menu - Always visible but simplified on mobile? No, hide on mobile and put in drawer */}
                    <div className="user-menu-container desktop-only">
                        <button
                            className="user-avatar-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Guest'}`} alt="" />
                        </button>

                        {showUserMenu && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Guest'}`} alt="" />
                                    <div>
                                        <p className="user-menu-name">{currentUser?.displayName || 'Khách'}</p>
                                        <p className="user-menu-role">
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

            {/* User Menu Overlay (Desktop) */}
            {showUserMenu && (
                <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)} />
            )}

            {/* MOBILE MENU DRAWER */}
            <>
                <div className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-header">
                        <h3>Menu</h3>
                        <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {currentUser && (
                        <div className="mobile-user-profile" onClick={() => { setShowProfileModal(true); closeMobileMenu(); }}>
                            <img src={currentUser.avatar} alt="Avatar" />
                            <div>
                                <p className="name">{currentUser.displayName}</p>
                                <p className="role">{currentUser.role === 'admin' ? 'Admin' : 'Member'}</p>
                            </div>
                        </div>
                    )}

                    <div className="mobile-nav-links">
                        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Trang Chủ
                        </Link>
                        <Link to="/blog" className={`mobile-nav-item ${location.pathname.startsWith('/blog') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Blog
                        </Link>

                        {currentUser?.role === 'admin' && (
                            <Link to="/admin" className="mobile-nav-item" onClick={closeMobileMenu}>
                                Quản Lý (Admin)
                            </Link>
                        )}
                    </div>

                    <div className="mobile-actions">
                        <button className="mobile-action-btn" onClick={() => { setShowCollectionsModal(true); closeMobileMenu(); }}>
                            Setup Đã Lưu
                        </button>

                        {currentUser?.role === 'admin' && (
                            <button className="mobile-action-btn primary" onClick={() => { setShowAddSetupModal(true); closeMobileMenu(); }}>
                                + Đăng Setup
                            </button>
                        )}

                        {!currentUser && (
                            <button className="mobile-action-btn primary" onClick={() => { setShowAuthModal(true); closeMobileMenu(); }}>
                                Đăng Nhập
                            </button>
                        )}

                        <button className="mobile-action-btn" onClick={toggleTheme}>
                            {theme === 'light' ? 'Chế Độ Tối' : 'Chế Độ Sáng'}
                        </button>
                    </div>
                </div>
            </>

        </header>
    );
};

export default Header;

