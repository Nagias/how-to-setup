import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/ipUtils'; // Keep for legacy or remove later
import { api, ADMIN_EMAILS } from '../utils/api';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { sampleSetups, sampleBlogs } from '../data/sampleData';

const AppContext = createContext();

// Cache keys (defined outside component to avoid recreating)
const CACHE_KEY_SETUPS = 'deskhub_cache_setups';
const CACHE_KEY_BLOGS = 'deskhub_cache_blogs';
const CACHE_TIMESTAMP = 'deskhub_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to get initial data from cache SYNCHRONOUSLY
const getInitialSetups = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY_SETUPS);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                console.log('⚡ Instant load:', parsed.length, 'setups from cache');
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Cache parse error:', e);
    }
    return sampleSetups;
};

const getInitialBlogs = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY_BLOGS);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Cache parse error:', e);
    }
    return sampleBlogs;
};

// Check if cache is fresh (sync check)
const isCacheFresh = () => {
    try {
        const cacheTime = localStorage.getItem(CACHE_TIMESTAMP);
        return cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION;
    } catch (e) {
        return false;
    }
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    // Initialize DIRECTLY from cache for instant display (no async wait)
    const [setups, setSetups] = useState(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY_SETUPS);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.length > 0) {
                    console.log('⚡ Instant load:', parsed.length, 'setups from cache');
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Cache parse error:', e);
        }
        return []; // Start with empty, will be filled by loadData
    });
    const [blogs, setBlogs] = useState(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY_BLOGS);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Cache parse error:', e);
        }
        return [];
    });
    const [currentUser, setCurrentUser] = useState(null);
    // Show loading only when we have no data at all
    const [loading, setLoading] = useState(() => {
        // If we have cache, we're not loading. Otherwise, we are.
        try {
            const cached = localStorage.getItem(CACHE_KEY_SETUPS);
            if (cached) {
                const parsed = JSON.parse(cached);
                return !(parsed && parsed.length > 0); // Not loading if we have data
            }
        } catch (e) {
            // Ignore
        }
        return true; // Loading if no cache
    });

    const loadData = async () => {
        // Stale-While-Revalidate: Always fetch fresh data, cache is only for instant display
        console.log('🔄 Fetching fresh data from Firestore...');

        try {
            const data = await api.getData();

            if (data.setups && data.setups.length > 0) {
                console.log('📊 Loaded', data.setups.length, 'setups from Firestore');
                setSetups(data.setups);
                // Update cache
                try {
                    localStorage.setItem(CACHE_KEY_SETUPS, JSON.stringify(data.setups));
                } catch (e) {
                    console.warn('Cache storage failed:', e);
                }
            } else {
                // No data from Firestore - use sample data as fallback
                console.warn('⚠️ No data from Firestore, using sample data');
                setSetups(sampleSetups);
            }

            if (data.blogs && data.blogs.length > 0) {
                console.log('📰 Loaded', data.blogs.length, 'blogs from Firestore');
                setBlogs(data.blogs);
                try {
                    localStorage.setItem(CACHE_KEY_BLOGS, JSON.stringify(data.blogs));
                } catch (e) {
                    console.warn('Cache storage failed:', e);
                }
            } else {
                setBlogs(sampleBlogs);
            }

            // Update cache timestamp
            localStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());

            setAllComments(data.comments || {});
        } catch (error) {
            console.error('❌ Error loading data from Firestore:', error);
            // On error, keep showing cached data (already loaded from state initialization)
            console.log('📌 Keeping cached data due to network error');
        } finally {
            setLoading(false);
        }
    };
    const [filters, setFilters] = useState({
        colorTone: [],
        budget: [],
        gender: [],
        purpose: [],
        size: [],
        search: ''
    });
    const [currentView, setCurrentView] = useState('gallery');
    const [selectedSetup, setSelectedSetup] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const [showCollectionsModal, setShowCollectionsModal] = useState(false);
    const [showAddSetupModal, setShowAddSetupModal] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [allComments, setAllComments] = useState({});

    // Initialize data on mount
    useEffect(() => {
        // initializeAdmin(); // No longer needed with real Auth
        loadData();
        loadTheme();

        // Listen for Auth changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Optimistic update: Set user immediately with basic info
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                const basicUser = {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email?.split('@')[0],
                    photoURL: user.photoURL,
                    role: isAdmin ? 'admin' : 'user' // Force admin role immediately if whitelisted
                };
                setCurrentUser(basicUser);

                // Fetch extra info from Firestore in background
                try {
                    const docRef = doc(db, 'users', user.uid);
                    getDoc(docRef).then(docSnap => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            // Update state with full data
                            // IMPORTANT: Enforce admin role if whitelisted, even if Firestore says 'user'
                            const isStillAdmin = ADMIN_EMAILS.includes(user.email);
                            setCurrentUser(prev => ({
                                ...prev,
                                displayName: userData.displayName || prev.displayName,
                                photoURL: userData.avatar || prev.photoURL,
                                role: isStillAdmin ? 'admin' : (userData.role || prev.role)
                            }));
                        }
                    }).catch(err => console.warn("Background user fetch failed:", err));
                } catch (err) {
                    console.warn("Failed to initiate user fetch:", err);
                }
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);



    // Load theme preference
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('deskhub_theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('deskhub_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Refresh current user (only for guest updates)
    const refreshUser = () => {
        if (currentUser && !currentUser.isGuest) return; // Don't overwrite Firebase user
        setCurrentUser(getCurrentUser());
    };

    // Filter setups
    const getFilteredSetups = () => {
        return setups.filter(setup => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    setup.title.toLowerCase().includes(searchLower) ||
                    setup.caption.toLowerCase().includes(searchLower) ||
                    setup.tags.some(tag => tag.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }

            const categoryFilters = ['colorTone', 'budget', 'gender', 'purpose', 'size'];
            for (const category of categoryFilters) {
                if (filters[category].length > 0) {
                    if (!filters[category].includes(setup.filters[category])) {
                        return false;
                    }
                }
            }
            return true;
        });
    };

    // Toggle like
    const toggleLike = async (setupId) => {
        // Require logged-in user for Liking (same as Save)
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }

        const user = currentUser;
        const res = await api.toggleLike(setupId, user.id);
        if (res.success) {
            // Optimistic update or reload
            setSetups(prev => prev.map(s =>
                s.id === setupId ? { ...s, likes: res.likes } : s
            ));
        }
    };

    // Toggle save
    const toggleSave = async (setupId) => {
        // Strictly require logged-in user for Saving
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }

        const user = currentUser;
        const res = await api.toggleSave(setupId, user.id);
        if (res.success) {
            setSetups(prev => prev.map(s =>
                s.id === setupId ? { ...s, saves: res.saves } : s
            ));
        }
    };

    // Get user's saved setups
    const getSavedSetups = () => {
        const user = currentUser || getCurrentUser();
        if (!user) return [];
        return setups.filter(setup => {
            const saves = setup.saves || [];
            // Check formatted save object { userId, timestamp } or string ID
            return saves.some(s => (s.userId === user.id || s === user.id));
        });
    };

    const logout = async () => {
        await api.logout();
        // State update handled by onAuthStateChanged
    };

    // Check if user liked/saved
    const hasUserLiked = (setupId) => {
        const user = currentUser || getCurrentUser();
        if (!user) return false;
        const setup = setups.find(s => s.id === setupId);
        if (!setup) return false;
        const likes = setup.likes || [];
        return likes.some(l => (l.userId === user.id || l === user.id));
    };

    const hasUserSaved = (setupId) => {
        const user = currentUser || getCurrentUser();
        if (!user) return false;
        const setup = setups.find(s => s.id === setupId);
        if (!setup) return false;
        const saves = setup.saves || [];
        return saves.some(s => (s.userId === user.id || s === user.id));
    };

    // Add comment - handles both formats:
    // 1. addComment(setupId, commentText) - string format from SetupDetailModal
    // 2. addComment(setupId, {text, author, userId, avatar}) - object format from SetupDetailPage
    const addComment = async (setupId, commentData) => {
        const user = currentUser || getCurrentUser();

        // Ensure avatar has a fallback - Firebase doesn't accept undefined values
        const defaultAvatar = user.photoURL || user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`;

        let comment;

        // Check if commentData is an object or a string
        if (typeof commentData === 'object' && commentData !== null) {
            // Object format from SetupDetailPage
            comment = {
                text: commentData.text,
                author: commentData.author || user.displayName,
                avatar: commentData.avatar || defaultAvatar,
                userId: commentData.userId || user.id
            };
        } else {
            // String format from SetupDetailModal
            comment = {
                text: commentData,
                author: user.displayName,
                avatar: defaultAvatar,
                userId: user.id
            };
        }

        const newComment = await api.addComment(setupId, comment);

        // Update local state
        setAllComments(prev => ({
            ...prev,
            [setupId]: [...(prev[setupId] || []), newComment]
        }));

        setSetups(prev => prev.map(s =>
            s.id === setupId ? { ...s, comments: (s.comments || 0) + 1 } : s
        ));
    };

    // Get comments for setup - returns cached comments
    const getComments = (setupId) => {
        return allComments[setupId] || [];
    };

    // Fetch comments from Firestore for a specific setup
    const fetchCommentsForSetup = async (setupId) => {
        try {
            const comments = await api.getCommentsForSetup(setupId);
            setAllComments(prev => ({
                ...prev,
                [setupId]: comments
            }));
            return comments;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    };

    // Newsletter subscription
    const subscribeNewsletter = async (data) => {
        // Handle object passed from Modal
        const payload = {
            email: data.email,
            name: data.name || 'Khách'
        };
        const res = await api.subscribeNewsletter(payload);
        return res;
    };

    // Add blog (admin only)
    const addBlog = async (blogData) => {
        console.log('🟢 AppContext.addBlog called');

        // Use state currentUser which contains Firestore role
        if (currentUser?.role !== 'admin') {
            console.warn('⚠️ Non-admin user attempted to add blog');
            return { success: false, message: 'Chỉ Admin mới có thể viết blog!' };
        }

        const user = currentUser;

        // Ensure ALL fields are defined (Firebase hates undefined)
        const authorName = user.displayName || user.email || 'Admin';
        const authorAvatar = user.photoURL || user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

        const blogToSave = {
            ...blogData,
            author: {
                name: authorName,
                avatar: authorAvatar
            }
        };

        console.log('🟢 Blog data prepared:', blogToSave);

        const newBlog = await api.addBlog(blogToSave);
        setBlogs([newBlog, ...blogs]);
        return { success: true, blog: newBlog };
    };

    // Update blog
    const updateBlog = async (blogId, blogData) => {
        // Use state currentUser
        if (currentUser?.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể chỉnh sửa blog!' };
        }

        const res = await api.updateBlog(blogId, blogData);
        if (res.success) {
            setBlogs(prev => prev.map(b =>
                b.id === blogId ? res.blog : b
            ));
            return { success: true, blog: res.blog };
        }
        return { success: false, message: 'Cập nhật thất bại' };
    };

    // Delete blog
    const deleteBlog = async (blogId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể xóa blog!' };
        }

        const res = await api.deleteBlog(blogId);
        if (res.success) {
            setBlogs(prev => prev.filter(b => b.id !== blogId));
            return { success: true };
        }
        return { success: false, message: 'Xóa thất bại' };
    };

    // Add setup (admin only)
    const addSetup = async (setupData) => {
        console.log('🟢 AppContext.addSetup called');

        // Use state currentUser
        if (currentUser?.role !== 'admin') {
            console.warn('⚠️ Non-admin user attempted to add setup');
            return { success: false, message: 'Chỉ Admin mới có thể thêm setup!' };
        }

        const user = currentUser;
        console.log('🟢 Current user:', { id: user.id, displayName: user.displayName, role: user.role });

        // Ensure avatar has a fallback
        const authorAvatar = user.photoURL || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`;

        const setupToSave = {
            ...setupData,
            author: {
                name: user.displayName || user.email || 'Anonymous',
                avatar: authorAvatar
            }
        };

        console.log('🟢 Calling api.addSetup with setupToSave:', setupToSave);
        const res = await api.addSetup(setupToSave);

        console.log('🟢 api.addSetup response:', res);

        if (res.success) {
            setSetups(prev => [res.setup, ...prev]);
            return { success: true, setup: res.setup };
        }
        return { success: false, message: res.message || 'Thêm setup thất bại' };
    };

    // Delete setup (admin only)
    const deleteSetup = async (setupId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể xóa setup!' };
        }

        const res = await api.deleteSetup(setupId);
        if (res.success) {
            setSetups(prev => prev.filter(s => s.id !== setupId));
            return { success: true };
        }
        return { success: false, message: 'Xóa thất bại' };
    };

    // Update setup (admin only)
    const updateSetup = async (setupId, setupData) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể sửa setup!' };
        }

        const res = await api.updateSetup(setupId, setupData);
        if (res.success) {
            setSetups(prev => prev.map(s => s.id === setupId ? res.setup : s));
            return { success: true, setup: res.setup };
        }
        return { success: false, message: 'Cập nhật thất bại' };
    };

    // Get similar setups
    const getSimilarSetups = (setupId, limit = 4) => {
        const currentSetup = setups.find(s => s.id === setupId);
        if (!currentSetup) return [];

        return setups
            .filter(s => s.id !== setupId)
            .map(setup => {
                let score = 0;
                Object.keys(currentSetup.filters).forEach(key => {
                    if (setup.filters[key] === currentSetup.filters[key]) {
                        score += 1;
                    }
                });
                const matchingTags = setup.tags.filter(tag =>
                    currentSetup.tags.includes(tag)
                ).length;
                score += matchingTags * 0.5;
                return { ...setup, similarityScore: score };
            })
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);
    };

    const refreshData = loadData;

    // Force refresh - clears ALL cache and fetches fresh data
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing all data...');
        try {
            // Clear localStorage cache
            localStorage.removeItem(CACHE_KEY_SETUPS);
            localStorage.removeItem(CACHE_KEY_BLOGS);
            localStorage.removeItem(CACHE_TIMESTAMP);
            console.log('✅ LocalStorage cache cleared');

            // Clear IndexedDB (Firestore offline cache)
            if ('indexedDB' in window) {
                const databases = await window.indexedDB.databases?.();
                if (databases) {
                    for (const dbInfo of databases) {
                        if (dbInfo.name && dbInfo.name.includes('firestore')) {
                            window.indexedDB.deleteDatabase(dbInfo.name);
                            console.log('✅ Cleared IndexedDB:', dbInfo.name);
                        }
                    }
                }
            }

            // Force fetch fresh data
            setLoading(true);
            const data = await api.getData();

            if (data.setups && data.setups.length > 0) {
                setSetups(data.setups);
                localStorage.setItem(CACHE_KEY_SETUPS, JSON.stringify(data.setups));
            }

            if (data.blogs && data.blogs.length > 0) {
                setBlogs(data.blogs);
                localStorage.setItem(CACHE_KEY_BLOGS, JSON.stringify(data.blogs));
            }

            localStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());
            console.log('✅ Fresh data loaded:', data.setups?.length, 'setups,', data.blogs?.length, 'blogs');

            return { success: true, message: 'Đã tải lại dữ liệu mới!' };
        } catch (error) {
            console.error('❌ Force refresh failed:', error);
            return { success: false, message: 'Lỗi khi tải lại dữ liệu' };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        refreshData,
        forceRefresh,
        theme,
        toggleTheme,
        setups,
        loading,
        blogs,
        currentUser,
        refreshUser,
        filters,
        setFilters,
        currentView,
        setCurrentView,
        selectedSetup,
        setSelectedSetup,
        selectedBlog,
        setSelectedBlog,
        showAuthModal,
        setShowAuthModal,
        showProfileModal,
        setShowProfileModal,
        showNewsletterModal,
        setShowNewsletterModal,
        showCollectionsModal,
        setShowCollectionsModal,
        showAddSetupModal,
        setShowAddSetupModal,
        showMobileFilter,
        setShowMobileFilter,
        getFilteredSetups,
        toggleLike,
        toggleSave,
        hasUserLiked,
        hasUserSaved,
        getSavedSetups,
        addComment,
        getComments,
        fetchCommentsForSetup,
        subscribeNewsletter,
        addBlog,
        updateBlog,
        deleteBlog,
        addSetup,
        updateSetup,
        deleteSetup,
        logout,
        getSimilarSetups,
        setBlogs
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
