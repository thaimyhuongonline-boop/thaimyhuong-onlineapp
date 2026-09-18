# SỔ BÀN GIAO — YÊU CẦU DỰ ÁN THÁI MỸ HƯƠNG

- **Thời gian tiếp nhận:** 18/09/2026
- **Khách hàng:** CÔNG TY TNHH THÁI MỸ HƯƠNG
- **Hệ thống:** Web App Quản Lý Đơn Hàng & Phân Phối (KiotViet ➡ MISA 7 Bước)

---

## 1. Yêu cầu nguyên văn của người dùng

> "bạn đọc qua file day-chuyen-4-agent-claude-code.pdf
> bạn thấy bạn có thể làm theo quy trình khi viết tiếp tục cho app của tôi không? nếu được hãy làm theo quy trình này.
> tôi muốn bạn giữ nguyên code hiện tại chỉ phát triển thêm. ngoại trừ giao diện đăng nhập (index) hãy tối giản giao hiện hiện tại của app. tôi cần những tính năng thực tế, đơn giản, sau khi hoàn thành việc trang trí sẽ làm sau. giờ bạn hãy làm giao diện cho tôi biết app đang làm được gì là đủ. setup có quy trình thứ tự là được.
> tôi có cảm giác app này đang giống một thứ gì đó rất hỗn loạn trong cách xử lý và nó đang rất cồng kềnh trong giao diện"

---

## 2. Các nguyên tắc bất di bất dịch (Ràng buộc cứng)

1. **Tuân thủ quy trình 4 Agent**: Planner ➡ Coder ➡ Tester ➡ Reviewer qua Sổ bàn giao (`bangiao/`).
2. **Giữ nguyên 100% logic và code nghiệp vụ hiện tại**: Toàn bộ thuật toán bóc tách dữ liệu KiotViet, tính chẵn lẻ thùng/hộp, tách thuế VAT, định khoản tài khoản MISA (1111/1121/1311/13881) và lưu trữ Supabase được bảo toàn tuyệt đối, chỉ mở rộng hoặc tinh gọn giao diện.
3. **Giữ nguyên giao diện đăng nhập ([index.html](file:///g:/My%20Drive/thaimyhuong/index.html))**.
4. **Tối giản giao diện (Minimalist Enterprise)**: Bỏ mọi banner rườm rà, gradient màu mè, bóng đổ nhiều tầng; đưa về giao diện phẳng, thanh thoát, khoa học, tập trung vào số liệu thực tế.
5. **Setup quy trình thứ tự rõ ràng**: Người dùng mở app là thấy ngay toàn cảnh: App đang làm được gì, thứ tự 7 bước từ KiotViet sang MISA, trạng thái và nút hành động từng bước.
