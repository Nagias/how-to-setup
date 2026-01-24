import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { vietnameseToSlug } from '../../utils/slugify';
import './BlogEditor.css';

const BlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addBlog, updateBlog, blogs } = useApp();

    // Determine edit mode based on URL param
    const isEditMode = !!id;
    // We need to fetch the blog if editing. For local state, we can find it in 'blogs'.
    const [selectedBlog, setSelectedBlog] = useState(null);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [category, setCategory] = useState('Hướng Dẫn');
    const [tags, setTags] = useState('');
    const [readTime, setReadTime] = useState(5);
    const [content, setContent] = useState('');
    const contentRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploadType, setUploadType] = useState('image');

    // Load blog data if editing
    useEffect(() => {
        if (isEditMode && blogs.length > 0) {
            const blogToEdit = blogs.find(b => b.id == id); // Loose equality
            if (blogToEdit) {
                setSelectedBlog(blogToEdit);
                setTitle(blogToEdit.title || '');
                setSlug(blogToEdit.slug || '');
                setExcerpt(blogToEdit.excerpt || '');
                setCoverImage(blogToEdit.coverImage || '');
                setCategory(blogToEdit.category || 'Hướng Dẫn');
                setTags(blogToEdit.tags?.join(', ') || '');
                setReadTime(blogToEdit.readTime || 5);
                setContent(blogToEdit.content || '');
                if (contentRef.current) {
                    contentRef.current.innerHTML = blogToEdit.content || '';
                }
            } else {
                // Not found locally? Maybe fetch or 404.
                // For now, redirect or alert
                alert("Không tìm thấy bài viết!");
                navigate('/blog');
            }
        }
    }, [isEditMode, id, blogs, navigate]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Auto generate slug from title (with Vietnamese support)
        const autoSlug = vietnameseToSlug(newTitle);

        // Only auto-update if slug is empty or matches previous auto-gen
        if (!slug || slug === vietnameseToSlug(title)) {
            setSlug(autoSlug);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🟡 Blog form submission started');

        const blogData = {
            title,
            slug: slug || vietnameseToSlug(title),
            excerpt,
            coverImage: coverImage || 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200',
            content,
            category,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            readTime: parseInt(readTime) || 5
        };

        console.log('🟡 Blog data to save:', blogData);

        if (isEditMode && selectedBlog) {
            console.log('🟡 Updating blog:', selectedBlog.id);
            const res = await updateBlog(selectedBlog.id, blogData);
            console.log('🟡 Update response:', res);

            if (res.success) {
                alert('Đã cập nhật bài viết thành công!');
                navigate(`/blog/${selectedBlog.id}`);
            } else {
                alert(`Lỗi: ${res.message || 'Có lỗi xảy ra khi cập nhật!'}`);
            }
        } else {
            console.log('🟡 Creating new blog');
            const res = await addBlog(blogData);
            console.log('🟡 Create response:', res);

            if (res.success) {
                alert('Đã đăng bài viết thành công!');
                navigate('/blog');
            } else {
                alert(`Lỗi: ${res.message || 'Có lỗi xảy ra!'}`);
            }
        }
    };

    // ... (keep existing helper functions command, etc) ...
    // Note: I need to explicitly preserve the execCommand etc functions if I am replacing the block containing them
    // But I am replacing lines 16-200 (approx) which covers state + useEffect + handleSubmit + form start.
    // I need to be careful about where I stop replacement.

    // Actually, I'll stop BEFORE helper functions (line 85).
    // And THEN replace the form part.
    // Wait, replacing lines 16 to 83.


    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        contentRef.current?.focus();
        updateContent();
    };

    const insertHeading = (level) => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const heading = document.createElement(`h${level}`);
            heading.textContent = selection.toString() || `Tiêu đề ${level}`;
            range.deleteContents();
            range.insertNode(heading);
            updateContent();
        }
    };

    const handleFileUpload = (type) => {
        setUploadType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
            fileInputRef.current.click();
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;
                if (uploadType === 'image') {
                    // Chèn ảnh với style max-width 100%
                    const imgHtml = `<img src="${result}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" alt="Uploaded image" />`;
                    document.execCommand('insertHTML', false, imgHtml);
                } else {
                    const videoHtml = `<div class="video-container" style="margin: 10px 0;"><video controls width="100%" style="border-radius: 8px;"><source src="${result}" type="${file.type}">Trình duyệt của bạn không hỗ trợ thẻ video.</video></div><p><br/></p>`;
                    document.execCommand('insertHTML', false, videoHtml);
                }
                updateContent();
            };
            reader.readAsDataURL(file);
        }
        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    const insertLink = () => {
        const url = prompt('Nhập đường dẫn (URL):');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const changeFont = (fontName) => {
        execCommand('fontName', fontName);
    };

    const changeColor = (color) => {
        execCommand('foreColor', color);
    };

    const changeFontSize = (size) => {
        if (!size) return;
        // Use fontSize command with 1-7 scale, then override with specific px
        document.execCommand('fontSize', false, '7');
        // Find and update the font elements
        const fonts = contentRef.current?.querySelectorAll('font[size="7"]');
        fonts?.forEach(font => {
            font.removeAttribute('size');
            font.style.fontSize = size;
        });
        contentRef.current?.focus();
        updateContent();
    };

    const updateContent = () => {
        if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
        }
    };

    return (
        <div className="blog-editor">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onFileChange}
            />

            <div className="editor-header">
                <h1>{isEditMode ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}</h1>
                <p>{isEditMode ? 'Cập nhật nội dung bài viết của bạn' : 'Chia sẻ kiến thức và cảm hứng setup của bạn'}</p>
            </div>

            <form onSubmit={handleSubmit} className="editor-form">
                {/* Basic Info */}
                <div className="form-section">
                    <h3>Thông Tin Cơ Bản</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="title">Tiêu Đề *</label>
                            <input
                                id="title"
                                type="text"
                                className="input"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Nhập tiêu đề bài viết"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="slug">URL / Slug</label>
                            <input
                                id="slug"
                                type="text"
                                className="input"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="tu-dong-tao-tu-tieu-de"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Danh Mục *</label>
                            <select
                                id="category"
                                className="input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="Hướng Dẫn">Hướng Dẫn</option>
                                <option value="Thiết Kế">Thiết Kế</option>
                                <option value="Đánh Giá">Đánh Giá</option>
                                <option value="Xu Hướng">Xu Hướng</option>
                                <option value="Mẹo">Mẹo</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="excerpt">Mô Tả Ngắn *</label>
                            <textarea
                                id="excerpt"
                                className="input"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Mô tả ngắn gọn về nội dung bài viết"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="coverImage">Ảnh Bìa (URL hoặc Upload bên dưới)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    id="coverImage"
                                    type="url"
                                    className="input"
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setUploadType('image'); // Tạm dùng logic này để set url ảnh bìa thủ công nếu muốn, hoặc chỉ đơn giản là copy paste
                                        // Thực tế cover image nên upload riêng. Ở đây ta cho phép paste URL hoặc user tự upload ảnh rồi copy base64 (hơi khó).
                                        // Để đơn giản, ta giữ input URL cho cover image, và nút upload cho content.
                                        alert('Hiện tại ảnh bìa hỗ trợ URL. Tính năng upload ảnh bìa đang phát triển.');
                                    }}
                                >
                                    URL
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="readTime">Thời Gian Đọc (phút)</label>
                            <input
                                id="readTime"
                                type="number"
                                className="input"
                                value={readTime}
                                onChange={(e) => setReadTime(e.target.value)}
                                min="1"
                                max="60"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="tags">Thẻ (phân cách bằng dấu phẩy)</label>
                            <input
                                id="tags"
                                type="text"
                                className="input"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="desk, productivity, ergonomics"
                            />
                        </div>
                    </div>
                </div>

                {/* Rich Text Editor */}
                <div className="form-section">
                    <h3>Nội Dung Bài Viết</h3>

                    {/* Toolbar */}
                    <div className="editor-toolbar">
                        <div className="toolbar-group">
                            <select onChange={(e) => insertHeading(e.target.value)} className="toolbar-select">
                                <option value="">Tiêu đề</option>
                                <option value="2">Heading 2</option>
                                <option value="3">Heading 3</option>
                                <option value="4">Heading 4</option>
                            </select>
                            <select onChange={(e) => changeFont(e.target.value)} className="toolbar-select">
                                <option value="Arial">Arial</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="System-ui">System UI</option>
                            </select>
                            <select onChange={(e) => changeFontSize(e.target.value)} className="toolbar-select" title="Cỡ chữ">
                                <option value="">Cỡ chữ</option>
                                <option value="12px">12px</option>
                                <option value="14px">14px</option>
                                <option value="16px">16px</option>
                                <option value="18px">18px</option>
                                <option value="20px">20px</option>
                                <option value="24px">24px</option>
                                <option value="28px">28px</option>
                                <option value="32px">32px</option>
                            </select>
                        </div>

                        <div className="toolbar-group">
                            <button type="button" className="toolbar-btn" onClick={() => execCommand('bold')} title="In đậm">
                                <strong>B</strong>
                            </button>
                            <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')} title="In nghiêng">
                                <em>I</em>
                            </button>
                            <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')} title="Gạch chân">
                                <u>U</u>
                            </button>
                            <button type="button" className="toolbar-btn" onClick={() => insertLink()} title="Chèn Link">
                                🔗
                            </button>
                        </div>

                        <div className="toolbar-group">
                            <button type="button" className="toolbar-btn" onClick={() => execCommand('insertUnorderedList')} title="Danh sách">
                                • List
                            </button>
                            <button type="button" className="toolbar-btn" onClick={() => execCommand('insertOrderedList')} title="Số thứ tự">
                                1. List
                            </button>
                        </div>

                        <div className="toolbar-group">
                            <button type="button" className="toolbar-btn" onClick={() => handleFileUpload('image')} title="Tải ảnh lên">
                                📷 Ảnh
                            </button>
                            <button type="button" className="toolbar-btn" onClick={() => handleFileUpload('video')} title="Tải video lên">
                                🎥 Video
                            </button>
                        </div>

                        <div className="toolbar-group">
                            <input type="color" onChange={(e) => changeColor(e.target.value)} title="Màu chữ" className="toolbar-color-picker" />
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div
                        ref={contentRef}
                        className="content-editor"
                        contentEditable
                        onInput={updateContent}
                        data-placeholder="Bắt đầu viết bài tại đây..."
                    />
                </div>

                {/* Actions */}
                <div className="editor-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/blog')}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isEditMode ? 'Cập Nhật' : 'Đăng Bài'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogEditor;
