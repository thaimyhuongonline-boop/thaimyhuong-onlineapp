# Kế hoạch: Hoán Đổi Vị Trí 2 Khối Giao Diện Tại Bước 3 (Lưu Trữ)

## 1. Yêu cầu nguyên văn
> "giữ nguyên code, áp dụng quy trình dây chuyền 4 agent, giúp tôi thay đổi vị trí của "Kho lưu trữ các đợt điều động xe đã tạo" và "Danh sách 18 cột đối soát chi tiết của chuyến xe" tôi nghĩ nó sẽ hợp lý hơn cho người dùng."

## 2. Hiểu yêu cầu
- **Màn hình thực hiện:** `buoc3_luu_tru.html` (Bước 3: Lưu Trữ).
- **Đối tượng sử dụng:** Nhân viên kế toán, thủ kho, điều phối xe.
- **Mục tiêu UX:** 
  - Đưa khối *"Kho lưu trữ các đợt điều động xe đã tạo"* lên phần trên của trang để người dùng có cái nhìn tổng quan ngay khi vào màn hình.
  - Đưa khối *"Danh sách 18 cột đối soát chi tiết của chuyến xe"* (kèm thanh thông tin đợt đang xem `heroMetaBar`) xuống bên dưới để hiển thị chi tiết khi chọn đợt.
  - Cải thiện trải nghiệm: Khi người dùng bấm `👁️ 18 cột` ở danh sách đợt phía trên, trang sẽ cuộn mượt mà xuống bảng chi tiết 18 cột phía dưới thay vì cuộn lên đầu như bố cục cũ.

## 3. Câu hỏi CHẶN
*(Không có)*

## 4. Hiện trạng kỹ thuật trong `buoc3_luu_tru.html`
- Thứ tự DOM hiện tại:
  1. `<div class="tmh-page-header">...</div>` (Header trang)
  2. `<div class="hero-meta-bar" id="heroMetaBar">...</div>` (Thanh thông tin đợt đang xem + tìm kiếm + nút xuất Excel / Tiếp tục B4)
  3. `<div class="tmh-card">` chứa `lblTieuDeBang18Cot` & `tbody18Cot` (Bảng 18 cột)
  4. `<div class="tmh-card">` chứa `tbodyLichSu` (Kho lưu trữ các đợt điều động xe đã tạo)
- Hàm `xemDot(idx)` ở dòng 901 hiện đang gọi: `window.scrollTo({ top: 0, behavior: 'smooth' });`

## 5. Thiết kế chi tiết sau hoán đổi
- Thứ tự DOM mới:
  1. `<div class="tmh-page-header">...</div>` (Header trang)
  2. `<div class="tmh-card">` chứa `tbodyLichSu` — **"📚 Kho lưu trữ các đợt điều động xe đã tạo"** (Đặt ngay trên đầu)
  3. `<div class="hero-meta-bar" id="heroMetaBar">...</div>` — **Thanh thông tin đợt đang xem & Thao tác nhanh** (Dẫn nhập vào bảng 18 cột)
  4. `<div class="tmh-card">` chứa `lblTieuDeBang18Cot` & `tbody18Cot` — **"📋 Danh sách 18 cột đối soát chi tiết của chuyến xe"** (Nằm ở dưới)
- Tinh chỉnh hàm `xemDot(idx)`:
  ```javascript
  function xemDot(idx) {
    const d = lichSuDot[idx];
    if (!d) return;
    dotHienTai = d;
    localStorage.setItem("tmh_dot_hien_tai", JSON.stringify(d));
    hienThiDuLieu();
    const el = document.getElementById('heroMetaBar');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  ```

## 6. Bẫy phải tránh
- Không làm mất hoặc đứt gãy các ID phần tử DOM quan trọng: `tbodyLichSu`, `tbody18Cot`, `tfoot18Cot`, `lblTieuDeBang18Cot`, `heroMetaBar`, `lblMaDot`, `lblXe`, `lblTaiXe`, `lblThuTien`, `lblNgayGiao`, `lblSoHD`, `timKiemTongLuuTru`, `chkChonTatCa18Cot`, `btnXoaDongChon`.
- Bảo toàn 100% logic nghiệp vụ: Không sửa đổi thuật toán xuất Excel, đồng bộ Supabase, sao lưu JSON, tính toán doanh số, phân quyền tài khoản.

## 7. Kế hoạch kiểm thử
- Kiểm tra hiển thị Bước 3: Khối Kho lưu trữ các đợt hiển thị ngay phía trên.
- Bấm nút `👁️ 18 cột` ở bất kỳ đợt nào: Bảng 18 cột phía dưới cập nhật dữ liệu chính xác và màn hình cuộn mượt mà đến bảng chi tiết.
- Kiểm tra thanh tìm kiếm `timKiemTongLuuTru` và các nút chức năng ("Xem lại 2 Phiếu", "Xuất Excel 18 cột", "Tiếp tục Bước 4").
- Kiểm tra các nút thao tác trên từng đợt: `👁️ 18 cột`, `📄 2 Phiếu`, `✏️ Sửa`, `📋 B4`, `🗑️ Xóa`.

## 8. Xong khi
- Giao diện hoán đổi chuẩn xác theo yêu cầu.
- Toàn bộ 4 sổ bàn giao được cập nhật.
- Commit và push lên `main`.
