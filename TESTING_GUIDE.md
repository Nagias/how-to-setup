# HƯỚNG DẪN TEST DESKHUB - UPDATE (Video & SEO)

## 🎥 1. TEST VIDEO THUMBNAIL (MỚI)
Tính năng mới: Setup Card có thể hiển thị Video thumbnail và tự phát khi rê chuột vào.

1. **Chuẩn bị Dữ liệu**:
   - Do dữ liệu được lưu trong trình duyệt (Local Storage), để thấy Setup mới có video, bạn cần làm mới dữ liệu.
   - **Cách 1**: Mở Console (F12) -> Gõ `localStorage.removeItem('deskhub_setups')` -> Enter -> F5 lại trang. (Lưu ý: Mất các setup cũ bạn đã tạo thêm).
   - **Cách 2**: Chờ phiên làm việc mới (hoặc mở Tab ẩn danh).

2. **Kiểm tra**:
   - Tìm thẻ Setup Card đầu tiên ("Góc Làm Việc Tối Giản").
   - **Rê chuột vào ảnh**: Video sẽ bắt đầu phát.
   - **Rê chuột ra**: Video dừng và reset.
   - Click vào Setup -> Vẫn mở Modal chi tiết như bình thường.

## 🔍 2. KIỂM TRA SEO TITLE
Nếu bạn chưa thấy Tiêu đề tab thay đổi:
1. Hãy chắc chắn bạn đã refresh trang (F5) sau khi cập nhật code.
2. Thử click vào một bài Blog -> Nhìn lên Tab trình duyệt.
   - Tiêu đề sẽ đổi từ "DeskHub..." thành tên bài Blog.
3. Nếu vẫn chưa thấy, có thể do trình duyệt cache (Lưu ý: Title thay đổi bằng JavaScript nên View Source sẽ vẫn thấy title gốc, nhưng Google Bot hiện đại vẫn đọc được).

## 👑 3. CÁC TÍNH NĂNG KHÁC
- [x] Admin Dashboard (Menu -> Dashboard).
- [x] Blog Editor & File Upload.
- [x] Like/Save realtime.
