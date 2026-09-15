# BÀN GIAO DỰ ÁN — THÁI MỸ HƯƠNG (cho AI tiếp nhận)

> Tài liệu giao ca. Người dùng KHÔNG rành code. Cách làm xuyên suốt: AI viết code
> → người dùng dán vào (GitHub / Supabase / Apps Script) → chụp màn hình phản hồi
> → AI sửa. Luôn đi TỪNG BƯỚC NHỎ, giải thích ngắn gọn dễ hiểu, không dồn nhiều việc
> một lúc. Người dùng thao tác; đừng yêu cầu cấp quyền để AI tự làm.

---

## 1. BỐI CẢNH CHUNG

Khách hàng: **CÔNG TY TNHH THÁI MỸ HƯƠNG** — phân phối hàng (nước POCARI, đường, mì...).
Nghiệp vụ: bán qua **KiotViet**, giao hàng bằng xe, thu tiền khi xe về, theo dõi công nợ,
và cuối cùng đẩy dữ liệu sang phần mềm kế toán **MISA**.

Dự án đã trải qua HAI GIAI ĐOẠN:

**Giai đoạn A — Google Sheet + Apps Script (ĐÃ XONG, đang chạy thật).**
Một hệ thống 7 bước hoàn chỉnh trên Google Sheet. Vẫn đang dùng.

**Giai đoạn B — App web Vercel + Supabase (ĐANG LÀM, mới bắt đầu).**
Lý do chuyển: Google Sheet nhiều người dùng cùng lúc không ổn định.
Mục tiêu: dựng lại TRỌN BỘ 7 bước thành app web. Người dùng đã chốt làm đủ 7 bước,
chấp nhận đi dài. **Đây là phần cần tiếp tục.**

---

## 2. GIAI ĐOẠN A — HỆ THỐNG APPS SCRIPT (đã hoàn thiện)

Chạy trong 1 file Google Sheet, menu "🚀 XỬ LÝ DỮ LIỆU". Các file .gs:

- **00_HamDungChung**: safeParseNumber (ép chuỗi tiền VN→số), cleanDateStr, getDanhSachXe.
- **01_Buoc1_Upload**: đọc file KiotViet → sheet DATA_KIOT; tự thêm khách mới (KHÁCH HÀNG),
  mã hàng mới (DATA).
- **02_Buoc2_va_3**: tạo DANH SÁCH THU TIỀN + PHIẾU XUẤT KHO. Chứa parseVNNumber_,
  chuanHoaNgayVN_ (nhiều bước xài chung). Phiếu xuất kho: KM lên trên, hàng bán giữa,
  chứng từ (mã "HĐ") dưới cùng. Chẵn/Lẻ: Chẵn = phần nguyên số lượng; Lẻ = phần thập phân × quy cách.
- **03_Buoc3_LuuTru**: ghi LƯU TRỮ (19 cột A→S, khóa = Mã Hóa Đơn, chống trùng), xuất Excel,
  và archive **CHI TIẾT HÓA ĐƠN** (11 cột, vĩnh viễn — nguồn cho MISA vì DATA_KIOT bị ghi đè mỗi upload).
- **04_Buoc4_KiemDon**: tạo bảng KIỂM ĐƠN GIAO VỀ (11 cột A→K). Cột K = ô tick "Giao lại?".
  Form chỉ liệt kê chuyến CHƯA kiểm xong (lọc soDaKiem < soDon).
- **05_Buoc5_LuuKiemDon**: ghi 5 cột O→S vào LƯU TRỮ (chỉ ghi đúng vùng, không đè cả sheet
  → tránh gãy công thức CÔNG NỢ). Đơn tick "Giao lại" thì GỠ khỏi LƯU TRỮ + CHI TIẾT
  (để giao lại đợt sau, không tính nợ oan). Xong tự mở form nộp tiền.
- **06_Buoc7_NopTien**: tạo PHIẾU NỘP TIỀN (chốt sổ + đếm mệnh giá + 3 bảng chi tiết CK/trả về/nợ).
- **07_CongNo**: chạy tay `dungHeCongNo` → dựng 3 sheet CÔNG NỢ (công thức MAP/SUMIF), THU NỢ, NỢ KHÁC.
  CÔNG NỢ = nợ phát sinh (LƯU TRỮ R) + NỢ KHÁC − THU NỢ, khóa Mã KH. Tự dò dấu , hay ;.
- **08_LuuBangKeNopTien**: ghi 1 dòng vào SỔ NỘP TIỀN XE (16 cột), chống trùng xe+ngày.
- **09_XuatMISA**: gom CHI TIẾT HÓA ĐƠN theo khoảng ngày → sheet XUẤT MISA BÁN HÀNG (70 cột:
  cột A "Số xe" + 69 cột mẫu MISA). Ghép định khoản (ĐỊNH KHOẢN HÀNG HÓA) + tình trạng thu tiền (LƯU TRỮ).
