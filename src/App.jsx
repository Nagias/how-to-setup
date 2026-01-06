import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/layout/Header';
import FilterSidebar from './components/filters/FilterSidebar';
import MasonryGallery from './components/gallery/MasonryGallery';
import SetupDetailModal from './components/setup-detail/SetupDetailModal';
import BlogView from './components/blog/BlogView';
import BlogDetail from './components/blog/BlogDetail';
import BlogEditor from './components/blog/BlogEditor';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/common/AuthModal';
import ProfileModal from './components/common/ProfileModal';
import NewsletterModal from './components/common/NewsletterModal';
import CollectionsModal from './components/common/CollectionsModal';
import AddSetupModal from './components/admin/AddSetupModal';
import './index.css';
import './App.css';

// Gallery Page Component
const GalleryPage = () => (
    <div className="gallery-layout">
        <FilterSidebar />
        <div className="gallery-content">
            <MasonryGallery />
        </div>
    </div>
);

const AppContent = () => {
    const {
        selectedSetup,
        showAddSetupModal,
        setShowAddSetupModal,
        addSetup,
        setShowNewsletterModal
    } = useApp();
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const handleSaveSetup = async (setupData) => {
        const res = await addSetup(setupData);
        if (res.success) {
            setShowAddSetupModal(false);
            alert('Đã thêm setup thành công!');
        } else {
            alert(res.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="app">
            <Header />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<GalleryPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/blog" element={<BlogView />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/blog/new" element={<BlogEditor />} />
                    <Route path="/blog/edit/:id" element={<BlogEditor />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </main>

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
                    </div>
                    <div className="footer-section">
                        <h5>Liên Kết</h5>
                        <ul>
                            <li><a href="/">Bộ Sưu Tập</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><button onClick={() => setShowNewsletterModal(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>Đăng Ký Nhận Tin</button></li>
                            <li><a href="#">Giới Thiệu</a></li>
                            <li><a href="#">Liên Hệ</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Theo Dõi</h5>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
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
