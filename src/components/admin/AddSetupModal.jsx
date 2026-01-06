import React, { useState, useRef, useEffect } from 'react';
import './AddSetupModal.css';

/* ADDED STYLES FOR IMAGE UPLOAD */
/*
.image-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}
.input-url {
    flex: 1;
}
.btn-upload {
    padding: 0.6rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
    transition: all 0.2s;
}
.btn-upload:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-primary);
}
*/
import { filterOptions } from '../../data/sampleData';

const AddSetupModal = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        caption: initialData?.caption || '',
        mainImage: initialData?.images?.[0]?.url || initialData?.image || '', // Fallback for various formats
        filters: initialData?.filters || {
            colorTone: 'neutral',
            budget: 'mid-range',
            gender: 'neutral',
            purpose: 'productivity',
            size: 'medium'
        },
        tags: initialData?.tags?.join(', ') || ''
    });

    // Products state: { id, x, y, name, type, price, link }
    // x, y in percentages
    const [products, setProducts] = useState(
        initialData?.images?.[0]?.products || initialData?.products || []
    );

    // Tagging state
    const [activeTag, setActiveTag] = useState(null); // Tag being edited or created
    const [showTagPopup, setShowTagPopup] = useState(false);
    const imageRef = useRef(null);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('filter.')) {
            const filterName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                filters: { ...prev.filters, [filterName]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle Image Click to Add Tag
    const handleImageClick = (e) => {
        if (!formData.mainImage || activeTag) return; // Prevent if no image or already editing

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newTag = {
            id: Date.now().toString(),
            x,
            y,
            name: '',
            type: 'Monitor',
            price: '',
            link: ''
        };

        setActiveTag(newTag);
        setShowTagPopup(true);
    };

    // Handle Click on Existing Tag
    const handleTagClick = (e, product) => {
        e.stopPropagation();
        setActiveTag(product);
        setShowTagPopup(true);
    };

    // Save Tag
    const handleSaveTag = () => {
        if (!activeTag.name) return alert('Vui lòng nhập tên sản phẩm');

        setProducts(prev => {
            const exists = prev.find(p => p.id === activeTag.id);
            if (exists) {
                return prev.map(p => p.id === activeTag.id ? activeTag : p);
            }
            return [...prev, activeTag];
        });

        setActiveTag(null);
        setShowTagPopup(false);
    };

    // Delete Tag
    const handleDeleteTag = () => {
        setProducts(prev => prev.filter(p => p.id !== activeTag.id));
        setActiveTag(null);
        setShowTagPopup(false);
    };

    // Submit Main Form
    const handleSubmit = (e) => {
        e.preventDefault();

        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

        const setupData = {
            ...formData,
            tags: tagsArray,
            // Standardize structure
            image: formData.mainImage,
            products: products,
            // Also support complex images structure if needed by detailed views
            images: [
                {
                    url: formData.mainImage,
                    products: products
                }
            ],
            updatedAt: new Date().toISOString()
        };

        if (initialData) {
            onSave(initialData.id, setupData);
        } else {
            onSave(setupData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-setup-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? 'Chỉnh Sửa Setup' : 'Thêm Góc Setup Mới'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="add-setup-body">
                    <form id="setupForm" onSubmit={handleSubmit} className="setup-form-layout">
                        {/* Left Column: Info */}
                        <div className="form-column">
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ví dụ: Góc làm việc tối giản"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea
                                    name="caption"
                                    value={formData.caption}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mô tả về setup này..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Hình ảnh</label>
                                <div className="image-input-group">
                                    <input
                                        type="url"
                                        name="mainImage"
                                        value={formData.mainImage}
                                        onChange={handleChange}
                                        placeholder="Dán link ảnh (URL)..."
                                        className="input-url"
                                    />
                                    <div className="file-upload-wrapper">
                                        <label htmlFor="file-upload" className="btn-upload">
                                            📂 Tải ảnh lên
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 5000000) { // Limit 5MB
                                                        alert('Ảnh quá lớn (>5MB). Vui lòng chọn ảnh nhỏ hơn.');
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData(prev => ({ ...prev, mainImage: reader.result }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                                <small style={{ marginTop: '5px', color: '#888', display: 'block' }}>Hỗ trợ JPG, PNG. Tối đa 5MB.</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tông màu</label>
                                    <select name="filter.colorTone" value={formData.filters.colorTone} onChange={handleChange}>
                                        {filterOptions.colorTone.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ngân sách</label>
                                    <select name="filter.budget" value={formData.filters.budget} onChange={handleChange}>
                                        {filterOptions.budget.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phong cách</label>
                                    <select name="filter.gender" value={formData.filters.gender} onChange={handleChange}>
                                        {filterOptions.gender.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Mục đích</label>
                                    <select name="filter.purpose" value={formData.filters.purpose} onChange={handleChange}>
                                        {filterOptions.purpose.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="tối-giản, gaming, rgb..."
                                />
                            </div>

                            {/* Product List Summary */}
                            <div className="product-list-preview">
                                <h4>Sản phẩm đã gán ({products.length})</h4>
                                {products.length === 0 && <small>Chưa có sản phẩm. Click vào ảnh bên phải để thêm.</small>}
                                {products.map(p => (
                                    <div key={p.id} className="product-item-preview">
                                        <span>{p.name}</span>
                                        <small>{p.price}</small>
                                        <button type="button" onClick={() => {
                                            setActiveTag(p);
                                            setShowTagPopup(true);
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Image & Tagging */}
                        <div className="form-column">
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Gắn Thẻ Sản Phẩm (Click vào ảnh)</label>
                            <div
                                className="image-tagging-area"
                                onClick={handleImageClick}
                            >
                                {formData.mainImage ? (
                                    <>
                                        <img
                                            ref={imageRef}
                                            src={formData.mainImage}
                                            alt="Tagging Area"
                                            className="tagging-image"
                                        />

                                        {/* Render Existing Tags */}
                                        {products.map(p => (
                                            <div
                                                key={p.id}
                                                className={`tag-marker ${activeTag?.id === p.id ? 'active' : ''}`}
                                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                                onClick={(e) => handleTagClick(e, p)}
                                            >
                                                +
                                            </div>
                                        ))}

                                        {/* Render New Temp Tag */}
                                        {activeTag && !products.find(p => p.id === activeTag.id) && (
                                            <div
                                                className="tag-marker active"
                                                style={{ left: `${activeTag.x}%`, top: `${activeTag.y}%` }}
                                            >
                                                +
                                            </div>
                                        )}

                                        {/* Tag Popup Form */}
                                        {showTagPopup && activeTag && (
                                            <div
                                                className="tag-popup"
                                                style={{
                                                    left: `${Math.min(activeTag.x, 60)}%`, // Prevent overflowing right 
                                                    top: `${Math.min(activeTag.y + 5, 80)}%`
                                                }}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <h4>{products.find(p => p.id === activeTag.id) ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h4>
                                                <div className="form-group">
                                                    <input
                                                        autoFocus
                                                        placeholder="Tên sản phẩm"
                                                        value={activeTag.name}
                                                        onChange={e => setActiveTag({ ...activeTag, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <select
                                                        value={activeTag.type}
                                                        onChange={e => setActiveTag({ ...activeTag, type: e.target.value })}
                                                    >
                                                        <option value="Monitor">Màn hình</option>
                                                        <option value="Keyboard">Bàn phím</option>
                                                        <option value="Mouse">Chuột</option>
                                                        <option value="Audio">Loa/Tai nghe</option>
                                                        <option value="Chair">Ghế</option>
                                                        <option value="Desk">Bàn</option>
                                                        <option value="PC">PC/Laptop</option>
                                                        <option value="Light">Đèn</option>
                                                        <option value="Other">Khác</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        placeholder="Giá (VD: $100 hoặc 2tr)"
                                                        value={activeTag.price}
                                                        onChange={e => setActiveTag({ ...activeTag, price: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        placeholder="Link sản phẩm (tùy chọn)"
                                                        value={activeTag.link}
                                                        onChange={e => setActiveTag({ ...activeTag, link: e.target.value })}
                                                    />
                                                </div>
                                                <div className="popup-actions">
                                                    <button type="button" className="btn-small btn-delete" onClick={() => {
                                                        if (products.find(p => p.id === activeTag.id)) {
                                                            handleDeleteTag();
                                                        } else {
                                                            setActiveTag(null);
                                                            setShowTagPopup(false);
                                                        }
                                                    }}>Xóa/Hủy</button>
                                                    <button type="button" className="btn-small btn-submit" onClick={handleSaveTag}>
                                                        Lưu
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="placeholder-text">Nhập URL ảnh bên trái để bắt đầu gắn thẻ</div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" form="setupForm" className="btn-submit">Đăng Setup</button>
                </div>
            </div>
        </div>
    );
};

export default AddSetupModal;
