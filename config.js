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
 * Hàm Upsert Supabase thông minh có khả năng tự phục hồi (Auto-healing)
 * Nếu bảng trên CSDL Supabase thiếu một cột nào đó (lỗi PGRST204),
 * hàm sẽ tự động loại bỏ cột đó và thử lại ngay, tránh bị từ chối toàn bộ đợt lưu.
 */
async function upsertSupabaseTuTu(tableName, payload, options = {}) {
  if (typeof sb === 'undefined') return { success: false, error: 'Chưa khởi tạo Supabase client' };

  let currentPayload = Array.isArray(payload)
    ? payload.map(item => ({ ...item }))
    : { ...payload };

  const conflictCol = options.onConflict;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const query = conflictCol 
        ? sb.from(tableName).upsert(currentPayload, { onConflict: conflictCol })
        : sb.from(tableName).upsert(currentPayload);

      const { data, error } = await query;
      if (!error) return { success: true, data };

      // Phát hiện lỗi thiếu cột PostgREST (PGRST204)
      if (error.message && error.message.includes("Could not find the") && error.message.includes("column")) {
        const match = error.message.match(/Could not find the '([^']+)' column/i);
        if (match && match[1]) {
          const colLoi = match[1];
          console.warn(`[Auto-heal] Bảng "${tableName}" chưa có cột "${colLoi}". Đang loại bỏ để lưu an toàn...`);
          if (Array.isArray(currentPayload)) {
            currentPayload.forEach(row => delete row[colLoi]);
          } else {
            delete currentPayload[colLoi];
          }
          continue;
        }
      }

      console.error(`[Supabase Upsert Error] ${tableName}:`, error);
      return { success: false, error };
    } catch (ex) {
      console.error(`[Supabase Exception] ${tableName}:`, ex);
      return { success: false, error: ex };
    }
  }
  return { success: false, error: 'Vượt quá số lần thử tự phục hồi' };
}

/**
 * Gom nhóm danh sách bản ghi từ bảng luu_tru trên Supabase thành danh sách chuyến xe (đợt)
 * Dùng chung cho Bước 1, Bước 2, Bước 3
 */
function chuyenDoiLuuTruThanhDanhSachDot(rowsLuuTru) {
  if (!Array.isArray(rowsLuuTru) || rowsLuuTru.length === 0) return [];
  const mapDot = new Map();
  rowsLuuTru.forEach(r => {
    const mDot = r.ma_dot || 'DOT_KHAC';
    if (!mapDot.has(mDot)) {
      mapDot.set(mDot, {
        maDot: mDot,
        xe: r.xe || 'Xe chung',
        taiXe: r.tai_xe || '',
        ngayGiao: r.ngay_giao || '',
        ngayRaw: r.ngay_giao || '',
        nvGiao: r.giao_hang || '',
        nvThu: r.thu_tien || '',
        danhSachChiTiet: [],
        danhSachHD: [],
        tongTien: 0,
        soLuongHD: 0,
        daQuyetToan: false,
        taoLuc: r.tao_luc || new Date().toISOString()
      });
    }
    const dot = mapDot.get(mDot);
    if (!dot.danhSachHD.includes(r.ma_hd)) {
      dot.danhSachHD.push(r.ma_hd);
    }
    dot.danhSachChiTiet.push({
      maHD: r.ma_hd,
      stt: r.stt,
      tenKH: r.ten_kh,
      nguoiBan: r.nguoi_ban,
      maKH: r.ma_kh,
      doanhSo: parseFloat(r.doanh_so || 0),
      giamSP: parseFloat(r.giam_gia_sp || 0),
      giamHD: parseFloat(r.giam_gia_hd || 0),
      thanhTien: parseFloat(r.thanh_tien || 0),
      tienMat: parseFloat(r.tien_mat || 0),
      chuyenKhoan: parseFloat(r.chuyen_khoan || 0),
      taiKhoanNhan: r.tai_khoan_nhan || '',
      traVe: parseFloat(r.tra_ve || 0),
      noPhatSinh: parseFloat(r.no_phat_sinh || 0),
      ghiChu: r.ghi_chu || '',
      laGiaoLai: !!r.la_giao_lai,
      daKiemDon: !!r.da_kiem_don,
      daQuyetToan: !!r.da_quyet_toan,
      // Mặt hàng khách trả 1 phần (chọn ở Bước 2 — cần sql/13_hang_tra_ve.sql)
      hangTraVe: Array.isArray(r.hang_tra_ve) ? r.hang_tra_ve : []
    });
  });

  return Array.from(mapDot.values()).map(d => {
    d.soLuongHD = d.danhSachChiTiet.length;
    d.tongTien = d.danhSachChiTiet.reduce((s, x) => s + (x.thanhTien || 0), 0);
    // Nếu các đơn đã kiểm đơn hoặc đã quyết toán
    d.daQuyetToan = d.danhSachChiTiet.length > 0 && d.danhSachChiTiet.every(x => x.daKiemDon || x.daQuyetToan);
    return d;
  });
}

