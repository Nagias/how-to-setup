// Cloudinary Configuration
// Để sử dụng Cloudinary, bạn cần:
// 1. Tạo tài khoản tại https://cloudinary.com
// 2. Lấy Cloud Name, API Key từ Dashboard
// 3. Tạo Upload Preset (Settings > Upload > Upload presets)
// 4. Thêm các biến môi trường vào file .env

export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'desk-setups') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);
    formData.append('cloud_name', cloudinaryConfig.cloudName);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (publicId, options = {}) => {
    const {
        width = 'auto',
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity = 'auto',
    } = options;

    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/w_${width},q_${quality},f_${format},c_${crop},g_${gravity}/${publicId}`;
};

// Delete image from Cloudinary (requires backend API)
export const deleteFromCloudinary = async (publicId) => {
    // Note: Deletion requires authentication and should be done from backend
    // This is a placeholder for future backend integration
    console.warn('Image deletion should be handled by backend API');
    return { success: false, message: 'Backend API required for deletion' };
};
