import React, { useState, useMemo } from 'react';
import { searchIntentConfig } from '../../../types/blogTypes';
import './SeoComponents.css';

/**
 * Outline Builder - Create article structure before writing
 * Helps ensure proper heading hierarchy and content planning
 */
const OutlineBuilder = ({
    searchIntent = 'informational',
    primaryKeyword = '',
    onOutlineChange,
    existingOutline = []
}) => {
    const [outline, setOutline] = useState(existingOutline);
    const [newItem, setNewItem] = useState({ level: 'h2', text: '' });
    const [isExpanded, setIsExpanded] = useState(true);

    const intentConfig = searchIntentConfig[searchIntent];

    // Suggested structure based on search intent
    const suggestedStructure = useMemo(() => {
        const structures = {
            informational: [
                { level: 'h2', text: 'Giới thiệu về [topic]' },
                { level: 'h2', text: '[Topic] là gì?' },
                { level: 'h3', text: 'Định nghĩa' },
                { level: 'h3', text: 'Lịch sử phát triển' },
                { level: 'h2', text: 'Tại sao [topic] quan trọng?' },
                { level: 'h2', text: 'Cách thực hiện [topic]' },
                { level: 'h3', text: 'Bước 1: ...' },
                { level: 'h3', text: 'Bước 2: ...' },
                { level: 'h3', text: 'Bước 3: ...' },
                { level: 'h2', text: 'Lời khuyên và mẹo hay' },
                { level: 'h2', text: 'Câu hỏi thường gặp (FAQ)' },
                { level: 'h2', text: 'Kết luận' }
            ],
            transactional: [
                { level: 'h2', text: 'Tổng quan sản phẩm' },
                { level: 'h2', text: 'Tính năng nổi bật' },
                { level: 'h3', text: 'Tính năng 1' },
                { level: 'h3', text: 'Tính năng 2' },
                { level: 'h2', text: 'Bảng giá' },
                { level: 'h2', text: 'So sánh với đối thủ' },
                { level: 'h2', text: 'Đánh giá từ người dùng' },
                { level: 'h2', text: 'Hướng dẫn mua hàng' }
            ],
            commercial: [
                { level: 'h2', text: 'Top [n] sản phẩm tốt nhất' },
                { level: 'h2', text: '#1. [Sản phẩm A]' },
                { level: 'h3', text: 'Ưu điểm' },
                { level: 'h3', text: 'Nhược điểm' },
                { level: 'h3', text: 'Ai nên mua?' },
                { level: 'h2', text: '#2. [Sản phẩm B]' },
                { level: 'h2', text: 'Bảng so sánh chi tiết' },
                { level: 'h2', text: 'Hướng dẫn chọn mua' },
                { level: 'h2', text: 'Kết luận - Nên mua gì?' }
            ],
            navigational: [
                { level: 'h2', text: 'Thông tin nhanh' },
                { level: 'h2', text: 'Cách truy cập' },
                { level: 'h2', text: 'Hướng dẫn sử dụng' }
            ]
        };

        return structures[searchIntent] || structures.informational;
    }, [searchIntent]);

    // Add new outline item
    const addItem = () => {
        if (newItem.text.trim()) {
            const updatedOutline = [...outline, { ...newItem, id: Date.now() }];
            setOutline(updatedOutline);
            setNewItem({ level: 'h2', text: '' });
            onOutlineChange?.(updatedOutline);
        }
    };

    // Remove outline item
    const removeItem = (id) => {
        const updatedOutline = outline.filter(item => item.id !== id);
        setOutline(updatedOutline);
        onOutlineChange?.(updatedOutline);
    };

    // Move item up/down
    const moveItem = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= outline.length) return;

        const updatedOutline = [...outline];
        [updatedOutline[index], updatedOutline[newIndex]] = [updatedOutline[newIndex], updatedOutline[index]];
        setOutline(updatedOutline);
        onOutlineChange?.(updatedOutline);
    };

    // Apply suggested structure
    const applySuggestedStructure = () => {
        const keywordText = primaryKeyword || 'topic';
        const populatedStructure = suggestedStructure.map((item, idx) => ({
            ...item,
            id: Date.now() + idx,
            text: item.text.replace(/\[topic\]/gi, keywordText)
        }));
        setOutline(populatedStructure);
        onOutlineChange?.(populatedStructure);
    };

    // Check for issues
    const outlineIssues = useMemo(() => {
        const issues = [];
        const h2Count = outline.filter(i => i.level === 'h2').length;

        if (h2Count < 3) {
            issues.push({ type: 'warning', message: `Nên có ít nhất 3 H2 (hiện có ${h2Count})` });
        }

        if (outline.length === 0) {
            issues.push({ type: 'error', message: 'Chưa có dàn ý nào' });
        }

        // Check if any H2 contains keyword
        if (primaryKeyword) {
            const h2WithKeyword = outline.filter(
                i => i.level === 'h2' && i.text.toLowerCase().includes(primaryKeyword.toLowerCase())
            ).length;
            if (h2WithKeyword === 0) {
                issues.push({ type: 'warning', message: 'Nên có ít nhất 1 H2 chứa keyword' });
            }
        }

        return issues;
    }, [outline, primaryKeyword]);

    return (
        <div className="outline-builder">
            <div className="outline-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="outline-title">
                    <span className="outline-icon">📝</span>
                    <h4>Dàn ý bài viết ({outline.length} mục)</h4>
                </div>
                <button type="button" className="expand-btn">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="outline-content">
                    {/* Intent suggestion */}
                    {intentConfig && (
                        <div className="intent-suggestion-box">
                            <span className="intent-label">{intentConfig.label}</span>
                            <button
                                type="button"
                                className="apply-template-btn"
                                onClick={applySuggestedStructure}
                            >
                                📋 Áp dụng mẫu
                            </button>
                        </div>
                    )}

                    {/* Issues */}
                    {outlineIssues.length > 0 && (
                        <div className="outline-issues">
                            {outlineIssues.map((issue, idx) => (
                                <div key={idx} className={`issue-item ${issue.type}`}>
                                    {issue.type === 'error' ? '❌' : '⚠️'} {issue.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Outline items */}
                    <div className="outline-items">
                        {outline.map((item, index) => (
                            <div
                                key={item.id}
                                className={`outline-item ${item.level} ${primaryKeyword && item.text.toLowerCase().includes(primaryKeyword.toLowerCase())
                                        ? 'has-keyword'
                                        : ''
                                    }`}
                            >
                                <span className="item-level">{item.level.toUpperCase()}</span>
                                <span className="item-text">{item.text}</span>
                                {primaryKeyword && item.text.toLowerCase().includes(primaryKeyword.toLowerCase()) && (
                                    <span className="keyword-badge">🔑</span>
                                )}
                                <div className="item-actions">
                                    <button type="button" onClick={() => moveItem(index, 'up')} disabled={index === 0}>↑</button>
                                    <button type="button" onClick={() => moveItem(index, 'down')} disabled={index === outline.length - 1}>↓</button>
                                    <button type="button" onClick={() => removeItem(item.id)} className="remove-btn">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add new item */}
                    <div className="add-outline-item">
                        <select
                            value={newItem.level}
                            onChange={(e) => setNewItem({ ...newItem, level: e.target.value })}
                            className="level-select"
                        >
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                            <option value="h4">H4</option>
                        </select>
                        <input
                            type="text"
                            value={newItem.text}
                            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                            placeholder="Nhập tiêu đề heading..."
                            className="item-input"
                            onKeyPress={(e) => e.key === 'Enter' && addItem()}
                        />
                        <button type="button" onClick={addItem} className="add-btn">+ Thêm</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutlineBuilder;
