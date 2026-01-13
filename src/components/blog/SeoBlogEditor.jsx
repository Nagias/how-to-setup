import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../utils/api';
import { vietnameseToSlug } from '../../utils/slugify';
import { defaultSeoBlogPost, searchIntentConfig } from '../../types/blogTypes';
import TipTapEditor from './editor/TipTapEditor';
import SeoPanel from './seo/SeoPanel';
import { KeywordAnalyzer, ReadabilityChecker, PublishChecklist } from './seo/SeoAnalyzers';
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

    // Calculate if can publish
    const canPublish = useMemo(() => {
        const { seo, keywords, title, slug } = blogData;
        const h2Count = countHeadings(contentJson, 2);
        const imagesMissingAlt = images.filter(img => !img.alt);

        return (
            seo.seoTitle && seo.seoTitle.length >= 30 &&
            seo.metaDescription && seo.metaDescription.length >= 120 &&
            keywords.primaryKeyword && keywords.primaryKeyword.trim() !== '' &&
            h2Count >= 1 &&
            slug && slug.trim() !== '' &&
            title && title.trim() !== '' &&
            imagesMissingAlt.length === 0
        );
    }, [blogData, contentJson, images]);

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
                    </div>

                    {/* Intent Suggestion */}
                    {intentConfig && (
                        <div className="intent-suggestion">
                            <span className="intent-badge">{intentConfig.label}</span>
                            <span className="intent-hint">
                                Cấu trúc đề xuất: {intentConfig.suggestedStructure.join(' → ')}
                            </span>
                        </div>
                    )}

                    {/* Rich Text Editor */}
                    <div className="content-section">
                        <TipTapEditor
                            content={contentJson}
                            onUpdate={handleContentUpdate}
                            onImageAdd={handleImageAdd}
                            placeholder="Bắt đầu viết nội dung bài viết..."
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
                </div>

                {/* Right Column - SEO Panel */}
                <div className="editor-sidebar">
                    {/* SEO Panel */}
                    <SeoPanel
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
