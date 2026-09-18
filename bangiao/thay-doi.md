# SỔ BÀN GIAO — THAY ĐỔI CỦA CODER

- **Lượt thực hiện:** 2
- **Thời gian:** 18/09/2026 (20:35)
- **Vai trò:** CODER (Người viết code)
- **Nhiệm vụ:** Hoàn thiện Bước 1 (kho lưu tạm, đẩy B2 xóa đúng file, giữ file còn lại, nút xóa chủ động), theo dõi biến động giá bán sản phẩm qua các thời kỳ, và chuẩn hóa giao diện Google System.

---

## 1. Danh sách file đã chỉnh sửa (Lượt 2)

### 1. `buoc1_upload.html` [HOÀN THIỆN BƯỚC 1 & BIẾN ĐỘNG GIÁ]
- **Bộ nhớ lưu tạm độc lập:**
  * Mỗi file Excel nạp vào được cấp một ID riêng và lưu vào danh sách kho tạm `danhSachFileDaNap` (đồng bộ LocalStorage và Supabase `file_kiot_tam`).
  * Khi chọn 1 file và bấm **"Tiếp tục sang Bước 2" (`chuyenSangBuoc2`)**:
    + Chỉ xóa đúng file được chọn khỏi `file_kiot_tam` và `localStorage`.
    + Các file khác chưa đẩy **vẫn nằm nguyên 100%** trong kho tạm của Bước 1.
  * Giữ nguyên nút xóa chủ động `🗑️ Xóa` ở từng dòng file và nút `🗑️ Xóa kho tạm` toàn bộ để nhân viên xử lý khi nạp nhầm file.
- **Theo dõi biến động giá bán tự động (`tuDongDongBoDanhMuc`):**
  * Đọc danh mục hàng hóa hiện có: Khi quét dòng hàng từ file KiotViet, nếu phát hiện đơn giá `donGia > 0` và khác với giá bán hiện tại `gia_ban`:
    + Tự động cập nhật `gia_ban` mới nhất.
    + Thêm bản ghi biến động vào mảng `lich_su_gia`: ngày giờ, giá cũ, giá mới, chênh lệch (+/- VNĐ), mã HĐ.
    + Cập nhật đồng thời vào LocalStorage và bảng `hang_hoa` trên Supabase.
  * Hiển thị thanh cảnh báo Google Chip `#chipBienDongGia`: *"Phát hiện X mặt hàng có biến động giá bán [Xem chi tiết]"*.
  * Modal `#modalBienDongGia` phong cách Google Material để nhân viên kế toán xem chi tiết các mặt hàng vừa đổi giá.

### 2. `layout.css` [CHUẨN HÓA TOÀN DIỆN PHONG CÁCH GOOGLE SYSTEM]
- **Bảng màu & Design Tokens Google Material:**
  * Nền: Google Gray `#f8f9fa`, mặt thẻ `#ffffff`.
  * Đường viền: Google Border `#dadce0`, đường kẻ phụ `#f1f3f4`.
  * Màu xanh thương hiệu Thái Mỹ Hương: Google Sheets Green `#137333`, hover `#0d652d`, soft `#e6f4ea`.
  * Màu chữ Google: Tiêu đề `#202124`, thân văn bản `#3c4043`, chú thích phụ `#5f6368`.
- **Form controls chuẩn Google Workspace:**
  * Định nghĩa chuẩn `.form-group`, `.form-label` (chữ xám đậm, font-weight 600, khoảng cách 5px).
  * Định nghĩa chuẩn `.form-control`: Chiều cao 38px, viền mảnh `#dadce0`, bo góc `4px`, focus viền xanh Google `#1a73e8` với bóng nhẹ 2px, readonly màu xám nhạt `#f1f3f4`.
- **Modal Dialog chuẩn Google:**
  * `.tmh-modal-box`: Viền mảnh `#dadce0`, bo góc 8px, đổ bóng êm dịu `0 8px 24px rgba(60,64,67,0.15)`.
  * Nút đóng tròn dạng Google close button (hover nền xám `#f1f3f4`).
  * Hệ thống lưới `.modal-form-grid`: 2 cột cân đối, các trường dài (tên hàng, tên khách, địa chỉ, ghi chú) tự động trải rộng 2 cột (`col-span-2`), các trường ngắn (mã, đơn vị tính, quy cách, giá bán) chia đôi đều tăm tắp.

### 3. `danh_muc.html` [MODAL GOOGLE SYSTEM & LỊCH SỬ BIẾN ĐỘNG GIÁ]
- **Khắc phục triệt để lỗi giao diện modal cũ:**
  * Modal "Chỉnh Sửa — Hàng hoá" (ảnh chụp của khách) được chuyển sang cấu trúc `.modal-form-grid` 2 cột của Google System: nhãn và ô input xếp dọc ngay ngắn, độ rộng 100%, không còn bị lệch hay co dúm.
- **Hiển thị lịch sử biến động giá của sản phẩm:**
  * Trong modal chỉnh sửa hàng hóa: Bổ sung bảng "Lịch sử biến động giá bán (X mốc giá)" liệt kê chi tiết từng lần thay đổi giá qua các hóa đơn KiotViet hoặc chỉnh sửa thủ công.
  * Trên bảng danh mục Hàng hóa chính: Hiển thị badge xanh `📈 X mốc giá` ngay cạnh giá bán để nhân viên bấm vào xem nhanh.
  * Khi nhân viên chỉnh sửa giá bán thủ công trong danh mục, hệ thống cũng tự động ghi nhận một mốc lịch sử giá mới.

---

## 2. Cam kết kỹ thuật & Nghiệp vụ
- Giữ nguyên 100% thuật toán tách thùng hộp chẵn/lẻ, chiết khấu khuyến mãi, tách VAT 8%/10%, định khoản tài khoản nợ có MISA.
- Không sửa trang đăng nhập `index.html`.
- Dữ liệu lưu tạm và đồng bộ Supabase tuân thủ đúng cơ chế phi đồng bộ `async/await`.

---

## 3. Trạng thái bàn giao
- **Trạng thái:** HOÀN TẤT. Chuyển sang TESTER nghiệm thu chi tiết các kịch bản.
