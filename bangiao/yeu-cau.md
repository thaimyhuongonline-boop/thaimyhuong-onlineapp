# SỔ BÀN GIAO — YÊU CẦU DỰ ÁN THÁI MỸ HƯƠNG

- **Thời gian tiếp nhận lượt mới:** 18/09/2026 (22:05)
- **Khách hàng:** CÔNG TY TNHH THÁI MỸ HƯƠNG
- **Hệ thống:** Web App Quản Lý Đơn Hàng & Phân Phối (KiotViet ➡ MISA 7 Bước)

---

## 1. Yêu cầu nguyên văn & Tiếp nhận mã nguồn gốc (Lượt 4)

Người dùng đã cung cấp trọn vẹn mã nguồn Google Apps Script gốc:
`THÁI MỸ HƯƠNG — BƯỚC 2 & BƯỚC 3 (BẢN 24/07/2026 — v2)`

> "haiz, tôi có nên gửi mấy đoạn script cũ cho bạn không? để bạn biết logic tính toán của phiếu xuất kho và danh sách thu tiền?
> hay là bạn giữ lại cổng đăng nhập, danh mục hay phương án là tôi gửi các đoạn appscript tôi đã làm cho bạn để bạn lấy logic tính toán?"
> *(Kèm toàn bộ mã nguồn Apps Script của 3 hàm: `getDropdownData()`, `code_TaoDanhSachThuTien()`, `code_TaoPhieuXuatKho()` và các hàm phụ trợ)*

---

## 2. Phân tích cốt lõi từ Apps Script gốc

Qua phân tích mã nguồn Apps Script thực tế của Thái Mỹ Hương, phát hiện **5 điểm vàng nghiệp vụ** cần chuẩn hóa ngay vào `buoc2_phieu_xuat_kho.html`:

1. **Khóa gom nhóm Phiếu Xuất Kho: `[Mã Hàng + Đơn Giá]` (`maHang + "‖" + donGia`)**:
   - Không được gom gộp các dòng khác giá lại với nhau rồi tính giá bình quân.
   - Nếu cùng 1 mã hàng mà có giá khác nhau (ví dụ: dòng bán giá chuẩn, dòng chiết khấu giá thấp hơn, hoặc dòng tặng 0đ) ➡ **bắt buộc tách thành các dòng riêng biệt**.
   - Đơn giá thực tế dòng: `donGia = (sl !== 0) ? (thanhTienDong / sl) : donGiaGoc;` làm tròn 2 chữ số thập phân.
2. **Chia tách 2 Khối rõ rệt trên Phiếu Xuất Kho**:
   - `MA_CHUNG_TU = ["HĐ"]` (có thể mở rộng thêm mã chứng từ khác).
   - **KHỐI A — HÀNG HÓA**: Các mặt hàng thực tế. Có dòng tổng cộng riêng: *Tổng cộng kiện chẵn, kiện lẻ, thành tiền*.
   - **KHỐI B — CHỨNG TỪ ĐI KÈM**: Các mã thuộc `MA_CHUNG_TU`. Cột Chẵn / Lẻ **để trống**, ghi chú là "CHỨNG TỪ", có dòng tổng cộng riêng "CỘNG CHỨNG TỪ", và **TUYỆT ĐỐI KHÔNG CỘNG VÀO TỔNG SỐ KIỆN HÀNG HÓA**.
3. **Thứ tự sắp xếp tối ưu cho thủ kho (`soSanhKMTruoc_`)**:
   - Hàng khuyến mãi (đơn giá = 0đ) **dồn lên TRÊN CÙNG** để thủ kho chỉ lấy kệ khuyến mãi 1 lần.
   - Hàng bán thông thường xếp ở giữa, sắp xếp theo Mã Hàng A ➡ Z với so sánh tự nhiên (`numeric: true` để `P350` đứng trước `P500`).
   - Khối chứng từ đi kèm nằm ở cuối cùng.
4. **Công thức tính Chẵn / Lẻ chuẩn xác (`taoDongXuatKho_`)**:
   - `soNguyen = Math.floor(absSL)` ➡ `chan = soNguyen * dau`.
   - `phanLe = absSL - soNguyen` ➡ `le = Math.round(phanLe * qc) * dau`.
5. **Danh Sách Thu Tiền (`code_TaoDanhSachThuTien`)**:
   - Không chọn hóa đơn nào = **Lấy TẤT CẢ** (`layTatCa = true`).
   - Gom theo từng hóa đơn: `Doanh Số = Σ(sl * donGia)`, `Giảm Giá SP = Σ(sl * donGia - thanhTien)`, `Giảm Giá HĐ = giamHD`, `Thành Tiền = thanhTienDong - giamHD`.
   - 10 cột chuẩn: `STT | Mã HĐ | Mã KH | Tên KH | Người Bán | Doanh Số | Giảm Giá SP | Giảm Giá HĐ | Thành Tiền | Ghi Chú`.
