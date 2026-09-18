# SỔ BÀN GIAO — THAY ĐỔI CỦA CODER

- **Lượt thực hiện:** 1
- **Vai trò:** CODER (Người viết code)
- **Nhiệm vụ:** Tối giản giao diện toàn hệ thống, tạo Trung tâm Quy trình 7 Bước `trang_chu.html`, giữ nguyên 100% logic kế toán và trang đăng nhập.

---

## 1. Danh sách file đã thay đổi

1. `trang_chu.html` [MỚI]
   - Màn hình Bảng điều phối Trung tâm Quy trình 7 Bước.
   - Thể hiện trực quan theo thứ tự: Bước 1 (Nạp KiotViet) ➡ Bước 2 (Tạo PXK & DSTT) ➡ Bước 3 (Lưu trữ đối soát) ➡ Bước 4 (Kiểm đơn giao về) ➡ Bước 5 (Báo cáo đối soát) ➡ Bước 6 (Bảng kê nộp tiền) ➡ Bước 7 (Xuất file MISA 69 cột) + 2 Khối quản trị Danh mục & Tài khoản.
   - Có tích hợp đếm nhanh số liệu thực tế từ Supabase (`luu_tru`).

2. `layout.css` [CHỈNH SỬA]
   - Loại bỏ các gradient lòe loẹt, giảm shadow nặng nề, làm phẳng giao diện (Flat & Clean Minimalist).
   - Tối giản stepper thanh tiến trình 7 bước (gọn gàng, vừa vặn, không chiếm diện tích).
   - Chuẩn hóa padding của `.tmh-page-body`, `.tmh-card`, `.tmh-topbar` và bảng biểu kế toán `.tmh-table`.

3. `layout.js` [CHỈNH SỬA]
   - Bổ sung menu `🧭 Tổng quan Quy trình` (`trang_chu.html`) lên vị trí đầu tiên của thanh điều hướng.
   - Cập nhật link logo và link breadcrumb trỏ về `trang_chu.html`.
   - Tối giản HTML của Stepper 7 bước, thêm nút quay về tổng quan quy trình.

4. `index.html` [CHỈNH SỬA]
   - Giữ nguyên 100% giao diện đăng nhập (như yêu cầu).
   - Cập nhật đúng 1 dòng logic: Sau khi xác thực thành công, chuyển hướng vào `trang_chu.html` thay vì nhảy bổ vào Bước 1.

5. `danh_muc.html` [CHỈNH SỬA]
   - Thay thế banner gradient cồng kềnh `.dm-header-banner` bằng thẻ thông tin phẳng màu trắng, viền mảnh thanh lịch.
   - Giữ nguyên 100% logic nạp/sửa/xóa danh mục hàng hóa, khách hàng, xe, ngân hàng, nhân sự.

6. `quan_ly_taikhoan.html` [CHỈNH SỬA]
   - Thay thế banner gradient cồng kềnh `.acc-header-banner` bằng thẻ phẳng tối giản.
   - Giữ nguyên 100% logic phân quyền 3 cấp độ và ma trận phân quyền.

---

## 2. Cam kết bảo toàn nghiệp vụ kế toán
- **Logic KiotViet ➡ MISA:** Giữ nguyên toàn bộ các thuật toán tính chẵn/lẻ thùng hộp, bóc tách khuyến mãi, tách thuế VAT 8%/10%, định khoản tài khoản kế toán (1111/1121x/1311/13881) và lưu trữ Supabase.
- **Thư viện:** Không cài thêm gói lạ, chỉ dùng đúng các thư viện CDN hiện có (`@supabase/supabase-js`, `xlsx`, `xlsx-js-style`).
- **Phạm vi:** Không sửa đổi cấu trúc bảng hay migration của cơ sở dữ liệu Supabase.

---

## 3. Trạng thái bàn giao cho Tester
- **Trạng thái:** XONG. Chuyển giao sang TESTER kiểm tra tính đúng đắn trên trình duyệt và console.
