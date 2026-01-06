// Utility functions for IP-based user identification

// Generate a unique device fingerprint based on browser characteristics
export const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvasFingerprint: canvas.toDataURL(),
        colorDepth: screen.colorDepth,
        deviceMemory: navigator.deviceMemory || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };

    // Create a hash from the fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return `guest_${Math.abs(hash).toString(36)}`;
};

// Get or create guest user ID
export const getGuestUserId = () => {
    let guestId = localStorage.getItem('deskhub_guest_id');

    if (!guestId) {
        guestId = generateDeviceFingerprint();
        localStorage.setItem('deskhub_guest_id', guestId);
    }

    return guestId;
};

// Get current user (logged in or guest)
export const getCurrentUser = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('deskhub_current_user') || 'null');

    if (loggedInUser) {
        return {
            id: loggedInUser.id,
            username: loggedInUser.username,
            displayName: loggedInUser.displayName,
            avatar: loggedInUser.avatar,
            role: loggedInUser.role,
            isGuest: false
        };
    }

    // Guest user
    const guestId = getGuestUserId();
    const guestName = localStorage.getItem('deskhub_guest_name') || 'Khách';
    const guestAvatar = localStorage.getItem('deskhub_guest_avatar') || 'https://i.pravatar.cc/150?img=0';

    return {
        id: guestId,
        username: guestId,
        displayName: guestName,
        avatar: guestAvatar,
        role: 'guest',
        isGuest: true
    };
};

// Update guest profile
export const updateGuestProfile = (name, avatar) => {
    localStorage.setItem('deskhub_guest_name', name);
    if (avatar) {
        localStorage.setItem('deskhub_guest_avatar', avatar);
    }
};

// Check if user is admin
export const isAdmin = () => {
    const user = getCurrentUser();
    return user.role === 'admin';
};

// Login user
export const loginUser = (username, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('deskhub_users') || '[]');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const userSession = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            role: user.role
        };
        localStorage.setItem('deskhub_current_user', JSON.stringify(userSession));
        return { success: true, user: userSession };
    }

    return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
};

// Register user
export const registerUser = (username, password, displayName) => {
    const users = JSON.parse(localStorage.getItem('deskhub_users') || '[]');

    // Check if username exists
    if (users.find(u => u.username === username)) {
        return { success: false, error: 'Tên đăng nhập đã tồn tại' };
    }

    const newUser = {
        id: `user_${Date.now()}`,
        username,
        password, // In production, this should be hashed
        displayName: displayName || username,
        avatar: `https://i.pravatar.cc/150?img=${users.length + 1}`,
        role: 'user',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('deskhub_users', JSON.stringify(users));

    // Auto login
    const userSession = {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        role: newUser.role
    };
    localStorage.setItem('deskhub_current_user', JSON.stringify(userSession));

    return { success: true, user: userSession };
};

// Logout
export const logoutUser = () => {
    localStorage.removeItem('deskhub_current_user');
};

// Initialize admin account
export const initializeAdmin = () => {
    const users = JSON.parse(localStorage.getItem('deskhub_users') || '[]');

    if (!users.find(u => u.role === 'admin')) {
        const adminUser = {
            id: 'admin_001',
            username: 'admin',
            password: 'admin123', // Change this in production!
            displayName: 'Admin',
            avatar: 'https://i.pravatar.cc/150?img=10',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        localStorage.setItem('deskhub_users', JSON.stringify(users));
    }
};
