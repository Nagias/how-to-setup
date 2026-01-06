import React, { useState } from 'react';
import './AddSetupModal.css';
import { filterOptions } from '../../data/sampleData';

const AddSetupModal = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        caption: initialData?.caption || '',
        mainImage: initialData?.images?.[0]?.url || '',
        filters: initialData?.filters || {
            colorTone: 'neutral',
            budget: 'mid-range',
            gender: 'neutral',
            purpose: 'productivity',
            size: 'medium'
        },
        tags: initialData?.tags?.join(', ') || '',
        products: initialData?.images?.[0]?.products || []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('filter.')) {
            const filterName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                filters: {
                    ...prev.filters,
                    [filterName]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Process tags
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

        const setupData = {
            ...formData,
            tags: tagsArray,
            images: [
                {
                    url: formData.mainImage,
                    products: formData.products
                }
            ]
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
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>{initialData ? 'Chỉnh Sửa Setup' : 'Thêm Góc Setup Mới'}</h2>

                <form onSubmit={handleSubmit} className="setup-form">
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
                        <label>URL Ảnh chính</label>
                        <input
                            type="url"
                            name="mainImage"
                            value={formData.mainImage}
                            onChange={handleChange}
                            required
                            placeholder="https://..."
                        />
                        {formData.mainImage && (
                            <div className="image-preview">
                                <img src={formData.mainImage} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tông màu</label>
                            <select name="filter.colorTone" value={formData.filters.colorTone} onChange={handleChange}>
                                {filterOptions.colorTone.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Ngân sách</label>
                            <select name="filter.budget" value={formData.filters.budget} onChange={handleChange}>
                                {filterOptions.budget.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phong cách</label>
                            <select name="filter.gender" value={formData.filters.gender} onChange={handleChange}>
                                {filterOptions.gender.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mục đích</label>
                            <select name="filter.purpose" value={formData.filters.purpose} onChange={handleChange}>
                                {filterOptions.purpose.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Kích thước</label>
                            <select name="filter.size" value={formData.filters.size} onChange={handleChange}>
                                {filterOptions.size.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tags (phân tách bằng dấu phẩy)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="tối-giản, gaming, rgb..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-submit">Đăng Setup</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSetupModal;
