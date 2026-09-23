/* ====================================================================
 * phan_quyen.js — BỘ MÁY PHÂN QUYỀN TỰ MỞ RỘNG & NHẬT KÝ KIỂM SOÁT HẬU KỲ
 * THÁI MỸ HƯƠNG — KiotViet ➡ MISA
 * ====================================================================
 * Nạp ngay SAU config.js ở mọi trang. File này bổ sung (và thay thế một số
 * hàm phân quyền cũ trong config.js bằng bản mới cùng tên):
 *
 * 1. Ma trận quyền TỰ MỞ RỘNG theo tính năng:
 *    - Mục (cột) = các trang cố định (MODULE_PHAN_QUYEN) + mục mới thêm vào menu
 *      (layout.js) + trang mới chưa khai báo (tự đăng ký khi có người mở).
 *    - Chức năng con (DANH_MUC_CHUC_NANG) = các thao tác nhạy cảm trong từng mục;
 *      thêm 1 dòng khai báo là tính năng mới tự hiện trong ma trận & tự bị kiểm soát.
 * 2. Áp dụng cho MỌI tài khoản nhân sự (kể cả Cấp 1). Riêng tài khoản Supabase
 *    chính thức (đăng nhập qua Supabase Auth) luôn toàn quyền, không chịu ma trận.
 * 3. Quyền = Quyền riêng của tài khoản (nếu có) › Quyền theo chức vụ › Mặc định theo Cấp.
 * 4. Mỗi lần mở trang: kiểm tra lại tài khoản trên máy chủ (bị xoá/khoá → đăng xuất),
 *    nạp lại quyền mới nhất.
 * 5. Nhật ký kiểm soát hậu kỳ (bảng nhat_ky_he_thong): đăng nhập, đổi quyền, đổi tài
 *    khoản, thao tác bị chặn và mọi lần ghi dữ liệu lên máy chủ.
 * ==================================================================== */

