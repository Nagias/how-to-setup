import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './CollectionsModal.css';

const CollectionsModal = () => {
    const { showCollectionsModal, setShowCollectionsModal, getSavedSetups, setSelectedSetup } = useApp();

    if (!showCollectionsModal) return null;

    const savedSetups = getSavedSetups();

    const navigate = useNavigate();

    const handleClose = () => {
        setShowCollectionsModal(false);
    };

    const handleSetupClick = (setup) => {
        handleClose();
        navigate(`/setup/${setup.id}`);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="collections-modal modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="collections-content">
                    <div className="collections-header">
                        <h2>Setup Đã Lưu</h2>
                        <p className="collections-count">{savedSetups.length} setup</p>
                    </div>

                    {savedSetups.length === 0 ? (
                        <div className="collections-empty">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <circle cx="60" cy="60" r="50" stroke="var(--color-border)" strokeWidth="2" />
                                <path d="M50 40h20a5 5 0 015 5v40l-15-8-15 8V45a5 5 0 015-5z" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                            </svg>
                            <h3>Chưa có setup nào</h3>
                            <p>Bấm vào biểu tượng 📌 trên các setup để lưu vào bộ sưu tập của bạn</p>
                        </div>
                    ) : (
                        <div className="collections-grid">
                            {savedSetups.map(setup => (
                                <div
                                    key={setup.id}
                                    className="collection-item"
                                    onClick={() => handleSetupClick(setup)}
                                >
                                    <div className="collection-item-image">
                                        <img src={setup.mainImage} alt={setup.title} />
                                    </div>
                                    <div className="collection-item-content">
                                        <h4>{setup.title}</h4>
                                        <p>{setup.caption}</p>
                                        <div className="collection-item-meta">
                                            <span>❤️ {setup.likes?.length || 0}</span>
                                            <span>💬 {setup.comments || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionsModal;
