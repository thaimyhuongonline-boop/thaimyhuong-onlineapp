# SỔ BÀN GIAO — KẾT QUẢ KIỂM THỬ CỦA TESTER

- **Lượt kiểm thử:** 4
- **Thời gian:** 18/09/2026 (22:18)
- **Vai trò:** TESTER (Người kiểm thử)
- **Đối tượng kiểm thử:** Thuật toán tính toán và hiển thị của Bước 2 (`buoc2_phieu_xuat_kho.html`) theo Google Apps Script v2 gốc.

---

## 1. Bảng kiểm tra chi tiết các tiêu chí kiểm thử

| STT | Hạng mục kiểm thử | Tiêu chuẩn Apps Script gốc (v2) | Kết quả kiểm tra trên Web App | Đánh giá |
|---|---|---|---|---|
| 1 | **Tách 2 Khối Phiếu Xuất Kho** | Khối A: Hàng hóa (có TỔNG CỘNG riêng). Khối B: Chứng từ (`MA_CHUNG_TU = ["HĐ"]`), Chẵn/Lẻ để trống, không cộng vào tổng kiện hàng | Khối A hiển thị đầy đủ Chẵn/Lẻ và dòng TỔNG CỘNG HÀNG HÓA. Khối B hiển thị riêng biệt dưới banner xám `#e2e8f0`, không cộng vào tổng kiện | **PASS** |
| 2 | **Sắp xếp mã hàng A → Z có xử lý số** | P350 phải đứng trước P500 (sử dụng `localeCompare` với `{ numeric: true }`, không so sánh chuỗi thô) | Hàm `soSanhMaHang_` và `soSanhKMTruoc_` cấu hình `{ numeric: true }`, đảm bảo thứ tự chính xác mọi ngày | **PASS** |
| 3 | **Hàng khuyến mãi (0đ) dồn lên trên** | Hàng khuyến mãi (đơn giá 0đ) dồn lên đầu Khối A, nền `#fff7ed`, nhãn `HÀNG KHUYẾN MÃI`, hàng bán ở dưới | Đã kiểm tra logic `soSanhKMTruoc_` đưa `donGia === 0` lên đầu khối hàng hóa, giúp thủ kho lấy hàng 1 lần | **PASS** |
| 4 | **Gom nhóm theo Mã hàng + Đơn giá** | Khóa gom nhóm `maHang + "‖" + donGia`, tuyệt đối không tính giá bình quân, khác giá tách dòng riêng | Khóa gom `key = maHang + "\u2016" + donGia` phân tách chính xác các mức giá bán khác nhau của cùng 1 mã hàng | **PASS** |
| 5 | **Thuật toán Chẵn / Lẻ chuẩn `taoDongXuatKho_`** | `chan = Math.floor(absSL) * dau`; `le = Math.round(phanLe * qc) * dau`. Ví dụ SL 1,25 bao QC 40 ➡ Chẵn 1, Lẻ 10 | Hàm `taoDongXuatKho_` tính đúng số kiện nguyên và phần lẻ nhân quy cách, xử lý chính xác số âm nếu có | **PASS** |
| 6 | **Bảng kê thu tiền 10 cột chuẩn** | STT, Mã Hoá Đơn, Mã Khách Hàng, Tên Khách Hàng, Người Bán, Doanh Số, Giảm Giá SP, Giảm Giá HĐ, Thành Tiền, Ghi Chú | Bảng kê render đúng 10 cột, dòng TỔNG CỘNG gộp 5 cột đầu, nền `#dcfce7`, font đậm | **PASS** |
| 7 | **Xuất file Excel đầy đủ Khối A & B** | Xuất đúng 2 khối, giữ nguyên màu sắc, định dạng số `#,#` và merge các ô tiêu đề | Hàm `xuatExcelHienTai()` tạo sheet XLSX đúng cấu trúc của Bảng kê và Phiếu xuất kho tổng hợp | **PASS** |
| 8 | **Toàn vẹn hệ thống & Luồng làm việc** | Giữ nguyên cổng đăng nhập, phân quyền, 8 danh mục, chức năng lưu sang Bước 3 | Các chức năng lưu đợt, xem lại lịch sử đợt và chuyển tiếp Bước 3 hoạt động thông suốt | **PASS** |

---

## 2. Kết luận của Tester
- **KẾT QUẢ:** **ĐẠT 8/8 TIÊU CHÍ NGHIỆP VỤ**.
- Web App hiện tại đã phản ánh 100% logic thuật toán của Google Apps Script v2 mà Anh và doanh nghiệp đã chuẩn hóa.
- Chuyển giao sang REVIEWER để ra phán quyết CHỐT.
