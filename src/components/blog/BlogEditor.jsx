import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import './BlogEditor.css';

const BlogEditor = () => {
    const { addBlog, updateBlog, selectedBlog, setCurrentView } = useApp();
    const isEditMode = !!selectedBlog;

    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [category, setCategory] = useState('Hướng Dẫn');
    const [tags, setTags] = useState('');
    const [readTime, setReadTime] = useState(5);
    const [content, setContent] = useState('');
    const contentRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploadType, setUploadType] = useState('image'); // 'image' or 'video'

    // Pre-fill form when editing
    useEffect(() => {
        if (isEditMode && selectedBlog) {
            setTitle(selectedBlog.title || '');
            setExcerpt(selectedBlog.excerpt || '');
            setCoverImage(selectedBlog.coverImage || '');
            setCategory(selectedBlog.category || 'Hướng Dẫn');
            setTags(selectedBlog.tags?.join(', ') || '');
            setReadTime(selectedBlog.readTime || 5);
            setContent(selectedBlog.content || '');
            if (contentRef.current) {
                contentRef.current.innerHTML = selectedBlog.content || '';
            }
        }
    }, [isEditMode, selectedBlog]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const blogData = {
            title,
            slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            excerpt,
            coverImage: coverImage || 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200',
            content,
            category,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            readTime: parseInt(readTime)
        };

        if (isEditMode) {
            const res = await updateBlog(selectedBlog.id, blogData);
            if (res.success) {
                alert('Đã cập nhật bài viết thành công!');
                setCurrentView('blog');
            } else {
                alert(res.message || 'Có lỗi xảy ra khi cập nhật!');
            }
        } else {
            const res = await addBlog(blogData);
            if (res.success) {
                alert('Đã đăng bài viết thành công!');
                // Reset form
                setTitle('');
                setExcerpt('');
                setCoverImage('');
                setCategory('Hướng Dẫn');
                setTags('');
                setReadTime(5);
                setContent('');
                if (contentRef.current) {
                    contentRef.current.innerHTML = '';
                }
                setCurrentView('blog');
            } else {
                alert(res.message || 'Có lỗi xảy ra!');
            }
        }
    };

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
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề bài viết"
                                required
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
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentView('blog')}>
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
