import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../utils/api';
import './AddSetupModal.css';
import { filterOptions } from '../../data/sampleData';

const AddSetupModal = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        caption: initialData?.caption || '',
        authorName: initialData?.author?.name || '',
        authorAvatar: initialData?.author?.avatar || '',
        filters: initialData?.filters || {
            colorTone: 'neutral',
            budget: 'mid-range',
            gender: 'neutral',
            purpose: 'productivity',
            size: 'medium'
        },
        tags: initialData?.tags?.join(', ') || ''
    });

    // Media State management - IMAGES ONLY
    // items: { id, type: 'image', url, file, products: [] }
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

    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(initialData?.author?.avatar || '');

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

    // Extract YouTube video ID from URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newItems = files.map(file => {
            // Only accept images now (no video upload)
            if (file.size > 10 * 1024 * 1024) {
                alert(`Ảnh ${file.name} quá lớn (>10MB).`);
                return null;
            }

            return {
                id: Date.now() + Math.random().toString(),
                type: 'image',
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

    // Avatar upload handler
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Avatar quá lớn (>5MB).');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
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
    const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
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
                    const MAX_WIDTH = maxWidth;
                    const MAX_HEIGHT = maxWidth;
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

                    // Compress to JPEG with custom quality
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🟡 Form submission started');
        setUploading(true);

        try {
            // Validate media
            if (mediaList.length === 0) {
                alert('Vui lòng thêm ít nhất một ảnh hoặc video!');
                setUploading(false);
                return;
            }

            console.log('🟡 Processing media uploads...');

            // Upload avatar first if exists
            let avatarUrl = avatarPreview; // Use existing preview if no new file
            if (avatarFile) {
                try {
                    console.log('🟡 Uploading avatar...');
                    // Compress avatar (limit 500px)
                    const avatarBase64 = await compressImage(avatarFile, 500);
                    // Convert to blob for upload
                    const avatarBlob = await (await fetch(avatarBase64)).blob();
                    const compressedAvatar = new File([avatarBlob], "avatar.jpg", { type: "image/jpeg" });

                    avatarUrl = await api.uploadFile(compressedAvatar);
                    console.log('✅ Avatar uploaded:', avatarUrl);
                } catch (err) {
                    console.error('❌ Avatar upload failed:', err);
                    // Fallback to base64
                    try {
                        avatarUrl = await compressImage(avatarFile, 300);
                    } catch (compErr) {
                        console.error('Avatar compression failed:', compErr);
                        avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.authorName || 'User');
                    }
                }
            }

            // Upload files first
            const processedMedia = await Promise.all(mediaList.map(async (item) => {
                if (item.file) {
                    try {
                        // Image upload only
                        console.log(`🟡 Compressing image: ${item.file.name}`);
                        const compressedBase64 = await compressImage(item.file, 1920);
                        const blob = await (await fetch(compressedBase64)).blob();
                        const compressedFile = new File([blob], item.file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });

                        console.log(`🟡 Starting upload (Compressed): ${compressedFile.size / 1024} KB`);

                        // Try upload with 15s timeout fallback
                        let downloadUrl;
                        try {
                            const uploadPromise = api.uploadFile(compressedFile);
                            const timeoutPromise = new Promise((resolve) =>
                                setTimeout(() => resolve('TIMEOUT'), 15000)
                            );

                            const result = await Promise.race([uploadPromise, timeoutPromise]);

                            if (result === 'TIMEOUT') {
                                console.warn("Upload timed out (15s), switching to fallback");
                                throw new Error("Timeout");
                            }

                            downloadUrl = result;
                            console.log(`✅ Image uploaded: ${downloadUrl}`);
                            return { ...item, url: downloadUrl, file: null };
                        } catch (uploadErr) {
                            console.warn("Upload failed/timed out, switching to fallback:", uploadErr);
                        }

                        // If we reached here, upload failed. Use Fallback.
                        // Silent Fallback: No Alert, just save as Base64.
                        console.log('⚠️ Using Silent Base64 fallback');
                        // Reduce to 600px, 0.5 quality to ensure multiple images (e.g. 7) fit in 1MB Firestore limit
                        // 600px ~ 40-50KB per image -> 10 images = 500KB (Safe)
                        const fallbackBase64 = await compressImage(item.file, 600, 0.5);
                        return { ...item, url: fallbackBase64, file: null };

                    } catch (err) {
                        console.error('❌ Serious logic error', err);
                        // Last resort: Return empty or placeholder to prevent crash
                        return { ...item, url: "https://via.placeholder.com/800?text=Error", file: null };
                    }
                }

                // Existing items
                return item;
            }));

            console.log('🟡 Media processing complete:', processedMedia);

            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            // Convert media array to images array for backward compatibility
            const imagesArray = processedMedia
                .filter(item => item.type === 'image')
                .map(item => ({
                    url: item.url,
                    products: item.products || []
                }));

            const setupData = {
                title: formData.title,
                caption: formData.caption,
                filters: formData.filters,
                tags: tagsArray,
                // Author information
                author: {
                    name: formData.authorName || 'Anonymous',
                    avatar: avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.authorName || 'User')
                },
                // Media
                images: imagesArray,
                media: processedMedia,
                mainImage: processedMedia[0]?.url || '',
                image: processedMedia[0]?.url || '',    // Legacy
                products: imagesArray[0]?.products || [], // Legacy - from first image
                updatedAt: new Date().toISOString()
            };

            console.log('🟡 Final setupData to save:', setupData);
            console.log('🟡 Calling onSave...');

            if (initialData?.id) {
                await onSave(initialData.id, setupData);
            } else {
                await onSave(setupData);
            }

            console.log('✅ onSave completed successfully');
        } catch (err) {
            console.error('❌ Form submission error:', err);
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
                                            {item.type === 'video' && item.platform === 'youtube' ? (
                                                <>
                                                    <img src={item.thumb || item.thumbnail} alt="yt-thumb" style={{ opacity: 0.8 }} />
                                                    <div className="video-icon" style={{ fontSize: '12px' }}>🔴</div>
                                                </>
                                            ) : item.type === 'video' ? (
                                                <div className="video-icon">▶️</div>
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

                                <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
                                    Hỗ trợ nhiều ảnh (Max 10MB/ảnh).
                                </small>
                            </div>

                            {/* Author Information */}
                            <div className="form-group">
                                <label>Tên người đăng</label>
                                <input
                                    type="text"
                                    name="authorName"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    placeholder="Nhập tên người đăng..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Avatar người đăng</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {avatarPreview && (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid var(--color-border)'
                                            }}
                                        />
                                    )}
                                    <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            style={{ display: 'none' }}
                                        />
                                        {avatarPreview ? 'Đổi Avatar' : 'Tải Avatar'}
                                    </label>
                                </div>
                                <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
                                    Ảnh đại diện của người đăng (Max 5MB)
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
