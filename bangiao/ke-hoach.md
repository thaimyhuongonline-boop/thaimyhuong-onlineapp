# Kế hoạch: Hoàn Thiện Bước 1, Theo Dõi Biến Động Giá Bán & Tối Giản Giao Diện Theo Chuẩn Google System

## 1. Yêu cầu nguyên văn
> "giờ ở bước 1, đã chia nhiệm vụ rồi, bước 1 sẽ là upload file từ kiot, sau đó sẽ cập nhật những dữ liệu mới vào danh mục và lưu tạm ở đó, những file nào đã được đẩy qua bước 2 thì xoá bỏ khỏi bộ nhớ tạm. còn những file upload lên mà chưa đẩy qua bước 2 thì còn nằm nguyên ở bước 1 lưu tạm ở đó, nút xoá chủ động vẫn còn giao diện hiện tại vẫn giữ nhé để khi nhân viên upload nhầm thì có thể chủ động xoá giá bán của hàng hoá nếu có thay đổi nên cập nhật sao cho người dùng có thể theo dõi giá bán mỗi lần có giá khác nhau, giống như theo dõi giá bán của 1 sản phẩm hay biến động giá vậy. hoàn chỉnh bước 1 không còn sai sót gì rồi mới đến bước 2.
> mà giao diện này tôi thấy nó còn chưa basic ấy, hãy dùng giao diện đơn giản như google systerm á. nhìn đơn giản nhưng lại không kém phần chuyên nghiệp. 
> giữ nguyên quy trình làm app theo thứ tự 4 bước nhé để app chuyên nghiệp. làm xong hãy commit và push lên main luôn nhé."

## 2. Hiểu yêu cầu
- **Ai dùng:** Nhân viên kế toán, thủ kho, người tải file bán hàng của Công ty Thái Mỹ Hương.
- **Màn nào:**
  - `buoc1_upload.html` (Trang chính của Bước 1).
  - `danh_muc.html` (Hiển thị lịch sử biến động giá trong modal Chỉnh Sửa Hàng Hóa như ảnh bạn chụp).
  - `layout.css` (Áp dụng phong cách tối giản Google System cho toàn hệ thống).
- **Xong thì thấy gì:**
  - **Giao diện Google System**: Nền trắng sáng `#ffffff` và xám nhẹ `#f8f9fa`, viền mảnh tinh tế `#dadce0`, nút bấm phẳng chuẩn Google Sheets/Workspace (`#137333` / `#e6f4ea`), bảng dữ liệu kẻ ngang thanh lịch (`#f1f3f4`), không bóng đổ nặng, không gradient.
  - **Kho lưu tạm Bước 1 hoàn hảo**:
    * Khi nạp nhiều file: Tất cả đều được lưu trong kho tạm.
    * Nhân viên có nút `🗑️ Xóa` riêng cho từng file để chủ động xóa file nhầm. Nút `Xóa kho tạm` xóa toàn bộ vẫn còn.
    * Khi chọn 1 file và bấm `Tiếp tục sang Bước 2`: File được chọn lập tức được xóa khỏi kho tạm (cả local và Supabase), **các file còn lại vẫn giữ nguyên 100%** trong danh sách tạm.
  - **Theo dõi biến động giá bán**:
    * Mỗi khi nạp file KiotViet có đơn giá mới hoặc khác giá bán hiện tại: Tự động ghi nhận mốc thời gian, giá cũ, giá mới, chênh lệch (+/- VNĐ).
    * Tại Bước 1: Có bảng/modal "Biến động giá bán" cho biết các sản phẩm vừa thay đổi giá.
    * Tại Danh mục Hàng hóa (modal Chỉnh sửa): Có mục hiển thị danh sách lịch sử giá để nhân viên theo dõi giá bán qua từng thời kỳ của sản phẩm.

## 3. Câu hỏi CHẶN
*(Không có)*

## 4. Giả định tự chốt
- Lịch sử biến động giá được lưu vào trường `lich_su_gia` của hàng hóa (mảng JSON gồm `{ ngay, gia_cu, gia_moi, ma_hd, chenh_lech }`) và được đồng bộ trong cả LocalStorage và Supabase.
- Khi đẩy file sang Bước 2, thao tác xóa file được chọn khỏi `file_kiot_tam` trên Supabase phải được `await` hoàn tất trước khi điều hướng `window.location.href` để tránh bị hủy ngầm.

## 5. Hiện trạng kỹ thuật
- `buoc1_upload.html`:
  - Đã có hàm `tuDongDongBoDanhMuc()`, nhưng hiện tại nếu mã hàng đã tồn tại thì nó bỏ qua luôn (`if (!setMaHangHienCo.has(maHangKey))`), dẫn đến việc nếu KiotViet có giá mới thì giá cũ không bao giờ được cập nhật và không có lịch sử biến động giá.
  - `chuyenSangBuoc2()` đang xóa file được chọn nhưng dùng promise không chờ (`.then()`), cần chuyển sang `await` và bảo đảm các file chưa đẩy được bảo lưu trọn vẹn.
- `danh_muc.html`:
  - Modal Chỉnh sửa Hàng hóa (như trong ảnh chụp) mới chỉ có ô input "Giá Bán (VNĐ)" đơn lẻ, chưa hiển thị lịch sử biến động giá.

## 6. Thiết kế chi tiết