/**
 * ĐỒNG BỘ DỮ LIỆU EXCEL KIOTVIET CHƯA CHIA XE LÊN SUPABASE (DÙNG CHUNG CHO MỌI MÁY)
 * Lưu vào bảng file_kiot_tam với id cố định 'kiot_chua_chia_xe'
 */
async function dongBoKiotTamLenSupabase(duLieuKiotViet, danhSachTenFile = [], nguoiTao = "") {
  if (typeof sb === 'undefined') return { success: false, error: 'Chưa khởi tạo Supabase' };
  if (!Array.isArray(duLieuKiotViet) || duLieuKiotViet.length === 0) {
    return await xoaKiotTamSupabase();
  }

  try {
    const setHD = new Set();
    let tongTien = 0;
    duLieuKiotViet.forEach(r => {
      const m = String(r['Mã hóa đơn'] || '').trim().toUpperCase();
      if (m && !m.includes('TỔNG')) setHD.add(m);
      const tt = parseFloat(r['Thành tiền'] || 0);
      if (!isNaN(tt)) tongTien += tt;
    });

    const payload = {
      id: 'kiot_chua_chia_xe',
      ten_file: Array.isArray(danhSachTenFile) ? danhSachTenFile.join(', ') : String(danhSachTenFile || 'Excel KiotViet'),
      so_hd: setHD.size,
      so_dong: duLieuKiotViet.length,
      tong_doanh_so: tongTien,
      thoi_gian: new Date().toISOString(),
      du_lieu: duLieuKiotViet,
      nguoi_tao: nguoiTao || localStorage.getItem('userAccount') || 'Nhân sự'
    };

    const res = await upsertSupabaseTuTu('file_kiot_tam', payload, { onConflict: 'id' });
    if (res.success) {
      console.log(`✅ [Supabase Sync] Đã lưu ${duLieuKiotViet.length} dòng KiotViet tạm (${setHD.size} HĐ) lên Cloud!`);
    }
    return res;
  } catch (err) {
    console.error("Lỗi dongBoKiotTamLenSupabase:", err);
    return { success: false, error: err };
  }
}

/**
 * TẢI DỮ LIỆU EXCEL KIOTVIET CHƯA CHIA XE TỪ SUPABASE (DÀNH CHO MÁY B VÀ QUẢN LÝ)
 */
async function taiKiotTamTuSupabase() {
  if (typeof sb === 'undefined') return null;
  try {
    const { data, error } = await sb.from('file_kiot_tam').select('*').eq('id', 'kiot_chua_chia_xe').maybeSingle();
    if (error || !data || !Array.isArray(data.du_lieu)) return null;

    let tenFiles = [];
    if (data.ten_file) {
      tenFiles = data.ten_file.split(',').map(s => s.trim()).filter(Boolean);
    }

    return {
      duLieu: data.du_lieu,
      danhSachTenFile: tenFiles,
      soHD: data.so_hd || 0,
      soDong: data.so_dong || 0,
      tongDoanhSo: parseFloat(data.tong_doanh_so || 0),
      taoLuc: data.tao_luc,
      thoiGian: data.thoi_gian,
      nguoiTao: data.nguoi_tao
    };
  } catch (err) {
    console.warn("Lỗi taiKiotTamTuSupabase:", err);
    return null;
  }
}

/**
 * XÓA DỮ LIỆU KIOT TẠM TRÊN SUPABASE KHI ĐÃ ĐIỀU XE XONG TOÀN BỘ HOẶC XÓA HẾT
 */
