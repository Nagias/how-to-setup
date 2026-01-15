import React, { useMemo } from 'react';
import './SeoComponents.css';

/**
 * Content Optimizer - AI-like suggestions for improving content
 * Analyzes content and provides actionable recommendations
 */
const ContentOptimizer = ({
    title = '',
    content = '',
    contentJson = null,
    seoData = {},
    keywords = {},
    images = [],
    wordCount = 0
}) => {
    const suggestions = useMemo(() => {
        const items = [];
        const primaryKeyword = keywords?.primaryKeyword?.toLowerCase() || '';
        const plainText = stripHtml(content).toLowerCase();

        // 1. Title optimization
        if (title && primaryKeyword) {
            if (!title.toLowerCase().includes(primaryKeyword)) {
                items.push({
                    id: 'title-keyword',
                    type: 'high',
                    icon: '📌',
                    message: `Thêm keyword "${keywords.primaryKeyword}" vào tiêu đề`,
                    action: 'Keyword trong tiêu đề giúp Google hiểu chủ đề chính'
                });
            }
            if (title.length > 60) {
                items.push({
                    id: 'title-length',
                    type: 'medium',
                    icon: '✂️',
                    message: 'Tiêu đề quá dài - có thể bị cắt trên Google',
                    action: `Rút gọn còn dưới 60 ký tự (hiện ${title.length})`
                });
            }
        }

        // 2. Content length
        if (wordCount < 300) {
            items.push({
                id: 'word-count-low',
                type: 'high',
                icon: '📝',
                message: 'Nội dung quá ngắn cho SEO',
                action: `Viết thêm ít nhất ${300 - wordCount} từ nữa (đề xuất 1000-2000 từ)`
            });
        } else if (wordCount < 800) {
            items.push({
                id: 'word-count-medium',
                type: 'low',
                icon: '📖',
                message: 'Nội dung có thể mở rộng thêm',
                action: 'Bài 1000-2000 từ thường xếp hạng tốt hơn'
            });
        }

        // 3. Keyword usage
        if (primaryKeyword) {
            const keywordCount = (plainText.match(new RegExp(primaryKeyword, 'gi')) || []).length;
            if (keywordCount === 0) {
                items.push({
                    id: 'no-keyword',
                    type: 'high',
                    icon: '🔑',
                    message: 'Keyword chưa xuất hiện trong nội dung!',
                    action: 'Thêm keyword tự nhiên vào bài viết'
                });
            } else if (keywordCount < 3) {
                items.push({
                    id: 'few-keywords',
                    type: 'medium',
                    icon: '🔑',
                    message: `Keyword chỉ xuất hiện ${keywordCount} lần`,
                    action: 'Đề xuất 5-10 lần cho bài 1000 từ'
                });
            }
        }

        // 4. Heading structure
        const h2Count = countHeadings(contentJson, 2);
        const h3Count = countHeadings(contentJson, 3);

        if (h2Count < 2) {
            items.push({
                id: 'few-h2',
                type: 'medium',
                icon: '🏷️',
                message: `Chỉ có ${h2Count} heading H2`,
                action: 'Thêm H2 để chia bài thành các phần rõ ràng'
            });
        }

        if (h2Count >= 3 && h3Count === 0) {
            items.push({
                id: 'no-h3',
                type: 'low',
                icon: '📑',
                message: 'Chưa có H3 để chia nhỏ các mục',
                action: 'Thêm H3 dưới mỗi H2 để cấu trúc rõ ràng hơn'
            });
        }

        // 5. Images
        if (images.length === 0) {
            items.push({
                id: 'no-images',
                type: 'medium',
                icon: '🖼️',
                message: 'Bài viết chưa có hình ảnh',
                action: 'Thêm ít nhất 1-3 hình ảnh minh họa'
            });
        } else {
            const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
            if (imagesWithoutAlt.length > 0) {
                items.push({
                    id: 'missing-alt',
                    type: 'medium',
                    icon: '🏷️',
                    message: `${imagesWithoutAlt.length} ảnh thiếu Alt text`,
                    action: 'Thêm mô tả Alt cho tất cả ảnh'
                });
            }
        }

        // 6. Meta description
        if (!seoData?.metaDescription || seoData.metaDescription.length < 50) {
            items.push({
                id: 'meta-desc',
                type: 'high',
                icon: '📋',
                message: 'Meta Description chưa đủ',
                action: 'Viết mô tả hấp dẫn 120-155 ký tự'
            });
        }

        // 7. Internal/External links
        const linkCount = (content.match(/<a /gi) || []).length;
        if (linkCount === 0) {
            items.push({
                id: 'no-links',
                type: 'low',
                icon: '🔗',
                message: 'Chưa có link trong bài',
                action: 'Thêm link internal đến bài viết khác'
            });
        }

        // 8. First paragraph keyword
        const firstParagraph = extractFirstParagraph(contentJson);
        if (primaryKeyword && firstParagraph && !firstParagraph.toLowerCase().includes(primaryKeyword)) {
            items.push({
                id: 'first-para-keyword',
                type: 'medium',
                icon: '🎯',
                message: 'Keyword chưa có trong đoạn mở đầu',
                action: 'Đề cập keyword trong 100 từ đầu tiên'
            });
        }

        return items;
    }, [title, content, contentJson, seoData, keywords, images, wordCount]);

    // Group by priority
    const highPriority = suggestions.filter(s => s.type === 'high');
    const mediumPriority = suggestions.filter(s => s.type === 'medium');
    const lowPriority = suggestions.filter(s => s.type === 'low');

    if (suggestions.length === 0) {
        return (
            <div className="content-optimizer perfect">
                <div className="optimizer-header">
                    <h4>🎉 Content Optimizer</h4>
                    <span className="perfect-badge">Tuyệt vời!</span>
                </div>
                <p className="no-suggestions">Không có đề xuất cải thiện. Bài viết đã tối ưu tốt!</p>
            </div>
        );
    }

    return (
        <div className="content-optimizer">
            <div className="optimizer-header">
                <h4>💡 Content Optimizer</h4>
                <span className="suggestions-count">{suggestions.length} đề xuất</span>
            </div>

            {highPriority.length > 0 && (
                <div className="suggestion-group high">
                    <div className="group-label">Ưu tiên cao</div>
                    {highPriority.map(s => (
                        <SuggestionItem key={s.id} suggestion={s} />
                    ))}
                </div>
            )}

            {mediumPriority.length > 0 && (
                <div className="suggestion-group medium">
                    <div className="group-label">Nên xem xét</div>
                    {mediumPriority.map(s => (
                        <SuggestionItem key={s.id} suggestion={s} />
                    ))}
                </div>
            )}

            {lowPriority.length > 0 && (
                <div className="suggestion-group low">
                    <div className="group-label">Tùy chọn</div>
                    {lowPriority.map(s => (
                        <SuggestionItem key={s.id} suggestion={s} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Individual suggestion item
const SuggestionItem = ({ suggestion }) => (
    <div className={`suggestion-item ${suggestion.type}`}>
        <span className="suggestion-icon">{suggestion.icon}</span>
        <div className="suggestion-content">
            <div className="suggestion-message">{suggestion.message}</div>
            <div className="suggestion-action">{suggestion.action}</div>
        </div>
    </div>
);

// Helper functions
const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const countHeadings = (json, level) => {
    if (!json) return 0;
    let count = 0;
    const traverse = (node) => {
        if (node.type === 'heading' && node.attrs?.level === level) {
            count++;
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    };
    traverse(json);
    return count;
};

const extractFirstParagraph = (json) => {
    if (!json?.content) return '';
    for (const node of json.content) {
        if (node.type === 'paragraph' && node.content) {
            return node.content.map(c => c.text || '').join('');
        }
    }
    return '';
};

export default ContentOptimizer;
