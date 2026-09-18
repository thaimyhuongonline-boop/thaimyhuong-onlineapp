# Kế hoạch: Tối giản Giao diện & Thiết lập Trung tâm Quy trình 7 Bước Thái Mỹ Hương

## 1. Yêu cầu nguyên văn
> "bạn đọc qua file day-chuyen-4-agent-claude-code.pdf
> bạn thấy bạn có thể làm theo quy trình khi viết tiếp tục cho app của tôi không? nếu được hãy làm theo quy trình này.
> tôi muốn bạn giữ nguyên code hiện tại chỉ phát triển thêm. ngoại trừ giao diện đăng nhập (index) hãy tối giản giao hiện hiện tại của app. tôi cần những tính năng thực tế, đơn giản, sau khi hoàn thành việc trang trí sẽ làm sau. giờ bạn hãy làm giao diện cho tôi biết app đang làm được gì là đủ. setup có quy trình thứ tự là được.
> tôi có cảm giác app này đang giống một thứ gì đó rất hỗn loạn trong cách xử lý và nó đang rất cồng kềnh trong giao diện"

## 2. Hiểu yêu cầu
- **Ai dùng:** Kế toán, Quản lý, Giám đốc Công ty TNHH Thái Mỹ Hương (đặc thù người dùng muốn sự rõ ràng, mạch lạc, dễ hiểu, không rối mắt).
- **Màn nào:** 
  - Toàn bộ khung giao diện hệ thống: `layout.css`, `layout.js`.
  - Màn hình chính sau đăng nhập: `trang_chu.html` (Trung tâm Quy trình 7 Bước KiotViet ➡ MISA).
  - Tinh gọn giao diện các bước 1 -> 7 (`buoc1_upload.html` đến `buoc7_xuat_misa.html`).
  - Giữ nguyên 100% trang `index.html`.
- **Xong thì thấy gì:**
  - Mở app lên sau khi đăng nhập, người dùng thấy ngay một **Bảng điều phối Quy trình 7 Bước** tối giản, trực quan, thể hiện rõ: *App đang làm được những gì, theo thứ tự từ 1 đến 7 ra sao*.
  - Mỗi bước có: Số thứ tự, Tên nghiệp vụ, Tóm tắt chức năng thực tế ngắn gọn (1 dòng), Trạng thái dữ liệu hiện tại, và Nút bấm mở chức năng đó.
  - Giao diện sạch sẽ (Minimalist & Flat), không còn các banner to tổ chảng, không gradient chói mắt, bảng biểu số liệu kế toán hiển thị thanh lịch, ngay ngắn.

## 3. Câu hỏi CHẶN
*(Không có — Yêu cầu đã rõ ràng và được phê duyệt)*

## 4. Giả định em tự chốt
- **Giả định 1:** Giữ nguyên 100% logic JavaScript tính toán, thuật toán bóc tách đơn hàng, xử lý quy cách chẵn/lẻ, tách thuế VAT, định khoản TK nợ MISA (1111/1121/1311/13881) và tương tác Supabase. Không xóa bất kỳ hàm nào.
- **Giả định 2:** `trang_chu.html` sẽ là trang Bảng điều phối trung tâm sau đăng nhập (Index sẽ chuyển hướng vào đây), đồng thời thanh menu sidebar và topbar luôn có nút quay về trang này để người dùng bất kỳ lúc nào cũng kiểm tra được tiến trình tổng thể.
- **Giả định 3:** Tối giản `layout.css` theo hệ màu xanh lá đậm nhận diện Thái Mỹ Hương (`#166534` / `#236446`), nền trắng - xám thanh lịch (`#f8fafc`), bỏ bóng đổ nặng và gradient lòe loẹt.

## 5. Hiện trạng
- `index.html`: Giao diện đăng nhập hiện có, giữ nguyên 100%. Sau đăng nhập hiện đang trỏ sang `buoc1_upload.html`. Cần trỏ tới `trang_chu.html`.
- `layout.css`: 1022 dòng, nhiều class CSS cồng kềnh, gradient nặng nề, padding quá lớn làm giao diện phình to.
- `layout.js`: Sidebar có stepper và menu, nhưng chưa có trang tổng quan rõ ràng để người dùng thấy app đang làm được gì.
- Các file `buoc1_upload.html` đến `buoc7_xuat_misa.html`: Đang nhúng banner to, làm mất diện tích thao tác của nhân viên.

## 6. Thiết kế kỹ thuật
- **File mới:**
  - `trang_chu.html`: Trang Trung tâm Quy trình 7 Bước (Pipeline Dashboard) hiển thị danh sách tuần tự từ Bước 1 đến Bước 7 + Danh mục + Quản lý tài khoản.
- **File chỉnh sửa:**
  - `layout.css`: Tinh giản typography, bỏ các gradient banner, thu gọn header/footer, làm phẳng giao diện (flat cards, neat borders, readable data tables).
  - `layout.js`: Cập nhật menu để có mục "🏠 Tổng quan quy trình" đứng đầu, điều hướng chuẩn xác.
  - `index.html`: Cập nhật đích chuyển hướng sau đăng nhập thành công sang `trang_chu.html`.
  - Các trang bước: Bỏ bớt phần banner màu mè trang trí, chỉ để lại tiêu đề gọn gàng và khu vực làm việc thực tế.

## 7. Bẫy phải tránh trong việc này
- **Bẫy 1:** Tuyệt đối không xóa bất kỳ thẻ `<input>` hay `id` nào mà script JS đang sử dụng để đọc/ghi dữ liệu.
- **Bẫy 2:** Không chạm vào các hàm xử lý số liệu lẻ (`docSoLuong_`), ép kiểu tiền tệ, hoặc logic upload file KiotViet.
- **Bẫy 3:** Không làm mất tính tương thích phân quyền 3 cấp (Toàn quyền, Cấp quản lý, Nhân sự) trong `config.js`.

## 8. Kế hoạch test
- Mở `index.html`, đăng nhập kiểm tra chuyển hướng vào `trang_chu.html`.
- Kiểm tra `trang_chu.html`: Hiển thị rõ 7 bước theo thứ tự, bấm vào từng bước mở đúng trang tương ứng.
- Kiểm tra các trang bước 1 -> 7: Giao diện gọn gàng, không còn cồng kềnh, các nút bấm và bảng dữ liệu hoạt động bình thường, không lỗi Console.
- Kiểm tra tính bảo vệ trang (`baoVeTrang`) và đăng xuất.

## 9. Không làm
- Không cài thêm bất kỳ thư viện npm nào (giữ nguyên mô hình CDN hiện tại).
- Không sửa đổi cấu trúc bảng SQL trong Supabase.
- Không sửa đổi giao diện trang `index.html`.

## 10. Xong khi
- Giao diện toàn app đồng bộ phong cách tối giản, sáng sủa, khoa học.
- Bảng điều phối quy trình 7 bước hoạt động trơn tru, người dùng nhìn vào hiểu ngay app làm được gì.
- Kiểm thử đầy đủ, Reviewer duyệt CHỐT vào sổ bàn giao.
