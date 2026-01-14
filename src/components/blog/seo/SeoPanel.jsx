import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { seoRules } from '../../../types/blogTypes';
import './SeoComponents.css';

/**
 * SEO Panel - Main container for all SEO configuration
 * Now supports external tab control via ref
 */
const SeoPanel = forwardRef(({
    seoData,
    onChange,
    content,
    keywords,
    onKeywordsChange,
    searchIntent,
    onIntentChange
}, ref) => {
    const [activeTab, setActiveTab] = React.useState('keywords');

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        switchToTab: (tabId) => {
            setActiveTab(tabId);
            // Scroll the panel into view
            const panel = document.querySelector('.seo-panel');
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        focusField: (fieldId) => {
            setTimeout(() => {
                const field = document.querySelector(`#seo-field-${fieldId}`);
                if (field) {
                    field.focus();
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }));

    const tabs = [
        { id: 'keywords', label: 'Keywords', icon: '🔑' },
        { id: 'social', label: 'Social', icon: '📱' },
        { id: 'intent', label: 'Intent', icon: '🎯' }
    ];

    // Calculate field status for real-time feedback
    const seoTitleLength = seoData?.seoTitle?.length || 0;
    const metaDescLength = seoData?.metaDescription?.length || 0;
    const hasPrimaryKeyword = keywords?.primaryKeyword && keywords.primaryKeyword.trim() !== '';

    return (
        <div className="seo-panel">
            <div className="seo-panel-header">
                <h3>⚙️ SEO Settings</h3>
            </div>

            {/* ESSENTIAL SEO FIELDS - Always visible at the top */}
            <div className="seo-essential-fields">
                <div className="essential-field-header">
                    <span className="essential-icon">🎯</span>
                    <span>Các trường bắt buộc</span>
                </div>

                {/* SEO Title */}
                <div className="seo-field">
                    <label htmlFor="seo-field-seoTitle">
                        SEO Title <span className="required">*</span>
                        <span className={`char-counter ${seoTitleLength === 0 ? 'empty' : seoTitleLength < 30 ? 'short' : seoTitleLength > 60 ? 'long' : 'good'}`}>
                            {seoTitleLength}/60
                        </span>
                    </label>
                    <input
                        id="seo-field-seoTitle"
                        type="text"
                        value={seoData?.seoTitle || ''}
                        onChange={(e) => onChange({ ...seoData, seoTitle: e.target.value })}
                        placeholder="Nhập tiêu đề SEO (30-60 ký tự)"
                        className="seo-input"
                        maxLength={70}
                    />
                    {seoTitleLength < 30 && seoTitleLength > 0 && (
                        <div className="seo-hint warning">⚠️ Cần tối thiểu 30 ký tự</div>
                    )}
                </div>

                {/* Meta Description */}
                <div className="seo-field">
                    <label htmlFor="seo-field-metaDescription">
                        Meta Description <span className="required">*</span>
                        <span className={`char-counter ${metaDescLength === 0 ? 'empty' : metaDescLength < 120 ? 'short' : metaDescLength > 155 ? 'long' : 'good'}`}>
                            {metaDescLength}/155
                        </span>
                    </label>
                    <textarea
                        id="seo-field-metaDescription"
                        value={seoData?.metaDescription || ''}
                        onChange={(e) => onChange({ ...seoData, metaDescription: e.target.value })}
                        placeholder="Nhập mô tả SEO (120-155 ký tự)"
                        className="seo-input"
                        rows={3}
                        maxLength={160}
                    />
                    {metaDescLength < 120 && metaDescLength > 0 && (
                        <div className="seo-hint warning">⚠️ Cần tối thiểu 120 ký tự</div>
                    )}
                </div>

                {/* Primary Keyword */}
                <div className="seo-field">
                    <label htmlFor="seo-field-primaryKeyword">
                        Primary Keyword <span className="required">*</span>
                    </label>
                    <input
                        id="seo-field-primaryKeyword"
                        type="text"
                        value={keywords?.primaryKeyword || ''}
                        onChange={(e) => onKeywordsChange({ ...keywords, primaryKeyword: e.target.value })}
                        placeholder="Từ khóa chính bạn muốn rank trên Google"
                        className="seo-input primary-keyword-input"
                    />
                    {!hasPrimaryKeyword && (
                        <div className="seo-hint error">❌ Bắt buộc nhập Primary Keyword</div>
                    )}
                </div>
            </div>

            {/* Tab Navigation for Advanced Settings */}
            <div className="seo-advanced-section">
                <div className="advanced-header">
                    <span>Cài đặt nâng cao</span>
                </div>
                <div className="seo-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`seo-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="seo-tab-content">
                    {activeTab === 'keywords' && (
                        <KeywordsTab
                            keywords={keywords}
                            onChange={onKeywordsChange}
                            content={content}
                        />
                    )}
                    {activeTab === 'social' && (
                        <SocialTab seoData={seoData} onChange={onChange} />
                    )}
                    {activeTab === 'intent' && (
                        <IntentTab
                            searchIntent={searchIntent}
                            onChange={onIntentChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

/**
 * Meta Tab - SEO Title & Meta Description
 */
const MetaTab = ({ seoData, onChange }) => {
    const seoTitleLength = seoData.seoTitle?.length || 0;
    const metaDescLength = seoData.metaDescription?.length || 0;

    const seoTitleStatus = useMemo(() => {
        if (seoTitleLength === 0) return 'empty';
        if (seoTitleLength < seoRules.seoTitle.idealLength.min) return 'short';
        if (seoTitleLength > seoRules.seoTitle.maxLength) return 'long';
        return 'good';
    }, [seoTitleLength]);

    const metaDescStatus = useMemo(() => {
        if (metaDescLength === 0) return 'empty';
        if (metaDescLength < seoRules.metaDescription.idealLength.min) return 'short';
        if (metaDescLength > seoRules.metaDescription.maxLength) return 'long';
        return 'good';
    }, [metaDescLength]);

    return (
        <div className="seo-meta-tab">
            {/* SEO Title */}
            <div className="seo-field">
                <label>
                    SEO Title
                    <span className={`char-counter ${seoTitleStatus}`}>
                        {seoTitleLength} / {seoRules.seoTitle.maxLength}
                    </span>
                </label>
                <input
                    id="seo-field-seoTitle"
                    type="text"
                    value={seoData.seoTitle || ''}
                    onChange={(e) => onChange({ ...seoData, seoTitle: e.target.value })}
                    placeholder="Tiêu đề hiển thị trên Google"
                    className="seo-input"
                    maxLength={seoRules.seoTitle.maxLength}
                />
                <div className="seo-hint">
                    {seoTitleStatus === 'short' && '⚠️ Quá ngắn - Nên có 50-60 ký tự'}
                    {seoTitleStatus === 'long' && '⚠️ Quá dài - Sẽ bị cắt trên Google'}
                    {seoTitleStatus === 'good' && '✅ Độ dài tốt'}
                    {seoTitleStatus === 'empty' && '❌ Bắt buộc nhập SEO Title'}
                </div>
            </div>

            {/* Meta Description */}
            <div className="seo-field">
                <label>
                    Meta Description
                    <span className={`char-counter ${metaDescStatus}`}>
                        {metaDescLength} / {seoRules.metaDescription.maxLength}
                    </span>
                </label>
                <textarea
                    id="seo-field-metaDescription"
                    value={seoData.metaDescription || ''}
                    onChange={(e) => onChange({ ...seoData, metaDescription: e.target.value })}
                    placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm"
                    className="seo-input"
                    rows={3}
                    maxLength={seoRules.metaDescription.maxLength}
                />
                <div className="seo-hint">
                    {metaDescStatus === 'short' && '⚠️ Quá ngắn - Nên có 150-155 ký tự'}
                    {metaDescStatus === 'long' && '⚠️ Quá dài - Sẽ bị cắt trên Google'}
                    {metaDescStatus === 'good' && '✅ Độ dài tốt'}
                    {metaDescStatus === 'empty' && '❌ Bắt buộc nhập Meta Description'}
                </div>
            </div>

            {/* Google Preview */}
            <div className="google-preview">
                <h4>Google Preview</h4>
                <div className="google-result">
                    <div className="google-title">
                        {seoData.seoTitle || 'Tiêu đề bài viết của bạn'}
                    </div>
                    <div className="google-url">
                        deskhub.vn › blog › {seoData.slug || 'url-bai-viet'}
                    </div>
                    <div className="google-desc">
                        {seoData.metaDescription || 'Mô tả bài viết của bạn sẽ hiển thị ở đây...'}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Keywords Tab - Keyword Management
 */
const KeywordsTab = ({ keywords, onChange, content }) => {
    const handleAddSecondary = () => {
        const keyword = prompt('Nhập secondary keyword:');
        if (keyword && !keywords.secondaryKeywords.includes(keyword.trim())) {
            onChange({
                ...keywords,
                secondaryKeywords: [...keywords.secondaryKeywords, keyword.trim()]
            });
        }
    };

    const handleRemoveSecondary = (index) => {
        onChange({
            ...keywords,
            secondaryKeywords: keywords.secondaryKeywords.filter((_, i) => i !== index)
        });
    };

    const handleAddLsi = () => {
        const keyword = prompt('Nhập LSI/semantic keyword:');
        if (keyword && !keywords.lsiKeywords.includes(keyword.trim())) {
            onChange({
                ...keywords,
                lsiKeywords: [...keywords.lsiKeywords, keyword.trim()]
            });
        }
    };

    const handleRemoveLsi = (index) => {
        onChange({
            ...keywords,
            lsiKeywords: keywords.lsiKeywords.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="seo-keywords-tab">
            {/* Primary Keyword */}
            <div className="seo-field">
                <label>
                    Primary Keyword <span className="required">*</span>
                </label>
                <input
                    id="seo-field-primaryKeyword"
                    type="text"
                    value={keywords.primaryKeyword || ''}
                    onChange={(e) => onChange({ ...keywords, primaryKeyword: e.target.value })}
                    placeholder="Từ khóa chính bạn muốn rank"
                    className="seo-input primary-keyword-input"
                />
                {!keywords.primaryKeyword && (
                    <div className="seo-hint error">❌ Bắt buộc có primary keyword</div>
                )}
            </div>

            {/* Secondary Keywords */}
            <div className="seo-field">
                <label>Secondary Keywords</label>
                <div className="keyword-tags">
                    {keywords.secondaryKeywords?.map((kw, index) => (
                        <span key={index} className="keyword-tag">
                            {kw}
                            <button type="button" onClick={() => handleRemoveSecondary(index)}>×</button>
                        </span>
                    ))}
                    <button type="button" className="add-keyword-btn" onClick={handleAddSecondary}>
                        + Thêm
                    </button>
                </div>
            </div>

            {/* LSI Keywords */}
            <div className="seo-field">
                <label>LSI / Semantic Keywords</label>
                <div className="keyword-tags">
                    {keywords.lsiKeywords?.map((kw, index) => (
                        <span key={index} className="keyword-tag lsi">
                            {kw}
                            <button type="button" onClick={() => handleRemoveLsi(index)}>×</button>
                        </span>
                    ))}
                    <button type="button" className="add-keyword-btn" onClick={handleAddLsi}>
                        + Thêm
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Social Tab - Open Graph Settings
 */
const SocialTab = ({ seoData, onChange }) => {
    return (
        <div className="seo-social-tab">
            <div className="seo-field">
                <label>OG Title</label>
                <input
                    type="text"
                    value={seoData.ogTitle || ''}
                    onChange={(e) => onChange({ ...seoData, ogTitle: e.target.value })}
                    placeholder="Tiêu đề khi chia sẻ (để trống = dùng SEO Title)"
                    className="seo-input"
                />
            </div>

            <div className="seo-field">
                <label>OG Description</label>
                <textarea
                    value={seoData.ogDescription || ''}
                    onChange={(e) => onChange({ ...seoData, ogDescription: e.target.value })}
                    placeholder="Mô tả khi chia sẻ (để trống = dùng Meta Description)"
                    className="seo-input"
                    rows={2}
                />
            </div>

            <div className="seo-field">
                <label>OG Image URL</label>
                <input
                    type="url"
                    value={seoData.ogImage || ''}
                    onChange={(e) => onChange({ ...seoData, ogImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="seo-input"
                />
            </div>

            {/* Social Preview */}
            <div className="social-preview">
                <h4>Facebook Preview</h4>
                <div className="fb-card">
                    <div className="fb-image">
                        {seoData.ogImage ? (
                            <img src={seoData.ogImage} alt="OG Preview" />
                        ) : (
                            <div className="fb-image-placeholder">Chưa có ảnh</div>
                        )}
                    </div>
                    <div className="fb-content">
                        <div className="fb-domain">deskhub.vn</div>
                        <div className="fb-title">{seoData.ogTitle || seoData.seoTitle || 'Tiêu đề bài viết'}</div>
                        <div className="fb-desc">{seoData.ogDescription || seoData.metaDescription || 'Mô tả bài viết...'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Intent Tab - Search Intent Selector
 */
const IntentTab = ({ searchIntent, onChange }) => {
    const intents = [
        {
            value: 'informational',
            label: 'Thông tin (Informational)',
            icon: '📚',
            desc: 'Người dùng muốn tìm hiểu, học hỏi',
            cta: 'Đọc thêm, Tìm hiểu thêm'
        },
        {
            value: 'navigational',
            label: 'Điều hướng (Navigational)',
            icon: '🧭',
            desc: 'Người dùng muốn tìm trang/nguồn cụ thể',
            cta: 'Truy cập, Đến trang'
        },
        {
            value: 'transactional',
            label: 'Giao dịch (Transactional)',
            icon: '💳',
            desc: 'Người dùng muốn mua/đăng ký',
            cta: 'Mua ngay, Đăng ký'
        },
        {
            value: 'commercial',
            label: 'Thương mại (Commercial)',
            icon: '🔍',
            desc: 'Người dùng so sánh trước khi mua',
            cta: 'So sánh, Xem đánh giá'
        }
    ];

    return (
        <div className="seo-intent-tab">
            <p className="intent-intro">
                Chọn search intent phù hợp để tối ưu cấu trúc nội dung
            </p>

            <div className="intent-options">
                {intents.map(intent => (
                    <div
                        key={intent.value}
                        className={`intent-option ${searchIntent === intent.value ? 'selected' : ''}`}
                        onClick={() => onChange(intent.value)}
                    >
                        <div className="intent-icon">{intent.icon}</div>
                        <div className="intent-info">
                            <div className="intent-label">{intent.label}</div>
                            <div className="intent-desc">{intent.desc}</div>
                            <div className="intent-cta">CTA gợi ý: {intent.cta}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeoPanel;
