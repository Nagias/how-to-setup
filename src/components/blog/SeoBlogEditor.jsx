import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../utils/api';
import { vietnameseToSlug } from '../../utils/slugify';
import { defaultSeoBlogPost, searchIntentConfig } from '../../types/blogTypes';
import TipTapEditor from './editor/TipTapEditor';
import SeoPanel from './seo/SeoPanel';
import { KeywordAnalyzer, ReadabilityChecker, PublishChecklist } from './seo/SeoAnalyzers';
import OutlineBuilder from './seo/OutlineBuilder';
import ContentOptimizer from './seo/ContentOptimizer';
import { uploadToCloudinary } from '../../config/cloudinary';
import './SeoBlogEditor.css';

const SeoBlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addBlog, updateBlog, blogs, currentUser } = useApp();

    const isEditMode = !!id;

    // Initialize state with default values
    const [blogData, setBlogData] = useState({
        ...defaultSeoBlogPost,
        author: currentUser ? {
            id: currentUser.id,
            name: currentUser.displayName || 'Anonymous',
            bio: '',
            expertise: '',
            avatar: currentUser.photoURL || ''
        } : null
    });

    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [contentJson, setContentJson] = useState(null);
    const [images, setImages] = useState([]);

    // Ref to control SeoPanel from PublishChecklist
    const seoPanelRef = useRef(null);

    // Load blog data if editing
    useEffect(() => {
        if (isEditMode && blogs.length > 0) {
            const blogToEdit = blogs.find(b => b.id === id);
            if (blogToEdit) {
                // Merge existing data with defaults for new fields
                setBlogData({
                    ...defaultSeoBlogPost,
                    ...blogToEdit,
                    seo: { ...defaultSeoBlogPost.seo, ...blogToEdit.seo },
                    keywords: { ...defaultSeoBlogPost.keywords, ...blogToEdit.keywords },
                    schema: { ...defaultSeoBlogPost.schema, ...blogToEdit.schema }
                });
                if (blogToEdit.content && typeof blogToEdit.content === 'object') {
                    setContentJson(blogToEdit.content);
                }
            } else {
                alert('Không tìm thấy bài viết!');
                navigate('/blog');
            }
        }
    }, [isEditMode, id, blogs, navigate]);

    // Update author when user changes
    useEffect(() => {
        if (currentUser && !blogData.author) {
            setBlogData(prev => ({
                ...prev,
                author: {
                    id: currentUser.id,
                    name: currentUser.displayName || 'Anonymous',
                    bio: '',
                    expertise: '',
                    avatar: currentUser.photoURL || ''
                }
            }));
        }
    }, [currentUser, blogData.author]);

    // Handle title change with auto-slug
    const handleTitleChange = useCallback((value) => {
        setBlogData(prev => {
            const newSlug = prev.slug === vietnameseToSlug(prev.title) || !prev.slug
                ? vietnameseToSlug(value)
                : prev.slug;
            return { ...prev, title: value, slug: newSlug };
        });
    }, []);

    // Handle content update from TipTap
    const handleContentUpdate = useCallback(({ json, html }) => {
        setContentJson(json);
        setBlogData(prev => ({
            ...prev,
            content: json,
            contentHtml: html
        }));

        // Extract images from JSON for SEO tracking
        const extractedImages = extractImagesFromJson(json);
        setImages(extractedImages);
    }, []);

    // Handle image addition
    const handleImageAdd = useCallback((imageData) => {
        setImages(prev => [...prev, imageData]);
    }, []);

    // Update SEO data
    const handleSeoChange = useCallback((newSeo) => {
        setBlogData(prev => ({ ...prev, seo: newSeo }));
    }, []);

    // Update keywords
    const handleKeywordsChange = useCallback((newKeywords) => {
        setBlogData(prev => ({ ...prev, keywords: newKeywords }));
    }, []);

    // Update search intent
    const handleIntentChange = useCallback((intent) => {
        setBlogData(prev => ({ ...prev, searchIntent: intent }));
    }, []);

    // Handle navigation from PublishChecklist to SEO fields
    const handleChecklistNavigate = useCallback((tab, field) => {
        if (seoPanelRef.current) {
            seoPanelRef.current.switchToTab(tab);
            seoPanelRef.current.focusField(field);
        }
    }, []);

    // Calculate if can publish
    const canPublish = useMemo(() => {
        const { seo, keywords, title, slug } = blogData;
        const h2Count = countHeadings(contentJson, 2);

        return (
            seo.seoTitle && seo.seoTitle.length >= 30 &&
            seo.metaDescription && seo.metaDescription.length >= 120 &&
            keywords.primaryKeyword && keywords.primaryKeyword.trim() !== '' &&
            h2Count >= 1 &&
            slug && slug.trim() !== '' &&
            title && title.trim() !== ''
            // Note: Image alt text is recommended but not required for publishing
        );
    }, [blogData, contentJson]);

    // Handle cover image upload - Using Cloudinary
    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            return;
        }

        // Validate file size (max 10MB for Cloudinary)
        if (file.size > 10 * 1024 * 1024) {
            alert('File ảnh quá lớn (tối đa 10MB)');
            return;
        }

        setUploadingCover(true);
        try {
            const result = await uploadToCloudinary(file, 'blog-covers');
            setBlogData(prev => ({
                ...prev,
                coverImage: result.url,
                seo: { ...prev.seo, ogImage: result.url }
            }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Tải ảnh thất bại: ${error.message}`);
        } finally {
            setUploadingCover(false);
            // Reset input value to allow re-selecting same file
            e.target.value = null;
        }
    };

    // Handle form submission
    const handleSubmit = async (status = 'draft') => {
        if (status === 'published' && !canPublish) {
            alert('Vui lòng hoàn thành tất cả yêu cầu SEO trước khi đăng!');
            return;
        }

        setSaving(true);

        const dataToSave = {
            ...blogData,
            status,
            // Generate canonical URL
            canonicalUrl: `https://deskhub.vn/blog/${blogData.slug}`,
            // Legacy fields for compatibility
            excerpt: blogData.excerpt || blogData.seo.metaDescription,
            coverImage: blogData.coverImage || blogData.seo.ogImage,
            readTime: calculateReadTime(blogData.contentHtml)
        };

        try {
            if (isEditMode) {
                const res = await updateBlog(id, dataToSave);
                if (res.success) {
                    alert(status === 'published' ? 'Đã đăng bài thành công!' : 'Đã lưu nháp!');
                    navigate(`/blog/${id}`);
                } else {
                    alert(`Lỗi: ${res.message}`);
                }
            } else {
                const res = await addBlog(dataToSave);
                if (res.success) {
                    alert(status === 'published' ? 'Đã đăng bài thành công!' : 'Đã lưu nháp!');
                    navigate('/blog');
                } else {
                    alert(`Lỗi: ${res.message}`);
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Có lỗi xảy ra khi lưu bài viết!');
        } finally {
            setSaving(false);
        }
    };

    const intentConfig = searchIntentConfig[blogData.searchIntent];

    return (
        <div className="seo-blog-editor">
            {/* Header */}
            <div className="editor-header">
                <div className="header-left">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate('/blog')}
                    >
                        ← Quay lại
                    </button>
                    <h1>{isEditMode ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}</h1>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleSubmit('draft')}
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Nháp'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleSubmit('published')}
                        disabled={saving || !canPublish}
                        title={!canPublish ? 'Hoàn thành các yêu cầu SEO để đăng bài' : ''}
                    >
                        {saving ? 'Đang đăng...' : 'Đăng Bài'}
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="editor-layout">
                {/* Left Column - Content */}
                <div className="editor-main">
                    {/* Title */}
                    <div className="title-section">
                        <input
                            type="text"
                            value={blogData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Tiêu đề bài viết (H1)"
                            className="title-input"
                            maxLength={100}
                        />
                        <div className="title-meta">
                            <span>{blogData.title.length}/100 ký tự</span>
                            <span>•</span>
                            <span>Slug: /{blogData.slug || 'auto-generated'}</span>
                        </div>
                    </div>

                    {/* Slug Editor */}
                    <div className="slug-section">
                        <label>URL Slug:</label>
                        <div className="slug-input-wrapper">
                            <span className="slug-prefix">deskhub.vn/blog/</span>
                            <input
                                type="text"
                                value={blogData.slug}
                                onChange={(e) => setBlogData(prev => ({ ...prev, slug: vietnameseToSlug(e.target.value) }))}
                                placeholder="url-bai-viet"
                                className="slug-input"
                            />
                        </div>

                        {/* 301 Redirects */}
                        {isEditMode && (
                            <details className="redirects-details">
                                <summary>🔄 Quản lý Redirect 301 ({(blogData.redirectsFrom || []).length})</summary>
                                <div className="redirects-content">
                                    <p className="redirects-hint">
                                        Thêm URL cũ để tự động redirect về bài viết này
                                    </p>
                                    {(blogData.redirectsFrom || []).map((oldSlug, idx) => (
                                        <div key={idx} className="redirect-item">
                                            <span className="old-url">/blog/{oldSlug}</span>
                                            <span className="redirect-arrow">→</span>
                                            <span className="new-url">/blog/{blogData.slug}</span>
                                            <button
                                                type="button"
                                                className="remove-redirect"
                                                onClick={() => setBlogData(prev => ({
                                                    ...prev,
                                                    redirectsFrom: prev.redirectsFrom.filter((_, i) => i !== idx)
                                                }))}
                                            >✕</button>
                                        </div>
                                    ))}
                                    <div className="add-redirect">
                                        <input
                                            type="text"
                                            id="new-redirect-slug"
                                            placeholder="old-url-slug"
                                            className="redirect-input"
                                        />
                                        <button
                                            type="button"
                                            className="add-redirect-btn"
                                            onClick={() => {
                                                const input = document.getElementById('new-redirect-slug');
                                                if (input.value.trim()) {
                                                    setBlogData(prev => ({
                                                        ...prev,
                                                        redirectsFrom: [...(prev.redirectsFrom || []), vietnameseToSlug(input.value.trim())]
                                                    }));
                                                    input.value = '';
                                                }
                                            }}
                                        >+ Thêm</button>
                                    </div>
                                </div>
                            </details>
                        )}
                    </div>

                    {/* ========== ESSENTIAL SEO FIELDS - ALWAYS VISIBLE ========== */}
                    <div className="essential-seo-section">
                        <div className="essential-seo-header">
                            <span className="essential-seo-icon">🎯</span>
                            <h3>Thông tin SEO bắt buộc</h3>
                        </div>

                        {/* SEO Title */}
                        <div className="essential-seo-field">
                            <label htmlFor="main-seo-title">
                                SEO Title <span className="required-star">*</span>
                                <span className={`field-counter ${(blogData.seo?.seoTitle?.length || 0) === 0 ? 'empty' :
                                    (blogData.seo?.seoTitle?.length || 0) < 30 ? 'warning' :
                                        (blogData.seo?.seoTitle?.length || 0) > 60 ? 'warning' : 'good'
                                    }`}>
                                    {blogData.seo?.seoTitle?.length || 0}/60
                                </span>
                            </label>
                            <input
                                id="main-seo-title"
                                type="text"
                                value={blogData.seo?.seoTitle || ''}
                                onChange={(e) => handleSeoChange({ ...blogData.seo, seoTitle: e.target.value })}
                                placeholder="Tiêu đề hiển thị trên Google (30-60 ký tự)"
                                className="essential-seo-input"
                                maxLength={70}
                            />
                            {(blogData.seo?.seoTitle?.length || 0) > 0 && (blogData.seo?.seoTitle?.length || 0) < 30 && (
                                <span className="field-hint warning">⚠️ Cần tối thiểu 30 ký tự</span>
                            )}
                            {/* NEW: Keyword in Title warning */}
                            {blogData.keywords?.primaryKeyword && blogData.seo?.seoTitle &&
                                !blogData.seo.seoTitle.toLowerCase().includes(blogData.keywords.primaryKeyword.toLowerCase()) && (
                                    <span className="field-hint warning">⚠️ Keyword "{blogData.keywords.primaryKeyword}" chưa có trong Title</span>
                                )}
                            {blogData.keywords?.primaryKeyword && blogData.seo?.seoTitle &&
                                blogData.seo.seoTitle.toLowerCase().includes(blogData.keywords.primaryKeyword.toLowerCase()) && (
                                    <span className="field-hint success">✅ Keyword có trong Title</span>
                                )}
                        </div>

                        {/* Meta Description */}
                        <div className="essential-seo-field">
                            <label htmlFor="main-meta-desc">
                                Meta Description <span className="required-star">*</span>
                                <span className={`field-counter ${(blogData.seo?.metaDescription?.length || 0) === 0 ? 'empty' :
                                    (blogData.seo?.metaDescription?.length || 0) < 120 ? 'warning' :
                                        (blogData.seo?.metaDescription?.length || 0) > 155 ? 'warning' : 'good'
                                    }`}>
                                    {blogData.seo?.metaDescription?.length || 0}/155
                                </span>
                            </label>
                            <textarea
                                id="main-meta-desc"
                                value={blogData.seo?.metaDescription || ''}
                                onChange={(e) => handleSeoChange({ ...blogData.seo, metaDescription: e.target.value })}
                                placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm (120-155 ký tự)"
                                className="essential-seo-input"
                                rows={3}
                                maxLength={160}
                            />
                            {(blogData.seo?.metaDescription?.length || 0) > 0 && (blogData.seo?.metaDescription?.length || 0) < 120 && (
                                <span className="field-hint warning">⚠️ Cần tối thiểu 120 ký tự</span>
                            )}
                            {/* NEW: Keyword in Description warning */}
                            {blogData.keywords?.primaryKeyword && blogData.seo?.metaDescription &&
                                !blogData.seo.metaDescription.toLowerCase().includes(blogData.keywords.primaryKeyword.toLowerCase()) && (
                                    <span className="field-hint warning">⚠️ Keyword "{blogData.keywords.primaryKeyword}" chưa có trong Description</span>
                                )}
                            {blogData.keywords?.primaryKeyword && blogData.seo?.metaDescription &&
                                blogData.seo.metaDescription.toLowerCase().includes(blogData.keywords.primaryKeyword.toLowerCase()) && (
                                    <span className="field-hint success">✅ Keyword có trong Description</span>
                                )}
                        </div>

                        {/* Primary Keyword */}
                        <div className="essential-seo-field">
                            <label htmlFor="main-primary-keyword">
                                Primary Keyword <span className="required-star">*</span>
                            </label>
                            <input
                                id="main-primary-keyword"
                                type="text"
                                value={blogData.keywords?.primaryKeyword || ''}
                                onChange={(e) => handleKeywordsChange({ ...blogData.keywords, primaryKeyword: e.target.value })}
                                placeholder="Từ khóa chính bạn muốn xếp hạng trên Google"
                                className="essential-seo-input"
                            />
                            {!blogData.keywords?.primaryKeyword && (
                                <span className="field-hint error">❌ Bắt buộc nhập Primary Keyword</span>
                            )}
                        </div>

                        {/* NEW: URL/Slug SEO Warnings */}
                        {blogData.slug && (
                            <div className="seo-warnings-box">
                                <div className="warnings-header">📋 Kiểm tra URL</div>
                                <div className="warnings-list">
                                    {/* URL length check */}
                                    {blogData.slug.length > 60 ? (
                                        <div className="warning-item error">❌ URL quá dài ({blogData.slug.length} ký tự). Nên dưới 60.</div>
                                    ) : blogData.slug.length > 50 ? (
                                        <div className="warning-item warning">⚠️ URL hơi dài ({blogData.slug.length} ký tự). Nên 30-50.</div>
                                    ) : (
                                        <div className="warning-item success">✅ Độ dài URL tốt ({blogData.slug.length} ký tự)</div>
                                    )}

                                    {/* Keyword in URL check */}
                                    {blogData.keywords?.primaryKeyword && (
                                        blogData.slug.toLowerCase().includes(
                                            blogData.keywords.primaryKeyword.toLowerCase().replace(/\s+/g, '-')
                                        ) || blogData.slug.toLowerCase().includes(
                                            blogData.keywords.primaryKeyword.toLowerCase().replace(/\s+/g, '')
                                        ) ? (
                                            <div className="warning-item success">✅ URL chứa keyword</div>
                                        ) : (
                                            <div className="warning-item warning">⚠️ URL nên chứa keyword "{blogData.keywords.primaryKeyword}"</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* ========== END ESSENTIAL SEO FIELDS ========== */}

                    {/* Intent Suggestion */}
                    {intentConfig && (
                        <div className="intent-suggestion">
                            <span className="intent-badge">{intentConfig.label}</span>
                            <span className="intent-hint">
                                Cấu trúc đề xuất: {intentConfig.suggestedStructure.join(' → ')}
                            </span>
                        </div>
                    )}

                    {/* Outline Builder */}
                    <OutlineBuilder
                        searchIntent={blogData.searchIntent}
                        primaryKeyword={blogData.keywords?.primaryKeyword}
                        onOutlineChange={(outline) => setBlogData(prev => ({ ...prev, outline }))}
                        existingOutline={blogData.outline || []}
                    />

                    {/* Rich Text Editor */}
                    <div className="content-section">
                        <TipTapEditor
                            content={contentJson}
                            onUpdate={handleContentUpdate}
                            onImageAdd={handleImageAdd}
                            placeholder="Bắt đầu viết nội dung bài viết..."
                            primaryKeyword={blogData.keywords?.primaryKeyword}
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="cover-section">
                        <label>Ảnh Bìa / OG Image:</label>

                        {!blogData.coverImage ? (
                            <div className="cover-upload-box" onClick={() => document.getElementById('cover-upload').click()}>
                                <input
                                    id="cover-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploadingCover}
                                />
                                <div className="upload-label">
                                    {uploadingCover ? (
                                        <>
                                            <span className="upload-icon">⏳</span>
                                            <span>Đang tải ảnh lên...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="upload-icon">📤</span>
                                            <span>Nhấn để tải ảnh lên</span>
                                            <small>(Max 5MB)</small>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="cover-preview-container">
                                <img src={blogData.coverImage} className="cover-preview-img" alt="Cover" />
                                <button
                                    className="remove-cover-btn"
                                    onClick={() => setBlogData(prev => ({ ...prev, coverImage: '', seo: { ...prev.seo, ogImage: '' } }))}
                                >
                                    ✕ Gỡ ảnh
                                </button>
                            </div>
                        )}

                        <details className="url-fallback">
                            <summary>Hoặc nhập URL ảnh thủ công</summary>
                            <input
                                type="url"
                                value={blogData.coverImage}
                                onChange={(e) => setBlogData(prev => ({
                                    ...prev,
                                    coverImage: e.target.value,
                                    seo: { ...prev.seo, ogImage: e.target.value }
                                }))}
                                placeholder="https://example.com/cover.jpg"
                                className="cover-input"
                                style={{ marginTop: '8px' }}
                            />
                        </details>
                    </div>

                    {/* Excerpt */}
                    <div className="excerpt-section">
                        <label>Mô tả ngắn (Excerpt):</label>
                        <textarea
                            value={blogData.excerpt}
                            onChange={(e) => setBlogData(prev => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Mô tả ngắn về bài viết..."
                            className="excerpt-input"
                            rows={3}
                            maxLength={300}
                        />
                    </div>

                    {/* Category & Tags */}
                    <div className="meta-section">
                        <div className="meta-field">
                            <label>Danh mục:</label>
                            <select
                                value={blogData.category}
                                onChange={(e) => setBlogData(prev => ({ ...prev, category: e.target.value }))}
                                className="meta-select"
                            >
                                <option value="Hướng Dẫn">Hướng Dẫn</option>
                                <option value="Thiết Kế">Thiết Kế</option>
                                <option value="Đánh Giá">Đánh Giá</option>
                                <option value="Xu Hướng">Xu Hướng</option>
                                <option value="Mẹo">Mẹo</option>
                            </select>
                        </div>
                        <div className="meta-field">
                            <label>Tags (phân cách bằng dấu phẩy):</label>
                            <input
                                type="text"
                                value={blogData.tags?.join(', ') || ''}
                                onChange={(e) => setBlogData(prev => ({
                                    ...prev,
                                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                }))}
                                placeholder="desk setup, productivity, gaming"
                                className="meta-input"
                            />
                        </div>
                    </div>

                    {/* Index Toggle */}
                    <div className="index-section">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={blogData.noIndex}
                                onChange={(e) => setBlogData(prev => ({ ...prev, noIndex: e.target.checked }))}
                            />
                            <span>No Index (không cho Google index bài này)</span>
                        </label>
                    </div>

                    {/* ========== EXTERNAL REFERENCES (E.E.A.T) ========== */}
                    <div className="references-section">
                        <div className="references-header">
                            <span className="references-icon">📚</span>
                            <h4>Nguồn tham khảo (E.E.A.T)</h4>
                        </div>
                        <p className="references-hint">
                            Thêm nguồn uy tín để tăng độ tin cậy cho bài viết
                        </p>

                        {/* Existing references */}
                        <div className="references-list">
                            {(blogData.references || []).map((ref, index) => (
                                <div key={index} className="reference-item">
                                    <div className="reference-info">
                                        <a href={ref.url} target="_blank" rel="noopener noreferrer">
                                            {ref.title || ref.url}
                                        </a>
                                        {ref.nofollow && <span className="nofollow-badge">nofollow</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-ref-btn"
                                        onClick={() => {
                                            setBlogData(prev => ({
                                                ...prev,
                                                references: prev.references.filter((_, i) => i !== index)
                                            }));
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add new reference */}
                        <div className="add-reference">
                            <input
                                type="url"
                                id="new-ref-url"
                                placeholder="URL nguồn (https://...)"
                                className="ref-input"
                            />
                            <input
                                type="text"
                                id="new-ref-title"
                                placeholder="Tiêu đề nguồn"
                                className="ref-input"
                            />
                            <div className="ref-options">
                                <label className="nofollow-toggle">
                                    <input type="checkbox" id="new-ref-nofollow" />
                                    <span>nofollow</span>
                                </label>
                                <button
                                    type="button"
                                    className="add-ref-btn"
                                    onClick={() => {
                                        const urlInput = document.getElementById('new-ref-url');
                                        const titleInput = document.getElementById('new-ref-title');
                                        const nofollowInput = document.getElementById('new-ref-nofollow');

                                        if (urlInput.value.trim()) {
                                            setBlogData(prev => ({
                                                ...prev,
                                                references: [
                                                    ...(prev.references || []),
                                                    {
                                                        url: urlInput.value.trim(),
                                                        title: titleInput.value.trim() || urlInput.value.trim(),
                                                        nofollow: nofollowInput.checked
                                                    }
                                                ]
                                            }));
                                            urlInput.value = '';
                                            titleInput.value = '';
                                            nofollowInput.checked = false;
                                        }
                                    }}
                                >
                                    + Thêm nguồn
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ========== END EXTERNAL REFERENCES ========== */}

                    {/* ========== SCHEMA MARKUP CONTROLS ========== */}
                    <div className="schema-section">
                        <div className="schema-header">
                            <span className="schema-icon">🏷️</span>
                            <h4>Schema Markup (Rich Results)</h4>
                        </div>
                        <p className="schema-hint">
                            Bật schema để hiển thị rich snippets trên Google
                        </p>

                        <div className="schema-toggles">
                            {/* Article Schema - Always enabled */}
                            <div className="schema-toggle-item enabled">
                                <div className="toggle-info">
                                    <span className="toggle-icon">📄</span>
                                    <div>
                                        <span className="toggle-name">Article Schema</span>
                                        <span className="toggle-desc">Luôn bật cho tất cả bài viết</span>
                                    </div>
                                </div>
                                <span className="toggle-status active">✓ Active</span>
                            </div>

                            {/* FAQ Schema */}
                            <div className="schema-toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-icon">❓</span>
                                    <div>
                                        <span className="toggle-name">FAQ Schema</span>
                                        <span className="toggle-desc">Hiển thị Q&A trên kết quả tìm kiếm</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={blogData.schema?.enableFaqSchema || false}
                                        onChange={(e) => setBlogData(prev => ({
                                            ...prev,
                                            schema: { ...prev.schema, enableFaqSchema: e.target.checked }
                                        }))}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* Review Schema */}
                            <div className="schema-toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-icon">⭐</span>
                                    <div>
                                        <span className="toggle-name">Review Schema</span>
                                        <span className="toggle-desc">Hiển thị đánh giá sao trên Google</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={blogData.schema?.enableReviewSchema || false}
                                        onChange={(e) => setBlogData(prev => ({
                                            ...prev,
                                            schema: { ...prev.schema, enableReviewSchema: e.target.checked }
                                        }))}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* Review Data (if Review Schema enabled) */}
                            {blogData.schema?.enableReviewSchema && (
                                <div className="review-data-form">
                                    <div className="review-field">
                                        <label>Tên sản phẩm/dịch vụ đánh giá:</label>
                                        <input
                                            type="text"
                                            value={blogData.schema?.reviewData?.itemName || ''}
                                            onChange={(e) => setBlogData(prev => ({
                                                ...prev,
                                                schema: {
                                                    ...prev.schema,
                                                    reviewData: { ...prev.schema?.reviewData, itemName: e.target.value }
                                                }
                                            }))}
                                            placeholder="VD: Dell UltraSharp U2723QE"
                                            className="review-input"
                                        />
                                    </div>
                                    <div className="review-field">
                                        <label>Điểm đánh giá (1-5):</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            step="0.1"
                                            value={blogData.schema?.reviewData?.rating || 5}
                                            onChange={(e) => setBlogData(prev => ({
                                                ...prev,
                                                schema: {
                                                    ...prev.schema,
                                                    reviewData: { ...prev.schema?.reviewData, rating: parseFloat(e.target.value) }
                                                }
                                            }))}
                                            className="review-input rating-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ========== END SCHEMA MARKUP ========== */}
                </div>

                {/* Right Column - SEO Panel */}
                <div className="editor-sidebar">
                    {/* SEO Panel */}
                    <SeoPanel
                        ref={seoPanelRef}
                        seoData={blogData.seo}
                        onChange={handleSeoChange}
                        content={blogData.contentHtml}
                        keywords={blogData.keywords}
                        onKeywordsChange={handleKeywordsChange}
                        searchIntent={blogData.searchIntent}
                        onIntentChange={handleIntentChange}
                    />

                    {/* Keyword Analyzer */}
                    <KeywordAnalyzer
                        primaryKeyword={blogData.keywords.primaryKeyword}
                        title={blogData.title}
                        content={blogData.contentHtml}
                        contentJson={contentJson}
                    />

                    {/* Readability Checker */}
                    <ReadabilityChecker
                        title={blogData.title}
                        content={blogData.contentHtml}
                        contentJson={contentJson}
                        primaryKeyword={blogData.keywords?.primaryKeyword}
                    />

                    {/* Content Optimizer */}
                    <ContentOptimizer
                        title={blogData.title}
                        content={blogData.contentHtml}
                        contentJson={contentJson}
                        seoData={blogData.seo}
                        keywords={blogData.keywords}
                        images={images}
                        wordCount={blogData.contentHtml ? blogData.contentHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length : 0}
                    />

                    {/* Publishing Checklist */}
                    <PublishChecklist
                        seoData={blogData.seo}
                        keywords={blogData.keywords}
                        title={blogData.title}
                        slug={blogData.slug}
                        content={blogData.contentHtml}
                        contentJson={contentJson}
                        images={images}
                        author={blogData.author}
                        onNavigate={handleChecklistNavigate}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper functions
function extractImagesFromJson(json) {
    const images = [];
    if (!json || !json.content) return images;

    function traverse(node) {
        if (node.type === 'image') {
            images.push({
                url: node.attrs?.src,
                alt: node.attrs?.alt || ''
            });
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);
    return images;
}

function countHeadings(json, level) {
    let count = 0;
    if (!json || !json.content) return count;

    function traverse(node) {
        if (node.type === 'heading' && node.attrs?.level === level) {
            count++;
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);
    return count;
}

function calculateReadTime(html) {
    if (!html) return 5;
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200)); // ~200 words per minute
}

export default SeoBlogEditor;