- **Menu**: dựng menu + các hàm mở form.

Form HTML: UploadForm, FormChonXe, FormKiemDonVe, FormNopTien, FormXuatMISA.

### Quy tắc nghiệp vụ QUAN TRỌNG (đúc kết qua nhiều lần sửa lỗi — GIỮ NGUYÊN):
- Cột thanh toán KiotViet là "giả" (luôn ghi đã thu đủ tiền mặt) → phải KIỂM ĐƠN GIAO VỀ nhập tay tiền thật.
- **Số lượng lẻ (0,5 / 0,25 thùng)**: KiotViet số lượng theo ĐƠN VỊ CƠ BẢN (thùng/bao).
  Đây là ổ gà lớn: safeParseNumber ("0.5"→5 vì hiểu dấu chấm là hàng nghìn) → khi xuất MISA
  phải đọc số lượng bằng hàm riêng docSoLuong_ (giữ nguyên số), và ghi cột Số lượng dạng TEXT dấu chấm.
- **Định khoản MISA** theo từng mã hàng (tab ĐỊNH KHOẢN HÀNG HÓA): thuế %, TK doanh thu (5111x),
  TK giá vốn (632x), mã kho (KHO01), TK kho (1561). Thuế có mã 10% có mã 8%.
- **TK Nợ**: 100% tiền mặt→1111; 100% CK→11211/11212/11213 (theo tài khoản nhận, map ở TÀI KHOẢN NGÂN HÀNG
  cột "TK MISA"); 100% nợ→1311; trộn nhiều kiểu hoặc có trả về→1311. (Đã đổi 131 thành 1311.)
- Doanh thu ghi theo hóa đơn gốc, KHÔNG trừ hàng trả về (trả về lập phiếu riêng bên MISA).
- **Mã khuyến mãi**: sheet ĐỔI MÃ KHUYẾN MÃI đổi mã KM→mã thật + tên thật; giá 0, thuế 0, TK Nợ = 13881.
- Mã hàng + mã khách đã ĐỒNG BỘ giữa KiotViet và MISA (khách tự sửa ở gốc, khỏi ánh xạ).
- **Giao lại**: đơn giao không được → tick "Giao lại" → Bước 5 gỡ khỏi LƯU TRỮ+CHI TIẾT →
  hôm sau upload lại bình thường.
- MISA: giá KiotViet "Thành tiền" ĐÃ gồm thuế (công tắc GIA_KIOT_DA_GOM_THUE = true; tách ngược).
  Số chứng từ tự sinh theo hóa đơn, ô đầu (I2/J2) là số bắt đầu người dùng nhập, các dòng dưới công thức.

---

## 3. GIAI ĐOẠN B — APP WEB (đang làm, cần tiếp)

### Hạ tầng (đã dựng xong):
- **GitHub repo**: `thaimyhuong-onlineapp` (owner: thaimyhuongonline-boop), PUBLIC.
  Mô hình: các file HTML thuần, nhúng thư viện qua CDN (supabase-js@2, xlsx). Không dùng Next.js.
- **Vercel**: đã kết nối repo, tự deploy. Có địa chỉ .vercel.app.
- **Supabase**: URL `https://oedidnctnteeegkdcwaa.supabase.co`.
  Có khóa anon public (người dùng giữ, đã dán vào config.js). Gói FREE.
  Tài khoản admin gốc: email `thaimyhuong.online@gmail.com`, UID `3badb26d-19dc-43d5-8d4b-ab66613e348e`.

### Phân quyền: 3 vai trò — **admin, quanly (Cấp quản lý), nhanvien**.
Đăng nhập bằng Email HOẶC Số điện thoại (SĐT được ghép thành `<sđt>@thaimyhuong.local` phía sau).

### ĐÃ LÀM XONG trong Giai đoạn B:
1. **SQL**: bảng `public.ho_so` (id ref auth.users, ho_ten, so_dien_thoai, vai_tro, trang_thai, tao_luc)
   + RLS "mỗi người đọc hồ sơ của mình" + đã chèn hồ sơ admin cho UID trên.
2. **SQL (vừa chạy)**: hàm `public.la_admin()` (security definer, tránh lỗi vòng lặp RLS)
   + 3 policy cho admin: đọc mọi hồ sơ / sửa mọi hồ sơ / thêm hồ sơ.
