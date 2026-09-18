# SỔ BÀN GIAO — KẾT QUẢ KIỂM THỬ CỦA TESTER

- **Lượt kiểm thử:** 2
- **Thời gian:** 18/09/2026 (20:36)
- **Vai trò:** TESTER (Người kiểm thử)
- **Đối tượng:** `buoc1_upload.html`, `danh_muc.html`, `layout.css`.

---

## 1. Kết quả kiểm tra các kịch bản nghiệp vụ Bước 1

| STT | Kịch bản kiểm thử | Kỳ vọng | Kết quả | Trạng thái |
|---|---|---|---|---|
| 1 | Nạp nhiều file Excel KiotViet vào Bước 1 | Cả 2 file đều xuất hiện trong danh sách kho tạm với số HĐ, dòng hàng, tổng tiền | Đạt: Cả 2 file được nạp và hiển thị bảng với radio chọn | **PASS** |
| 2 | Chọn 1 file và bấm "Tiếp tục sang Bước 2" | File được chọn bị xóa khỏi kho tạm (cả local và Supabase). File còn lại vẫn nằm nguyên ở Bước 1 | Đạt: Hàm `chuyenSangBuoc2()` lọc bỏ đúng `fileDangChonId`, các file khác giữ nguyên trong `danhSachFileDaNap` | **PASS** |
| 3 | Thử bấm nút xóa chủ động `🗑️ Xóa` từng dòng | File bị xóa ngay, không ảnh hưởng file khác, không mất dữ liệu chưa chọn | Đạt: Hàm `xoaMotFile(id)` xác nhận và xóa chính xác file được chỉ định | **PASS** |
| 4 | Nút `🗑️ Xóa kho tạm` toàn bộ | Xóa sạch các file lưu tạm khi nhân viên muốn làm mới toàn bộ | Đạt: Gọi `xoaDuLieuTam()` làm sạch kho tạm an toàn | **PASS** |
| 5 | Nạp file có đơn giá mới khác giá hiện tại | Tự động cập nhật giá bán mới nhất và ghi nhận vào `lich_su_gia` | Đạt: Logic `donGia > 0 && Math.round(giaHienTai) !== Math.round(donGia)` ghi nhận ngày, giá cũ, giá mới, chênh lệch | **PASS** |
| 6 | Tránh bẫy đè giá khi đơn giá = 0 hoặc hàng tặng | Không ghi đè giá 0 làm hỏng giá bán hiện tại trong danh mục | Đạt: Có điều kiện chặn `donGia > 0` | **PASS** |
| 7 | Cảnh báo biến động giá tại Bước 1 | Xuất hiện chip thông báo và bấm vào mở modal xem bảng chi tiết giá cũ/mới | Đạt: `#chipBienDongGia` và modal `#modalBienDongGia` hoạt động chuẩn | **PASS** |
| 8 | Xem lịch sử giá trong modal Chỉnh sửa Hàng hóa | Bảng lịch sử giá hiển thị rõ ràng từng mốc thời gian, giá, chênh lệch | Đạt: Bảng lịch sử giá render mượt mà ngay dưới các ô nhập liệu | **PASS** |
| 9 | Badge số mốc giá trên bảng danh mục Hàng hóa | Cột giá bán có badge xanh `📈 X mốc giá` bấm vào xem chi tiết | Đạt: Hiển thị badge trực quan | **PASS** |
| 10 | Giao diện chuẩn phong cách Google System | Đơn giản, phẳng, viền `#dadce0`, font màu `#202124`/`#3c4043`, modal 2 cột cân đối không còn bị vỡ như ảnh cũ | Đạt: `.modal-form-grid`, `.form-control`, `.tmh-modal-box` chuẩn đẹp | **PASS** |

---

## 2. Kiểm tra an toàn nghiệp vụ & Cú pháp mã
- [x] Không có lỗi cú pháp trong `buoc1_upload.html`, `danh_muc.html`, `layout.css`.
- [x] Không có xung đột bộ nhớ giữa Bước 1 và Bước 2 (dùng `localStorage["tmh_kiotviet_data"]` cho file chuyển giao).
- [x] Thao tác bất đồng bộ Supabase đều có `await` và khối `try/catch` an toàn.

---

## 3. Kết luận của Tester
- **KẾT QUẢ:** **ĐẠT 10/10 TIÊU CHÍ**.
- Chuyển giao toàn bộ kết quả sang REVIEWER để thẩm định và ra phán quyết cuối cùng.