// ---------------------------------------------------------------------
// 1. DANH MỤC CHỨC NĂNG CON — thêm tính năng mới chỉ cần khai báo 1 dòng
//    loai 'ghi': thay đổi dữ liệu → cần quyền Toàn quyền ở mục
//    loai 'doc': xem / in / xuất file → cần ít nhất Chỉ xem ở mục
//    ham: tên các hàm (nút bấm) của tính năng trên các trang thuộc mục đó
// ---------------------------------------------------------------------
const DANH_MUC_CHUC_NANG = [
  // B1: Điều xe & Phiếu xuất kho
  { id: "dieuxe.luu_chuyen", module: "dieuxe", loai: "ghi", label: "Lưu chuyến xe (chuyển sang Bước 2)", ham: ["luuSangBuoc3"] },
  { id: "dieuxe.xoa_du_lieu", module: "dieuxe", loai: "ghi", label: "Xoá hoá đơn / file Excel đã nạp", ham: ["xoaMotHoaDon", "xoaCacHDDaChon", "xoaSachToanBoDuLieu", "xoaTatCaFileTam", "xoaChuDongFile"] },
  { id: "dieuxe.xoa_lich_su", module: "dieuxe", loai: "ghi", label: "Xoá chuyến xe khỏi lịch sử", ham: ["xoaMotChuyenXeKhoiLichSu"] },
  { id: "dieuxe.sua_danh_muc", module: "dieuxe", loai: "ghi", label: "Thêm / sửa / xoá nhanh Xe, Nhân sự, Quy cách", ham: ["themNhanhDanhMuc", "moQuanLyDanhMuc", "themTuModalDM", "suaMucDanhMuc", "xoaMucDanhMuc", "suaQuyCachNhanh"] },
  { id: "dieuxe.in_xuat", module: "dieuxe", loai: "doc", label: "In biểu mẫu & xuất Excel", ham: ["inBieuMau", "xuatExcelHienTai"] },
  // B2: Quyết toán thu tiền
  { id: "quyettoan.luu", module: "quyettoan", loai: "ghi", label: "Lưu quyết toán chuyến xe", ham: ["luuKetQuaQuyetToan"] },
  { id: "quyettoan.xoa_chuyen", module: "quyettoan", loai: "ghi", label: "Xoá dữ liệu chuyến xe", ham: ["xoaDuLieuChuyenXe"] },
  { id: "quyettoan.thu_no", module: "quyettoan", loai: "ghi", label: "Ghi thu nợ cũ qua xe", ham: ["themDongThuNoKhach", "chonThuNoDonNay", "xacNhanThuCacDonNoDaChon"] },
  { id: "quyettoan.danh_dau_thu_quy", module: "quyettoan", loai: "ghi", label: "Đánh dấu \"Đã thu quỹ\" trong sổ công nợ", ham: ["danhDauDaThuXong"] },
  { id: "quyettoan.in", module: "quyettoan", loai: "doc", label: "In bảng kê quyết toán", ham: ["inBangQuyetToan"] },
  // B3: Đẩy MISA & kho lưu trữ
  { id: "misa.xuat_file", module: "misa", loai: "doc", label: "Xuất file / copy dữ liệu MISA", ham: ["xuatFileExcelMISA", "copyDuLieuBangMISA", "xuatFileExcelThuNoMisa"] },
  { id: "misa.danh_dau_day", module: "misa", loai: "ghi", label: "Đánh dấu đã đẩy MISA", ham: ["danhDauDaDayMISA", "danhDauDaDayMisaThuNo"] },
  { id: "misa.sua_luu_tru", module: "misa", loai: "ghi", label: "Sửa / xoá / khôi phục kho lưu trữ", ham: ["moModalSuaDot", "luuSuaDot", "xoaDot", "xoaCacDongDaChon", "khoiPhucLichSu"] },
  // Báo cáo tổng hợp
  { id: "baocao.xuat_excel", module: "baocao", loai: "doc", label: "Xuất Excel báo cáo", ham: ["xuatExcelTongHop", "xuatExcelChiTiet"] },
  // Theo dõi công nợ
  { id: "congno.thu_no", module: "congno", loai: "ghi", label: "Thu nợ tại quỹ", ham: ["moModalThuNoTaiQuy", "moThuNoChoDon", "moThuNoChoKhachHang", "luuThuNoTaiQuy"] },
  { id: "congno.them_don", module: "congno", loai: "ghi", label: "Thêm đơn nợ ngoài bảng kê", ham: ["moModalThemDonThuCong", "luuDonNoThuCong"] },
  { id: "congno.xoa_don", module: "congno", loai: "ghi", label: "Xoá đơn nợ / hoàn tác xoá", ham: ["xoaDonNo", "xoaDonNoTrongModal", "hoanTacXoaDonNo"] },
  { id: "congno.in_xuat", module: "congno", loai: "doc", label: "In đối chiếu & xuất Excel công nợ", ham: ["inDoiChieuCongNoTuBoLoc", "inDoiChieuChoKhach", "inDoiChieuChoKhachDangXem", "xuatExcelCongNo", "xuatExcelBaoCaoCongNo", "inBaoCaoCongNo"] },
  { id: "congno.bao_cao", module: "congno", loai: "doc", label: "Xem báo cáo chi tiết (khách đã chọn, 4 thẻ tổng hợp, hàng hoá, đã thu)", ham: ["moBaoCaoDaChon", "moBaoCaoKPI"] },
  { id: "congno.xem_tra_truoc", module: "congno", loai: "doc", label: "Xem sổ tiền khách trả trước / trả dư", ham: ["moSoTraTruoc", "xemLichSuTraTruoc"] },
  { id: "congno.tra_truoc", module: "congno", loai: "ghi", label: "Nhận tiền trả trước & cấn trừ vào nợ", ham: ["moModalNhanTraTruoc", "luuNhanTraTruoc", "moModalCanTruTraTruoc", "xacNhanCanTruTraTruoc"] },
  { id: "congno.hoan_tien", module: "congno", loai: "ghi", label: "Hoàn tiền trả trước cho khách", ham: ["moModalHoanTienTraTruoc", "luuHoanTienTraTruoc"] },
  // Danh mục
  { id: "danhmuc.them_sua", module: "danhmuc", loai: "ghi", label: "Thêm / sửa bản ghi danh mục", ham: ["moModalThem", "moModalSua", "xuLyLuuBanGhi"] },
  { id: "danhmuc.xoa", module: "danhmuc", loai: "ghi", label: "Xoá bản ghi danh mục", ham: ["xoaBanGhi"] },
  { id: "danhmuc.nhap_excel", module: "danhmuc", loai: "ghi", label: "Nhập danh mục từ Excel", ham: ["docFileExcel"] },
  { id: "danhmuc.xuat_excel", module: "danhmuc", loai: "doc", label: "Xuất Excel / tải file mẫu", ham: ["xuatFileExcel", "taiFileMauExcel"] },
  // Tài khoản & Phân quyền
  { id: "taikhoan.them_sua", module: "taikhoan", loai: "ghi", label: "Thêm / sửa tài khoản", ham: ["moModalThemMoi", "moModalSua", "xuLyLuuTaiKhoan", "napDuLieuMau"] },
  { id: "taikhoan.khoa", module: "taikhoan", loai: "ghi", label: "Khoá / mở khoá tài khoản", ham: ["chuyenTrangThaiKhoa"] },
  { id: "taikhoan.doi_mk", module: "taikhoan", loai: "ghi", label: "Đặt lại mật khẩu", ham: ["moModalDoiMk", "xuLyDoiMatKhau"] },
  { id: "taikhoan.xoa", module: "taikhoan", loai: "ghi", label: "Xoá tài khoản", ham: ["xoaTaiKhoan"] },
  { id: "taikhoan.phan_quyen", module: "taikhoan", loai: "ghi", label: "Sửa ma trận & quyền riêng tài khoản", ham: ["luuMaTranPhanQuyen", "luuQuyenRiengTaiKhoan"] },
  { id: "taikhoan.nhat_ky", module: "taikhoan", loai: "doc", label: "Xem nhật ký kiểm soát", ham: ["taiNhatKyKiemSoat"] }
];

