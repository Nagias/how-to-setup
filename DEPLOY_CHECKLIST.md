# ✅ Checklist Deploy DeskHub

## Thông tin cần chuẩn bị:
- [ ] Tên miền của bạn: ________________
- [ ] Tài khoản GitHub username: ________________
- [ ] Tên repository muốn tạo: ________________

## Các bước thực hiện:

### 1️⃣ Cập nhật file CNAME
- [ ] Mở file `public/CNAME`
- [ ] Thay `your-domain.com` bằng tên miền thực của bạn
- [ ] Lưu file

### 2️⃣ Tạo GitHub Repository
- [ ] Truy cập https://github.com/new
- [ ] Tạo repository mới
- [ ] KHÔNG tick "Initialize with README"
- [ ] Click "Create repository"

### 3️⃣ Push code lên GitHub
Chạy các lệnh sau trong terminal:

```bash
git init
git add .
git commit -m "Initial commit - DeskHub"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 4️⃣ Cấu hình GitHub Pages
- [ ] Vào repository > Settings > Pages
- [ ] Source: chọn "GitHub Actions"
- [ ] Custom domain: nhập tên miền của bạn
- [ ] Click Save

### 5️⃣ Cấu hình DNS tại nhà cung cấp tên miền
Thêm các bản ghi A records:
- [ ] A record: @ → 185.199.108.153
- [ ] A record: @ → 185.199.109.153
- [ ] A record: @ → 185.199.110.153
- [ ] A record: @ → 185.199.111.153
- [ ] CNAME record: www → YOUR_USERNAME.github.io

### 6️⃣ Chờ deployment hoàn thành
- [ ] Kiểm tra tab Actions trên GitHub
- [ ] Đợi workflow chạy xong (màu xanh ✅)
- [ ] Truy cập website tại tên miền của bạn

### 7️⃣ Kiểm tra website
- [ ] Website hiển thị đúng
- [ ] HTTPS hoạt động
- [ ] Tất cả tính năng hoạt động bình thường

## ⚠️ Lưu ý:
- DNS có thể mất 24-48 giờ để propagate
- HTTPS sẽ được tự động cấu hình sau vài phút
- Mỗi lần push code mới, GitHub Actions sẽ tự động deploy

## 🆘 Cần trợ giúp?
Xem file DEPLOYMENT.md để biết hướng dẫn chi tiết và troubleshooting.
