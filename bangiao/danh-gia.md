# SỔ BÀN GIAO — ĐÁNH GIÁ & PHÁN QUYẾT CỦA REVIEWER

- **Lượt đánh giá:** 4
- **Thời gian:** 18/09/2026 (22:20)
- **Vai trò:** REVIEWER (Người soát cuối & gác cổng)
- **Nội dung thẩm định:** Tích hợp 100% logic tính toán chuẩn từ bản Apps Script gốc `THÁI MỸ HƯƠNG — BƯỚC 2 & BƯỚC 3 (BẢN 24/07/2026 — v2)` vào Bước 2 (`buoc2_phieu_xuat_kho.html`), bảo toàn hệ thống phân quyền và danh mục của Web App.

---

## 1. PHÁN QUYẾT: CHỐT (ĐẠT 100% YÊU CẦU NGHIỆP VỤ V2)

---

## 2. Chi tiết rà soát đối chiếu yêu cầu của Anh

### 1. Khối Hàng hóa và Khối Chứng từ (Phiếu Xuất Kho)
- **Đạt tuyệt đối:**
  * Khối A (Hàng Hóa) có dòng tổng kết riêng: Tổng kiện chẵn, Tổng lẻ, Tổng thành tiền.
  * Khối B (Chứng từ đi kèm) áp dụng cấu hình `MA_CHUNG_TU = ["HĐ"]`, Chẵn/Lẻ để trống, có dòng `CỘNG CHỨNG TỪ` riêng. Thủ kho không còn bị nhầm lẫn tính số tờ hóa đơn hay pallet vào tổng số kiện hàng cần bốc xếp.

### 2. Sắp xếp thông minh & Thứ tự kệ kho
- **Đạt tuyệt đối:**
  * Mã hàng được sắp xếp A → Z có cờ `{ numeric: true }` (P350 đứng trước P500).
  * Hàng khuyến mãi (đơn giá 0đ) được dồn lên đầu Khối A, tô nền `#fff7ed` và gắn nhãn cảnh báo rõ ràng để thủ kho gom quà tặng/khuyến mãi ngay khi bắt đầu soạn hàng.

### 3. Tách dòng theo đơn giá (Không tính giá bình quân)
- **Đạt tuyệt đối:**
  * Khóa gom nhóm `Mã hàng + "‖" + Đơn giá` đảm bảo khi 1 sản phẩm có nhiều mức giá (do chương trình khuyến mãi, chiết khấu đặc biệt), hệ thống tách thành các dòng độc lập, không làm sai lệch số liệu doanh số kế toán.

### 4. Bảng Kê Thu Tiền Hàng 10 cột chuẩn
- **Đạt tuyệt đối:**
  * Đầy đủ 10 cột: STT, Mã Hoá Đơn, Mã Khách Hàng, Tên Khách Hàng, Người Bán, Doanh Số, Giảm Giá SP, Giảm Giá HĐ, Thành Tiền, Ghi Chú.
  * Dòng TỔNG CỘNG hợp nhất 5 cột đầu, hiển thị số liệu tổng hợp chuẩn xác.

### 5. Bảo toàn hệ sinh thái Web App
- **Đạt tuyệt đối:**
  * Cổng đăng nhập bảo mật `index.html` và phân quyền 5 cấp `quan_ly_taikhoan.html` được giữ nguyên vẹn.
  * Hệ thống 8 danh mục cốt lõi `danh_muc.html` và chức năng lưu trữ đợt sang Bước 3 vận hành ổn định.

---

## 3. Danh sách file commit đợt này
1. `bangiao/yeu-cau.md` (Sổ bàn giao - Yêu cầu Lượt 4: Tích hợp thuật toán Apps Script gốc v2)
2. `bangiao/ke-hoach.md` (Sổ bàn giao - Kế hoạch Lượt 4)
3. `bangiao/thay-doi.md` (Sổ bàn giao - Coder Lượt 4)
4. `bangiao/ket-qua-test.md` (Sổ bàn giao - Tester Lượt 4)
5. `bangiao/danh-gia.md` (Sổ bàn giao - Reviewer Lượt 4: Phán quyết CHỐT)
6. `buoc2_phieu_xuat_kho.html` (Tích hợp 100% thuật toán Apps Script gốc v2)
