import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import './TipTapEditor.css';

// Custom heading extension that enforces hierarchy
const HeadingEnforcer = StarterKit.configure({
    heading: {
        levels: [2, 3, 4] // H1 is reserved for title, content uses H2-H4
    }
});

const TipTapEditor = ({
    content,
    onUpdate,
    onImageAdd,
    placeholder = 'Bắt đầu viết bài tại đây...'
}) => {
    const editor = useEditor({
        extensions: [
            HeadingEnforcer,
            Image.configure({
                HTMLAttributes: {
                    class: 'blog-image',
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'blog-link',
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }),
            Placeholder.configure({
                placeholder
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableHeader,
            TableCell
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            const html = editor.getHTML();
            onUpdate({ json, html });
        }
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content && typeof content === 'object') {
            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    // Insert image
    const insertImage = useCallback((url, alt = '') => {
        if (editor) {
            editor.chain().focus().setImage({ src: url, alt }).run();
            if (onImageAdd) {
                onImageAdd({ url, alt });
            }
        }
    }, [editor, onImageAdd]);

    // Insert link
    const insertLink = useCallback(() => {
        const url = prompt('Nhập URL:');
        if (url && editor) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    // Insert table
    const insertTable = useCallback(() => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }
    }, [editor]);

    // Handle image upload
    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // For now, use base64. In production, upload to server
                const reader = new FileReader();
                reader.onload = (event) => {
                    const alt = prompt('Nhập Alt text cho ảnh (bắt buộc cho SEO):') || '';
                    insertImage(event.target.result, alt);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }, [insertImage]);

    if (!editor) {
        return <div className="tiptap-loading">Đang tải editor...</div>;
    }

    return (
        <div className="tiptap-editor-wrapper">
            {/* Toolbar */}
            <div className="tiptap-toolbar">
                {/* Headings */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                        title="Heading 2"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                        title="Heading 3"
                    >
                        H3
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        className={`toolbar-btn ${editor.isActive('heading', { level: 4 }) ? 'active' : ''}`}
                        title="Heading 4"
                    >
                        H4
                    </button>
                </div>

                {/* Text Formatting */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                        title="In đậm"
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                        title="In nghiêng"
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
                        title="Gạch ngang"
                    >
                        <s>S</s>
                    </button>
                </div>

                {/* Lists */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                        title="Danh sách"
                    >
                        • List
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                        title="Danh sách số"
                    >
                        1. List
                    </button>
                </div>

                {/* Blocks */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
                        title="Trích dẫn"
                    >
                        " Quote
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="toolbar-btn"
                        title="Đường kẻ ngang"
                    >
                        ─
                    </button>
                </div>

                {/* Media & Links */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={handleImageUpload}
                        className="toolbar-btn"
                        title="Chèn ảnh"
                    >
                        📷 Ảnh
                    </button>
                    <button
                        type="button"
                        onClick={insertLink}
                        className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
                        title="Chèn link"
                    >
                        🔗 Link
                    </button>
                    <button
                        type="button"
                        onClick={insertTable}
                        className="toolbar-btn"
                        title="Chèn bảng"
                    >
                        📊 Bảng
                    </button>
                </div>

                {/* Undo/Redo */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="toolbar-btn"
                        title="Hoàn tác"
                    >
                        ↩
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="toolbar-btn"
                        title="Làm lại"
                    >
                        ↪
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="tiptap-content" />
        </div>
    );
};

export default TipTapEditor;
