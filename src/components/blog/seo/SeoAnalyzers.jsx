import React, { useMemo } from 'react';
import './SeoComponents.css';

/**
 * Keyword Analyzer - Real-time keyword analysis
 */
const KeywordAnalyzer = ({
    primaryKeyword,
    title,
    content, // HTML content string
    contentJson // TipTap JSON for heading analysis
}) => {
    const analysis = useMemo(() => {
        if (!primaryKeyword) {
            return {
                hasKeyword: false,
                checks: []
            };
        }

        const keyword = primaryKeyword.toLowerCase().trim();
        const plainText = stripHtml(content || '');
        const plainTextLower = plainText.toLowerCase();

        // Extract headings from JSON
        const h2s = extractHeadings(contentJson, 2);
        const h1Text = title?.toLowerCase() || '';

        // Calculate keyword density
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        const keywordCount = (plainTextLower.match(new RegExp(keyword, 'gi')) || []).length;
        const density = wordCount > 0 ? keywordCount / wordCount : 0;

        const checks = [
            {
                id: 'first150',
                label: 'Keyword trong 150 ký tự đầu',
                passed: plainTextLower.substring(0, 150).includes(keyword),
                priority: 'high'
            },
            {
                id: 'last150',
                label: 'Keyword trong 150 ký tự cuối',
                passed: plainTextLower.slice(-150).includes(keyword),
                priority: 'medium'
            },
            {
                id: 'h1',
                label: 'Keyword trong H1 (tiêu đề)',
                passed: h1Text.includes(keyword),
                priority: 'high'
            },
            {
                id: 'h2',
                label: 'Keyword trong ít nhất 1 H2',
                passed: h2s.some(h => h.toLowerCase().includes(keyword)),
                priority: 'high'
            },
            {
                id: 'density',
                label: `Mật độ keyword: ${(density * 100).toFixed(1)}%`,
                passed: density <= 0.03 && density >= 0.005,
                warning: density > 0.03,
                priority: 'medium',
                hint: density > 0.03 ? 'Quá dày! Nên < 3%' : (density < 0.005 ? 'Quá thưa! Nên 0.5-3%' : '')
            }
        ];

        return {
            hasKeyword: true,
            keyword,
            keywordCount,
            wordCount,
            density,
            checks
        };
    }, [primaryKeyword, title, content, contentJson]);

    if (!analysis.hasKeyword) {
        return (
            <div className="keyword-analyzer empty">
                <h4>🔑 Keyword Analysis</h4>
                <p className="no-keyword">Chưa có primary keyword</p>
            </div>
        );
    }

    const passedCount = analysis.checks.filter(c => c.passed).length;
    const totalChecks = analysis.checks.length;
    const score = Math.round((passedCount / totalChecks) * 100);

    return (
        <div className="keyword-analyzer">
            <div className="analyzer-header">
                <h4>🔑 Keyword Analysis</h4>
                <div className={`keyword-score ${score >= 70 ? 'good' : score >= 40 ? 'medium' : 'poor'}`}>
                    {score}%
                </div>
            </div>

            <div className="keyword-target">
                <span className="label">Target:</span>
                <span className="keyword">{analysis.keyword}</span>
                <span className="count">({analysis.keywordCount}x trong {analysis.wordCount} từ)</span>
            </div>

            <div className="keyword-checks">
                {analysis.checks.map(check => (
                    <div key={check.id} className={`check-item ${check.passed ? 'passed' : 'failed'} ${check.warning ? 'warning' : ''}`}>
                        <span className="check-icon">
                            {check.passed ? '✅' : (check.warning ? '⚠️' : '❌')}
                        </span>
                        <span className="check-label">{check.label}</span>
                        {check.hint && <span className="check-hint">{check.hint}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Readability Checker - Content structure validation
 */
const ReadabilityChecker = ({
    title,
    content,
    contentJson
}) => {
    const analysis = useMemo(() => {
        const plainText = stripHtml(content || '');

        // Count headings from JSON
        const h2Count = countHeadings(contentJson, 2);
        const h3Count = countHeadings(contentJson, 3);
        const hasH1InContent = checkForH1InContent(contentJson);

        // Paragraph analysis
        const paragraphs = extractParagraphs(contentJson);
        const longParagraphs = paragraphs.filter(p => p.wordCount > 100);

        // Word count
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;

        const checks = [
            {
                id: 'singleH1',
                label: 'Chỉ có 1 H1 (tiêu đề bài)',
                passed: !hasH1InContent,
                hint: hasH1InContent ? 'Không nên dùng H1 trong nội dung' : '',
                priority: 'high'
            },
            {
                id: 'hasH2',
                label: `Có ít nhất 1 H2 (hiện có ${h2Count})`,
                passed: h2Count >= 1,
                priority: 'high'
            },
            {
                id: 'multipleH2',
                label: `Có ít nhất 3 sections H2 (hiện có ${h2Count})`,
                passed: h2Count >= 3,
                priority: 'medium'
            },
            {
                id: 'headingHierarchy',
                label: 'Không bỏ cấp heading (H1→H2→H3)',
                passed: checkHeadingHierarchy(contentJson),
                priority: 'high'
            },
            {
                id: 'paragraphLength',
                label: `Paragraphs ngắn (${longParagraphs.length} quá dài)`,
                passed: longParagraphs.length === 0,
                hint: longParagraphs.length > 0 ? 'Nên chia nhỏ đoạn > 100 từ' : '',
                priority: 'medium'
            },
            {
                id: 'minWords',
                label: `Độ dài nội dung (${wordCount} từ)`,
                passed: wordCount >= 300,
                hint: wordCount < 300 ? 'Nên có ít nhất 300 từ' : '',
                priority: 'medium'
            }
        ];

        return { checks, wordCount, h2Count, h3Count };
    }, [title, content, contentJson]);

    const passedCount = analysis.checks.filter(c => c.passed).length;
    const totalChecks = analysis.checks.length;
    const score = Math.round((passedCount / totalChecks) * 100);

    return (
        <div className="readability-checker">
            <div className="checker-header">
                <h4>📖 Readability</h4>
                <div className={`readability-score ${score >= 70 ? 'good' : score >= 40 ? 'medium' : 'poor'}`}>
                    {score}%
                </div>
            </div>

            <div className="readability-stats">
                <span>{analysis.wordCount} từ</span>
                <span>•</span>
                <span>{analysis.h2Count} H2</span>
                <span>•</span>
                <span>{analysis.h3Count} H3</span>
            </div>

            <div className="readability-checks">
                {analysis.checks.map(check => (
                    <div key={check.id} className={`check-item ${check.passed ? 'passed' : 'failed'}`}>
                        <span className="check-icon">{check.passed ? '✅' : '❌'}</span>
                        <span className="check-label">{check.label}</span>
                        {check.hint && <span className="check-hint">{check.hint}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Publishing Checklist - Blocking rules
 */
const PublishChecklist = ({
    seoData,
    keywords,
    title,
    slug,
    content,
    contentJson,
    images,
    author
}) => {
    const checks = useMemo(() => {
        const h2Count = countHeadings(contentJson, 2);
        const imagesMissingAlt = images?.filter(img => !img.alt || img.alt.trim() === '') || [];

        return [
            {
                id: 'seoTitle',
                label: 'SEO Title',
                passed: seoData?.seoTitle && seoData.seoTitle.length >= 30,
                blocking: true
            },
            {
                id: 'metaDesc',
                label: 'Meta Description',
                passed: seoData?.metaDescription && seoData.metaDescription.length >= 120,
                blocking: true
            },
            {
                id: 'primaryKeyword',
                label: 'Primary Keyword',
                passed: keywords?.primaryKeyword && keywords.primaryKeyword.trim() !== '',
                blocking: true
            },
            {
                id: 'hasH2',
                label: 'Có ít nhất 1 H2',
                passed: h2Count >= 1,
                blocking: true
            },
            {
                id: 'slug',
                label: 'URL Slug',
                passed: slug && slug.trim() !== '',
                blocking: true
            },
            {
                id: 'title',
                label: 'Tiêu đề bài viết',
                passed: title && title.trim() !== '',
                blocking: true
            },
            {
                id: 'imageAlt',
                label: 'Ảnh có Alt text',
                passed: images?.length > 0 && imagesMissingAlt.length === 0,
                blocking: false, // Changed to non-blocking since images are optional
                hint: images?.length === 0
                    ? 'Chưa có ảnh trong bài viết'
                    : (imagesMissingAlt.length > 0 ? `${imagesMissingAlt.length} ảnh thiếu alt` : '')
            },
            {
                id: 'author',
                label: 'Tác giả',
                passed: author && author.name,
                blocking: false
            }
        ];
    }, [seoData, keywords, title, slug, content, contentJson, images, author]);

    const canPublish = checks.filter(c => c.blocking).every(c => c.passed);
    const passedCount = checks.filter(c => c.passed).length;

    return (
        <div className="publish-checklist">
            <div className="checklist-header">
                <h4>📋 Pre-Publish Checklist</h4>
                <span className={`checklist-status ${canPublish ? 'ready' : 'not-ready'}`}>
                    {canPublish ? '✅ Ready' : `❌ ${checks.filter(c => c.blocking && !c.passed).length} lỗi`}
                </span>
            </div>

            <div className="checklist-items">
                {checks.map(check => (
                    <div key={check.id} className={`checklist-item ${check.passed ? 'passed' : 'failed'}`}>
                        <span className="checklist-icon">
                            {check.passed ? '✅' : (check.blocking ? '❌' : '⚠️')}
                        </span>
                        <span className="checklist-label">
                            {check.label}
                            {check.blocking && !check.passed && <span className="blocking-badge">Bắt buộc</span>}
                        </span>
                        {check.hint && <span className="checklist-hint">{check.hint}</span>}
                    </div>
                ))}
            </div>

            <div className="checklist-summary">
                {passedCount}/{checks.length} hoàn thành
            </div>
        </div>
    );
};

// Helper functions
function stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.trim();
}

function extractHeadings(json, level) {
    const headings = [];
    if (!json || !json.content) return headings;

    function traverse(node) {
        if (node.type === 'heading' && node.attrs?.level === level) {
            const text = node.content?.map(c => c.text || '').join('') || '';
            headings.push(text);
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);
    return headings;
}

function countHeadings(json, level) {
    return extractHeadings(json, level).length;
}

function checkForH1InContent(json) {
    if (!json || !json.content) return false;

    function traverse(node) {
        if (node.type === 'heading' && node.attrs?.level === 1) {
            return true;
        }
        if (node.content) {
            return node.content.some(traverse);
        }
        return false;
    }

    return traverse(json);
}

function checkHeadingHierarchy(json) {
    if (!json || !json.content) return true;

    let lastLevel = 1; // Start with H1 (title)
    let valid = true;

    function traverse(node) {
        if (node.type === 'heading' && node.attrs?.level) {
            const level = node.attrs.level;
            if (level > lastLevel + 1) {
                valid = false;
            }
            lastLevel = level;
        }
        if (node.content && valid) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);
    return valid;
}

function extractParagraphs(json) {
    const paragraphs = [];
    if (!json || !json.content) return paragraphs;

    function traverse(node) {
        if (node.type === 'paragraph') {
            const text = node.content?.map(c => c.text || '').join('') || '';
            const wordCount = text.split(/\s+/).filter(Boolean).length;
            paragraphs.push({ text, wordCount });
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);
    return paragraphs;
}

export { KeywordAnalyzer, ReadabilityChecker, PublishChecklist };
