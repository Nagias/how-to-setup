import React, { useState } from 'react';
import { uploadToCloudinary } from '../../config/cloudinary';
import './CloudinaryUpload.css';

const CloudinaryUpload = ({ onUploadSuccess, folder = 'desk-setups', multiple = false }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            if (multiple) {
                // Upload multiple files
                const uploadPromises = files.map((file, index) => {
                    return uploadToCloudinary(file, folder).then((result) => {
                        setProgress(((index + 1) / files.length) * 100);
                        return result;
                    });
                });

                const results = await Promise.all(uploadPromises);
                onUploadSuccess(results);
            } else {
                // Upload single file
                const file = files[0];

                // Show preview
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);

                const result = await uploadToCloudinary(file, folder);
                setProgress(100);
                onUploadSuccess(result);
            }
        } catch (err) {
            setError(err.message || 'Upload failed');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="cloudinary-upload">
            <div className="upload-area">
                <input
                    type="file"
                    id="cloudinary-file-input"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
                <label htmlFor="cloudinary-file-input" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                    {uploading ? (
                        <div className="upload-progress">
                            <div className="spinner"></div>
                            <p>Đang tải lên... {Math.round(progress)}%</p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {preview ? (
                                <img src={preview} alt="Preview" className="upload-preview" />
                            ) : (
                                <>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <p>Click để chọn ảnh hoặc kéo thả vào đây</p>
                                    <span className="upload-hint">
                                        {multiple ? 'Hỗ trợ nhiều ảnh' : 'PNG, JPG, GIF tối đa 10MB'}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="upload-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};

export default CloudinaryUpload;
