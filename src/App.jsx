import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/layout/Header';
import FilterSidebar from './components/filters/FilterSidebar';
import MasonryGallery from './components/gallery/MasonryGallery';
import SetupDetailModal from './components/setup-detail/SetupDetailModal';
import BlogView from './components/blog/BlogView';
import BlogDetail from './components/blog/BlogDetail';
import BlogEditor from './components/blog/BlogEditor';
import SeoBlogEditor from './components/blog/SeoBlogEditor';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/common/AuthModal';
import ProfileModal from './components/common/ProfileModal';
import NewsletterModal from './components/common/NewsletterModal';
import CollectionsModal from './components/common/CollectionsModal';
import AddSetupModal from './components/admin/AddSetupModal';
import SetupDetailPage from './components/setup-detail/SetupDetailPage';
import './index.css';
import './App.css';

// Gallery Page Component
const GalleryPage = () => (
    <div className="gallery-layout">
        <div className="desktop-sidebar-wrapper">
            <FilterSidebar />
        </div>
        <div className="gallery-content">
            <MasonryGallery />
        </div>
    </div>
);

// Newsletter inline component for footer
const FooterNewsletter = () => {
    const { subscribeNewsletter } = useApp();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setStatus('loading');
        const res = await subscribeNewsletter({ email });
        if (res.success) {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="footer-newsletter">
            <p className="newsletter-label">📬 Nhận tin mới:</p>
            <form className="newsletter-inline-form" onSubmit={handleSubscribe}>
                <input
                    type="email"
                    placeholder="Email của bạn..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading' || status === 'success'}
                />
                <button type="submit" className={`btn-newsletter-small ${status}`} disabled={status === 'loading'}>
                    {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Đăng ký'}
                </button>
            </form>
        </div>
    );
};

const AppContent = () => {
    const {
        selectedSetup,
        showAddSetupModal,
        setShowAddSetupModal,
        addSetup,
        setShowNewsletterModal
    } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    // Handle scroll to top and URL cleanup (fbclid)

    useEffect(() => {
        window.scrollTo(0, 0);

        // FIXED: HashRouter puts ?fbclid BEFORE the # symbol.
        // React Router's location.search only reads AFTER #, so it's always empty.
        // We must use window.location.search (native browser API) to read the REAL query params.

        const realParams = new URLSearchParams(window.location.search);

        if (realParams.has('fbclid')) {
            // For HashRouter: Check the hash path (e.g., "#/blog/..." -> "/blog/...")
            const hashPath = window.location.hash.replace('#', '') || '/';
            const isHomePage = hashPath === '/' || hashPath === '' || hashPath === '/gallery';

            if (isHomePage) {
                const isSessionTracked = sessionStorage.getItem('fb_session_tracked');
                if (!isSessionTracked) {
                    // First landing on Homepage -> Keep fbclid for Analytics
                    sessionStorage.setItem('fb_session_tracked', 'true');
                    return;
                }
            }

            // Remove fbclid from URL using native History API
            realParams.delete('fbclid');

            // Rebuild clean URL: origin + pathname + (remaining params) + hash
            const cleanSearch = realParams.toString();
            const newUrl = window.location.origin +
                window.location.pathname +
                (cleanSearch ? '?' + cleanSearch : '') +
                window.location.hash;

            window.history.replaceState(null, '', newUrl);

            // Mark session as tracked
            sessionStorage.setItem('fb_session_tracked', 'true');
        }
    }, [location.pathname, location.hash]); // Listen to hash changes too

    const handleSaveSetup = async (setupData) => {
        console.log('🔴 App.handleSaveSetup called with:', setupData);
        const res = await addSetup(setupData);
        console.log('🔴 App.handleSaveSetup response:', res);

        if (res.success) {
            setShowAddSetupModal(false);
            alert('Đã thêm setup thành công!');
        } else {
            alert(`Lỗi: ${res.message || 'Có lỗi xảy ra'}`);
        }
    };

    return (
        <div className="app">
            <Header />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<GalleryPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/setup/:setupId" element={<SetupDetailPage />} />
                    <Route path="/blog" element={<BlogView />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    {/* SEO Blog Editor (New) */}
                    <Route path="/blog/seo-new" element={<SeoBlogEditor />} />
                    <Route path="/blog/seo-edit/:id" element={<SeoBlogEditor />} />
                    {/* Legacy Blog Editor */}
                    <Route path="/blog/new" element={<BlogEditor />} />
                    <Route path="/blog/edit/:id" element={<BlogEditor />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<GalleryPage />} />
                </Routes>
            </main>

            {/* Global Mobile Filter Sidebar */}
            <div className="mobile-filter-wrapper">
                <FilterSidebar />
            </div>

            {/* Modals - SetupDetailModal manages its own URL logic or stays as modal */}
            {selectedSetup && <SetupDetailModal />}
            {showAddSetupModal && (
                <AddSetupModal
                    onClose={() => setShowAddSetupModal(false)}
                    onSave={handleSaveSetup}
                />
            )}

            <AuthModal />
            <ProfileModal />
            <NewsletterModal />
            <CollectionsModal />

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-section">
                        <h4>DeskHub</h4>
                        <p>Khám phá và chia sẻ những góc làm việc đẹp nhất từ khắp nơi trên thế giới.</p>
                        <FooterNewsletter />
                    </div>
                    <div className="footer-section">
                        <h5>Liên Kết</h5>
                        <ul>
                            <li><Link to="/">Bộ Sưu Tập</Link></li>
                            <li><Link to="/blog">Blog</Link></li>

                            <li><a href="#">Giới Thiệu</a></li>
                            <li><a href="#">Liên Hệ</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Theo Dõi</h5>
                        <div className="social-links">
                            <a href="https://www.facebook.com/profile.php?id=61587318841497" className="social-link" aria-label="Facebook">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="YouTube">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33zM9.75 15.02V8.5l5.75 3.26z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <p>&copy; 2026 DeskHub. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
