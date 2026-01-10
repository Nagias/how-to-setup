import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { filterOptions } from '../../data/sampleData';
import './FilterSidebar.css';

const FilterSidebar = () => {
    const { filters, setFilters, showMobileFilter, setShowMobileFilter } = useApp();
    const [collapsed, setCollapsed] = useState(false);

    const toggleFilter = (category, value) => {
        const currentValues = filters[category];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        setFilters({ ...filters, [category]: newValues });
    };

    const clearAllFilters = () => {
        setFilters({
            colorTone: [],
            budget: [],
            gender: [],
            purpose: [],
            size: [],
            search: ''
        });
    };

    const getActiveFilterCount = () => {
        return Object.keys(filters).reduce((count, key) => {
            if (key === 'search') return count;
            return count + filters[key].length;
        }, 0);
    };

    const activeCount = getActiveFilterCount();

    // On mobile, use showMobileFilter from context
    // collapsed state is for desktop
    const isMobileOpen = showMobileFilter;

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="filter-backdrop mobile-only"
                    onClick={() => setShowMobileFilter(false)}
                />
            )}

            <aside className={`filter-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-content">
                    {/* Header */}
                    <div className="sidebar-header">
                        {/* Desktop Toggle Button */}
                        <button
                            className="sidebar-toggle desktop-only"
                            onClick={() => setCollapsed(!collapsed)}
                            title={collapsed ? 'Hiện bộ lọc' : 'Ẩn bộ lọc'}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            className="sidebar-close mobile-only"
                            onClick={() => setShowMobileFilter(false)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <h3 className="sidebar-title">
                            Bộ Lọc
                            {activeCount > 0 && (
                                <span className="filter-count">{activeCount}</span>
                            )}
                        </h3>
                        {activeCount > 0 && (
                            <button className="btn-clear-all" onClick={clearAllFilters}>
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {/* Filter Groups */}
                    <div className="filter-groups">
                        {Object.entries(filterOptions).map(([category, options]) => (
                            <FilterGroup
                                key={category}
                                category={category}
                                options={options}
                                selectedValues={filters[category]}
                                onToggle={toggleFilter}
                            />
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

const FilterGroup = ({ category, options, selectedValues, onToggle }) => {
    const [expanded, setExpanded] = useState(true);

    const categoryLabels = {
        colorTone: 'Tông Màu',
        budget: 'Ngân Sách',
        gender: 'Phong Cách',
        purpose: 'Mục Đích',
        size: 'Kích Thước'
    };

    return (
        <div className="filter-group">
            <button
                className="filter-group-header"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="filter-group-title">{categoryLabels[category]}</span>
                <svg
                    className={`expand-icon ${expanded ? 'expanded' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {expanded && (
                <div className="filter-options">
                    {options.map(option => (
                        <label key={option.value} className="filter-option">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                onChange={() => onToggle(category, option.value)}
                                className="filter-checkbox"
                            />
                            <span className="filter-option-content">
                                <span className="filter-option-label">{option.label}</span>
                                <span className="filter-option-description">{option.description}</span>
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterSidebar;
