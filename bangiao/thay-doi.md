# SỔ BÀN GIAO — THAY ĐỔI CỦA CODER

- **Lượt thực hiện:** 3
- **Thời gian:** 18/09/2026 (21:08)
- **Vai trò:** CODER (Người viết code)
- **Nhiệm vụ:** Hoán đổi vị trí hiển thị giữa "Kho lưu trữ các đợt điều động xe đã tạo" và "Danh sách 18 cột đối soát chi tiết của chuyến xe" trong Bước 3 (`buoc3_luu_tru.html`), giữ nguyên 100% logic code.

---

## 1. Danh sách file đã chỉnh sửa (Lượt 3)

### `buoc3_luu_tru.html` [HOÁN ĐỔI VỊ TRÍ 2 KHỐI GIAO DIỆN & ĐIỀU CHỈNH CUỘN]
1. **Hoán đổi cấu trúc DOM:**
   - **Đưa khối "Kho lưu trữ các đợt điều động xe đã tạo" (`tbodyLichSu`) lên trên cùng**:
     * Ngay sau tiêu đề trang `tmh-page-header`.
     * Giúp nhân viên khi vào Bước 3 là thấy ngay bảng tổng hợp các đợt xe đã tạo (STT, Mã đợt, Ngày giao, Xe, Tài xế, Thu tiền, Số đơn, Trạng thái, Thao tác).
   - **Đưa khối "Thông tin đợt đang xem & Thanh điều hướng" (`heroMetaBar`) xuống liền sau bảng đợt xe**:
     * Đóng vai trò làm thanh điều phối & tìm kiếm cho đợt được chọn (hiển thị mã đợt, xe, ngày giao, số lượng HĐ, ô tìm kiếm hóa đơn, nút xem lại 2 phiếu, xuất Excel 18 cột, tiếp tục B4).
   - **Đưa khối "Danh sách 18 cột đối soát chi tiết của chuyến xe" (`tbody18Cot`) xuống dưới**:
     * Hiển thị bảng chi tiết các hóa đơn của đợt đang chọn, cho phép tick chọn xóa dòng, đối soát số liệu kế toán.
2. **Cập nhật hàm cuộn mượt mà `xemDot(idx)`:**
   - Thay vì `window.scrollTo({ top: 0 })` (vốn dùng cho bố cục cũ khi danh sách đợt nằm ở đáy), cập nhật thành `document.getElementById('heroMetaBar').scrollIntoView({ behavior: 'smooth' })`.
   - Khi nhân viên click vào nút `👁️ 18 cột` ở bất kỳ đợt nào trên danh sách phía trên, màn hình sẽ tự động cuộn mượt mà đến phần thông tin và bảng chi tiết 18 cột phía dưới.

---

## 2. Cam kết bảo toàn 100% code nghiệp vụ
- Toàn bộ các hàm logic: `veBang18Cot()`, `hienThiLichSu()`, `xoaDot()`, `moModalSuaDot()`, `xuatExcel18Cot()`, `dongBoThuCongTuCloud()`, `saoLuuLichSu()`, `khoiPhucLichSu()`, `locDuLieuTongLuuTru()`, `kiemDonDot()`, `chuyenSangBuoc4()` đều được giữ nguyên 100%, không bị sửa đổi hay loại bỏ bất kỳ logic nào.
- Giữ nguyên các ID phần tử DOM để các hàm JavaScript truy vấn chính xác.

---

## 3. Trạng thái bàn giao
- **Trạng thái:** HOÀN THÀNH. Chuyển giao sang TESTER kiểm tra tính toàn vẹn và hành vi người dùng.
