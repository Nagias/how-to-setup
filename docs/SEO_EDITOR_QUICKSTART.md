# 🚀 Quick Start - SEO Editor

## Tôi Không Thấy Chỗ Điền SEO Title, Meta Description, Primary Keyword?

### ✅ Giải Pháp:

Các trường SEO nằm trong **SEO Panel** ở **sidebar bên phải** màn hình.

#### Trên Desktop (màn hình > 1200px):
- SEO Panel hiển thị ở **cột bên phải**
- Scroll xuống để xem tất cả các analyzer

#### Trên Tablet/Mobile (màn hình < 1200px):
- SEO Panel tự động **xuống dưới** phần nội dung chính
- Scroll xuống dưới cùng để thấy SEO Panel

---

## 📍 Vị Trí Các Trường Quan Trọng:

### 1. SEO Title & Meta Description
📍 **Vị trí**: SEO Panel → Tab "Meta Tags" 🏷️

**Cách điền:**
1. Tìm SEO Panel ở sidebar bên phải (hoặc scroll xuống dưới trên mobile)
2. Click vào tab **"Meta Tags"** (icon 🏷️)
3. Điền:
   - **SEO Title**: 50-60 ký tự
   - **Meta Description**: 150-155 ký tự

### 2. Primary Keyword
📍 **Vị trí**: SEO Panel → Tab "Keywords" 🔑

**Cách điền:**
1. Tìm SEO Panel
2. Click vào tab **"Keywords"** (icon 🔑)
3. Điền **Primary Keyword** (từ khóa chính)
4. (Tùy chọn) Thêm Secondary Keywords và LSI Keywords

### 3. Tiêu Đề Bài Viết (H1)
📍 **Vị trí**: Ô input lớn ở **đầu trang**, ngay dưới header

### 4. URL Slug
📍 **Vị trí**: Ngay dưới tiêu đề bài viết
- Tự động generate từ tiêu đề
- Có thể chỉnh sửa thủ công

### 5. Nội Dung
📍 **Vị trí**: TipTap Editor (ô soạn thảo lớn)
- Sử dụng toolbar để format text
- Thêm H2, H3 cho cấu trúc
- Thêm ảnh, link, table, v.v.

---

## 🎯 Checklist Nhanh:

### Bước 1: Điền thông tin cơ bản
- [ ] Tiêu đề bài viết (ô lớn ở đầu)
- [ ] URL Slug (tự động hoặc tùy chỉnh)

### Bước 2: Viết nội dung
- [ ] Viết nội dung trong TipTap Editor
- [ ] Thêm ít nhất 1 H2
- [ ] Thêm ảnh (nếu có) với Alt text

### Bước 3: SEO Panel - Tab "Meta Tags" 🏷️
- [ ] SEO Title (50-60 ký tự)
- [ ] Meta Description (150-155 ký tự)

### Bước 4: SEO Panel - Tab "Keywords" 🔑
- [ ] Primary Keyword

### Bước 5: Kiểm tra
- [ ] Xem **Pre-Publish Checklist** (cuối sidebar)
- [ ] Sửa các lỗi còn lại
- [ ] Click "Đăng Bài"

---

## ❓ FAQ

**Q: Tại sao "Độ dài nội dung" luôn hiển thị "0 từ"?**

A: Điều này xảy ra khi:
1. Bạn chưa viết nội dung trong TipTap Editor
2. Hoặc content chưa được save (đợi 1-2 giây sau khi gõ)

**Giải pháp**: Viết nội dung trong editor, đợi vài giây, số từ sẽ tự động cập nhật.

---

**Q: Tại sao text không tự động xuống dòng mà ô nhập liệu dài ra?**

A: Bug này đã được fix. Hãy:
1. Refresh trang (Ctrl + F5)
2. Hoặc đợi deployment mới (đã push fix)

---

**Q: Tôi không thấy SEO Panel?**

A: 
- **Desktop**: Scroll lên/xuống ở sidebar bên phải
- **Mobile**: Scroll xuống dưới cùng trang, SEO Panel ở dưới phần nội dung

---

**Q: Làm sao biết đã điền đủ để đăng bài?**

A: Xem **Pre-Publish Checklist** ở cuối sidebar:
- ✅ = Hoàn thành
- ❌ = Còn thiếu (có badge "BẮT BUỘC" màu cam)
- ⚠️ = Khuyến nghị (không bắt buộc)

Nút "Đăng Bài" chỉ active khi tất cả mục BẮT BUỘC đã hoàn thành.

---

## 📱 Layout Responsive

### Desktop (> 1200px)
```
┌─────────────────────────────────────────────────┐
│ Header (Quay lại | Lưu Nháp | Đăng Bài)        │
├─────────────────────────┬───────────────────────┤
│ Editor Main             │ SEO Panel (Sidebar)   │
│ - Tiêu đề               │ - Meta Tags Tab       │
│ - Slug                  │ - Keywords Tab        │
│ - TipTap Editor         │ - Social Tab          │
│ - Cover Image           │ - Intent Tab          │
│ - Excerpt               │ - Keyword Analyzer    │
│ - Category & Tags       │ - Readability Checker │
│                         │ - Publish Checklist   │
└─────────────────────────┴───────────────────────┘
```

### Mobile (< 1200px)
```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├─────────────────────────────────────────────────┤
│ Editor Main                                     │
│ - Tiêu đề                                       │
│ - Slug                                          │
│ - TipTap Editor                                 │
│ - Cover Image                                   │
│ - Excerpt                                       │
│ - Category & Tags                               │
├─────────────────────────────────────────────────┤
│ SEO Panel (Ở dưới)                              │
│ - Meta Tags Tab                                 │
│ - Keywords Tab                                  │
│ - Social Tab                                    │
│ - Intent Tab                                    │
│ - Keyword Analyzer                              │
│ - Readability Checker                           │
│ - Publish Checklist                             │
└─────────────────────────────────────────────────┘
```

---

**Version**: 1.0.1  
**Last Updated**: 2026-01-14