### Module A: Giao diện chuẩn "Google System" trong `layout.css`
- Bảng màu:
  - Nền trang: `#f8f9fa` (Google Gray)
  - Thẻ / Card: `#ffffff`, viền `1px solid #dadce0`, bo góc `8px`, bóng `0 1px 2px rgba(60,64,67,0.08)`.
  - Màu chủ đạo: `#137333` (Google Green), hover `#0d652d`, soft `#e6f4ea`.
  - Chữ: Tiêu đề `#202124`, nội dung `#3c4043`, chú thích `#5f6368`.
  - Nút bấm: Phẳng, viền `#dadce0`, không có gradient.
  - Bảng biểu: Header trắng viền dưới `#dadce0`, các dòng viền `#f1f3f4`, hover `#f8f9fa`.

### Module B: Logic Kho Lưu Tạm & Đẩy Bước 2 trong `buoc1_upload.html`
- Khi nạp file: Lưu vào `danhSachFileDaNap` và Supabase `file_kiot_tam`.
- Danh sách file có cột checkbox/radio "Chọn đẩy", thông tin số HĐ, dòng hàng, doanh số, và nút `🗑️ Xóa` từng dòng.
- Khi bấm "Tiếp tục sang Bước 2":
  ```javascript
  // 1. Lưu file chọn cho Bước 2
  localStorage.setItem("tmh_kiotviet_data", JSON.stringify(duLieuKiotViet));
  // 2. Xóa file chọn khỏi kho tạm
  if (typeof sb !== 'undefined') {
    await sb.from('file_kiot_tam').delete().eq('id', fileDangChonId);
  }
  danhSachFileDaNap = danhSachFileDaNap.filter(f => f.id !== fileDangChonId);
  luuDanhSachFile();
  // 3. Chuyển trang
  window.location.href = "buoc2_phieu_xuat_kho.html";
  ```
- Kết quả: Các file còn lại trong `danhSachFileDaNap` vẫn nằm nguyên ở Bước 1.

### Module C: Theo Dõi Biến Động Giá Bán Sản Phẩm
- Trong `tuDongDongBoDanhMuc(duLieu)`:
  - Duyệt qua từng dòng hàng hóa:
    - Nếu mã hàng chưa có: Thêm mới với `gia_ban = donGia`, khởi tạo `lich_su_gia: [{ ngay: ngayHienTai, gia: donGia, ma_hd: maHD, ghi_chu: 'Khởi tạo từ KiotViet' }]`.
    - Nếu mã hàng đã có: So sánh `donGia` với `gia_ban` hiện tại.
      - Nếu `donGia > 0` và `donGia !== gia_ban_cu`:
        - Ghi nhận biến động giá: Thêm vào mảng `lich_su_gia`:
          `{ ngay: ngayHienTai, gia_cu: gia_ban_cu, gia_moi: donGia, chenh_lech: donGia - gia_ban_cu, ma_hd: maHD, ghi_chu: 'Cập nhật từ KiotViet' }`
        - Cập nhật `gia_ban = donGia`.
        - Đưa vào danh sách cảnh báo biến động giá để hiển thị ngay cho người dùng tại Bước 1.
- Hiển thị tại `buoc1_upload.html`:
  - Thẻ thông báo Google Chip: "🏷️ Có X mặt hàng có biến động giá bán [Xem chi tiết]".
  - Modal Google-style: Bảng chi tiết biến động giá (Mã, Tên, Giá cũ, Giá mới, Chênh lệch, Thời gian).
- Hiển thị tại `danh_muc.html`:
  - Trong modal Chỉnh Sửa Hàng Hóa: Bổ sung bảng "Lịch sử biến động giá" bên dưới ô nhập giá bán.

## 7. Bẫy phải tránh
- Bẫy ép kiểu số: Đơn giá từ KiotViet có thể là chuỗi chứa dấu phẩy/chấm (`280,000` hoặc `280.000`), phải dùng `Number(String(val).replace(/,/g, ''))` hoặc hàm parse an toàn để không bị NaN.
- Bẫy đè giá 0: Nếu đơn giá từ file bằng 0 (ví dụ hàng tặng kèm hoặc file thiếu giá), không được ghi đè làm mất giá bán thật hiện tại. Chỉ ghi nhận biến động khi `donGia > 0`.
- Bẫy bất đồng bộ: Khi xóa file và chuyển trang, bắt buộc phải `await` xóa Supabase trước khi gọi `window.location.href`.

## 8. Kế hoạch kiểm thử
- Kiểm tra nạp 2 file Excel cùng lúc hoặc lần lượt: Cả 2 file cùng xuất hiện trong kho tạm Bước 1.
- Chọn file 1 đẩy sang Bước 2: File 1 bị xóa, quay lại Bước 1 kiểm tra thấy file 2 vẫn còn nguyên.
- Thử bấm nút xóa chủ động từng file: File được xóa chính xác, không ảnh hưởng file khác.
- Kiểm tra tính năng biến động giá: Nạp đơn hàng có đơn giá khác giá trong danh mục, xác nhận hệ thống cập nhật giá mới và lưu vết lịch sử giá.
- Kiểm tra giao diện phong cách Google System: Tối giản, thanh thoát, màu sắc Google hài hòa.

## 9. Xong khi
- Bước 1 hoàn thiện 100% không còn sai sót.
- Đầy đủ báo cáo vào Sổ bàn giao và push lên nhánh `main`.