async function xoaKiotTamSupabase() {
  if (typeof sb === 'undefined') return { success: false };
  try {
    const { error } = await sb.from('file_kiot_tam').delete().eq('id', 'kiot_chua_chia_xe');
    if (!error) console.log("🗑️ [Supabase Sync] Đã làm sạch file_kiot_tam trên Cloud.");
    return { success: !error, error };
  } catch (err) {
    console.warn("Lỗi xoaKiotTamSupabase:", err);
    return { success: false, error: err };
  }
}

/**
 * ĐỒNG BỘ DANH SÁCH ĐƠN HẸN GIAO LẠI TỪ BƯỚC 2 SANG BẢNG don_giao_lai TRÊN SUPABASE
 */
async function dongBoDonGiaoLaiLenSupabase(danhSachChoGiaoLai) {
  if (typeof sb === 'undefined' || !Array.isArray(danhSachChoGiaoLai) || danhSachChoGiaoLai.length === 0) return;
  try {
    const rows = danhSachChoGiaoLai.map(item => ({
      ma_hd: item.maHD || item.ma_hd,
      ma_kh: item.maKH || item.ma_kh || '',
      ten_kh: item.tenKH || item.ten_kh || '',
      thanh_tien: parseFloat(item.thanhTien || item.tienHD || item.thanh_tien || 0),
      tien_goc: parseFloat(item.tienHD || item.thanhTien || 0),
      ngay_don_goc: item.ngayGiaoGoc || item.ngay_don_goc || '',
      dot_goc: item.maDotGoc || item.dot_goc || '',
      xe_goc: item.xeGoc || item.xe_goc || '',
      trang_thai: 'cho_giao_lai'
    }));

    await upsertSupabaseTuTu('don_giao_lai', rows, { onConflict: 'ma_hd' });
  } catch (e) {
    console.warn("Lỗi dongBoDonGiaoLaiLenSupabase:", e);
  }
}

/**
 * TẢI DANH SÁCH ĐƠN HẸN GIAO LẠI TỪ SUPABASE VỀ CHO BƯỚC 1 HIỂN THỊ
 */
async function taiDonGiaoLaiTuSupabase() {
  if (typeof sb === 'undefined') return [];
  try {
    const { data, error } = await sb.from('don_giao_lai').select('*').eq('trang_thai', 'cho_giao_lai');
    if (error || !Array.isArray(data)) return [];
    return data.map(d => ({
      maHD: d.ma_hd,
      maKH: d.ma_kh,
      tenKH: d.ten_kh,
      thanhTien: parseFloat(d.thanh_tien || 0),
      tienHD: parseFloat(d.tien_goc || d.thanh_tien || 0),
      ngayGiaoGoc: d.ngay_don_goc,
      maDotGoc: d.dot_goc,
      xeGoc: d.xe_goc
    }));
  } catch (e) {
    console.warn("Lỗi taiDonGiaoLaiTuSupabase:", e);
    return [];
  }
}

/**
 * XÓA ĐƠN GIAO LẠI TRÊN SUPABASE KHI ĐÃ ĐƯỢC CHIA VÀO CHUYẾN XE MỚI
 */
async function xoaDonGiaoLaiSupabase(danhSachMaHD) {
  if (typeof sb === 'undefined' || !Array.isArray(danhSachMaHD) || danhSachMaHD.length === 0) return;
  try {
    for (const m of danhSachMaHD) {
      await sb.from('don_giao_lai').delete().eq('ma_hd', m);
    }
  } catch (e) {
    console.warn("Lỗi xoaDonGiaoLaiSupabase:", e);
  }
}




/* ====================================================================
 * escapeHtml — Escape dữ liệu người dùng trước khi chèn vào innerHTML
 * ==================================================================== */
