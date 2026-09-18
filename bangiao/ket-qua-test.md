# SỔ BÀN GIAO — KẾT QUẢ KIỂM THỬ CỦA TESTER

- **Lượt kiểm thử:** 3
- **Thời gian:** 18/09/2026 (21:09)
- **Vai trò:** TESTER (Người kiểm thử)
- **Đối tượng kiểm thử:** `buoc3_luu_tru.html` (Bước 3: Lưu Trữ).

---

## 1. Bảng kiểm tra chi tiết các tiêu chí kiểm thử

| STT | Hạng mục kiểm thử | Vị trí / Hành vi mong muốn | Kết quả kiểm tra thực tế | Đánh giá |
|---|---|---|---|---|
| 1 | Vị trí "Kho lưu trữ các đợt điều động xe đã tạo" | Nằm ở phía trên (ngay dưới header Bước 3) | Dòng 130-155: Card hiển thị danh sách đợt xuất hiện đầu tiên, nhân viên thấy ngay mọi đợt xe đã tạo | **PASS** |
| 2 | Vị trí "Thông tin đợt đang xem & Thanh thao tác" (`heroMetaBar`) | Nằm liền sau bảng các đợt xe | Dòng 157-183: Hiển thị thông tin đợt đang xem, ô tìm kiếm hóa đơn, nút Xem 2 Phiếu, Xuất Excel 18 cột, Tiếp tục B4 | **PASS** |
| 3 | Vị trí "Danh sách 18 cột đối soát chi tiết của chuyến xe" | Nằm ở dưới cùng | Dòng 185-230: Bảng 18 cột hiển thị đầy đủ, không che khuất danh sách các đợt | **PASS** |
| 4 | Tính toàn vẹn của các thẻ DOM & ID | Không bị mất ID nào | Đã xác minh tồn tại đầy đủ: `tbodyLichSu`, `heroMetaBar`, `lblMaDot`, `lblXe`, `lblTaiXe`, `lblThuTien`, `lblNgayGiao`, `lblSoHD`, `timKiemTongLuuTru`, `lblTieuDeBang18Cot`, `tbody18Cot`, `tfoot18Cot`, `chkChonTatCa18Cot`, `btnXoaDongChon` | **PASS** |
| 5 | Hành vi cuộn mượt mà khi chọn xem đợt (`xemDot`) | Bấm nút `👁️ 18 cột` ở danh sách đợt phía trên thì cuộn xuống bảng chi tiết phía dưới | Hàm `xemDot(idx)` gọi `document.getElementById('heroMetaBar').scrollIntoView({ behavior: 'smooth' })`, không còn cuộn ngược lên `top: 0` | **PASS** |
| 6 | Bảo toàn logic nghiệp vụ | Các hàm không bị lỗi, không sửa đổi logic kế toán | Tất cả các hàm `veBang18Cot`, `hienThiLichSu`, `xuatExcel18Cot`, `kiemDonDot`, `xoaDot`, `moModalSuaDot`, `dongBoThuCongTuCloud` được giữ nguyên vẹn | **PASS** |

---

## 2. Kết luận của Tester
- **KẾT QUẢ:** **ĐẠT 6/6 TIÊU CHÍ**.
- Bố cục mới giải quyết triệt để vấn đề công thái học (UX) cho nhân viên quản lý điều phối và kế toán đối soát.
- Chuyển giao sang REVIEWER để ra phán quyết CHỐT.
