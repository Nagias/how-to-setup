import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../utils/api';
import './AddSetupModal.css';
import { filterOptions } from '../../data/sampleData';

const AddSetupModal = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        caption: initialData?.caption || '',
        filters: initialData?.filters || {
            colorTone: 'neutral',
            budget: 'mid-range',
            gender: 'neutral',
            purpose: 'productivity',
            size: 'medium'
        },
        tags: initialData?.tags?.join(', ') || ''
    });

    // Media State management
    // items: { id, type: 'image'|'video', url, file, products: [] }
    const [mediaList, setMediaList] = useState(() => {
        if (initialData?.media && initialData.media.length > 0) {
            return initialData.media;
        }
        // Fallback for legacy data (single image)
        if (initialData?.image) {
            return [{
                id: Date.now().toString(),
                type: 'image',
                url: initialData.image,
                products: initialData.products || []
            }];
        }
        return [];
    });

    const [activeMediaId, setActiveMediaId] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Set first media as active on load
    useEffect(() => {
        if (mediaList.length > 0 && !activeMediaId) {
            setActiveMediaId(mediaList[0].id);
        }
    }, [mediaList, activeMediaId]);

    const activeMedia = mediaList.find(m => m.id === activeMediaId);

    // Tagging state
    const [activeTag, setActiveTag] = useState(null); // Tag being edited
    const [showTagPopup, setShowTagPopup] = useState(false);
    const imageRef = useRef(null);

    // Helper to update specific media item
    const updateMediaItem = (id, updates) => {
        setMediaList(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

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

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newItems = files.map(file => {
            const isVideo = file.type.startsWith('video/');
            // Size check: Video < 500MB, Image < 10MB
            if (isVideo && file.size > 500 * 1024 * 1024) {
                alert(`Video ${file.name} quá lớn (>500MB).`);
                return null;
            }
            if (!isVideo && file.size > 10 * 1024 * 1024) {
                alert(`Ảnh ${file.name} quá lớn (>10MB).`);
                return null;
            }

            return {
                id: Date.now() + Math.random().toString(),
                type: isVideo ? 'video' : 'image',
                url: URL.createObjectURL(file), // Preview URL
                file: file,
                products: []
            };
        }).filter(Boolean);

        setMediaList(prev => [...prev, ...newItems]);
        if (!activeMediaId && newItems.length > 0) {
            setActiveMediaId(newItems[0].id);
        }
    };

    const handleRemoveMedia = (id, e) => {
        e.stopPropagation();
        const newList = mediaList.filter(m => m.id !== id);
        setMediaList(newList);
        if (activeMediaId === id) {
            setActiveMediaId(newList[0]?.id || null);
        }
    };

    // --- Tagging Logic (Only for Images) ---

    const handleImageClick = (e) => {
        if (!activeMedia || activeMedia.type !== 'image') return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newTag = {
            id: Date.now().toString(),
            x, y,
            name: '', price: '', link: ''
        };

        setActiveTag(newTag);
        setShowTagPopup(true);
    };

    const handleTagClick = (e, product) => {
        e.stopPropagation();
        setActiveTag(product);
        setShowTagPopup(true);
    };

    const handleSaveTag = () => {
        if (!activeTag.name) return alert('Vui lòng nhập tên sản phẩm');

        const currentProducts = activeMedia.products || [];
        const exists = currentProducts.find(p => p.id === activeTag.id);

        let newProducts;
        if (exists) {
            newProducts = currentProducts.map(p => p.id === activeTag.id ? activeTag : p);
        } else {
            newProducts = [...currentProducts, activeTag];
        }

        updateMediaItem(activeMediaId, { products: newProducts });
        setActiveTag(null);
        setShowTagPopup(false);
    };

    const handleDeleteTag = () => {
        const currentProducts = activeMedia.products || [];
        const newProducts = currentProducts.filter(p => p.id !== activeTag.id);
        updateMediaItem(activeMediaId, { products: newProducts });
        setActiveTag(null);
        setShowTagPopup(false);
    };

    // --- Submit ---

    // Helper: Compress Image for Base64 Fallback (Firestore limit < 1MB)
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimensions
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.6
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Upload files first
            // Upload files
            const processedMedia = await Promise.all(mediaList.map(async (item) => {
                if (item.file) {
                    try {
                        if (item.type === 'video') {
                            // Video Logic (Keep existing)
                            console.log(`Starting video upload: ${item.file.name}`);
                            const videoTimeout = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Video upload timed out (5 mins)')), 300000)
                            );
                            const downloadUrl = await Promise.race([
                                api.uploadVideo(item.file, (percent) => console.log(`Video ${item.id}: ${Math.round(percent)}%`)),
                                videoTimeout
                            ]);
                            return { ...item, url: downloadUrl, file: null };
                        } else {
                            // Image Logic
                            const imageTimeout = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Image upload timed out (60s)')), 60000)
                            );
                            const downloadUrl = await Promise.race([
                                api.uploadFile(item.file),
                                imageTimeout
                            ]);
                            return { ...item, url: downloadUrl, file: null };
                        }
                    } catch (err) {
                        console.error('Failed to upload', item.file.name, err);

                        // Base64 Fallback with Compression (Only for Images)
                        if (item.type === 'image') {
                            console.log('Compressing & using Base64 for image:', item.file.name);
                            try {
                                const compressedBase64 = await compressImage(item.file);
                                return {
                                    ...item,
                                    url: compressedBase64,
                                    file: null
                                };
                            } catch (compErr) {
                                console.error('Compression failed:', compErr);
                            }
                        }

                        // For Videos, we must throw because Base64 is too big
                        throw new Error(`Lỗi tải lên video ${item.file.name} (hoặc file quá lớn). Hãy dùng link YouTube!`);
                    }
                }

                // Existing items
                return item;
            }));

            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            const setupData = {
                ...formData,
                tags: tagsArray,
                media: processedMedia, // Save full media array
                mainImage: processedMedia[0]?.url || '', // Key for SetupCard display
                // Legacy fields for backward compatibility
                image: processedMedia[0]?.url || '',
                products: processedMedia[0]?.products || [],
                updatedAt: new Date().toISOString()
            };

            if (initialData?.id) {
                await onSave(initialData.id, setupData);
            } else {
                await onSave(setupData);
            }
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu setup.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-setup-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? 'Chỉnh Sửa Setup' : 'Thêm Góc Setup Mới'}</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {uploading && <span style={{ color: 'var(--accent-color)' }}>⏳ Đang tải lên... Vui lòng chờ</span>}
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                </div>

                <div className="add-setup-body">
                    <form id="setupForm" onSubmit={handleSubmit} className="setup-form-layout">
                        {/* Left Column: Info */}
                        <div className="form-column">
                            {/* Standard Fields (Title, Caption) */}
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input
                                    type="text" name="title"
                                    value={formData.title} onChange={handleChange} required
                                    placeholder="Ví dụ: Góc làm việc tối giản"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea
                                    name="caption"
                                    value={formData.caption} onChange={handleChange} required
                                    placeholder="Mô tả về setup này..."
                                />
                            </div>

                            {/* Media List & Upload */}
                            <div className="form-group">
                                <label>Media (Ảnh/Video)</label>
                                <div className="media-gallery-preview">
                                    {mediaList.map(item => (
                                        <div
                                            key={item.id}
                                            className={`media-thumb ${activeMediaId === item.id ? 'active' : ''}`}
                                            onClick={() => setActiveMediaId(item.id)}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="video-icon">▶️</div>
                                            ) : item.type === 'youtube' ? (
                                                <>
                                                    <img src={item.thumb} alt="yt-thumb" style={{ opacity: 0.8 }} />
                                                    <div className="video-icon" style={{ fontSize: '12px' }}>🔴</div>
                                                </>
                                            ) : (
                                                <img src={item.url} alt="thumb" />
                                            )}
                                            <button type="button" className="btn-remove-media" onClick={(e) => handleRemoveMedia(item.id, e)}>×</button>
                                        </div>
                                    ))}

                                    <label className="add-media-btn">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <span>+ Thêm</span>
                                    </label>
                                </div>

                                {/* YouTube Input */}
                                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                    <input
                                        type="text"
                                        placeholder="Dán link YouTube (đỡ tốn dung lượng)..."
                                        className="youtube-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const url = e.target.value;
                                                const getYouTubeId = (url) => {
                                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                    const match = url.match(regExp);
                                                    return (match && match[2].length === 11) ? match[2] : null;
                                                };
                                                const vidId = getYouTubeId(url);
                                                if (vidId) {
                                                    const newItem = {
                                                        id: Date.now().toString(),
                                                        type: 'youtube', // distinct type
                                                        url: `https://www.youtube.com/embed/${vidId}`,
                                                        thumb: `https://img.youtube.com/vi/${vidId}/0.jpg`,
                                                        file: null,
                                                        products: []
                                                    };
                                                    setMediaList(prev => [...prev, newItem]);
                                                    if (!activeMediaId) setActiveMediaId(newItem.id);
                                                    e.target.value = '';
                                                } else {
                                                    alert('Link YouTube không hợp lệ!');
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
                                    Hỗ trợ nhiều ảnh & video (Max 400MB/Video).
                                </small>
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
                            {/* More filters... */}
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
                                <label>Tags (ngăn cách bởi dấu phẩy)</label>
                                <input
                                    type="text" name="tags"
                                    value={formData.tags} onChange={handleChange}
                                    placeholder="gaming, minimal, rgb..."
                                />
                            </div>
                        </div>

                        {/* Right Column: Preview & Tagging */}
                        <div className="form-column">
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>
                                {activeMedia ? (activeMedia.type === 'video' || activeMedia.type === 'youtube' ? 'Xem Video (Không hỗ trợ gắn thẻ)' : 'Gắn Thẻ Sản Phẩm (Click vào ảnh)') : 'Xem trước'}
                            </label>

                            <div className="image-tagging-area">
                                {activeMedia ? (
                                    activeMedia.type === 'video' ? (
                                        <video
                                            src={activeMedia.url}
                                            controls
                                            className="tagging-image"
                                            style={{ maxHeight: '100%' }}
                                        />
                                    ) : activeMedia.type === 'youtube' ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={activeMedia.url}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ aspectRatio: '16/9', borderRadius: '8px' }}
                                        ></iframe>
                                    ) : (
                                        <div
                                            className="image-wrapper"
                                            ref={imageRef}
                                            onClick={handleImageClick}
                                        >
                                            <img
                                                src={activeMedia.url}
                                                alt="Tagging Area"
                                                className="tagging-image"
                                            />

                                            {/* Render Tags */}
                                            {activeMedia.products.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={`tag-marker ${activeTag?.id === p.id ? 'active' : ''}`}
                                                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                                    onClick={(e) => handleTagClick(e, p)}
                                                >
                                                    +
                                                </div>
                                            ))}

                                            {/* New Temp Tag */}
                                            {activeTag && !activeMedia.products.find(p => p.id === activeTag.id) && (
                                                <div
                                                    className="tag-marker active"
                                                    style={{ left: `${activeTag.x}%`, top: `${activeTag.y}%` }}
                                                > + </div>
                                            )}

                                            {/* Tag Popup */}
                                            {showTagPopup && activeTag && (
                                                <div
                                                    className="tag-popup"
                                                    style={{
                                                        left: `${Math.min(activeTag.x, 60)}%`,
                                                        top: `${Math.min(activeTag.y + 5, 80)}%`
                                                    }}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <h4>{activeMedia.products.find(p => p.id === activeTag.id) ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h4>
                                                    <div className="form-group">
                                                        <input autoFocus placeholder="Tên sản phẩm" value={activeTag.name} onChange={e => setActiveTag({ ...activeTag, name: e.target.value })} />
                                                    </div>
                                                    <div className="form-group">
                                                        <input placeholder="Giá" value={activeTag.price} onChange={e => setActiveTag({ ...activeTag, price: e.target.value })} />
                                                    </div>
                                                    <div className="form-group">
                                                        <input placeholder="Link (tùy chọn)" value={activeTag.link} onChange={e => setActiveTag({ ...activeTag, link: e.target.value })} />
                                                    </div>
                                                    <div className="popup-actions">
                                                        <button type="button" className="btn-small btn-delete" onClick={() => {
                                                            if (activeMedia.products.find(p => p.id === activeTag.id)) handleDeleteTag();
                                                            else { setActiveTag(null); setShowTagPopup(false); }
                                                        }}>Xóa</button>
                                                        <button type="button" className="btn-small btn-submit" onClick={handleSaveTag}>Lưu</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="placeholder-text">Chọn hoặc tải lên media để bắt đầu custom</div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" form="setupForm" className="btn-submit" disabled={uploading}>
                        {uploading ? 'Đang Upload...' : 'Đăng Setup'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSetupModal;
