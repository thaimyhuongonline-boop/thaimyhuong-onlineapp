/* ====================================================================
 * config.js — CẤU HÌNH CHUNG cho mọi trang của app THÁI MỸ HƯƠNG
 * ====================================================================
 * Quản lý kết nối Supabase, phiên đăng nhập nhân sự (ID: Số điện thoại)
 * và phân loại tài khoản 3 cấp: 1. Toàn quyền | 2. Cấp quản lý | 3. Nhân sự
 * ==================================================================== */

// 1) URL & API Key của Supabase
const SUPABASE_URL = "https://oedidnctnteeegkdcwaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGlkbmN0bnRlZWVna2Rjd2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzE3MTYsImV4cCI6MjEwNDkwNzcxNn0.3ZO5ZO9_VJ7vsr9qC586kXl4XAbDCjQcamP66FkDkTE";

// Tạo kết nối dùng chung
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2) ĐỊNH NGHĨA 3 CẤP TÀI KHOẢN CHUẨN DO THÁI MỸ HƯƠNG QUY ĐỊNH
const CAP_TAI_KHOAN = {
  1: { cap: 1, ma: "toan_quyen", ten: "Toàn quyền", badgeClass: "badge-cap-1", moTa: "Ban Giám Đốc / Toàn quyền hệ thống", vaiTroCu: "admin" },
  2: { cap: 2, ma: "quan_ly", ten: "Cấp Quản lý", badgeClass: "badge-cap-2", moTa: "Cấp Quản lý / Soát xét", vaiTroCu: "quanly" },
  3: { cap: 3, ma: "nhan_su", ten: "Nhân sự", badgeClass: "badge-cap-3", moTa: "Nhân sự tác nghiệp", vaiTroCu: "nhanvien" }
};

// Map tên vai trò hiển thị tương thích
const TEN_VAI_TRO = {
  admin: "Toàn quyền (Cấp 1)",
  quanly: "Cấp quản lý (Cấp 2)",
  nhanvien: "Nhân sự (Cấp 3)"
};

// 3) DANH SÁCH 20 CHUYẾN XE CHÍNH THỨC CÔNG TY THÁI MỸ HƯƠNG
const DANH_SACH_XE_MAC_DINH = [
  { ma_xe: "XE01", bien_so: "", loai_xe: "HĐ1 SÁNG", tai_xe_mac_dinh: "SINH", ghi_chu: "HĐ1 SÁNG" },
  { ma_xe: "XE02", bien_so: "", loai_xe: "HĐ2 SÁNG", tai_xe_mac_dinh: "HẢI", ghi_chu: "HĐ2 SÁNG" },
  { ma_xe: "XE03", bien_so: "", loai_xe: "HĐ3 SÁNG", tai_xe_mac_dinh: "ĐẠT", ghi_chu: "HĐ3 SÁNG" },
  { ma_xe: "XE04", bien_so: "", loai_xe: "HĐ1 CHIỀU", tai_xe_mac_dinh: "SINH", ghi_chu: "HĐ1 CHIỀU" },
  { ma_xe: "XE05", bien_so: "", loai_xe: "HĐ2 CHIỀU", tai_xe_mac_dinh: "HẢI", ghi_chu: "HĐ2 CHIỀU" },
  { ma_xe: "XE06", bien_so: "", loai_xe: "HĐ3 CHIỀU", tai_xe_mac_dinh: "ĐẠT", ghi_chu: "HĐ3 CHIỀU" },
  { ma_xe: "XE07", bien_so: "", loai_xe: "THUÊ SÁNG", tai_xe_mac_dinh: "", ghi_chu: "THUÊ SÁNG" },
  { ma_xe: "XE08", bien_so: "", loai_xe: "THUÊ CHIỀU", tai_xe_mac_dinh: "", ghi_chu: "THUÊ CHIỀU" },
  { ma_xe: "XE09", bien_so: "", loai_xe: "ĐEN SÁNG", tai_xe_mac_dinh: "", ghi_chu: "ĐEN SÁNG" },
  { ma_xe: "XE10", bien_so: "", loai_xe: "ĐEN CHIỀU", tai_xe_mac_dinh: "", ghi_chu: "ĐEN CHIỀU" },
  { ma_xe: "XE11", bien_so: "", loai_xe: "ĐỎ SÁNG", tai_xe_mac_dinh: "", ghi_chu: "ĐỎ SÁNG" },
  { ma_xe: "XE12", bien_so: "", loai_xe: "ĐỎ CHIỀU", tai_xe_mac_dinh: "", ghi_chu: "ĐỎ CHIỀU" },
  { ma_xe: "XE13", bien_so: "", loai_xe: "XANH SÁNG", tai_xe_mac_dinh: "", ghi_chu: "XANH SÁNG" },
  { ma_xe: "XE14", bien_so: "", loai_xe: "XANH CHIỀU", tai_xe_mac_dinh: "", ghi_chu: "XANH CHIỀU" },
  { ma_xe: "XE15", bien_so: "", loai_xe: "NGUYEN NISSIN", tai_xe_mac_dinh: "", ghi_chu: "NGUYEN NISSIN" },
  { ma_xe: "XE16", bien_so: "", loai_xe: "NGHĨA NS", tai_xe_mac_dinh: "", ghi_chu: "NGHĨA NS" },
  { ma_xe: "XE17", bien_so: "", loai_xe: "VY EM NS", tai_xe_mac_dinh: "", ghi_chu: "VY EM NS" },
  { ma_xe: "XE18", bien_so: "", loai_xe: "VŨ", tai_xe_mac_dinh: "", ghi_chu: "VŨ" },
  { ma_xe: "XE19", bien_so: "", loai_xe: "NGUYỆT", tai_xe_mac_dinh: "", ghi_chu: "NGUYỆT" },
  { ma_xe: "XE20", bien_so: "", loai_xe: "NAM", tai_xe_mac_dinh: "", ghi_chu: "NAM" }
];

