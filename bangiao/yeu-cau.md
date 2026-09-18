# SỔ BÀN GIAO — YÊU CẦU DỰ ÁN THÁI MỸ HƯƠNG

- **Thời gian tiếp nhận lượt mới:** 18/09/2026 (20:25)
- **Khách hàng:** CÔNG TY TNHH THÁI MỸ HƯƠNG
- **Hệ thống:** Web App Quản Lý Đơn Hàng & Phân Phối (KiotViet ➡ MISA 7 Bước)

---

## 1. Yêu cầu nguyên văn của người dùng (Lượt 2)

> "giờ ở bước 1, đã chia nhiệm vụ rồi, bước 1 sẽ là upload file từ kiot, sau đó sẽ cập nhật những dữ liệu mới vào danh mục và lưu tạm ở đó, những file nào đã được đẩy qua bước 2 thì xoá bỏ khỏi bộ nhớ tạm. còn những file upload lên mà chưa đẩy qua bước 2 thì còn nằm nguyên ở bước 1 lưu tạm ở đó, nút xoá chủ động vẫn còn giao diện hiện tại vẫn giữ nhé để khi nhân viên upload nhầm thì có thể chủ động xoá giá bán của hàng hoá nếu có thay đổi nên cập nhật sao cho người dùng có thể theo dõi giá bán mỗi lần có giá khác nhau, giống như theo dõi giá bán của 1 sản phẩm hay biến động giá vậy. hoàn chỉnh bước 1 không còn sai sót gì rồi mới đến bước 2.
> mà giao diện này tôi thấy nó còn chưa basic ấy, hãy dùng giao diện đơn giản như google systerm á. nhìn đơn giản nhưng lại không kém phần chuyên nghiệp. 
> giữ nguyên quy trình làm app theo thứ tự 4 bước nhé để app chuyên nghiệp. làm xong hãy commit và push lên main luôn nhé."

---

## 2. Phân rã nghiệp vụ chi tiết

1. **Bộ nhớ lưu tạm Bước 1 & Quy tắc đẩy Bước 2**:
   - Nạp file Excel KiotViet ➡ lưu vào danh sách kho tạm Bước 1 (cả LocalStorage và bảng `file_kiot_tam` trên Supabase).
   - Khi chọn 1 file và bấm **"Tiếp tục sang Bước 2"**:
     * File được chọn sẽ chuyển dữ liệu sang Bước 2 và **BỊ XÓA** khỏi kho tạm của Bước 1.
     * Các file khác chưa đẩy **VẪN NẰM NGUYÊN** ở Bước 1, không bị mất.
   - Nút **"Xóa" chủ động cho từng file** (khi nhân viên nạp nhầm) và nút **"Xóa kho tạm"** vẫn được duy trì.
2. **Theo dõi biến động giá bán sản phẩm (Price History Tracking)**:
   - Khi nạp file KiotViet: Nếu hàng hóa đã có giá bán cũ mà đơn giá trong file mới khác giá cũ (hoặc ghi nhận giá mới), hệ thống sẽ:
     * Cập nhật `gia_ban` mới nhất cho sản phẩm.
     * Tự động lưu vết **Lịch sử biến động giá** (`lich_su_gia`: ngày giờ, giá cũ, giá mới, mã HĐ, chênh lệch).
     * Cung cấp giao diện trực quan để người dùng theo dõi lịch sử biến động giá của từng mặt hàng (ở cả Bước 1 và Danh mục).
3. **Chuẩn hóa giao diện phong cách "Google System" (Google Workspace / Material Design)**:
   - Tối giản triệt để: Nền `#ffffff` & `#f8f9fa`, viền mảnh `#dadce0`, góc bo nhẹ `8px`, không đổ bóng nặng, không màu mè gradient.
   - Màu nhận diện xanh lá chuẩn Google Sheets / Thái Mỹ Hương (`#137333`, `#1e8e3e`, nền chip `#e6f4ea`).
   - Bảng biểu kế toán thanh thoát, đường kẻ viền `#f1f3f4`, chữ xám đen chuẩn Google `#202124` / `#5f6368`.
4. **Quy trình 4 Agent & Commit Push**:
   - Planner lập kế hoạch ➡ Coder viết code ➡ Tester kiểm thử ➡ Reviewer duyệt CHỐT ➡ Commit và Push lên `main`.
