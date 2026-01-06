import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/ipUtils'; // Keep for legacy or remove later
import { api, ADMIN_EMAILS } from '../utils/api';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { sampleSetups, sampleBlogs } from '../data/sampleData';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    // Initialize with sample data immediately so something always shows
    const [setups, setSetups] = useState(sampleSetups);
    const [blogs, setBlogs] = useState(sampleBlogs);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);

        // ALWAYS start with sample data to ensure something is shown
        setSetups(sampleSetups);
        setBlogs(sampleBlogs);

        try {
            const data = await api.getData();
            // Only replace if we got real data from Firestore
            if (data.setups && data.setups.length > 0) {
                console.log("Loaded", data.setups.length, "setups from Firestore");
                setSetups(data.setups);
            } else {
                console.log("No setups from Firestore, keeping sample data");
            }

            if (data.blogs && data.blogs.length > 0) {
                setBlogs(data.blogs);
            }

            setAllComments(data.comments || {});
        } catch (error) {
            console.error("Error loading data, using sample data:", error);
            // Already set to sample data above
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

    // Refresh current user
    const refreshUser = () => {
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
        const user = getCurrentUser();
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
        const user = getCurrentUser();
        const res = await api.toggleSave(setupId, user.id);
        if (res.success) {
            setSetups(prev => prev.map(s =>
                s.id === setupId ? { ...s, saves: res.saves } : s
            ));
        }
    };

    // Get user's saved setups
    const getSavedSetups = () => {
        const user = getCurrentUser();
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
        const user = getCurrentUser();
        if (!user) return false;
        const setup = setups.find(s => s.id === setupId);
        if (!setup) return false;
        const likes = setup.likes || [];
        return likes.some(l => (l.userId === user.id || l === user.id));
    };

    const hasUserSaved = (setupId) => {
        const user = getCurrentUser();
        if (!user) return false;
        const setup = setups.find(s => s.id === setupId);
        if (!setup) return false;
        const saves = setup.saves || [];
        return saves.some(s => (s.userId === user.id || s === user.id));
    };

    // Add comment
    const addComment = async (setupId, commentText, authorName) => {
        const user = getCurrentUser();
        const comment = {
            text: commentText,
            author: authorName || user.displayName,
            avatar: user.avatar,
            userId: user.id
        };

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

    // Get comments for setup
    const getComments = (setupId) => {
        return allComments[setupId] || [];
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
        const user = getCurrentUser();
        if (user.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể viết blog!' };
        }

        const blogToSave = {
            ...blogData,
            author: { name: user.displayName, avatar: user.avatar }
        };

        const newBlog = await api.addBlog(blogToSave);
        setBlogs([newBlog, ...blogs]);
        return { success: true, blog: newBlog };
    };

    // Update blog
    const updateBlog = async (blogId, blogData) => {
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
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
        const user = getCurrentUser();
        if (user.role !== 'admin') {
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
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có thể thêm setup!' };
        }

        const setupToSave = {
            ...setupData,
            author: { name: user.displayName, avatar: user.avatar }
        };

        const res = await api.addSetup(setupToSave);
        if (res.success) {
            setSetups(prev => [res.setup, ...prev]);
            return { success: true, setup: res.setup };
        }
        return { success: false, message: 'Thêm setup thất bại' };
    };

    // Delete setup (admin only)
    const deleteSetup = async (setupId) => {
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
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
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
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

    const value = {
        refreshData,
        theme,
        toggleTheme,
        setups,
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
        getFilteredSetups,
        toggleLike,
        toggleSave,
        hasUserLiked,
        hasUserSaved,
        getSavedSetups,
        addComment,
        getComments,
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
