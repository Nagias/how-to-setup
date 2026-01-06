
import { sampleSetups, sampleBlogs } from '../data/sampleData';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get from LS
const getLS = (key, defaultVal) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
};

// Helper to set LS
const setLS = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const api = {
    // Fetch all initial data
    getData: async () => {
        await delay(500); // Simulate loading

        // Ensure data exists
        let setups = getLS('deskhub_setups', null);
        let blogs = getLS('deskhub_blogs', null);

        if (!setups) {
            setups = sampleSetups;
            setLS('deskhub_setups', setups);
        }

        if (!blogs) {
            blogs = sampleBlogs;
            setLS('deskhub_blogs', blogs);
        }

        const comments = getLS('deskhub_comments', {});

        return { setups, blogs, comments };
    },

    // Auth (Mock)
    login: async (username, password) => {
        await delay(300);
        const users = getLS('deskhub_users', []);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) throw new Error('Login failed');
        // Don't return password
        const { password: _, ...userInfo } = user;
        return userInfo;
    },

    register: async (user) => {
        await delay(300);
        const users = getLS('deskhub_users', []);
        if (users.find(u => u.username === user.username)) {
            throw new Error('Username already exists');
        }
        const newUser = {
            ...user,
            id: Date.now().toString(),
            role: 'user',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        setLS('deskhub_users', users);
        return { success: true, user: newUser };
    },

    // Interactions
    toggleLike: async (setupId, userId) => {
        const setups = getLS('deskhub_setups', []);
        const setupIndex = setups.findIndex(s => s.id === setupId);
        if (setupIndex === -1) return { success: false };

        let likes = setups[setupIndex].likes || [];
        const exists = likes.some(l => (l.userId === userId || l === userId));

        if (exists) {
            likes = likes.filter(l => (l.userId !== userId && l !== userId));
        } else {
            likes.push({ userId, timestamp: new Date().toISOString() });
        }

        setups[setupIndex].likes = likes;
        setLS('deskhub_setups', setups);
        return { success: true, likes };
    },

    toggleSave: async (setupId, userId) => {
        const setups = getLS('deskhub_setups', []);
        const setupIndex = setups.findIndex(s => s.id === setupId);
        if (setupIndex === -1) return { success: false };

        let saves = setups[setupIndex].saves || [];
        const exists = saves.some(s => (s.userId === userId || s === userId));

        if (exists) {
            saves = saves.filter(s => (s.userId !== userId && s !== userId));
        } else {
            saves.push({ userId, timestamp: new Date().toISOString() });
        }

        setups[setupIndex].saves = saves;
        setLS('deskhub_setups', setups);
        return { success: true, saves };
    },

    addComment: async (setupId, comment) => {
        const comments = getLS('deskhub_comments', {});
        if (!comments[setupId]) comments[setupId] = [];

        const newComment = {
            ...comment,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };

        comments[setupId].push(newComment);
        setLS('deskhub_comments', comments);

        // Update comment count in setup
        const setups = getLS('deskhub_setups', []);
        const setupIndex = setups.findIndex(s => s.id === setupId);
        if (setupIndex > -1) {
            setups[setupIndex].comments = (setups[setupIndex].comments || 0) + 1;
            setLS('deskhub_setups', setups);
        }

        return newComment;
    },

    // Setup Management
    addSetup: async (setupData) => {
        await delay(500);
        const setups = getLS('deskhub_setups', []);
        const newSetup = {
            ...setupData,
            id: Date.now(),
            likes: [],
            saves: [],
            comments: 0,
            createdAt: new Date().toISOString()
        };
        setups.unshift(newSetup); // Add to beginning
        setLS('deskhub_setups', setups);
        return { success: true, setup: newSetup };
    },

    // Blog Management
    addBlog: async (blog) => {
        const blogs = getLS('deskhub_blogs', []);
        const newBlog = {
            ...blog,
            id: Date.now(),
            views: 0,
            publishedAt: new Date().toISOString()
        };
        blogs.unshift(newBlog);
        setLS('deskhub_blogs', blogs);
        return newBlog;
    },

    subscribeNewsletter: async (sub) => {
        const subs = getLS('deskhub_newsletter', []);
        if (!subs.find(s => s.email === sub.email)) {
            subs.push({ ...sub, timestamp: new Date().toISOString() });
            setLS('deskhub_newsletter', subs);
        }
        return { success: true };
    },

    incrementBlogView: async (blogId) => {
        const blogs = getLS('deskhub_blogs', []);
        const index = blogs.findIndex(b => b.id === blogId);
        if (index > -1) {
            blogs[index].views = (blogs[index].views || 0) + 1;
            setLS('deskhub_blogs', blogs);
            return { success: true, views: blogs[index].views };
        }
        return { success: false };
    },

    deleteBlog: async (blogId) => {
        let blogs = getLS('deskhub_blogs', []);
        blogs = blogs.filter(b => b.id !== blogId);
        setLS('deskhub_blogs', blogs);
        return { success: true };
    },

    updateBlog: async (blogId, updates) => {
        const blogs = getLS('deskhub_blogs', []);
        const index = blogs.findIndex(b => b.id === blogId);
        if (index > -1) {
            blogs[index] = { ...blogs[index], ...updates };
            setLS('deskhub_blogs', blogs);
            return { success: true, blog: blogs[index] };
        }
        return { success: false };
    }
};