const TIEN_TO_QUYEN_TK = "@TK:";                      // dòng quyền riêng của 1 tài khoản trong phan_quyen_vi_tri
const KHOA_TRANG_TU_DANG_KY = "@HE_THONG:TRANG_MOI";  // danh sách trang mới tự đăng ký
const BANG_NHAT_KY = "nhat_ky_he_thong";
const MUC_QUYEN_HOP_LE = { all: 1, view: 1, none: 1 };

// ---------------------------------------------------------------------
// 2. TIỆN ÍCH CHUNG
// ---------------------------------------------------------------------
function _docHoSo() {
  try {
    const raw = localStorage.getItem("nhan_su_profile");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function _tenTrangHienTai() {
  return (window.location.pathname.split("/").pop() || "").split("?")[0];
}

function _voiThoiHan(p, ms) {
  return Promise.race([
    Promise.resolve(p),
    new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms); })
  ]);
}

// cac_quyen có thể là JSONB (object) hoặc TEXT (chuỗi JSON) tuỳ phiên bản bảng
function _chuanHoaQuyen(v) {
  if (!v) return {};
  if (typeof v === "string") { try { v = JSON.parse(v); } catch (e) { return {}; } }
  return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
}

function _laLoiThieuBang(err) {
  if (!err) return false;
  const msg = String(err.message || err.details || err.hint || "");
  return err.code === "PGRST205" || err.code === "42P01" || /Could not find the table/i.test(msg) || /does not exist/i.test(msg);
}

// Gọi thẳng REST của Supabase, không qua lớp chặn "chỉ xem" (dùng cho nhật ký & đăng ký trang)
function _bangTho(ten) {
  return (sb.rest && typeof sb.rest.from === "function") ? sb.rest.from(ten) : sb.from(ten);
}

function laSupabaseAdmin() {
  return window.TMH_LA_SUPABASE_ADMIN === true;
}

