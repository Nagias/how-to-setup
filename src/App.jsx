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
        addSetup
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
                            <li><a href="#">Giới Thiệu</a></li>
                            <li><a href="#">Liên Hệ</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Theo Dõi</h5>
                        <div className="social-links">
                            {/* Social Icons kept simple */}
                            <a href="#" className="social-link">FB</a>
                            <a href="#" className="social-link">IN</a>
                            <a href="#" className="social-link">YT</a>
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