function escapeHtml(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ====================================================================
 * TIỀN THIẾU / THỪA KHI NỘP TIỀN XE (Bước 2 → Báo Cáo Tổng Hợp)
 * Chênh lệch = Tiền mặt đếm thực tế (bảng đếm mệnh giá) − Số tiền phải nộp.
 * - Thiếu dưới 10.000 đ: không ghi nhận nợ.
 * - Thiếu từ 10.000 đ trở lên: ghi nợ cho người nộp tiền xe.
 * - Tiền thừa: ghi nhận cho người nộp tiền xe.
 * Bảng đếm tiền để trống (chưa đếm) thì chưa xác định được thiếu / thừa.
 * ==================================================================== */
const NGUONG_GHI_NO_THIEU_TIEN = 10000;

function tinhThieuThuaNopTien(tienDem, phaiNop) {
  const dem = Math.round(parseFloat(tienDem) || 0);
  const phai = Math.round(parseFloat(phaiNop) || 0);
  const daDem = dem > 0 || phai <= 0;
  const chenh = daDem ? dem - phai : 0;
  const thieu = chenh < 0 ? -chenh : 0;
  const thua = chenh > 0 ? chenh : 0;
  const ghiNo = thieu >= NGUONG_GHI_NO_THIEU_TIEN;
  return { daDem, tienDem: dem, phaiNop: phai, chenh, thieu, thua, ghiNo, soNo: ghiNo ? thieu : 0 };
}

/* ====================================================================
 * LÀM MỚI CHUYẾN XE ĐÃ QUYẾT TOÁN (Bước 2 → về "Chờ tính tiền")
 * Phiếu nộp tiền của chuyến được đưa về 0 và ghi_chu bắt đầu bằng GHI_CHU_LAM_MOI_CHUYEN,
 * để mọi máy nhận biết chuyến đã được làm mới mà gỡ các đơn nợ của chuyến khỏi sổ trên máy mình.
 * ==================================================================== */
const GHI_CHU_LAM_MOI_CHUYEN = "[LÀM MỚI CHUYẾN]";

/**
 * Gỡ khỏi sổ công nợ trên máy này các đơn nợ phát sinh từ chuyến xe đã được "Làm mới" ở Bước 2.
 * Chỉ gỡ khi chắc chắn: hoá đơn vẫn thuộc đúng chuyến đó trên luu_tru nhưng đã về chưa quyết toán
 * và không còn nợ, phiếu nộp tiền của chuyến mang dấu làm mới, và đơn nợ không còn khoản thu nào
 * (trên máy chủ lẫn chỉ ghi trên máy này). Lỗi mạng / thiếu bảng thì giữ nguyên sổ.
 * @param {Array} ds  sổ công nợ (mảng đơn nợ) — không bị sửa
 * @returns {Promise<{ds:Array, soGo:number}>}
 */
async function goDonNoCuaChuyenDaLamMoi(ds) {
  const kq = { ds: ds, soGo: 0 };
  if (typeof sb === "undefined" || !Array.isArray(ds)) return kq;
  const ungVien = ds.filter(d => d && d.maHD && d.maDot && d.maDot !== "NGOAI_BANG_KE" && !d.ngoaiBangKe && d.id === "NO_" + d.maHD);
  if (!ungVien.length) return kq;
  try {
    const dsMa = Array.from(new Set(ungVien.map(d => d.maHD)));
    const lt = new Map();
    for (let i = 0; i < dsMa.length; i += 150) {
      const { data, error } = await sb.from("luu_tru").select("ma_hd, ma_dot, no_phat_sinh, da_quyet_toan, da_kiem_don").in("ma_hd", dsMa.slice(i, i + 150));
      if (error) return kq;
      (data || []).forEach(r => lt.set(r.ma_hd, r));
    }
    let nghi = ungVien.filter(d => {
      const r = lt.get(d.maHD);
      return r && r.ma_dot === d.maDot && !r.da_quyet_toan && !r.da_kiem_don && !(parseFloat(r.no_phat_sinh) > 0);
    });
    if (!nghi.length) return kq;
    const dsPhieu = Array.from(new Set(nghi.map(d => "PNP_" + d.maDot)));
    const { data: phieu, error: e1 } = await sb.from("phieu_nop_tien").select("ma_phieu, ghi_chu").in("ma_phieu", dsPhieu);
    if (e1) return kq;
    const daLamMoi = new Set((phieu || []).filter(p => String(p.ghi_chu || "").indexOf(GHI_CHU_LAM_MOI_CHUYEN) === 0).map(p => p.ma_phieu));
    nghi = nghi.filter(d => daLamMoi.has("PNP_" + d.maDot));
    if (!nghi.length) return kq;
    const { data: thu, error: e2 } = await sb.from("thu_no").select("id_don_no, so_tien").in("id_don_no", nghi.map(d => d.id));
    if (e2) return kq;
    const tongThu = {};
    (thu || []).forEach(r => { tongThu[r.id_don_no] = (tongThu[r.id_don_no] || 0) + (parseFloat(r.so_tien) || 0); });
    const go = new Set(nghi.filter(d => {
      const chiTrenMay = typeof d.daThuCloudDaDongBo === "number" ? Math.max(0, (d.daThu || 0) - d.daThuCloudDaDongBo) : (d.daThu || 0);
      return !((tongThu[d.id] || 0) > 0.5) && !(chiTrenMay > 0.5);
    }).map(d => d.id));
    if (!go.size) return kq;
    return { ds: ds.filter(d => !go.has(d.id)), soGo: go.size };
  } catch (e) {
    console.warn("Lỗi gỡ đơn nợ của chuyến đã làm mới:", e);
    return kq;
  }
}

/* ====================================================================
 * PHÂN QUYỀN THEO MODULE THỰC TẾ CỦA APP
 * Mỗi module tương ứng 1 tab/trang có thật trong menu.
 * Mức quyền: 'all' (toàn quyền) | 'view' (chỉ xem) | 'none' (không truy cập)
 * ==================================================================== */
const MODULE_PHAN_QUYEN = [
  { id: "tongquan",  label: "Tổng quan Quy trình", trang: ["trang_chu.html"] },
  { id: "dieuxe",    label: "B1: Điều Xe & Phiếu Xuất Kho", trang: ["buoc1_dieu_xe_xuat_kho.html", "buoc1_upload.html", "buoc2_phieu_xuat_kho.html"] },
  { id: "quyettoan", label: "B2: Quyết Toán Thu Tiền", trang: ["buoc2_quyet_toan_thu_tien.html"] },
  { id: "misa",      label: "B3: Đẩy Dữ Liệu MISA", trang: ["buoc3_day_misa.html", "buoc3_luu_tru.html"] },
  { id: "baocao",    label: "Báo Cáo Tổng Hợp", trang: ["bao_cao_tong_hop.html"] },
  { id: "congno",    label: "Theo Dõi Công Nợ", trang: ["theo_doi_cong_no.html"] },
  { id: "danhmuc",   label: "Danh Mục", trang: ["danh_muc.html"] },
  { id: "taikhoan",  label: "Tài khoản & Phân quyền", trang: ["quan_ly_taikhoan.html"] }
];

// Ma trận mẫu ban đầu (khi Supabase chưa có dữ liệu phân quyền)
const MA_TRAN_MAC_DINH = {
  "Giám đốc Điều hành": { tongquan: "all", dieuxe: "all",  quyettoan: "all",  misa: "all",  baocao: "all",  congno: "all",  danhmuc: "all",  taikhoan: "all" },
  "Kế toán Bán hàng":   { tongquan: "all", dieuxe: "all",  quyettoan: "view", misa: "none", baocao: "none", congno: "view", danhmuc: "view", taikhoan: "none" },
  "Kế toán Công nợ":    { tongquan: "all", dieuxe: "view", quyettoan: "all",  misa: "none", baocao: "view", congno: "all",  danhmuc: "view", taikhoan: "none" },
  "Kế toán Tổng hợp":   { tongquan: "all", dieuxe: "all",  quyettoan: "all",  misa: "all",  baocao: "all",  congno: "all",  danhmuc: "all",  taikhoan: "view" },
  "Kiểm duyệt viên":    { tongquan: "all", dieuxe: "all",  quyettoan: "all",  misa: "none", baocao: "view", congno: "view", danhmuc: "view", taikhoan: "none" },
  "Thủ kho":            { tongquan: "all", dieuxe: "all",  quyettoan: "none", misa: "none", baocao: "none", congno: "none", danhmuc: "view", taikhoan: "none" },
  "Tài xế":             { tongquan: "all", dieuxe: "view", quyettoan: "view", misa: "none", baocao: "none", congno: "none", danhmuc: "none", taikhoan: "none" }
};

const _BAC_QUYEN = { none: 0, view: 1, all: 2 };
function _quyenCaoNhat(pq, keys) {
  let best = -1, val = null;
  keys.forEach(function (k) {
    if (pq && _BAC_QUYEN[pq[k]] !== undefined && _BAC_QUYEN[pq[k]] > best) { best = _BAC_QUYEN[pq[k]]; val = pq[k]; }
  });
  return val;
}

/**
 * Tính mức quyền của 1 module từ ma trận quyền của chức vụ.
 * - Có khoá mới -> dùng luôn.
 * - Dữ liệu cũ (buoc1..buoc7) -> quy đổi: dieuxe = max(buoc1..3), quyettoan = max(buoc4..6), misa = buoc7.
 * - Không có -> cấp 1/2/3 mặc định 'all' (giữ hành vi cũ), riêng taikhoan chỉ cấp 1.
 */
function tinhQuyenModule(pq, moduleId, cap) {
  if (cap === 1) return "all";
  if (pq && _BAC_QUYEN[pq[moduleId]] !== undefined) return pq[moduleId];
  if (pq) {
    let cu = null;
    if (moduleId === "dieuxe") cu = _quyenCaoNhat(pq, ["buoc1", "buoc2", "buoc3"]);
    else if (moduleId === "quyettoan") cu = _quyenCaoNhat(pq, ["buoc4", "buoc5", "buoc6"]);
    else if (moduleId === "misa") cu = _quyenCaoNhat(pq, ["buoc7"]);
    if (cu) return cu;
  }
  // Tài khoản & Báo cáo: mặc định chỉ Cấp 1 (taikhoan) / Cấp 1-2 (baocao); các mục khác mặc định mở
  if (moduleId === "taikhoan") return "none";
  if (moduleId === "baocao") return cap <= 2 ? "all" : "none";
  return "all";
}

function _docCapVaMaTranHienTai() {
  let cap = 3, pq = null;
  try {
    const profile = JSON.parse(localStorage.getItem("nhan_su_profile") || "{}");
    cap = parseInt(profile.phan_loai_tk || profile.cap_tai_khoan) || 3;
  } catch (e) {}
  try {
    const raw = localStorage.getItem("userPermissions");
    if (raw) pq = JSON.parse(raw);
  } catch (e) {}
  return { cap: cap, pq: pq };
}

/**
 * Kiểm tra quyền của người dùng hiện tại đối với một module
 * @returns {string} 'all' | 'view' | 'none'
 */
function layQuyenModule(moduleKey) {
  const c = _docCapVaMaTranHienTai();
  return tinhQuyenModule(c.pq, moduleKey, c.cap);
}

/** Module tương ứng với trang hiện tại (theo tên file) */
function layModuleCuaTrang(fileName) {
  const f = fileName || (window.location.pathname.split("/").pop() || "");
  const m = MODULE_PHAN_QUYEN.find(function (x) { return x.trang.indexOf(f) !== -1; });
  return m ? m.id : null;
}

/** Nạp lại ma trận quyền mới nhất từ Supabase (để thay đổi của quản trị có hiệu lực ngay) */
async function lamMoiMaTranQuyen(chucVu) {
  if (!chucVu || typeof sb === "undefined") return;
  try {
    const res = await Promise.race([
      sb.from("phan_quyen_vi_tri").select("cac_quyen").eq("chuc_vu", chucVu).maybeSingle(),
      new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, 4000); })
    ]);
    if (res && res.data && res.data.cac_quyen) {
      localStorage.setItem("userPermissions", JSON.stringify(res.data.cac_quyen));
    }
  } catch (e) { /* giữ bản đã lưu trên máy */ }
}