// ---------------------------------------------------------------------
// 3. DANH SÁCH MỤC (CỘT MA TRẬN) — TỰ MỞ RỘNG
// ---------------------------------------------------------------------
function docTrangTuDangKy() {
  try {
    const v = JSON.parse(localStorage.getItem("tmh_trang_tu_dang_ky") || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

function _luuTrangTuDangKy(quyen) {
  const ds = quyen && Array.isArray(quyen.trang) ? quyen.trang : [];
  try { localStorage.setItem("tmh_trang_tu_dang_ky", JSON.stringify(ds)); } catch (e) {}
}

function danhSachModuleDayDu() {
  const ds = MODULE_PHAN_QUYEN.map(function (m) { return { id: m.id, label: m.label, trang: m.trang.slice(), nguon: "co_dinh" }; });
  const timTheoTrang = function (f) { return ds.find(function (m) { return m.trang.indexOf(f) !== -1; }); };
  // Mục mới thêm vào menu (layout.js) tự thành 1 cột
  if (typeof DANH_SACH_7_BUOC !== "undefined") {
    DANH_SACH_7_BUOC.forEach(function (b) {
      const m = ds.find(function (x) { return x.id === b.mod; });
      if (m) { if (m.trang.indexOf(b.href) === -1) m.trang.push(b.href); }
      else if (!timTheoTrang(b.href)) ds.push({ id: b.mod || ("trang:" + b.href), label: b.label, trang: [b.href], nguon: "menu", moi: true });
    });
  }
  if (typeof MENU_CHINH !== "undefined") {
    MENU_CHINH.forEach(function (mn) {
      if (mn.isProcess || !mn.href) return;
      if (ds.some(function (x) { return x.id === mn.id; }) || timTheoTrang(mn.href)) return;
      ds.push({ id: mn.id, label: mn.label, trang: [mn.href], nguon: "menu", moi: true });
    });
  }
  // Trang mới chưa khai báo ở đâu cả — tự đăng ký khi có người mở
  docTrangTuDangKy().forEach(function (t) {
    if (!t || !t.file || timTheoTrang(t.file)) return;
    ds.push({ id: "trang:" + t.file, label: t.tieuDe || t.file, trang: [t.file], nguon: "tu_dang_ky", moi: true });
  });
  return ds;
}

/** Mục tương ứng với 1 trang (thay bản cũ trong config.js: trang lạ cũng bị kiểm soát) */
function layModuleCuaTrang(fileName) {
  const f = fileName || _tenTrangHienTai();
  const m = danhSachModuleDayDu().find(function (x) { return x.trang.indexOf(f) !== -1; });
  if (m) return m.id;
  if (!f || f === "index.html" || !/^[\w\-.]+\.html$/i.test(f)) return null;
  return "trang:" + f;
}

function timChucNang(id) {
  return DANH_MUC_CHUC_NANG.find(function (c) { return c.id === id; }) || null;
}

// ---------------------------------------------------------------------
// 4. TÍNH QUYỀN
// ---------------------------------------------------------------------
/**
 * Mức quyền 1 mục (thay bản cũ trong config.js):
 * - Có cấu hình → dùng luôn (KỂ CẢ tài khoản Cấp 1 — ma trận áp dụng cho mọi tài khoản nhân sự).
 * - Dữ liệu cũ 7 bước (buoc1..7) → quy đổi như trước.
 * - Chưa cấu hình → mặc định theo Cấp: Cấp 1 toàn quyền; mục cố định giữ mặc định cũ;
 *   mục / trang MỚI chưa cấu hình: Cấp 2 chỉ xem, Cấp 3 chưa được vào (chờ quản trị cấp quyền).
 */
function tinhQuyenModule(pq, moduleId, cap) {
  if (pq && MUC_QUYEN_HOP_LE[pq[moduleId]]) return pq[moduleId];
  if (pq) {
    let cu = null;
    if (moduleId === "dieuxe") cu = _quyenCaoNhat(pq, ["buoc1", "buoc2", "buoc3"]);
    else if (moduleId === "quyettoan") cu = _quyenCaoNhat(pq, ["buoc4", "buoc5", "buoc6"]);
    else if (moduleId === "misa") cu = _quyenCaoNhat(pq, ["buoc7"]);
    if (cu) return cu;
  }
  if (cap === 1) return "all";
  if (moduleId === "taikhoan") return "none";
  if (moduleId === "baocao") return cap <= 2 ? "all" : "none";
  const laMucCoDinh = MODULE_PHAN_QUYEN.some(function (m) { return m.id === moduleId; });
  if (!laMucCoDinh) return cap === 2 ? "view" : "none";
  return "all";
}

/** Chức vụ đã cấu hình mục này chưa (kể cả dữ liệu cũ 7 bước) — chưa thì đang dùng mặc định theo Cấp */
function coCauHinhModule(pq, moduleId) {
  if (!pq) return false;
  if (MUC_QUYEN_HOP_LE[pq[moduleId]]) return true;
  if (moduleId === "dieuxe") return !!_quyenCaoNhat(pq, ["buoc1", "buoc2", "buoc3"]);
  if (moduleId === "quyettoan") return !!_quyenCaoNhat(pq, ["buoc4", "buoc5", "buoc6"]);
  if (moduleId === "misa") return !!_quyenCaoNhat(pq, ["buoc7"]);
  return false;
}

/** Chức năng con có được dùng không, theo mức quyền của mục và giá trị cấu hình (allow/deny) */
function tinhDuocChucNang(cn, mucModule, giaTri) {
  if (mucModule === "none") return false;
  if (cn.loai === "ghi" && mucModule !== "all") return false;
  return giaTri !== "deny";
}

/** Gộp quyền: quyền riêng của tài khoản đè lên quyền theo chức vụ ('inherit' = theo chức vụ) */
function gopQuyen(quyenCV, quyenTK) {
  const kq = Object.assign({}, _chuanHoaQuyen(quyenCV));
  const tk = _chuanHoaQuyen(quyenTK);
  Object.keys(tk).forEach(function (k) {
    if (tk[k] && tk[k] !== "inherit") kq[k] = tk[k];
  });
  return kq;
}

/** Quyền của người dùng hiện tại với 1 mục: 'all' | 'view' | 'none' */
function layQuyenModule(moduleKey) {
  if (laSupabaseAdmin()) return "all";
  const c = _docCapVaMaTranHienTai();
  return tinhQuyenModule(c.pq, moduleKey, c.cap);
}

/** Người dùng hiện tại có được dùng chức năng con này không */
function layQuyenChucNang(id) {
  if (laSupabaseAdmin()) return true;
  const cn = timChucNang(id);
  if (!cn) return true;
  const c = _docCapVaMaTranHienTai();
  return tinhDuocChucNang(cn, tinhQuyenModule(c.pq, cn.module, c.cap), c.pq ? c.pq["cn:" + id] : undefined);
}

/**
 * Quyền hiệu lực đầy đủ của 1 tài khoản (dùng cho trang quản trị & kiểm soát hậu kỳ)
 * @returns {{ modules: Object<string,{muc,nguon}>, chucNang: Object<string,{duoc,nguon}> }}
 *   nguon: 'rieng' (quyền riêng TK) | 'chuc_vu' | 'mac_dinh' (theo Cấp) | 'muc' (do mức của mục)
 */
function tinhQuyenHieuLucTaiKhoan(tk, quyenCV, quyenTK) {
  const cap = parseInt(tk.phan_loai_tk) || 3;
  const cv = _chuanHoaQuyen(quyenCV);
  const rieng = _chuanHoaQuyen(quyenTK);
  const gop = gopQuyen(cv, rieng);
  const kq = { modules: {}, chucNang: {} };
  danhSachModuleDayDu().forEach(function (m) {
    const muc = tinhQuyenModule(gop, m.id, cap);
    let nguon = "mac_dinh";
    if (MUC_QUYEN_HOP_LE[rieng[m.id]]) nguon = "rieng";
    else if (coCauHinhModule(cv, m.id)) nguon = "chuc_vu";
    kq.modules[m.id] = { muc: muc, nguon: nguon };
  });
  DANH_MUC_CHUC_NANG.forEach(function (c) {
    const muc = kq.modules[c.module] ? kq.modules[c.module].muc : tinhQuyenModule(gop, c.module, cap);
    const duoc = tinhDuocChucNang(c, muc, gop["cn:" + c.id]);
    let nguon = "muc";
    if (rieng["cn:" + c.id] === "deny" || rieng["cn:" + c.id] === "allow") nguon = "rieng";
    else if (cv["cn:" + c.id] === "deny") nguon = "chuc_vu";
    kq.chucNang[c.id] = { duoc: duoc, nguon: nguon };
  });
  return kq;
}

// ---------------------------------------------------------------------
// 5. XÁC MINH TÀI KHOẢN SUPABASE CHÍNH THỨC & KIỂM TRA LẠI TÀI KHOẢN NHÂN SỰ
// ---------------------------------------------------------------------
// 'co' | 'khong' | 'het_han' (hồ sơ Supabase nhưng hết phiên) | 'loi' (không kiểm tra được)
async function xacMinhSupabaseAdmin(hoSo) {
  if (typeof sb === "undefined" || !sb.auth || typeof sb.auth.getSession !== "function") return "khong";
  const laHoSoSupabase = !!(hoSo && hoSo.nguon_tai_khoan === "supabase_auth");
  try {
    const r = await _voiThoiHan(sb.auth.getSession(), 4000);
    const u = r && r.data && r.data.session && r.data.session.user;
    if (!u) return laHoSoSupabase ? "het_han" : "khong";
    if (!hoSo) return "co"; // phiên Supabase Auth không kèm hồ sơ nhân sự (xem baoVeTrang trong config.js)
    if (laHoSoSupabase) return (!hoSo.auth_uid || hoSo.auth_uid === u.id) ? "co" : "het_han";
    // Phiên đăng nhập bằng email Supabase từ trước khi có đánh dấu nguồn tài khoản
    const email = String(u.email || "").toLowerCase();
    const tk = String(hoSo.so_dien_thoai || "").toLowerCase();
    if (email && (email === tk || email === tk.replace(/[^0-9+]/g, "") + "@thaimyhuong.local")) {
      hoSo.nguon_tai_khoan = "supabase_auth";
      hoSo.auth_uid = u.id;
      try { localStorage.setItem("nhan_su_profile", JSON.stringify(hoSo)); } catch (e) {}
      return "co";
    }
    return "khong";
  } catch (e) {
    return laHoSoSupabase ? "loi" : "khong";
  }
}

// Kiểm tra lại tài khoản nhân sự trên máy chủ mỗi lần mở trang.
// Trả về hồ sơ mới | null (không kiểm tra được, giữ phiên) | 'dang_xuat'
async function _kiemTraLaiTaiKhoan(hoSo) {
  try {
    const res = await _voiThoiHan(sb.from("nhan_su").select("*").eq("so_dien_thoai", hoSo.so_dien_thoai).maybeSingle(), 4000);
    if (!res || res.error) return null;
    if (!res.data) {
      // Bảng nhân sự còn trống (mới cài đặt) thì chưa kiểm soát được
      const dem = await _voiThoiHan(sb.from("nhan_su").select("so_dien_thoai", { count: "exact", head: true }), 4000);
      if (!dem || dem.error || !dem.count) return null;
      await ghiNhatKy("tu_choi", { noi_dung: "Phiên đăng nhập bị huỷ: tài khoản không còn trong danh sách nhân sự" }, true);
      alert("🔒 Tài khoản " + hoSo.so_dien_thoai + " không còn trong danh sách tài khoản nhân sự của công ty.\nPhiên đăng nhập sẽ kết thúc.");
      await dangXuat();
      return "dang_xuat";
    }
    const r = res.data;
    if (r.trang_thai === "khoa" || r.trang_thai_lam_viec === "Đã nghỉ việc") {
      await ghiNhatKy("tu_choi", { noi_dung: "Phiên đăng nhập bị huỷ: tài khoản đã bị khoá" }, true);
      alert("🔒 Tài khoản của bạn đã bị KHOÁ hoặc đã nghỉ việc. Phiên đăng nhập sẽ kết thúc.");
      await dangXuat();
      return "dang_xuat";
    }
    const moi = Object.assign({}, hoSo, r);
    delete moi.mat_khau_app;
    moi.phan_loai_tk = parseInt(r.phan_loai_tk) || parseInt(hoSo.phan_loai_tk) || 3;
    localStorage.setItem("nhan_su_profile", JSON.stringify(moi));
    localStorage.setItem("userChucVu", moi.chuc_vu || "");
    localStorage.setItem("userCapDo", moi.phan_loai_tk);
    return moi;
  } catch (e) {
    return null;
  }
}

/**
 * Nạp lại quyền mới nhất (thay bản cũ trong config.js; layout.js gọi hàm này mỗi lần mở trang).
 * @param {string} chucVu  chức vụ trong phiên hiện tại
 * @param {Object} [nd]    hồ sơ đang dùng để vẽ giao diện — được cập nhật theo số liệu mới nhất
 */
async function lamMoiMaTranQuyen(chucVu, nd) {
  window.TMH_LA_SUPABASE_ADMIN = false;
  if (typeof sb === "undefined") return;
  let hoSo = _docHoSo();

  // 1. Tài khoản Supabase chính thức → toàn quyền, không áp ma trận
  const kqAdmin = await xacMinhSupabaseAdmin(hoSo);
  if (kqAdmin === "co") {
    window.TMH_LA_SUPABASE_ADMIN = true;
    if (nd) { nd.ten_cap = "Quản trị Supabase"; nd.cap_tai_khoan = 1; }
    _napTrangTuDangKy();
    _dangKyTrangNeuMoi();
    return;
  }
  if (kqAdmin === "het_han") {
    alert("🔒 Phiên đăng nhập Supabase của bạn đã hết hạn. Vui lòng đăng nhập lại.");
    await dangXuat();
    return new Promise(function () {});
  }

  // 2. Tài khoản nhân sự: kiểm tra lại trên máy chủ (bị xoá / khoá / đổi chức vụ có hiệu lực ngay)
  let cv = chucVu;
  const sdt = hoSo && hoSo.so_dien_thoai;
  if (sdt && kqAdmin !== "loi") {
    const kq = await _kiemTraLaiTaiKhoan(hoSo);
    if (kq === "dang_xuat") return new Promise(function () {});
    if (kq) {
      hoSo = kq;
      cv = kq.chuc_vu || cv;
      if (nd) {
        nd.ho_ten = kq.ho_ten || nd.ho_ten;
        nd.chuc_vu = kq.chuc_vu || nd.chuc_vu;
        nd.cap_tai_khoan = kq.phan_loai_tk;
        nd.ten_cap = (CAP_TAI_KHOAN[kq.phan_loai_tk] || CAP_TAI_KHOAN[3]).ten;
      }
    }
  }

  // 3. Quyền theo chức vụ + quyền riêng của tài khoản + danh sách trang mới (1 lần gọi)
  try {
    const dsKhoa = [cv, sdt ? TIEN_TO_QUYEN_TK + sdt : null, KHOA_TRANG_TU_DANG_KY].filter(Boolean);
    const res = await _voiThoiHan(sb.from("phan_quyen_vi_tri").select("chuc_vu, cac_quyen").in("chuc_vu", dsKhoa), 4000);
    if (res && !res.error && Array.isArray(res.data)) {
      const tim = function (k) { const r = res.data.find(function (x) { return x.chuc_vu === k; }); return r ? _chuanHoaQuyen(r.cac_quyen) : null; };
      const quyenTK = (sdt && tim(TIEN_TO_QUYEN_TK + sdt)) || {};
      localStorage.setItem("userPermissions", JSON.stringify(gopQuyen(tim(cv) || {}, quyenTK)));
      localStorage.setItem("tmh_quyen_rieng_tk", JSON.stringify(quyenTK));
      const trang = tim(KHOA_TRANG_TU_DANG_KY);
      if (trang) _luuTrangTuDangKy(trang);
    }
  } catch (e) { /* mất mạng: giữ quyền đã lưu trên máy */ }

  // 4. Trang chưa có trong danh mục → tự đăng ký để hiện trong ma trận
  _dangKyTrangNeuMoi();
}

function _napTrangTuDangKy() {
  try {
    _bangTho("phan_quyen_vi_tri").select("cac_quyen").eq("chuc_vu", KHOA_TRANG_TU_DANG_KY).maybeSingle()
      .then(function (r) { if (r && !r.error && r.data) _luuTrangTuDangKy(_chuanHoaQuyen(r.data.cac_quyen)); }, function () {});
  } catch (e) {}
}

function _dangKyTrangNeuMoi() {
  try {
    const f = _tenTrangHienTai();
    if (!f || f === "index.html" || !/^[\w\-.]+\.html$/i.test(f)) return;
    const coDinh = danhSachModuleDayDu().some(function (m) { return m.nguon !== "tu_dang_ky" && m.trang.indexOf(f) !== -1; });
    if (coDinh) return;
    const ds = docTrangTuDangKy();
    if (ds.some(function (t) { return t && t.file === f; })) return;
    ds.push({ file: f, tieuDe: String(document.title || f).split("—")[0].trim(), lanDau: new Date().toISOString() });
    _luuTrangTuDangKy({ trang: ds });
    _bangTho("phan_quyen_vi_tri").upsert({ chuc_vu: KHOA_TRANG_TU_DANG_KY, cac_quyen: { trang: ds }, cap_nhat_luc: new Date().toISOString() })
      .then(function () {}, function () {});
    ghiNhatKy("trang_moi", { doi_tuong: f, noi_dung: "Phát hiện trang mới chưa có trong ma trận phân quyền: " + f });
  } catch (e) {}
}

/** Đăng xuất (thay bản cũ trong config.js: ghi nhật ký & xoá thêm dữ liệu phiên) */
async function dangXuat() {
  try { await ghiNhatKy("dang_xuat", { noi_dung: "Đăng xuất" }, true); } catch (e) {}
  ["userAccount", "nhan_su_profile", "userPermissions", "userRole", "userChucVu", "userCapDo", "tmh_quyen_rieng_tk"]
    .forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
  try { await sb.auth.signOut(); } catch (e) {}
  window.location.href = "index.html";
}

// ---------------------------------------------------------------------
// 6. CHẶN CHỨC NĂNG CON TRÊN TRANG (không sửa code tính năng — chỉ "bọc" hàm nút bấm)
// ---------------------------------------------------------------------
const _hamBiChan = new Map(); // tên hàm -> chức năng

function thongBaoQuyen(msg) {
  let t = document.getElementById("tmhToastQuyen");
  if (!t) {
    t = document.createElement("div");
    t.id = "tmhToastQuyen";
    t.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483000;background:#7f1d1d;color:#fff;padding:11px 18px;border-radius:10px;font:700 13px/1.4 sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.25);max-width:92vw;text-align:center;transition:opacity .25s;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hen);
  t._hen = setTimeout(function () { t.style.opacity = "0"; }, 3800);
}

const _lanBaoChan = {};
function _baoBiChan(cn) {
  thongBaoQuyen("🔒 Bạn không có quyền: " + cn.label + ". Liên hệ quản trị để được cấp quyền.");
  const now = Date.now();
  if (!_lanBaoChan[cn.id] || now - _lanBaoChan[cn.id] > 30000) {
    _lanBaoChan[cn.id] = now;
    ghiNhatKy("tu_choi", { module: cn.module, doi_tuong: cn.id, noi_dung: "Bị chặn thao tác: " + cn.label });
  }
}

function apDungQuyenChucNang() {
  if (laSupabaseAdmin()) return;
  const modTrang = layModuleCuaTrang();
  if (!modTrang) return;
  DANH_MUC_CHUC_NANG.forEach(function (cn) {
    if (cn.module !== modTrang || layQuyenChucNang(cn.id)) return;
    cn.ham.forEach(function (ten) {
      const goc = window[ten];
      if (typeof goc !== "function" || goc.__tmhBiChan) return;
      const boc = function () {
        const e = arguments[0];
        if (e && typeof e.preventDefault === "function") e.preventDefault(); // nút submit form
        _baoBiChan(cn);
        return undefined;
      };
      boc.__tmhBiChan = true;
      window[ten] = boc;
      _hamBiChan.set(ten, cn);
    });
  });
  if (_hamBiChan.size) {
    _chenCSSNutBiChan();
    danhDauNutBiChan(document.body);
    new MutationObserver(function (ds) {
      ds.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) danhDauNutBiChan(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
}

function _chenCSSNutBiChan() {
  if (document.getElementById("tmhCSSBiChan")) return;
  const st = document.createElement("style");
  st.id = "tmhCSSBiChan";
  st.textContent = ".tmh-bi-chan{opacity:.45 !important;filter:grayscale(1);cursor:not-allowed !important;}";
  document.head.appendChild(st);
}

// Làm mờ các nút của chức năng bị chặn (kể cả nút sinh ra sau này trong bảng)
function danhDauNutBiChan(goc) {
  if (!goc || !_hamBiChan.size) return;
  const cacNut = [];
  if (goc.matches && goc.matches("[onclick],[onchange]")) cacNut.push(goc);
  if (goc.querySelectorAll) goc.querySelectorAll("[onclick],[onchange]").forEach(function (el) { cacNut.push(el); });
  cacNut.forEach(function (el) {
    const code = (el.getAttribute("onclick") || "") + " " + (el.getAttribute("onchange") || "");
    _hamBiChan.forEach(function (cn, ten) {
      if (new RegExp("\\b" + ten + "\\s*\\(").test(code)) {
        el.classList.add("tmh-bi-chan");
        el.title = "🔒 Không có quyền: " + cn.label;
      }
    });
  });
}

// ---------------------------------------------------------------------
// 7. NHẬT KÝ KIỂM SOÁT HẬU KỲ (bảng nhat_ky_he_thong — sql/11)
// ---------------------------------------------------------------------
function _nhatKyDangTat() {
  try { return Date.now() < parseInt(sessionStorage.getItem("tmh_nhat_ky_tat_den") || "0"); } catch (e) { return false; }
}

function _xuLyLoiNhatKy(err) {
  if (_laLoiThieuBang(err)) {
    // Chưa chạy sql/11: tạm tắt 10 phút để không gọi lỗi liên tục
    try { sessionStorage.setItem("tmh_nhat_ky_tat_den", String(Date.now() + 10 * 60 * 1000)); } catch (e) {}
  }
}

function _thongTinNguoiDung() {
  const hs = _docHoSo() || {};
  return {
    sdt: hs.so_dien_thoai || hs.email || "",
    ho_ten: hs.ho_ten || "",
    chuc_vu: hs.chuc_vu || "",
    cap: parseInt(hs.phan_loai_tk) || null,
    la_admin_supabase: laSupabaseAdmin()
  };
}

/**
 * Ghi 1 dòng nhật ký. loai: dang_nhap | dang_nhap_loi | dang_xuat | phan_quyen | tai_khoan | tu_choi | ghi_du_lieu | trang_moi
 * @param {Object} info  { module, doi_tuong, noi_dung, chi_tiet, ... } (đè lên thông tin người dùng mặc định)
 * @param {boolean} doiGuiXong  chờ gửi xong (tối đa 1,5 giây) — dùng trước khi chuyển trang
 */
async function ghiNhatKy(loai, info, doiGuiXong) {
  if (typeof sb === "undefined" || _nhatKyDangTat()) return;
  try {
    const dong = Object.assign({
      loai: loai,
      trang: _tenTrangHienTai(),
      module: layModuleCuaTrang() || null,
      thiet_bi: String(navigator.userAgent || "").slice(0, 180)
    }, _thongTinNguoiDung(), info || {});
    const p = _bangTho(BANG_NHAT_KY).insert([dong]).then(function (r) { if (r && r.error) _xuLyLoiNhatKy(r.error); }, function () {});
    if (doiGuiXong) await _voiThoiHan(p, 1500).catch(function () {});
  } catch (e) {}
}

// Mọi lần ghi dữ liệu lên máy chủ (insert/update/upsert/delete) được gom lại mỗi 8 giây
const _hangDoiGhi = new Map();
let _henGuiGhi = null;
const _TEN_THAO_TAC = { insert: "Thêm", update: "Sửa", upsert: "Lưu", delete: "Xoá" };

function _ghiNhanThaoTacGhi(bang, thaoTac, soDong, loi) {
  const k = bang + "|" + thaoTac + "|" + (loi ? "loi" : "ok");
  const it = _hangDoiGhi.get(k) || { bang: bang, thao_tac: thaoTac, so_lan: 0, so_dong: 0, loi: "" };
  it.so_lan += 1;
  it.so_dong += soDong || 0;
  if (loi) it.loi = String(loi.message || loi).slice(0, 300);
  _hangDoiGhi.set(k, it);
  if (!_henGuiGhi) _henGuiGhi = setTimeout(_guiHangDoiGhi, 8000);
}

function _guiHangDoiGhi() {
  clearTimeout(_henGuiGhi);
  _henGuiGhi = null;
  if (!_hangDoiGhi.size || typeof sb === "undefined" || _nhatKyDangTat()) { _hangDoiGhi.clear(); return; }
  const nguoi = _thongTinNguoiDung();
  const trang = _tenTrangHienTai();
  const mod = layModuleCuaTrang() || null;
  const dsDong = Array.from(_hangDoiGhi.values()).map(function (it) {
    return Object.assign({
      loai: "ghi_du_lieu", trang: trang, module: mod, doi_tuong: it.bang,
      noi_dung: (_TEN_THAO_TAC[it.thao_tac] || it.thao_tac) + " dữ liệu bảng " + it.bang +
        (it.so_dong ? " — " + it.so_dong + " dòng" : "") + " (" + it.so_lan + " lần)" + (it.loi ? " — LỖI: " + it.loi : ""),
      chi_tiet: it
    }, nguoi);
  });
  _hangDoiGhi.clear();
  try { _bangTho(BANG_NHAT_KY).insert(dsDong).then(function (r) { if (r && r.error) _xuLyLoiNhatKy(r.error); }, function () {}); } catch (e) {}
}
window.addEventListener("pagehide", _guiHangDoiGhi);

(function theoDoiGhiDuLieu() {
  if (typeof sb === "undefined" || sb.__tmhNhatKy) return;
  sb.__tmhNhatKy = true;
  const fromTruoc = sb.from.bind(sb); // đã qua lớp chặn "chỉ xem" của config.js
  sb.from = function (bang) {
    const q = fromTruoc(bang);
    if (bang === BANG_NHAT_KY || !q) return q;
    ["insert", "update", "upsert", "delete"].forEach(function (m) {
      const fn = q[m];
      if (typeof fn !== "function") return;
      q[m] = function () {
        if (window.TMH_CHE_DO_XEM) {
          ghiNhatKy("tu_choi", { doi_tuong: bang, noi_dung: "Bị chặn " + (_TEN_THAO_TAC[m] || m).toLowerCase() + " dữ liệu bảng " + bang + " (chỉ có quyền xem)" });
          return fn.apply(q, arguments);
        }
        const tham = arguments[0];
        const soDong = (m === "insert" || m === "upsert") ? (Array.isArray(tham) ? tham.length : 1) : 0;
        const b = fn.apply(q, arguments);
        try {
          if (b && typeof b.then === "function" && !b.__tmhGhiLog) {
            const thenGoc = b.then;
            b.then = function (ok, loi) {
              return thenGoc.call(b, function (res) {
                try { _ghiNhanThaoTacGhi(bang, m, soDong, res && res.error); } catch (e) {}
                return res;
              }).then(ok, loi);
            };
            b.__tmhGhiLog = true;
          }
        } catch (e) {}
        return b;
      };
    });
    return q;
  };
})();
