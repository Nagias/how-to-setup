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

// Check if user is admin (Legacy/Local only)
// export const isAdmin = ... (Removed)

// Login/Register/Logout/InitAdmin (Removed - superseded by Firebase)

