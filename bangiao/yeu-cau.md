# SỔ BÀN GIAO — YÊU CẦU DỰ ÁN THÁI MỸ HƯƠNG

- **Thời gian tiếp nhận lượt mới:** 18/09/2026 (21:05)
- **Khách hàng:** CÔNG TY TNHH THÁI MỸ HƯƠNG
- **Hệ thống:** Web App Quản Lý Đơn Hàng & Phân Phối (KiotViet ➡ MISA 7 Bước)

---

## 1. Yêu cầu nguyên văn của người dùng (Lượt 3)

> "giữ nguyên code, áp dụng quy trình dây chuyền 4 agent, giúp tôi thay đổi vị trí của "Kho lưu trữ các đợt điều động xe đã tạo" và "Danh sách 18 cột đối soát chi tiết của chuyến xe" tôi nghĩ nó sẽ hợp lý hơn cho người dùng."

---

## 2. Phân rã nghiệp vụ chi tiết

1. **Mục tiêu thay đổi vị trí giao diện tại Bước 3 (`buoc3_luu_tru.html`)**:
   - Hiện tại: Khối *"Danh sách 18 cột đối soát chi tiết của chuyến xe"* nằm ở trên, khối *"Kho lưu trữ các đợt điều động xe đã tạo"* nằm ở tít dưới đáy trang. Do bảng 18 cột rất dài (40-100 hóa đơn), nhân viên khi vào Bước 3 không nhìn thấy danh sách các đợt xe đã tạo mà phải cuộn chuột xuống đáy.
   - Mong muốn của Anh: Đổi vị trí 2 khối này để:
     * **Khối 1 (Đặt ở trên):** *"Kho lưu trữ các đợt điều động xe đã tạo"* — Giúp nhân viên vừa vào Bước 3 là thấy ngay toàn bộ các đợt điều động, tình trạng kiểm đơn, và dễ dàng chọn xem bất kỳ đợt nào.
     * **Khối 2 (Đặt ở dưới):** *"Thông tin đợt đang xem & Thanh điều hướng"* (`heroMetaBar`) cùng với *"Danh sách 18 cột đối soát chi tiết của chuyến xe"* — Hiển thị chi tiết bảng tính 18 cột của đợt đang chọn để đối soát hoặc xuất Excel.
2. **Nguyên tắc kỹ thuật**:
   - **Giữ nguyên 100% code logic**: Toàn bộ các hàm xử lý dữ liệu (`xemDot`, `veBang18Cot`, `hienThiLichSu`, `xuatExcel18Cot`, `dongBoThuCongTuCloud`, `xoaDot`, `moModalSuaDot`, phân quyền tài khoản, v.v.) được bảo toàn tuyệt đối, không thay đổi thuật toán.
   - **Quy trình 4 Agent**: Tuân thủ tuần tự qua Planner ➡ Coder ➡ Tester ➡ Reviewer, ghi nhận đầy đủ vào Sổ bàn giao `bangiao/`.
   - **Commit và Push**: Đảm bảo trạng thái sạch và đồng bộ lên nhánh `main`.
