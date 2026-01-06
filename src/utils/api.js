
const API_URL = 'http://localhost:5000/api';

export const api = {
    // Fetch all initial data
    getData: async () => {
        try {
            const res = await fetch(`${API_URL}/data`);
            return await res.json();
        } catch (error) {
            console.error("API Error:", error);
            return null; // Fallback handled in provider
        }
    },

    // Auth
    login: async (username, password) => {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    register: async (user) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return res.json();
    },

    // Interactions
    toggleLike: async (setupId, userId) => {
        const res = await fetch(`${API_URL}/setups/${setupId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        return res.json();
    },

    toggleSave: async (setupId, userId) => {
        const res = await fetch(`${API_URL}/setups/${setupId}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        return res.json();
    },

    addComment: async (setupId, comment) => {
        const res = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setupId, comment })
        });
        return res.json();
    },

    addBlog: async (blog) => {
        const res = await fetch(`${API_URL}/blogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blog)
        });
        return res.json();
    },

    subscribeNewsletter: async (sub) => {
        const res = await fetch(`${API_URL}/newsletter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub)
        });
        return res.json();
    },

    incrementBlogView: async (blogId) => {
        try {
            const res = await fetch(`${API_URL}/blogs/${blogId}/view`, {
                method: 'POST'
            });
            return res.json();
        } catch (error) {
            console.error("Failed to increment view", error);
            return { success: false };
        }
    },

    deleteBlog: async (blogId) => {
        const res = await fetch(`${API_URL}/blogs/${blogId}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    updateBlog: async (blogId, updates) => {
        const res = await fetch(`${API_URL}/blogs/${blogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    }
};
