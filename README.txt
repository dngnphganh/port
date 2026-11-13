DIGITAL PORTFOLIO – ĐỖ NGUYỄN PHƯƠNG ANH
========================================

1. CẤU TRÚC
- index.html: nội dung website
- style.css: giao diện, màu sắc, bố cục
- script.js: menu, chế độ tối, tiến trình đọc, phóng to ảnh
- images/: nơi đặt ảnh của bạn
- documents/: nơi đặt PDF bài tập

2. THAY ẢNH
Đặt ảnh trong thư mục images và dùng đúng tên:
- cover.jpg
- avatar.jpg
- bai1.jpg ... bai6.jpg

Website hiện có các khung placeholder được thiết kế sẵn. Để thay khung bằng ảnh:
- Mở index.html trên GitHub, bấm biểu tượng bút chì (Edit).
- Tìm khung "YOUR PHOTO" hoặc "ẢNH MINH CHỨNG 01".
- Thay phần div placeholder tương ứng bằng:
  <img src="images/avatar.jpg" alt="Ảnh giới thiệu">
  hoặc:
  <img src="images/bai1.jpg" alt="Minh chứng bài 1">
- Với ảnh chân dung, đặt img trong .about-photo.
- Với ảnh minh chứng, đặt img trong .evidence-placeholder.
- Lưu thay đổi (Commit changes).

3. THÊM PDF
Tải file PDF vào documents với tên:
bai1.pdf, bai2.pdf, ... bai6.pdf
Nếu chưa có PDF, nút sẽ dẫn đến đường dẫn chưa tồn tại. Có thể sửa hoặc xóa nút file-link tương ứng.

4. SỬA NỘI DUNG
Trong index.html, tìm các đoạn nằm trong dấu [ ... ] rồi thay bằng nội dung bài làm thực tế.
Không giữ nguyên phần hướng dẫn trong ngoặc vuông khi nộp.

5. ĐƯA LÊN GITHUB PAGES
- Đăng nhập https://github.com
- Tạo repository mới tên: TEN-TAI-KHOAN.github.io (thay TEN-TAI-KHOAN bằng username GitHub của bạn)
- Chọn Public và tạo repository.
- Chọn Add file > Upload files.
- Tải index.html, style.css, script.js cùng thư mục images và documents lên.
- Nhấn Commit changes.
- Vào Settings > Pages.
- Ở Build and deployment, chọn Deploy from a branch.
- Chọn Branch: main và Folder: /(root), nhấn Save.
- Chờ GitHub triển khai, website có địa chỉ https://TEN-TAI-KHOAN.github.io

LƯU Ý
- Không đổi tên file nếu chưa sửa đường dẫn tương ứng trong index.html.
- Tên file phân biệt chữ hoa/chữ thường.
- Nội dung hiện là khung portfolio; cần bổ sung sản phẩm và ảnh thật trước khi nộp.
- Website tải font từ Google Fonts; nếu không có mạng, font sẽ chuyển về font dự phòng.