3. **config.js**: chứa SUPABASE_URL + ANON_KEY + client `sb` + TEN_VAI_TRO + taiKhoanThanhEmail()
   + baoVeTrang() (chặn trang nếu chưa đăng nhập) + dangXuat().
4. **index.html**: trang đăng nhập (logo cây may mắn SVG, xanh lá). Đăng nhập xong → trang_chu.html.
   Đã chạy đúng.
5. **trang_chu.html**: bảng điều khiển. Thanh trên (logo + tên + badge vai trò + Đăng xuất).
   10 ô chức năng hiện/ẩn theo quyền (mảng CHUC_NANG, mỗi ô có trang=null nghĩa chưa dựng →
   bấm báo "đang xây dựng"). Đã chạy đúng, admin thấy đủ 10 ô.

### ĐANG DỞ / LÀM TIẾP NGAY (nhịp hiện tại: QUẢN LÝ TÀI KHOẢN):
Vừa xong phần 1 (SQL policy admin ở trên). CÒN LẠI:
- **Phần 2 — Edge Function** trên Supabase để TẠO/KHÓA tài khoản. Bắt buộc dùng Edge Function
  vì trình duyệt không được phép tạo user người khác (cần service_role key, TUYỆT ĐỐI không để lộ ra HTML).
  Function nhận {sđt, mật khẩu, họ tên, vai trò} từ admin → tạo auth user (email = sđt@thaimyhuong.local)
  → chèn hồ sơ vào ho_so. Phải kiểm người gọi đúng là admin trước khi tạo.
- **Phần 3 — trang `quan_ly_taikhoan.html`** (chỉ admin): liệt kê người dùng, tạo tài khoản mới
  (SĐT + mật khẩu + vai trò), khóa/mở (đổi trang_thai). Gọi Edge Function ở trên.
  Nhớ gắn baoVeTrang() + kiểm vai_tro==='admin' đầu trang.

### THỨ TỰ DỰNG ĐÃ THỐNG NHẤT (từ khung ra chi tiết):
1. Trang chủ + đăng xuất + bảo vệ trang ✅ XONG.
2. **Quản lý tài khoản** ← ĐANG Ở ĐÂY (xong phần 1/3).
3. Các BẢNG DANH MỤC trong Supabase (khach_hang, hang_hoa/DATA, dinh_khoan_hang_hoa,
   tai_khoan_ngan_hang, danh_sach_xe, nhan_vien, nv_kinh_doanh, doi_ma_km) + trang nhập/sửa + nút UPLOAD KiotViet.
4. Dựng lại LOGIC 7 BƯỚC 1→7 (nặng nhất là Bước 2/3 tách phiếu và Bước 7 xuất MISA).

### QUYẾT ĐỊNH KIẾN TRÚC ĐÃ CHỐT:
- **Xử lý trong TRÌNH DUYỆT** (đọc file KiotViet bằng thư viện XLSX, tính bằng JavaScript trong trang),
  rồi LƯU KẾT QUẢ vào Supabase. KHÔNG xử lý ở máy chủ (giữ gần với Apps Script, dễ chuyển logic).
- Toàn bộ logic nghiệp vụ ở Mục 2 phải được BÊ NGUYÊN sang, đặc biệt các ổ gà: số lượng lẻ,
  định khoản theo mã, TK Nợ theo cách trả, KM, giao lại, thuế đã gồm/chưa gồm.
- Mọi bảng dữ liệu trong Supabase PHẢI bật RLS (repo public, anon key lộ ra ngoài).

---

## 4. LƯU Ý KHI TIẾP NHẬN
- Người dùng thao tác chậm nhưng chịu khó; hãy hướng dẫn từng cú click, xác nhận từng nhịp.
- Trước khi dựng bước xử lý nào, hỏi lại quy tắc nghiệp vụ nếu chưa chắc — kế toán rất nhạy,
  sai một chỗ (0,5→5; tiền mặt lệch) là sổ sách sai theo.
- File .gs Apps Script hiện có là "nguồn chân lý" về logic — bám theo đó khi viết lại cho web.
- Các danh mục (khách hàng, mã hàng, định khoản...) khách đã nhập công phu trong Google Sheet;
  sẽ chuyển sang Supabase, hoặc dựng lại bằng nút upload từ file KiotViet.

## 5. VIỆC KẾ TIẾP CỤ THỂ (bắt đầu ngay từ đây)
Viết **Edge Function tạo/khóa tài khoản** cho Supabase (phần 2 của nhịp Quản lý tài khoản),
hướng dẫn người dùng tạo function đó trên dashboard Supabase từng bước, rồi tới trang
`quan_ly_taikhoan.html`. Sau đó sang Mục 3 (danh mục + upload), rồi Mục 4 (logic 7 bước).
