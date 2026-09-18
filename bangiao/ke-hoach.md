# Kế hoạch: Chuẩn Hóa Lõi Tính Toán Bước 2 Theo 100% Thuật Toán Apps Script Gốc

## 1. Yêu cầu nguyên văn & Tiếp nhận nguồn
- Khách hàng đã cung cấp trọn bộ mã nguồn Google Apps Script thực tế đang chạy:
  `THÁI MỸ HƯƠNG — BƯỚC 2 & BƯỚC 3 (BẢN 24/07/2026 — v2)`
- Nhiệm vụ: Tích hợp 100% thuật toán này vào `buoc2_phieu_xuat_kho.html`, giữ nguyên cấu trúc nền tảng (Đăng nhập, Danh mục, Giao diện Google System).

## 2. Các điểm trọng yếu cần chuẩn hóa vào Bước 2
1. **Ép kiểu số tiền & số lượng:**
   - Dùng hàm `parseVNNumber_` bóc tách an toàn dấu chấm hàng nghìn, dấu phẩy thập phân, tiền tệ và số âm.
2. **Phiếu Xuất Kho (PXK):**
   - Gom nhóm theo khóa: `maHang + "‖" + donGia` (không gom gộp các dòng khác giá).
   - Tách 2 khối:
     * **Khối A (Hàng hóa):** Hàng KM (0đ) dồn lên đầu (`soSanhKMTruoc_`), tiếp theo là hàng bán sắp xếp mã hàng A ➡ Z với `numeric: true` (P350 đứng trước P500).
     * **Khối B (Chứng từ đi kèm):** Lọc theo `MA_CHUNG_TU = ["HĐ"]`, Chẵn/Lẻ để trống, có dòng "Cộng chứng từ", tuyệt đối không tính vào tổng số kiện hàng hóa.
   - Tính Chẵn/Lẻ theo đúng công thức `taoDongXuatKho_`:
     `chan = Math.floor(absSL) * dau`, `le = Math.round((absSL - chan) * qc) * dau`.
3. **Danh Sách Thu Tiền (DSTT):**
   - Gom theo `maHD`, tính đúng 4 cột tiền: Doanh số, Giảm giá SP, Giảm giá HĐ, Thành tiền.
   - 10 cột chuẩn và dòng tổng cộng hợp nhất.

## 3. Kế hoạch thực hiện theo 4 Agent
- **Planner:** Phân tích chi tiết và lập kế hoạch (Đã hoàn tất).
- **Coder:** Thay thế phần tính toán trong `buoc2_phieu_xuat_kho.html` bằng mã JavaScript chuyển thể từ Apps Script.
- **Tester:** Kiểm tra tính đúng đắn trên từng ca thử nghiệm (KM lên đầu, tách khối HĐ, tính chẵn lẻ).
- **Reviewer:** Rà soát và phê duyệt CHỐT trước khi commit và push lên `main`.
