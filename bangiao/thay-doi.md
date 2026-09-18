# SỔ BÀN GIAO — THAY ĐỔI CỦA CODER

- **Lượt thực hiện:** 4
- **Thời gian:** 18/09/2026 (22:15)
- **Vai trò:** CODER (Người viết code)
- **Nhiệm vụ:** Tích hợp 100% thuật toán chuẩn từ Google Apps Script gốc `THÁI MỸ HƯƠNG — BƯỚC 2 & BƯỚC 3 (BẢN 24/07/2026 — v2)` vào `buoc2_phieu_xuat_kho.html`, giữ nguyên hệ thống đăng nhập, phân quyền, danh mục và quy trình dữ liệu của Web App.

---

## 1. Danh sách file đã chỉnh sửa (Lượt 4)

### `buoc2_phieu_xuat_kho.html` [TÍCH HỢP 100% THUẬT TOÁN APPS SCRIPT V2 GỐC]

1. **Bổ sung các hằng số và hàm phụ trợ chuẩn từ Apps Script gốc:**
   - `var MA_CHUNG_TU = ["HĐ"];` (danh mục mã giấy tờ / hóa đơn đi kèm, không tính vào số kiện xuất kho).
   - `laChungTu_(maHang)`: Kiểm tra mã hàng có thuộc danh sách chứng từ không phân biệt hoa/thường.
   - `parseVNNumber_(val)`: Xử lý số liệu chuẩn Việt Nam / KiotViet (xóa dấu chấm phân cách hàng nghìn, giữ dấu phẩy thập phân, xử lý số âm có ngoặc hoặc dấu trừ, loại bỏ ký tự tiền tệ đ, Đ, $, VND).
   - `soSanhMaHang_(a, b)`: Sắp xếp mã hàng A → Z có cờ `{ numeric: true }` giúp P350 đứng trước P500 (tránh lỗi chuỗi), cùng mã thì đơn giá cao xếp trước.
   - `soSanhKMTruoc_(a, b)`: Sắp xếp cho Phiếu Xuất Kho: Hàng khuyến mãi (đơn giá 0đ) dồn lên TRÊN CÙNG, hàng bán xuống dưới, trong mỗi nhóm sắp A → Z (`numeric: true`).
   - `taoDongXuatKho_(item, stt)`: Thuật toán tách Chẵn / Lẻ:
     * `chan = Math.floor(absSL) * dau` (số kiện nguyên)
     * `phanLe = absSL - soNguyen`
     * `le = Math.round(phanLe * qc) * dau` (đổi ra đơn vị nhỏ dựa trên quy cách).

2. **Thay thế toàn bộ logic tạo Bảng Kê Thu Tiền Hàng `taoBangKeThuTien()`:**
   - Áp dụng cấu trúc 10 cột chuẩn: `STT | Mã Hoá Đơn | Mã Khách Hàng | Tên Khách Hàng | Người Bán | Doanh Số | Giảm Giá SP | Giảm Giá HĐ | Thành Tiền | Ghi Chú`.
   - Tính `doanhSo = sl * donGia`, `giamSP = (sl * donGia) - thanhTien`, `thanhTienFinal = thanhTienDong - giamHD`.
   - Dòng TỔNG CỘNG gộp (merge) 5 cột đầu tiên, định dạng nền xanh `#dcfce7`, font đậm, căn phải nhãn "TỔNG CỘNG", căn phải số liệu thành tiền.

3. **Thay thế toàn bộ logic tạo Phiếu Xuất Kho Tổng Hợp `taoPhieuXuatKhoTongHop()`:**
   - Gom nhóm dòng theo khóa `maHang + "\u2016" + donGia`: Khác giá là tách thành dòng riêng, không bình quân giá để kế toán đối soát chính xác với KiotViet.
   - Tách 2 khối rõ ràng:
     * **Khối A (Hàng hóa)**: Hàng khuyến mãi (0đ) dồn lên trên có nền màu cam nhạt `#fff7ed` và nhãn `HÀNG KHUYẾN MÃI`. Có dòng `TỔNG CỘNG HÀNG HÓA` riêng (nền `#dcfce7`), tổng kiện chẵn, tổng lẻ và tổng tiền hàng.
     * **Khối B (Chứng từ đi kèm)**: Nhận diện mã trong `MA_CHUNG_TU` (ví dụ `HĐ`), có banner phân cách `CHỨNG TỪ / GIẤY TỜ ĐI KÈM — KHÔNG TÍNH VÀO TỔNG SỐ KIỆN Ở TRÊN`. Cột Chẵn và Lẻ để trống. Có dòng `CỘNG CHỨNG TỪ` riêng, không cộng vào tổng kiện hàng hóa của kho.
   - Tính chẵn/lẻ qua `taoDongXuatKho_`, lấy quy cách từ danh mục hàng hóa `mapQuyCach`.

4. **Đồng bộ hóa chức năng Xuất Excel `xuatExcelHienTai()`:**
   - Xuất Bảng kê thu tiền 10 cột chuẩn với các merge header và dòng tổng cộng.
   - Xuất Phiếu xuất kho tổng hợp chia rõ Khối A và Khối B, định dạng màu sắc (`#FFF7ED` cho KM, `#DCFCE7` cho tổng hàng, `#E2E8F0` cho khối chứng từ), công thức và độ rộng cột chuẩn.

5. **Giữ nguyên 100% các tính năng nền tảng của Web App:**
   - Cổng đăng nhập bảo mật `index.html`.
   - Trang quản lý tài khoản & phân quyền 5 cấp `quan_ly_taikhoan.html`.
   - Bộ 8 danh mục quản trị `danh_muc.html`.
   - Chức năng lưu trữ lịch sử đợt điều động (`localStorage` và Supabase) chuyển tiếp mượt mà sang Bước 3.

---

## 2. Trạng thái bàn giao
- **Trạng thái:** HOÀN THÀNH. Chuyển giao sang TESTER kiểm tra tính toán số liệu và hiển thị.