/**
 * CHẾ ĐỘ CHỈ XEM: chặn mọi thao tác ghi (insert/update/upsert/delete) lên Supabase
 * từ trang hiện tại khi người dùng chỉ có quyền 'view'.
 */
window.TMH_CHE_DO_XEM = false;
(function baoVeGhiSupabase() {
  if (typeof sb === "undefined" || sb.__tmhGuard) return;
  sb.__tmhGuard = true;
  const goc = sb.from.bind(sb);
  const loi = { message: "Bạn chỉ có quyền XEM ở mục này, không được thêm/sửa/xoá dữ liệu." };
  function chan() {
    try { alert("🔒 " + loi.message); } catch (e) {}
    const p = new Proxy(function () {}, {
      get: function (_, k) {
        if (k === "then") return function (ok) { return Promise.resolve({ data: null, error: loi, status: 403 }).then(ok); };
        if (k === "catch") return function () { return Promise.resolve(); };
        return function () { return p; };
      },
      apply: function () { return p; }
    });
    return p;
  }
  sb.from = function (table) {
    const q = goc(table);
    ["insert", "update", "upsert", "delete"].forEach(function (m) {
      const fn = q[m];
      if (typeof fn !== "function") return;
      q[m] = function () {
        if (window.TMH_CHE_DO_XEM) return chan();
        return fn.apply(q, arguments);
      };
    });
    return q;
  };
})();
