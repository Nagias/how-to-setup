import React, { useState, useRef, useEffect } from 'react';
import './AvatarCropper.css';

const AvatarCropper = ({ imageSrc, onCancel, onCropComplete }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // Xử lý bắt đầu kéo
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
    };

    // Xử lý khi đang kéo
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    // Xử lý thả chuột UI 
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Xử lý touch cho mobile
    const handleTouchStart = (e) => {
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
            x: touch.clientX - offset.x,
            y: touch.clientY - offset.y
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setOffset({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    // Hàm thực hiện crop ảnh
    const handleCrop = async () => {
        const canvas = document.createElement('canvas'); // Tạo canvas ảo
        const ctx = canvas.getContext('2d');
        const image = imageRef.current;
        const container = containerRef.current;

        // Kích thước mong muốn cho avatar (vuông)
        const size = 400;
        canvas.width = size;
        canvas.height = size;

        // Tính toán tỷ lệ vẽ
        // Container là khung nhìn (ví dụ 300x300)
        // Image đang được scale và translate trong container

        const containerRect = container.getBoundingClientRect();
        // Vùng crop nằm giữa container (ví dụ 200x200 ở giữa)
        // Ta giả định vùng crop là hình tròn/vuông ở chính giữa container

        // Vị trí tâm container
        const cx = containerRect.width / 2;
        const cy = containerRect.height / 2;

        // Vị trí ảnh hiện tại (tương đối với tâm container)
        // offset.x, offset.y là vị trí của tâm ảnh so với tâm container (do transform translate)

        // Vẽ ảnh lên canvas
        // Ta cần map từ toạ độ màn hình vào toạ độ ảnh gốc

        // 1. Xoá canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // 2. Tính toán
        // Ảnh gốc có kích thước: image.naturalWidth, image.naturalHeight
        // Ảnh hiển thị có kích thước: image.width * zoom, image.height * zoom

        // Tỷ lệ giữa ảnh hiển thị và ảnh gốc
        const displayWidth = image.naturalWidth * (containerRect.width / image.naturalWidth) * zoom; // fit width logic if needed, but lets simplify
        // Giả sử ảnh được render với width = 100% container (ban đầu) hoặc object-fit logic.
        // Để chính xác, ta dùng kích thước render thực tế:
        const currentImageRect = image.getBoundingClientRect();

        // Tỉ lệ scale thực tế của ảnh so với ảnh gốc
        const scaleX = image.naturalWidth / currentImageRect.width;
        const scaleY = image.naturalHeight / currentImageRect.height;

        // Vùng crop trên màn hình (chính giữa container, kích thước ví dụ 250px)
        const CROP_SIZE = 250; // Phải khớp với CSS .crop-area
        const cropRect = {
            left: containerRect.left + (containerRect.width - CROP_SIZE) / 2,
            top: containerRect.top + (containerRect.height - CROP_SIZE) / 2,
            width: CROP_SIZE,
            height: CROP_SIZE
        };

        // Tính toạ độ ảnh nguồn cần lấy
        // sX = (cropRect.left - currentImageRect.left) * scaleX
        const sX = (cropRect.left - currentImageRect.left) * scaleX;
        const sY = (cropRect.top - currentImageRect.top) * scaleY;
        const sW = CROP_SIZE * scaleX;
        const sH = CROP_SIZE * scaleY;

        // Vẽ
        ctx.drawImage(
            image,
            sX, sY, sW, sH, // Source
            0, 0, size, size // Destination
        );

        // Xuất ra blob
        canvas.toBlob((blob) => {
            onCropComplete(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="cropper-overlay">
            <div className="cropper-container">
                <div className="cropper-header">
                    <h3>Chỉnh sửa ảnh đại diện</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div
                    className="cropper-workspace"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                >
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="Crop target"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        draggable={false}
                    />
                    <div className="crop-mask"></div>
                    <div className="crop-area"></div>
                </div>

                <div className="cropper-controls">
                    <span className="icon-small">−</span>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="zoom-slider"
                    />
                    <span className="icon-large">+</span>
                </div>

                <div className="cropper-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleCrop}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarCropper;
