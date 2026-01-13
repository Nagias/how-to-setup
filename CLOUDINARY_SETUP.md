# Hướng dẫn Setup Cloudinary

## Bước 1: Tạo tài khoản Cloudinary (MIỄN PHÍ)

1. Truy cập: https://cloudinary.com/users/register_free
2. Đăng ký tài khoản miễn phí (Free tier: 25GB storage, 25GB bandwidth/tháng)
3. Xác nhận email

## Bước 2: Lấy thông tin cấu hình

1. Đăng nhập vào Cloudinary Dashboard: https://console.cloudinary.com/
2. Tại trang Dashboard, bạn sẽ thấy:
   - **Cloud Name**: Tên cloud của bạn (vd: `dxxxx`)
   - **API Key**: Khóa API (vd: `123456789012345`)
   - **API Secret**: Khóa bí mật (không cần cho upload từ client)

## Bước 3: Tạo Upload Preset (Quan trọng!)

Upload Preset cho phép upload từ client mà không cần API Secret.

1. Vào **Settings** (biểu tượng bánh răng) > **Upload**
2. Scroll xuống phần **Upload presets**
3. Click **Add upload preset**
4. Cấu hình:
   - **Preset name**: Đặt tên (vd: `desk_setup_uploads`)
   - **Signing Mode**: Chọn **Unsigned** (quan trọng!)
   - **Folder**: Đặt tên folder (vd: `desk-setups`)
   - **Unique filename**: Bật (để tránh trùng tên)
   - **Overwrite**: Tắt
   - **Auto tagging**: Bật nếu muốn
5. Click **Save**

## Bước 4: Cập nhật file .env

Mở file `.env` trong project và cập nhật:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_API_KEY=your-api-key-here
VITE_CLOUDINARY_UPLOAD_PRESET=desk_setup_uploads
```

**Ví dụ:**
```env
VITE_CLOUDINARY_CLOUD_NAME=dxxxx
VITE_CLOUDINARY_API_KEY=123456789012345
VITE_CLOUDINARY_UPLOAD_PRESET=desk_setup_uploads
```

## Bước 5: Sử dụng trong code

### Upload ảnh đơn giản:

```jsx
import CloudinaryUpload from './components/upload/CloudinaryUpload';

function MyComponent() {
    const handleUploadSuccess = (result) => {
        console.log('Upload thành công:', result);
        console.log('URL ảnh:', result.url);
        // Lưu result.url vào database
    };

    return (
        <CloudinaryUpload 
            onUploadSuccess={handleUploadSuccess}
            folder="desk-setups"
        />
    );
}
```

### Upload nhiều ảnh:

```jsx
<CloudinaryUpload 
    onUploadSuccess={(results) => {
        results.forEach(img => console.log(img.url));
    }}
    folder="desk-setups"
    multiple={true}
/>
```

### Tối ưu hóa ảnh khi hiển thị:

```jsx
import { getOptimizedImageUrl } from './config/cloudinary';

// Lấy URL ảnh đã tối ưu
const optimizedUrl = getOptimizedImageUrl('desk-setups/image123', {
    width: 800,
    quality: 'auto',
    format: 'auto'
});

<img src={optimizedUrl} alt="Setup" />
```

## Bước 6: Test upload

1. Chạy dev server: `npm run dev`
2. Mở component có CloudinaryUpload
3. Chọn ảnh để upload
4. Kiểm tra console để xem kết quả
5. Vào Cloudinary Dashboard > Media Library để xem ảnh đã upload

## Lưu ý quan trọng:

- ✅ **KHÔNG** commit file `.env` lên GitHub
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Upload Preset phải là **Unsigned** để upload từ client
- ✅ Free tier có giới hạn 25GB/tháng bandwidth
- ✅ Cloudinary tự động tối ưu ảnh (WebP, AVIF) khi dùng `f_auto`

## Troubleshooting:

### Lỗi "Upload preset not found"
- Kiểm tra tên preset trong `.env` có đúng không
- Đảm bảo preset đã được tạo và là **Unsigned**

### Lỗi "Invalid cloud name"
- Kiểm tra VITE_CLOUDINARY_CLOUD_NAME trong `.env`
- Restart dev server sau khi sửa `.env`

### Upload chậm
- Cloudinary có server toàn cầu, tốc độ phụ thuộc vào mạng
- Nén ảnh trước khi upload nếu file quá lớn

## Tài liệu tham khảo:

- Cloudinary Docs: https://cloudinary.com/documentation
- Upload API: https://cloudinary.com/documentation/image_upload_api_reference
- Transformations: https://cloudinary.com/documentation/image_transformations