/**
 * Hàm làm sạch số điện thoại đăng nhập
 */
function lamSachSoDienThoai(sdt) {
  if (!sdt) return "";
  return sdt.toString().trim().replace(/[^0-9+]/g, "");
}

/**
 * Kiểm tra phiên đăng nhập và bảo vệ trang
 * Trả về thông tin hồ sơ nhân sự đầy đủ nếu hợp lệ, ngược lại chuyển về trang đăng nhập
 */
async function baoVeTrang() {
  var nsRaw = localStorage.getItem("nhan_su_profile");
  if (!nsRaw) {
    // Thử kiểm tra session Supabase Auth cũ nếu có
    try {
      var phien = await sb.auth.getSession();
      if (phien.data && phien.data.session) {
        var uid = phien.data.session.user.id;
        var hs = await sb.from("ho_so").select("*").eq("id", uid).maybeSingle();
        if (hs && hs.data && hs.data.trang_thai !== "khoa" && hs.data.trang_thai !== "bi_khoa") {
          return {
            uid: uid,
            so_dien_thoai: phien.data.session.user.email ? phien.data.session.user.email.split('@')[0] : "admin",
            ho_ten: hs.data.ho_ten || "Quản trị viên",
            chuc_vu: "Giám đốc Điều hành",
            cap_tai_khoan: 1,
            ten_cap: "Toàn quyền",
            vai_tro: "admin",
            trang_thai: "hoat_dong"
          };
        }
      }
    } catch (e) {}

    window.location.href = "index.html";
    return null;
  }

  try {
    var ns = JSON.parse(nsRaw);
    if (!ns || ns.trang_thai === "khoa" || ns.trang_thai_lam_viec === "Đã nghỉ việc") {
      alert("🔒 Tài khoản của bạn đang bị khóa hoặc đã nghỉ việc.");
      await dangXuat();
      return null;
    }

    var cap = parseInt(ns.phan_loai_tk) || (ns.vai_tro_app === "Admin" ? 1 : (ns.vai_tro_app === "Quản trị viên" ? 2 : 3));
    var thongTinCap = CAP_TAI_KHOAN[cap] || CAP_TAI_KHOAN[3];

    return {
      uid: ns.so_dien_thoai || ns.so_cccd,
      so_dien_thoai: ns.so_dien_thoai,
      ho_ten: ns.ho_ten || "Quý nhân viên",
      chuc_vu: ns.chuc_vu || ns.vi_tri_cong_viec || "Nhân sự",
      cap_tai_khoan: cap,
      ten_cap: thongTinCap.ten,
      vai_tro: thongTinCap.vaiTroCu,
      bo_phan: ns.bo_phan || "",
      khoi: ns.khoi || "",
      trang_thai: "hoat_dong",
      du_lieu_goc: ns
    };
  } catch (err) {
    console.error("Lỗi đọc hồ sơ nhân sự:", err);
    window.location.href = "index.html";
    return null;
  }
}

/**
 * Đăng xuất an toàn và xóa toàn bộ session
 */
async function dangXuat() {
  localStorage.removeItem("userAccount");
  localStorage.removeItem("nhan_su_profile");
  localStorage.removeItem("userPermissions");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userChucVu");
  try {
    await sb.auth.signOut();
  } catch (e) {}
  window.location.href = "index.html";
}

/**
 * Kiểm tra quyền của người dùng hiện tại đối với một module/bước
 * @param {string} moduleKey - 'buoc1', 'buoc2', ..., 'buoc7', 'taikhoan'
 * @returns {string} 'all' | 'view' | 'none'
 */
function layQuyenModule(moduleKey) {
  try {
    const profile = JSON.parse(localStorage.getItem("nhan_su_profile") || "{}");
    const cap = parseInt(profile.phan_loai_tk || profile.cap_tai_khoan);
    if (cap === 1) return "all"; // Cấp 1 Toàn quyền mọi module

    const pq = JSON.parse(localStorage.getItem("userPermissions") || "{}");
    if (pq && pq[moduleKey]) return pq[moduleKey];

    return cap === 2 ? "all" : "view";
  } catch (e) {
    return "view";
  }
}

