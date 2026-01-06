# Hướng Dẫn Deploy DeskHub lên GitHub Pages

## Bước 1: Tạo Repository trên GitHub

1. Truy cập https://github.com/new
2. Tạo repository mới với tên bạn muốn (ví dụ: `deskhub`)
3. **KHÔNG** chọn "Initialize this repository with a README"
4. Click "Create repository"

## Bước 2: Khởi tạo Git và Push code lên GitHub

Mở terminal trong thư mục dự án và chạy các lệnh sau:

```bash
# Khởi tạo git repository (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - DeskHub website"

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO bằng thông tin của bạn)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Đổi tên branch thành main (nếu cần)
git branch -M main

# Push code lên GitHub
git push -u origin main
```

## Bước 3: Cấu hình GitHub Pages

### Nếu bạn SỬ DỤNG TÊN MIỀN RIÊNG:

1. Truy cập repository trên GitHub
2. Vào **Settings** > **Pages**
3. Trong phần **Source**, chọn **GitHub Actions**
4. Trong phần **Custom domain**, nhập tên miền của bạn (ví dụ: `deskhub.com`)
5. Click **Save**
6. Tạo file `CNAME` trong thư mục public:
   ```bash
   echo "your-domain.com" > public/CNAME
   ```
7. Commit và push:
   ```bash
   git add public/CNAME
   git commit -m "Add custom domain"
   git push
   ```

### Nếu bạn KHÔNG sử dụng tên miền riêng:

1. Cập nhật `vite.config.js`, thay đổi dòng `base`:
   ```javascript
   base: '/YOUR_REPO_NAME/',
   ```
2. Truy cập repository trên GitHub
3. Vào **Settings** > **Pages**
4. Trong phần **Source**, chọn **GitHub Actions**

## Bước 4: Cấu hình DNS (chỉ cho tên miền riêng)

Truy cập trang quản lý DNS của nhà cung cấp tên miền và thêm các bản ghi sau:

### Cho domain chính (ví dụ: deskhub.com):
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### Cho subdomain www (ví dụ: www.deskhub.com):
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

## Bước 5: Deploy

Sau khi hoàn thành các bước trên:

1. GitHub Actions sẽ tự động chạy khi bạn push code
2. Kiểm tra tiến trình tại tab **Actions** trên GitHub
3. Sau khi hoàn thành, website sẽ có tại:
   - Với tên miền riêng: `https://your-domain.com`
   - Không tên miền: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Deploy thủ công (tùy chọn)

Nếu muốn deploy thủ công mà không dùng GitHub Actions:

```bash
# Cài đặt dependencies
npm install

# Deploy
npm run deploy
```

## Cập nhật website

Mỗi khi bạn muốn cập nhật website:

```bash
git add .
git commit -m "Update website"
git push
```

GitHub Actions sẽ tự động build và deploy phiên bản mới.

## Lưu ý quan trọng

1. **DNS propagation** có thể mất 24-48 giờ
2. **HTTPS** sẽ được tự động cấu hình bởi GitHub Pages
3. Đảm bảo file `CNAME` luôn có trong thư mục `public/` nếu dùng tên miền riêng
4. Kiểm tra tab **Actions** trên GitHub nếu có lỗi deployment

## Troubleshooting

### Website không hiển thị đúng:
- Kiểm tra `base` trong `vite.config.js`
- Xóa cache trình duyệt (Ctrl + Shift + R)

### GitHub Actions thất bại:
- Kiểm tra tab Actions để xem lỗi chi tiết
- Đảm bảo đã bật GitHub Pages trong Settings

### Tên miền không hoạt động:
- Kiểm tra DNS records
- Đợi DNS propagation (có thể mất 24-48 giờ)
- Kiểm tra file CNAME trong repository
