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
 * Helper lấy ngày định dạng YYYY-MM-DD theo giờ địa phương (Việt Nam UTC+7)
 * Tránh lỗi lệch ngày (bị lùi về hôm qua) khi dùng toISOString().slice(0, 10) trước 7:00 sáng
 */
function layNgayLocalYYYYMMDD(d) {
  if (!d || !(d instanceof Date) || isNaN(d)) d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Bộ nhớ đệm các cột chưa tồn tại trên từng bảng Supabase để tránh lặp lại roundtrip lỗi PGRST204
const _knownMissingColsByTable = new Map();

/**
 * Hàm Upsert Supabase thông minh có khả năng tự phục hồi (Auto-healing)
 * Nếu bảng trên CSDL Supabase thiếu một cột nào đó (lỗi PGRST204),
 * hàm sẽ tự động loại bỏ cột đó và thử lại ngay, tránh bị từ chối toàn bộ đợt lưu.
 * Hỗ trợ retry khi gặp lỗi mạng/timeout và lưu cache cột thiếu để tối ưu tốc độ lưu.
 */
async function upsertSupabaseTuTu(tableName, payload, options = {}) {
  if (typeof sb === 'undefined') return { success: false, error: 'Chưa khởi tạo Supabase client' };

  let currentPayload = Array.isArray(payload)
    ? payload.map(item => ({ ...item }))
    : { ...payload };

  // 1. Loại bỏ ngay các cột đã biết là chưa có trên bảng để tiết kiệm roundtrip
  const knownMissing = _knownMissingColsByTable.get(tableName);
  if (knownMissing && knownMissing.size > 0) {
    if (Array.isArray(currentPayload)) {
      currentPayload.forEach(row => {
        knownMissing.forEach(col => delete row[col]);
      });
    } else {
      knownMissing.forEach(col => delete currentPayload[col]);
    }
  }

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
          if (!_knownMissingColsByTable.has(tableName)) {
            _knownMissingColsByTable.set(tableName, new Set());
          }
          _knownMissingColsByTable.get(tableName).add(colLoi);
          console.warn(`[Auto-heal] Bảng "${tableName}" chưa có cột "${colLoi}". Đang loại bỏ để lưu an toàn...`);
          if (Array.isArray(currentPayload)) {
            currentPayload.forEach(row => delete row[colLoi]);
          } else {
            delete currentPayload[colLoi];
          }
          continue;
        }
      }

      // Xử lý lỗi mạng/timeout: retry với exponential backoff nếu chưa quá 4 lần
      const errMsg = (error.message || '').toLowerCase();
      const errCode = String(error.code || '');
      const laLoiMang = errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('fetch') || errMsg.includes('failed to fetch') || ['502', '503', '504', '429'].includes(errCode);
      if (attempt < 4 && laLoiMang) {
        console.warn(`[Supabase Retry] Thử lại lưu bảng "${tableName}" sau lỗi mạng/timeout (lần ${attempt + 1})...`);
        await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
        continue;
      }

      console.error(`[Supabase Upsert Error] ${tableName}:`, error);
      return { success: false, error };
    } catch (ex) {
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
        continue;
      }
      console.error(`[Supabase Exception] ${tableName}:`, ex);
      return { success: false, error: ex };
    }
  }
  return { success: false, error: 'Vượt quá số lần thử tự phục hồi' };
}

/**
 * Chuẩn hóa ngày về dạng DD/MM/YYYY (VD: '2026-10-02' hoặc '2/10/2026' -> '02/10/2026')
 */
function chuanHoaNgayVNChung(val) {
  const s = String(val || '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[3].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[1]}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
  return s;
}

/**
 * Chuẩn hóa ngày về dạng YYYY-MM-DD (VD: '02/10/2026' -> '2026-10-02')
 */
function chuanHoaNgayISOChung(val) {
  const s = String(val || '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return s;
}

/**
 * Sinh toàn bộ biến thể chuỗi ngày (DD/MM/YYYY, D/M/YYYY, YYYY-MM-DD) để truy vấn .in('ngay_giao', ...)
 * khớp tuyệt đối 100% giữa Bước 2, Bước 3 và Báo Cáo Tổng Hợp.
 */
function taoBienTheNgayTruyVan(ngayVal) {
  const iso = chuanHoaNgayISOChung(ngayVal);
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ngayVal ? [String(ngayVal).trim()] : [];
  const [y, m, d] = iso.split('-');
  const dm = String(parseInt(d, 10));
  const mm = String(parseInt(m, 10));
  return Array.from(new Set([
    iso,
    `${d}/${m}/${y}`,
    `${dm}/${mm}/${y}`,
    `${dm}/${m}/${y}`,
    `${d}/${mm}/${y}`
  ]));
}

/**
 * Tạo chữ ký chuẩn hóa cho 1 dòng hàng hóa (chống nhân đôi khi nạp file Excel hoặc lưu nhiều lần)
 */
function taoChuKyDongHang(r) {
  if (!r) return '';
  const maHD = String(r['Mã hóa đơn'] !== undefined ? r['Mã hóa đơn'] : (r.ma_hd || '')).trim().toUpperCase();
  const maHang = String(r['Mã hàng'] !== undefined ? r['Mã hàng'] : (r.ma_hang || '')).trim().toUpperCase();
  const dgRaw = r['Đơn giá'] !== undefined ? r['Đơn giá'] : (r['Giá bán'] !== undefined ? r['Giá bán'] : (r.don_gia || 0));
  const slRaw = r['Số lượng'] !== undefined ? r['Số lượng'] : (r.so_luong || 0);
  const dg = Math.round((parseFloat(dgRaw) || 0) * 100) / 100;
  const sl = Math.round((parseFloat(slRaw) || 0) * 1000) / 1000;
  return `${maHD}‖${maHang}‖${dg}‖${sl}`;
}

/**
 * Khử trùng lặp dòng chi tiết hàng hóa (từ chi_tiet_hoa_don hoặc bộ nhớ KiotViet)
 * - Loại bỏ dòng tổng hợp giả (HH_TONGHOP) nếu có dòng hàng thật
 * - Nếu cùng 1 hóa đơn bị lưu nhiều đợt (nhiều ma_dot hoặc nhiều mốc tao_luc cách nhau > 1.5s),
 *   chỉ giữ lại 1 đợt chuẩn nhất (khớp tổng tiền hóa đơn trên luu_tru hoặc mới nhất).
 * - Nếu trong cùng 1 đợt mà mọi mặt hàng bị nhân bản gấp k lần (k >= 2) do bấm Lưu nhiều lần,
 *   tự động rút gọn về đúng 1 bản gốc (trả kèm danh sách id dư thừa trong .idsTrungLap để dọn DB).
 */
function khuTrungDongChiTietHang(rows, mapTienHD = null) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const layMaHD = r => String(r['Mã hóa đơn'] !== undefined ? r['Mã hóa đơn'] : (r.ma_hd || '')).trim().toUpperCase();
  const layMaHang = r => String(r['Mã hàng'] !== undefined ? r['Mã hàng'] : (r.ma_hang || '')).trim().toUpperCase();
  const layTT = r => parseFloat(r['Thành tiền'] !== undefined ? r['Thành tiền'] : (r.thanh_tien || 0)) || 0;

  // Nhóm theo Mã hóa đơn
  const theoHD = new Map();
  rows.forEach(r => {
    if (!r) return;
    const maHD = layMaHD(r);
    const maH = layMaHang(r);
    if (!maHD || !maH || maH.toLowerCase().includes('tổng')) return;
    if (!theoHD.has(maHD)) theoHD.set(maHD, []);
    theoHD.get(maHD).push(r);
  });

  const ketQua = [];
  const idsTrungLap = [];

  theoHD.forEach((dsDongHD, maHD) => {
    // 1. Nếu có dòng hàng thật thì loại bỏ HH_TONGHOP
    const dongThat = dsDongHD.filter(r => layMaHang(r) !== 'HH_TONGHOP');
    let ds = dongThat.length > 0 ? dongThat : dsDongHD;
    if (dongThat.length > 0 && dongThat.length < dsDongHD.length) {
      dsDongHD.forEach(r => { if (layMaHang(r) === 'HH_TONGHOP' && r.id) idsTrungLap.push(r.id); });
    }

    const tienHDChuan = mapTienHD && mapTienHD.has(maHD) ? (parseFloat(mapTienHD.get(maHD)) || 0) : 0;

    // 2. Nhóm theo lô lưu (ma_dot + cửa sổ tao_luc 2 giây) để tách các lần bấm Lưu trùng
    const danhSachLo = [];
    const sorted = ds.slice().sort((a, b) => {
      const da = String(a.ma_dot || ''), db = String(b.ma_dot || '');
      if (da !== db) return da.localeCompare(db);
      const ta = a.tao_luc ? Date.parse(a.tao_luc) || 0 : 0;
      const tb = b.tao_luc ? Date.parse(b.tao_luc) || 0 : 0;
      return ta - tb;
    });

    sorted.forEach(r => {
      const mDot = String(r.ma_dot || '');
      const t = r.tao_luc ? (Date.parse(r.tao_luc) || 0) : 0;
      const loCuoi = danhSachLo.length > 0 ? danhSachLo[danhSachLo.length - 1] : null;
      if (!loCuoi || loCuoi.maDot !== mDot || (t > 0 && loCuoi.maxTime > 0 && (t - loCuoi.maxTime) > 1800)) {
        danhSachLo.push({ maDot: mDot, minTime: t, maxTime: t, rows: [r] });
      } else {
        loCuoi.rows.push(r);
        if (t > loCuoi.maxTime) loCuoi.maxTime = t;
      }
    });

    let loChon = ds;
    if (danhSachLo.length > 1) {
      // Kiểm tra xem các lô có phải là bản sao của cùng 1 hóa đơn không
      // Nếu tổng tiền 1 lô đã khớp với tienHDChuan (hoặc các lô có cùng chữ ký mặt hàng), chỉ chọn 1 lô tốt nhất
      const sigLo = lo => Array.from(new Set(lo.rows.map(taoChuKyDongHang))).sort().join('|');
      const sigDau = sigLo(danhSachLo[0]);
      const cungBoHang = danhSachLo.every(l => sigLo(l) === sigDau);
      const coLoKhopTien = tienHDChuan > 0 && danhSachLo.some(l => Math.abs(l.rows.reduce((s, x) => s + layTT(x), 0) - tienHDChuan) <= 1000);

      if (cungBoHang || coLoKhopTien) {
        let bestLo = danhSachLo[danhSachLo.length - 1]; // ưu tiên lô mới nhất
        if (tienHDChuan > 0) {
          let minDiff = Infinity;
          danhSachLo.forEach(l => {
            const sumLo = l.rows.reduce((s, x) => s + layTT(x), 0);
            const diff = Math.abs(sumLo - tienHDChuan);
            if (diff < minDiff || (diff === minDiff && l.maxTime >= bestLo.maxTime)) {
              minDiff = diff;
              bestLo = l;
            }
          });
        } else {
          // Chọn lô có nhiều mặt hàng phân biệt nhất, mới nhất
          let maxUnique = -1;
          danhSachLo.forEach(l => {
            const u = new Set(l.rows.map(taoChuKyDongHang)).size;
            if (u > maxUnique || (u === maxUnique && l.maxTime >= bestLo.maxTime)) {
              maxUnique = u;
              bestLo = l;
            }
          });
        }
        loChon = bestLo.rows;
        danhSachLo.forEach(l => {
          if (l !== bestLo) l.rows.forEach(r => { if (r.id) idsTrungLap.push(r.id); });
        });
      }
    }

    // 3. Kiểm tra nhân bản ngay trong cùng 1 lô (cùng tao_luc hoặc không có tao_luc)
    const nhomSig = new Map();
    loChon.forEach(r => {
      const sig = taoChuKyDongHang(r);
      if (!nhomSig.has(sig)) nhomSig.set(sig, []);
      nhomSig.get(sig).push(r);
    });

    const counts = Array.from(nhomSig.values()).map(arr => arr.length);
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const uocChung = counts.length > 0 ? counts.reduce((acc, c) => gcd(acc, c), counts[0]) : 1;
    const tongTienLo = loChon.reduce((s, x) => s + layTT(x), 0);

    if (uocChung >= 2 && (tienHDChuan <= 0 || Math.abs(tongTienLo / uocChung - tienHDChuan) <= Math.max(1000, Math.abs(tongTienLo - tienHDChuan)))) {
      nhomSig.forEach(arr => {
        const soGiu = Math.max(1, Math.round(arr.length / uocChung));
        for (let i = 0; i < arr.length; i++) {
          if (i < soGiu) ketQua.push(arr[i]);
          else if (arr[i].id) idsTrungLap.push(arr[i].id);
        }
      });
    } else if (nhomSig.size < loChon.length) {
      // Nếu tổng tiền khi giữ 1 dòng mỗi chữ ký khớp đúng tienHDChuan (hoặc dòng không có tao_luc bị push trùng)
      const dongDuyNhat = Array.from(nhomSig.values()).map(arr => arr[0]);
      const tongDuyNhat = dongDuyNhat.reduce((s, x) => s + layTT(x), 0);
      const coTaoLucKhacNhau = Array.from(nhomSig.values()).some(arr => arr.length > 1 && new Set(arr.map(x => String(x.tao_luc || ''))).size > 1);
      if ((tienHDChuan > 0 && Math.abs(tongDuyNhat - tienHDChuan) <= 1000 && Math.abs(tongTienLo - tienHDChuan) > 1000) || coTaoLucKhacNhau) {
        nhomSig.forEach(arr => {
          ketQua.push(arr[0]);
          for (let i = 1; i < arr.length; i++) {
            if (arr[i].id) idsTrungLap.push(arr[i].id);
          }
        });
      } else {
        ketQua.push(...loChon);
      }
    } else {
      ketQua.push(...loChon);
    }
  });

  Object.defineProperty(ketQua, 'idsTrungLap', { value: idsTrungLap, enumerable: false, configurable: true });
  return ketQua;
}

/**
 * Gom nhóm danh sách bản ghi từ bảng luu_tru trên Supabase thành danh sách chuyến xe (đợt)
 * Dùng chung cho Bước 1, Bước 2, Bước 3
 */
function chuyenDoiLuuTruThanhDanhSachDot(rowsLuuTru) {
  if (!Array.isArray(rowsLuuTru) || rowsLuuTru.length === 0) return [];
  const mapDot = new Map();
  const daThayMaHD = new Set();

  rowsLuuTru.forEach(r => {
    if (!r) return;
    const maHDChuan = String(r.ma_hd || '').trim().toUpperCase();
    if (!maHDChuan || daThayMaHD.has(maHDChuan)) return;
    daThayMaHD.add(maHDChuan);

    const mDotGoc = String(r.ma_dot || 'DOT_KHAC').trim();
    const ngayVN = chuanHoaNgayVNChung(r.ngay_giao);
    // Nếu DOT_KHAC hoặc cùng ma_dot nhưng bị lẫn nhiều ngày giao khác nhau, tách theo ngày để không nuốt đơn giữa các ngày
    let keyDot = mDotGoc;
    if (mapDot.has(keyDot)) {
      const dotDaCo = mapDot.get(keyDot);
      if (ngayVN && dotDaCo.ngayGiao && dotDaCo.ngayGiao !== ngayVN) {
        keyDot = `${mDotGoc}__${chuanHoaNgayISOChung(ngayVN)}`;
      }
    }

    if (!mapDot.has(keyDot)) {
      mapDot.set(keyDot, {
        maDot: keyDot,
        maDotGoc: mDotGoc,
        xe: r.xe || 'Xe chung',
        taiXe: r.tai_xe || '',
        ngayGiao: ngayVN || r.ngay_giao || '',
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
    const dot = mapDot.get(keyDot);
    if (!dot.danhSachHD.includes(r.ma_hd)) {
      dot.danhSachHD.push(r.ma_hd);
    }
    const tm = parseFloat(r.tien_mat || 0);
    const ck = parseFloat(r.chuyen_khoan || 0);
    const tv = parseFloat(r.tra_ve || 0);
    const no = parseFloat(r.no_phat_sinh || 0);
    const daQT = !!(r.da_quyet_toan || r.da_kiem_don || (tm + ck + tv + no > 0));

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
      tienMat: tm,
      chuyenKhoan: ck,
      taiKhoanNhan: r.tai_khoan_nhan || '',
      traVe: tv,
      noPhatSinh: no,
      ghiChu: r.ghi_chu || '',
      hinhThuc: r.hinh_thuc_thanh_toan || '',
      daKiemTra: !!r.da_kiem_tra,
      laGiaoLai: !!r.la_giao_lai,
      daKiemDon: !!r.da_kiem_don || daQT,
      daQuyetToan: daQT,
      // Mặt hàng khách trả 1 phần (chọn ở Bước 2 — cần sql/13_hang_tra_ve.sql)
      hangTraVe: Array.isArray(r.hang_tra_ve) ? r.hang_tra_ve : []
    });
  });

  return Array.from(mapDot.values()).map(d => {
    d.soLuongHD = d.danhSachChiTiet.length;
    d.tongTien = d.danhSachChiTiet.reduce((s, x) => s + (x.thanhTien || 0), 0);
    // Nếu các đơn đã kiểm đơn hoặc đã quyết toán
    d.daQuyetToan = d.danhSachChiTiet.length > 0 && d.danhSachChiTiet.every(x => x.daKiemDon || x.daQuyetToan || (x.thanhTien || 0) === 0);
    return d;
  });
}

// Máy chủ Supabase trả TỐI ĐA 1000 dòng mỗi lần đọc (.limit lớn hơn vẫn chỉ được 1000) → đọc luu_tru theo từng
// trang 1000 dòng (mới nhất trước) tới toiDa dòng, rồi bổ sung hoá đơn cũ hơn của các chuyến đã có để không
// chuyến nào bị thiếu hoá đơn. Lỗi bất kỳ trang nào → trả { data: null, error } như một lần đọc hỏng.
async function docLuuTruMoiNhat(toiDa = 20000) {
  const CO = 1000;
  const theoMa = new Map();
  let taoLucCuoi = null, conNua = false;
  for (let tu = 0; tu < toiDa; tu += CO) {
    const den = Math.min(tu + CO, toiDa) - 1;
    const { data, error } = await sb.from('luu_tru').select('*')
      .order('tao_luc', { ascending: false }).order('ma_hd', { ascending: true }).range(tu, den);
    if (error) return { data: null, error };
    (data || []).forEach(r => theoMa.set(r.ma_hd, r));
    if (data && data.length) taoLucCuoi = data[data.length - 1].tao_luc;
    conNua = !!data && data.length === den - tu + 1;
    if (!conNua) break;
  }
  if (conNua && taoLucCuoi) {
    const dsDot = Array.from(new Set(Array.from(theoMa.values()).map(r => r.ma_dot).filter(Boolean)));
    for (let i = 0; i < dsDot.length; i += 100) {
      for (let tu = 0; tu < 20000; tu += CO) {
        const { data, error } = await sb.from('luu_tru').select('*')
          .in('ma_dot', dsDot.slice(i, i + 100)).lte('tao_luc', taoLucCuoi).order('ma_hd').range(tu, tu + CO - 1);
        if (error) return { data: null, error };
        (data || []).forEach(r => { if (!theoMa.has(r.ma_hd)) theoMa.set(r.ma_hd, r); });
        if (!data || data.length < CO) break;
      }
    }
  }
  return { data: Array.from(theoMa.values()), error: null };
}

/**
 * Tải 100% dữ liệu luu_tru của một ngày giao (khớp tuyệt đối với query của Báo Cáo Tổng Hợp)
 */
async function taiLuuTruTheoNgay(ngayVal) {
  if (typeof sb === 'undefined' || !ngayVal) return [];
  const dsNgay = taoBienTheNgayTruyVan(ngayVal);
  if (!dsNgay.length) return [];
  const kq = [];
  const CO = 1000;
  for (let tu = 0; tu < 10000; tu += CO) {
    const { data, error } = await sb.from('luu_tru').select('*')
      .in('ngay_giao', dsNgay).order('ma_hd', { ascending: true }).range(tu, tu + CO - 1);
    if (error) break;
    if (Array.isArray(data) && data.length) kq.push(...data);
    if (!data || data.length < CO) break;
  }
  return kq;
}

/**
 * Bóc tách & nạp đầy đủ chi tiết từng mặt hàng cho 1 chuyến xe (chống lỗi fallback HH_TONGHOP và chống nhân đôi)
 * Tìm theo thứ tự:
 *  1) chi_tiet_hoa_don theo ma_dot
 *  2) chi_tiet_hoa_don theo từng ma_hd còn thiếu (kể cả mã gốc nếu mã HĐ có hậu tố giao lại '123')
 *  3) file_kiot_tam / localStorage (tmh_kiotviet_data, tmh_lich_su_dot)
 * Đồng thời tự động khử dòng trùng và tự phục hồi (self-heal) ma_dot trên chi_tiet_hoa_don.
 */
async function taiChiTietHangDayDuChoDot(dot, tuDongSuaDB = true) {
  if (!dot) return [];
  const maDot = String(dot.maDotGoc || dot.maDot || '').trim();
  const mapTienHD = new Map();
  const mapInfoHD = new Map();
  const setMaHD = new Set();

  (dot.danhSachHD || []).forEach(m => {
    const k = String(m || '').trim().toUpperCase();
    if (k) setMaHD.add(k);
  });
  (dot.danhSachChiTiet || []).forEach(it => {
    const k = String(it.maHD || it.ma_hd || '').trim().toUpperCase();
    if (!k) return;
    setMaHD.add(k);
    mapInfoHD.set(k, it);
    mapTienHD.set(k, parseFloat(it.thanhTien || it.tienHD || 0) || 0);
  });

  const chuanHoaDong = (c, maHDGhiDe) => {
    const maHD = String(maHDGhiDe || c.ma_hd || c['Mã hóa đơn'] || '').trim().toUpperCase();
    const info = mapInfoHD.get(maHD) || {};
    const maHang = String(c.ma_hang !== undefined ? c.ma_hang : (c['Mã hàng'] || '')).trim().toUpperCase();
    const tenHang = String(c.ten_hang !== undefined ? c.ten_hang : (c['Tên hàng'] || '')).trim();
    const dvt = String(c.dvt !== undefined ? c.dvt : (c['ĐVT'] || 'Thùng')).trim();
    const sl = parseFloat(c.so_luong !== undefined ? c.so_luong : (c['Số lượng'] || 0)) || 0;
    const dg = parseFloat(c.don_gia !== undefined ? c.don_gia : (c['Đơn giá'] !== undefined ? c['Đơn giá'] : (c['Giá bán'] || 0))) || 0;
    const tt = parseFloat(c.thanh_tien !== undefined ? c.thanh_tien : (c['Thành tiền'] || 0)) || 0;
    const qc = parseFloat(c.quy_cach !== undefined ? c.quy_cach : (c['Quy cách'] || 1)) || 1;
    const km = !!(c.la_khuyen_mai || c['KM'] || (dg === 0 && tt === 0 && sl > 0));
    const maKH = String(c.ma_kh || c['Mã khách hàng'] || info.maKH || '').trim().toUpperCase();
    const tenKH = String(c.ten_kh || c['Tên khách hàng'] || info.tenKH || 'Khách Lẻ').trim();
    const nguoiBan = String(c.nguoi_ban || c['Người bán'] || info.nguoiBan || '').trim();
    return {
      id: c.id,
      ma_dot: c.ma_dot || maDot,
      tao_luc: c.tao_luc || null,
      'Mã hóa đơn': maHD,
      ma_hd: maHD,
      'Mã khách hàng': maKH,
      ma_kh: maKH,
      'Tên khách hàng': tenKH,
      ten_kh: tenKH,
      'Mã hàng': maHang,
      ma_hang: maHang,
      'Tên hàng': tenHang,
      ten_hang: tenHang,
      'ĐVT': dvt,
      dvt: dvt,
      'Số lượng': sl,
      so_luong: sl,
      'Đơn giá': dg,
      don_gia: dg,
      'Giá bán': dg,
      'Thành tiền': tt,
      thanh_tien: tt,
      'Quy cách': qc,
      quy_cach: qc,
      'Người bán': nguoiBan,
      nguoi_ban: nguoiBan,
      'KM': km,
      la_khuyen_mai: km
    };
  };

  let dsDong = [];

  // 1. Tải từ chi_tiet_hoa_don theo ma_dot trên Supabase
  if (typeof sb !== 'undefined' && maDot) {
    try {
      const { data: cthdDot } = await sb.from('chi_tiet_hoa_don').select('*').eq('ma_dot', maDot);
      if (Array.isArray(cthdDot) && cthdDot.length > 0) {
        const dedup = khuTrungDongChiTietHang(cthdDot, mapTienHD);
        dsDong = dedup.map(c => chuanHoaDong(c));
        // Tự động dọn các bản ghi bị nhân đôi trong cùng ma_dot trên DB
        if (tuDongSuaDB && Array.isArray(dedup.idsTrungLap) && dedup.idsTrungLap.length > 0) {
          const idsXoa = dedup.idsTrungLap.filter(Boolean);
          for (let i = 0; i < idsXoa.length; i += 100) {
            sb.from('chi_tiet_hoa_don').delete().in('id', idsXoa.slice(i, i + 100)).then(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc chi_tiet_hoa_don theo ma_dot:', e);
    }
  }

  // Nếu dot.cacDongChiTietKiotViet đã có sẵn một số dòng hợp lệ trên máy, hợp nhất trước khi tìm bù
  if (Array.isArray(dot.cacDongChiTietKiotViet) && dot.cacDongChiTietKiotViet.length > 0) {
    const coSan = dot.cacDongChiTietKiotViet.filter(r => {
      const mh = String(r['Mã hàng'] || r.ma_hang || '').trim().toUpperCase();
      return mh && mh !== 'HH_TONGHOP';
    });
    if (coSan.length > 0) {
      dsDong = khuTrungDongChiTietHang(dsDong.concat(coSan.map(c => chuanHoaDong(c))), mapTienHD);
    }
  }

  // 2. Kiểm tra những hóa đơn nào trong chuyến VẪN CHƯA CÓ dòng hàng chi tiết
  const maDaCoHang = new Set(dsDong.filter(r => r['Mã hàng'] && r['Mã hàng'] !== 'HH_TONGHOP').map(r => r['Mã hóa đơn']));
  const dsMaThieu = Array.from(setMaHD).filter(m => !maDaCoHang.has(m));

  if (dsMaThieu.length > 0 && typeof sb !== 'undefined') {
    try {
      // Hỗ trợ tra cứu cả mã gốc nếu mã HĐ giao lại có hậu tố '123' (VD: HD286860123 -> HD286860)
      const mapMaGocSangMaThieu = new Map();
      const tapMaTruyVan = new Set(dsMaThieu);
      dsMaThieu.forEach(m => {
        if (m.endsWith('123') && m.length > 5) {
          const maGoc = m.slice(0, -3);
          tapMaTruyVan.add(maGoc);
          mapMaGocSangMaThieu.set(maGoc, m);
        }
      });
      const arrTruyVan = Array.from(tapMaTruyVan);
      const tatCaTimThay = [];
      for (let i = 0; i < arrTruyVan.length; i += 150) {
        const { data } = await sb.from('chi_tiet_hoa_don').select('*').in('ma_hd', arrTruyVan.slice(i, i + 150));
        if (Array.isArray(data) && data.length) tatCaTimThay.push(...data);
      }

      if (tatCaTimThay.length > 0) {
        const dongBuDB = [];
        dsMaThieu.forEach(maThieu => {
          let tung = tatCaTimThay.filter(r => String(r.ma_hd || '').trim().toUpperCase() === maThieu);
          if (tung.length === 0 && maThieu.endsWith('123')) {
            const maGoc = maThieu.slice(0, -3);
            tung = tatCaTimThay.filter(r => String(r.ma_hd || '').trim().toUpperCase() === maGoc);
          }
          if (tung.length > 0) {
            const dedup = khuTrungDongChiTietHang(tung.map(x => ({ ...x, ma_hd: maThieu })), mapTienHD);
            dedup.forEach(c => {
              const chuan = chuanHoaDong(c, maThieu);
              dsDong.push(chuan);
              dongBuDB.push({
                ma_hd: chuan.ma_hd,
                ma_dot: maDot,
                ngay_ct: dot.ngayGiao || '',
                xe: dot.xe || '',
                ma_kh: chuan.ma_kh,
                ten_kh: chuan.ten_kh,
                ma_hang: chuan.ma_hang,
                ten_hang: chuan.ten_hang,
                dvt: chuan.dvt,
                so_luong: chuan.so_luong,
                don_gia: chuan.don_gia,
                thanh_tien: chuan.thanh_tien,
                quy_cach: chuan.quy_cach,
                la_khuyen_mai: chuan.la_khuyen_mai
              });
            });
          }
        });

        // Tự động phục hồi (self-heal): ghi bổ sung các dòng tìm được vào ma_dot hiện tại của chuyến trên chi_tiet_hoa_don
        if (tuDongSuaDB && dongBuDB.length > 0 && maDot && typeof upsertSupabaseTuTu === 'function') {
          upsertSupabaseTuTu('chi_tiet_hoa_don', dongBuDB).then(() => {});
        }
      }
    } catch (e) {
      console.warn('Lỗi tìm bù chi_tiet_hoa_don theo ma_hd:', e);
    }
  }

  // 3. Nếu vẫn còn hóa đơn thiếu dòng hàng, tìm tiếp trong bộ nhớ localStorage (tmh_kiotviet_data, tmh_lich_su_dot)
  const maDaCoSauDB = new Set(dsDong.filter(r => r['Mã hàng'] && r['Mã hàng'] !== 'HH_TONGHOP').map(r => r['Mã hóa đơn']));
  const dsMaConThieu = Array.from(setMaHD).filter(m => !maDaCoSauDB.has(m));
  if (dsMaConThieu.length > 0) {
    try {
      const nguonLocal = [];
      const rawKiot = JSON.parse(localStorage.getItem('tmh_kiotviet_data') || '[]');
      if (Array.isArray(rawKiot)) nguonLocal.push(...rawKiot);
      const lsDot = JSON.parse(localStorage.getItem('tmh_lich_su_dot') || '[]');
      if (Array.isArray(lsDot)) {
        lsDot.forEach(d => {
          if (Array.isArray(d.cacDongChiTietKiotViet)) nguonLocal.push(...d.cacDongChiTietKiotViet);
        });
      }
      if (nguonLocal.length > 0) {
        dsMaConThieu.forEach(maThieu => {
          const khop = nguonLocal.filter(r => {
            const m = String(r['Mã hóa đơn'] || r.ma_hd || '').trim().toUpperCase();
            const mh = String(r['Mã hàng'] || r.ma_hang || '').trim().toUpperCase();
            return (m === maThieu || (maThieu.endsWith('123') && m === maThieu.slice(0, -3))) && mh && mh !== 'HH_TONGHOP';
          });
          if (khop.length > 0) {
            const dedup = khuTrungDongChiTietHang(khop.map(x => ({ ...x, 'Mã hóa đơn': maThieu, ma_hd: maThieu })), mapTienHD);
            dedup.forEach(c => dsDong.push(chuanHoaDong(c, maThieu)));
          }
        });
      }
    } catch (e) {}
  }

  // Khử trùng lần cuối toàn bộ danh sách dòng của chuyến
  dsDong = khuTrungDongChiTietHang(dsDong, mapTienHD).map(c => chuanHoaDong(c));
  dot.cacDongChiTietKiotViet = dsDong;
  return dsDong;
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
 * BỔ SUNG (APPEND + UPSERT) DỮ LIỆU EXCEL KIOTVIET VÀO DANH SÁCH CHỜ CHIA XE — AN TOÀN KHÔNG MẤT ĐƠN
 *
 * Khác với dongBoKiotTamLenSupabase (ghi đè nguyên khối JSON), hàm này:
 *   1. ĐỌC LẠI bản mới nhất trên máy chủ NGAY TRƯỚC KHI GHI (máy khác / lần nạp trước có thể đã có đơn);
 *   2. HỢP NHẤT theo "Mã hóa đơn": HĐ mới -> THÊM; HĐ đã có trong lần nạp -> CẬP NHẬT (thay bộ dòng của
 *      HĐ đó bằng dữ liệu mới); HĐ cũ không nằm trong lần nạp -> GIỮ NGUYÊN (không bao giờ xoá);
 *   3. UPSERT khối đã hợp nhất.
 * Vì luôn union với bản mới nhất của máy chủ, nếu lần nạp này THIẾU vài HĐ (do rớt mạng lúc đọc sơ bộ,
 * hay máy khác vừa nạp) thì các HĐ đó vẫn được giữ lại -> không rớt data.
 * Có RETRY + backoff để kháng rớt mạng giữa chừng. CHỈ dùng cho thao tác NẠP/BỔ SUNG, KHÔNG dùng cho
 * xoá đơn / chia xe (những luồng đó cần thu nhỏ danh sách nên vẫn dùng dongBoKiotTamLenSupabase / xoá).
 *
 * @param {Array}  dongMoi      các dòng hàng hoá vừa nạp (đã chuẩn hoá, có khoá 'Mã hóa đơn')
 * @param {Array|string} tenFileMoi  tên file vừa nạp (sẽ gộp vào danh sách tên file hiện có, không trùng)
 * @param {string} nguoiTao
 * @returns {Promise<{success:boolean, duLieu?:Array, danhSachTenFile?:Array, error?:any}>}
 */
async function boSungKiotTamLenSupabase(dongMoi, tenFileMoi = [], nguoiTao = "") {
  if (typeof sb === 'undefined') return { success: false, error: 'Chưa khởi tạo Supabase' };
  const dongMoiArr = Array.isArray(dongMoi) ? dongMoi : [];
  const maCua = r => String((r && (r['Mã hóa đơn'] != null ? r['Mã hóa đơn'] : r.ma_hd)) || '').trim().toUpperCase();
  const tenFileArr = Array.isArray(tenFileMoi) ? tenFileMoi : (tenFileMoi ? [tenFileMoi] : []);
  const maTrongLanNap = new Set(dongMoiArr.map(maCua).filter(Boolean));

  // Đọc TRỰC TIẾP file_kiot_tam để PHÂN BIỆT "đọc lỗi (mạng)" với "máy chủ rỗng thật":
  //   - error            -> lỗi mạng  -> TUYỆT ĐỐI KHÔNG GHI (ghi lúc này sẽ đè mất đơn) -> thử lại
  //   - không lỗi, rỗng  -> cloud trống thật -> ghi dongMoi làm nền an toàn
  //   - không lỗi, có dữ -> hợp nhất theo Mã hóa đơn rồi ghi
  async function docCloudKiotTam() {
    const { data, error } = await sb.from('file_kiot_tam').select('*').eq('id', 'kiot_chua_chia_xe').maybeSingle();
    if (error) return { loi: true };
    const rows = (data && Array.isArray(data.du_lieu)) ? data.du_lieu : [];
    let files = [];
    if (data && data.ten_file) files = String(data.ten_file).split(',').map(s => s.trim()).filter(Boolean);
    return { loi: false, rows, files };
  }

  let lastErr = null;
  // Thử tối đa 4 vòng (đọc lại + hợp nhất + ghi). Mỗi vòng đọc LẠI máy chủ để chống đè mất đơn.
  for (let lan = 0; lan < 4; lan++) {
    try {
      const doc = await docCloudKiotTam();
      if (doc.loi) {
        // Đọc hỏng (mạng) -> KHÔNG ghi đè, lùi lại thử vòng sau
        lastErr = 'Không đọc được danh sách chờ hiện có trên máy chủ (mạng?) — đã hoãn ghi để không mất đơn';
      } else {
        // Giữ các HĐ cũ KHÔNG nằm trong lần nạp (không đụng chạm) + bộ dòng mới (thêm/cập nhật HĐ trong lần nạp)
        const giuLaiHDCu = doc.rows.filter(r => !maTrongLanNap.has(maCua(r)));
        const hopNhat = giuLaiHDCu.concat(dongMoiArr);
        const tenFiles = Array.from(new Set(doc.files.concat(tenFileArr).filter(Boolean)));

        const res = await dongBoKiotTamLenSupabase(hopNhat, tenFiles, nguoiTao);
        if (res && res.success) {
          return { success: true, duLieu: hopNhat, danhSachTenFile: tenFiles };
        }
        lastErr = (res && res.error) || 'Ghi file_kiot_tam thất bại';
      }
    } catch (e) {
      lastErr = e;
    }
    // backoff tăng dần trước khi thử lại (400ms, 800ms, 1200ms)
    await new Promise(r => setTimeout(r, 400 * (lan + 1)));
  }
  return { success: false, error: lastErr || 'Không ghi được danh sách chờ lên máy chủ' };
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
      // Bước 2 ghi chuyến gốc vào maDotCu / xeCu / ngayCu (trước đây bị bỏ trống trên máy chủ)
      ngay_don_goc: item.ngayGiaoGoc || item.ngayCu || item.ngay_don_goc || '',
      dot_goc: item.maDotGoc || item.maDotCu || item.dot_goc || '',
      xe_goc: item.xeGoc || item.xeCu || item.xe_goc || '',
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
      xeGoc: d.xe_goc,
      // cùng tên trường Bước 2 dùng (để Bước 1 hiện "Chuyến trước" và đối chiếu đúng chuyến gốc)
      maDotCu: d.dot_goc || '',
      xeCu: d.xe_goc || '',
      ngayCu: d.ngay_don_goc || ''
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

/**
 * ĐỐI CHIẾU HÀNG ĐỢI HẸN GIAO LẠI VỚI KHO LƯU TRỮ (luu_tru) — cho khớp với Bước 2
 * --------------------------------------------------------------------
 * Một đơn chỉ còn "chờ giao lại" khi hoá đơn CÒN trên luu_tru, VẪN thuộc chuyến gốc (nếu biết mã
 * chuyến gốc) và chuyến đó ghi nhận có HÀNG TRẢ VỀ (tra_ve > 0) — đúng như Bước 2 đang hiện.
 * Còn lại là đơn TREO (trước đây nằm mãi ở Bước 1 dù Bước 2 không có hàng trả về):
 *   • hoá đơn không còn trên luu_tru (chuyến gốc đã bị xoá)
 *   • hoá đơn đã thuộc chuyến khác (đã được xếp giao lại / điều lại)
 *   • chuyến gốc không còn hàng trả về (đã làm mới chuyến, sửa thành giao đủ...)
 * Không đọc được máy chủ → daKiemTra = false, giữ nguyên danh sách (không gỡ nhầm lúc mất mạng).
 * @returns {Promise<{hopLe:Array, treo:Array<{item, lyDo}>, daKiemTra:boolean}>}
 */
async function doiChieuDonGiaoLaiVoiLuuTru(dsGL) {
  const ds = Array.isArray(dsGL) ? dsGL : [];
  const kq = { hopLe: ds.slice(), treo: [], daKiemTra: false };
  if (typeof sb === "undefined" || !ds.length) return kq;
  const maCua = it => String((it && (it.maHD || it.ma_hd)) || "").trim().toUpperCase();
  const dsMa = Array.from(new Set(ds.map(maCua).filter(Boolean)));
  const theoMa = new Map();
  try {
    for (let i = 0; i < dsMa.length; i += 150) {
      const { data, error } = await sb.from("luu_tru").select("ma_hd, ma_dot, xe, ngay_giao, tra_ve").in("ma_hd", dsMa.slice(i, i + 150));
      if (error) return kq;
      (data || []).forEach(r => theoMa.set(String(r.ma_hd || "").trim().toUpperCase(), r));
    }
  } catch (e) { return kq; }
  kq.hopLe = [];
  kq.daKiemTra = true;
  ds.forEach(it => {
    const r = theoMa.get(maCua(it));
    const dotGoc = it.maDotCu || it.maDotGoc || "";
    let lyDo = "";
    if (!r) lyDo = "hoá đơn không còn trên kho lưu trữ (chuyến gốc đã bị xoá)";
    else if (dotGoc && r.ma_dot && r.ma_dot !== dotGoc) lyDo = `hoá đơn đã thuộc chuyến khác (${r.xe || "?"} ${r.ngay_giao || ""})`.trim();
    else if (!((parseFloat(r.tra_ve) || 0) > 0)) lyDo = `chuyến ${r.xe || "?"} ${r.ngay_giao || ""} không ghi nhận hàng trả về`.trim();
    if (lyDo) kq.treo.push({ item: it, lyDo: lyDo });
    else {
      // Bổ sung thông tin chuyến gốc cho đơn lấy từ máy chủ (trước đây trống)
      if (!it.maDotCu && r.ma_dot) it.maDotCu = r.ma_dot;
      if (!it.xeCu && r.xe) it.xeCu = r.xe;
      if (!it.ngayCu && r.ngay_giao) it.ngayCu = r.ngay_giao;
      kq.hopLe.push(it);
    }
  });
  return kq;
}

/**
 * Dọn hàng đợi hẹn giao lại trên máy này + máy chủ: gộp đơn trên máy chủ, đối chiếu luu_tru,
 * gỡ các đơn treo ở cả 2 nơi. Trả về { treo: [{item, lyDo}], daKiemTra }.
 */
async function donDepDonGiaoLaiTreo() {
  let dsGL = [];
  try { dsGL = JSON.parse(localStorage.getItem("tmh_danh_sach_cho_giao_lai") || "[]") || []; } catch (e) {}
  if (typeof taiDonGiaoLaiTuSupabase === "function") {
    try {
      const cloud = await taiDonGiaoLaiTuSupabase();
      const coRoi = new Set(dsGL.map(x => String(x.maHD || "").trim().toUpperCase()));
      (cloud || []).forEach(d => { if (!coRoi.has(String(d.maHD || "").trim().toUpperCase())) dsGL.push(d); });
    } catch (e) {}
  }
  const kq = await doiChieuDonGiaoLaiVoiLuuTru(dsGL);
  if (!kq.daKiemTra) return { treo: [], daKiemTra: false };
  localStorage.setItem("tmh_danh_sach_cho_giao_lai", JSON.stringify(kq.hopLe));
  if (kq.treo.length) await xoaDonGiaoLaiSupabase(kq.treo.map(t => t.item.maHD || t.item.ma_hd));
  return { treo: kq.treo, daKiemTra: true };
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
 * - Thiếu từ 10.000 đ trở lên: ghi nợ cho người nộp tiền xe (tính toán cuối tháng).
 * - Tiền thừa dưới 10.000 đ: không ghi nhận. Thừa từ 10.000 đ trở lên: ghi nhận cho người nộp.
 * Bảng đếm tiền để trống (chưa đếm) thì chưa xác định được thiếu / thừa.
 * ==================================================================== */
const NGUONG_GHI_NO_THIEU_TIEN = 10000;

function tinhThieuThuaNopTien(tienDem, phaiNop) {
  const dem = Math.round(parseFloat(tienDem) || 0);
  const phai = Math.round(parseFloat(phaiNop) || 0);
  const daDem = dem > 0 || phai <= 0;
  const chenh = daDem ? dem - phai : 0;
  const rawThieu = chenh < 0 ? -chenh : 0;
  const rawThua = chenh > 0 ? chenh : 0;
  // Tiền thừa / thiếu dưới 10.000 đ không ghi nhận
  const thieu = rawThieu >= NGUONG_GHI_NO_THIEU_TIEN ? rawThieu : 0;
  const thua = rawThua >= NGUONG_GHI_NO_THIEU_TIEN ? rawThua : 0;
  const ghiNo = thieu >= NGUONG_GHI_NO_THIEU_TIEN;
  return { daDem, tienDem: dem, phaiNop: phai, chenh, rawThieu, rawThua, thieu, thua, ghiNo, soNo: ghiNo ? thieu : 0 };
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
 * XOÁ DỮ LIỆU CHUYẾN XE / HOÁ ĐƠN → GỠ ĐƠN NỢ ĐÃ GHI NHẬN KHỎI SỔ CÔNG NỢ
 * --------------------------------------------------------------------
 * Sổ công nợ trên mỗi máy chỉ được BỔ SUNG thêm từ luu_tru, nên khi một chuyến xe
 * (hoặc một hoá đơn lẻ) bị xoá khỏi luu_tru thì đơn nợ đã ghi nhận trước đó vẫn
 * còn treo trong sổ — xoá hết xe rồi mà phần công nợ vẫn báo còn nợ.
 * Hai hàm dưới đây xử lý cả 2 chiều:
 *   1. goDonNoCuaChuyenTrenMayNay(...) — gỡ ngay trên máy vừa thực hiện xoá.
 *   2. goDonNoMatChungTu(ds) — mọi máy tự đối chiếu lại sổ với luu_tru khi tải sổ.
 * Chỉ gỡ khi CHẮC CHẮN an toàn: đơn nợ sinh từ bảng kê (id = "NO_" + maHD), không
 * phải đơn "Ngoài bảng kê", và CHƯA THU đồng nào. Đơn đã thu (một phần hoặc đủ)
 * luôn được giữ lại để không mất dấu tiền đã thu.
 * ==================================================================== */

/**
 * Gỡ ngay trên máy này các đơn nợ thuộc chuyến xe / các hoá đơn vừa bị xoá dữ liệu,
 * để sổ công nợ ở máy đang xoá cập nhật liền (máy khác tự gỡ qua goDonNoMatChungTu).
 * @param {string} maDot     mã chuyến xe bị xoá (bỏ trống nếu chỉ xoá hoá đơn lẻ)
 * @param {Array}  dsMaHD    danh sách mã hoá đơn bị xoá (tuỳ chọn)
 * @returns {{soGo:number, giuLai:number}} số đơn đã gỡ và số đơn giữ lại vì đã thu tiền
 */
function goDonNoCuaChuyenTrenMayNay(maDot, dsMaHD) {
  const kq = { soGo: 0, giuLai: 0 };
  try {
    let ds = [];
    try { ds = JSON.parse(localStorage.getItem("tmh_theo_doi_cong_no") || "[]"); } catch (e) { return kq; }
    if (!Array.isArray(ds) || !ds.length) return kq;
    const dot = maDot ? String(maDot) : "";
    const setMa = new Set((dsMaHD || []).map(m => String(m || "").trim().toUpperCase()).filter(Boolean));
    const conLai = ds.filter(d => {
      if (!d || !d.maHD || d.ngoaiBangKe || d.maDot === "NGOAI_BANG_KE") return true;
      if (d.id !== "NO_" + d.maHD) return true;
      const thuocChuyen = dot && String(d.maDot || "") === dot;
      const thuocHD = setMa.has(String(d.maHD).trim().toUpperCase());
      if (!thuocChuyen && !thuocHD) return true;
      if ((d.daThu || 0) > 0.5) { kq.giuLai++; return true; }  // đã thu tiền → giữ lại
      kq.soGo++;
      return false;
    });
    if (kq.soGo) localStorage.setItem("tmh_theo_doi_cong_no", JSON.stringify(conLai));
    return kq;
  } catch (e) {
    console.warn("Lỗi gỡ đơn nợ của chuyến vừa xoá:", e);
    return kq;
  }
}

/**
 * Đối chiếu sổ công nợ trên máy này với luu_tru trên máy chủ và gỡ những đơn nợ mà
 * chứng từ gốc KHÔNG CÒN nữa (chuyến xe / hoá đơn đã bị xoá ở bất kỳ máy nào):
 *   • hoá đơn không còn dòng nào trên luu_tru, hoặc
 *   • hoá đơn đã thuộc chuyến khác và chuyến đó không ghi nợ (nợ cũ của chuyến đã xoá).
 * Chỉ gỡ khi đơn nợ chưa từng được thu (cả trên máy chủ lẫn phần chỉ ghi trên máy này)
 * VÀ chuyến xe của đơn nợ đã từng lưu được phiếu nộp tiền lên máy chủ (PNP_<maDot>) —
 * để phân biệt "chuyến đã bị xoá" với "chuyến quyết toán lúc mất mạng, chưa lên máy chủ"
 * (trường hợp sau phải GIỮ đơn nợ, vì mất mạng không phải là đã xoá).
 * Lỗi mạng / đọc không được thì GIỮ NGUYÊN sổ.
 * @param {Array} ds  sổ công nợ (mảng đơn nợ) — không bị sửa
 * @returns {Promise<{ds:Array, soGo:number}>}
 */
async function goDonNoMatChungTu(ds) {
  const kq = { ds: ds, soGo: 0 };
  if (typeof sb === "undefined" || !Array.isArray(ds) || !ds.length) return kq;
  const ungVien = ds.filter(d => d && d.maHD && !d.ngoaiBangKe && d.maDot !== "NGOAI_BANG_KE" && d.id === "NO_" + d.maHD);
  if (!ungVien.length) return kq;
  try {
    const dsMa = Array.from(new Set(ungVien.map(d => d.maHD)));
    const lt = new Map();
    for (let i = 0; i < dsMa.length; i += 150) {
      const { data, error } = await sb.from("luu_tru").select("ma_hd, ma_dot, no_phat_sinh").in("ma_hd", dsMa.slice(i, i + 150));
      if (error) return kq;
      (data || []).forEach(r => lt.set(r.ma_hd, r));
    }
    let nghi = ungVien.filter(d => {
      if (!d.maDot) return false;                             // không rõ chuyến nào → giữ cho an toàn
      const r = lt.get(d.maHD);
      if (!r) return true;                                    // hoá đơn đã bị xoá khỏi lưu trữ
      if ((parseFloat(r.no_phat_sinh) || 0) > 0) return false; // vẫn đang ghi nợ → giữ
      return !!(r.ma_dot && r.ma_dot !== d.maDot);             // đã sang chuyến khác, không còn nợ
    });
    if (!nghi.length) return kq;

    // Chỉ coi là "đã bị xoá" khi chuyến xe từng lưu được phiếu nộp tiền lên máy chủ.
    // Chuyến chưa bao giờ lên máy chủ (quyết toán lúc mất mạng) thì giữ nguyên đơn nợ.
    const dsPhieu = Array.from(new Set(nghi.map(d => "PNP_" + d.maDot)));
    const coPhieu = new Set();
    for (let i = 0; i < dsPhieu.length; i += 150) {
      const { data, error } = await sb.from("phieu_nop_tien").select("ma_phieu").in("ma_phieu", dsPhieu.slice(i, i + 150));
      if (error) return kq;
      (data || []).forEach(r => coPhieu.add(r.ma_phieu));
    }
    nghi = nghi.filter(d => coPhieu.has("PNP_" + d.maDot));
    if (!nghi.length) return kq;

    const dsId = nghi.map(d => d.id);
    const tongThu = {};
    for (let i = 0; i < dsId.length; i += 150) {
      const { data, error } = await sb.from("thu_no").select("id_don_no, so_tien").in("id_don_no", dsId.slice(i, i + 150));
      if (error) return kq;
      (data || []).forEach(r => { tongThu[r.id_don_no] = (tongThu[r.id_don_no] || 0) + (parseFloat(r.so_tien) || 0); });
    }
    const go = new Set(nghi.filter(d => {
      const chiTrenMay = typeof d.daThuCloudDaDongBo === "number" ? Math.max(0, (d.daThu || 0) - d.daThuCloudDaDongBo) : (d.daThu || 0);
      return !((tongThu[d.id] || 0) > 0.5) && !(chiTrenMay > 0.5);
    }).map(d => d.id));
    if (!go.size) return kq;
    return { ds: ds.filter(d => !go.has(d.id)), soGo: go.size };
  } catch (e) {
    console.warn("Lỗi gỡ đơn nợ không còn chứng từ gốc:", e);
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
  { id: "chotquy",   label: "Sổ quỹ tiền mặt", trang: ["bang_chot_quy.html"] },
  { id: "misa",      label: "B3: Đẩy Dữ Liệu MISA", trang: ["buoc3_day_misa.html", "buoc3_luu_tru.html"] },
  { id: "baocao",    label: "Báo Cáo Tổng Hợp", trang: ["bao_cao_tong_hop.html"] },
  { id: "congno",    label: "Theo Dõi Công Nợ", trang: ["theo_doi_cong_no.html"] },
  { id: "danhmuc",   label: "Danh Mục", trang: ["danh_muc.html"] },
  { id: "taikhoan",  label: "Tài khoản & Phân quyền", trang: ["quan_ly_taikhoan.html"] }
];

// Ma trận mẫu ban đầu (khi Supabase chưa có dữ liệu phân quyền)
const MA_TRAN_MAC_DINH = {
  "Giám đốc Điều hành": { tongquan: "all", dieuxe: "all",  quyettoan: "all",  chotquy: "all",  misa: "all",  baocao: "all",  congno: "all",  danhmuc: "all",  taikhoan: "all" },
  "Kế toán Bán hàng":   { tongquan: "all", dieuxe: "all",  quyettoan: "view", chotquy: "none", misa: "none", baocao: "none", congno: "view", danhmuc: "view", taikhoan: "none" },
  "Kế toán Công nợ":    { tongquan: "all", dieuxe: "view", quyettoan: "all",  chotquy: "none", misa: "none", baocao: "view", congno: "all",  danhmuc: "view", taikhoan: "none" },
  "Kế toán Tổng hợp":   { tongquan: "all", dieuxe: "all",  quyettoan: "all",  chotquy: "all",  misa: "all",  baocao: "all",  congno: "all",  danhmuc: "all",  taikhoan: "view" },
  "Kiểm duyệt viên":    { tongquan: "all", dieuxe: "all",  quyettoan: "all",  chotquy: "none", misa: "none", baocao: "view", congno: "view", danhmuc: "view", taikhoan: "none" },
  "Thủ kho":            { tongquan: "all", dieuxe: "all",  quyettoan: "none", chotquy: "none", misa: "none", baocao: "none", congno: "none", danhmuc: "view", taikhoan: "none" },
  "Tài xế":             { tongquan: "all", dieuxe: "view", quyettoan: "view", chotquy: "none", misa: "none", baocao: "none", congno: "none", danhmuc: "none", taikhoan: "none" }
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
  // Tài khoản & Báo cáo & Chốt Quỹ: mặc định chỉ Cấp 1 (taikhoan) / Kế toán Tổng hợp & Cấp 1 (chotquy) / Cấp 1-2 (baocao)
  if (moduleId === "taikhoan") return "none";
  if (moduleId === "chotquy") {
    let chucVu = "";
    try {
      chucVu = (localStorage.getItem("userChucVu") || "").toLowerCase();
      if (!chucVu) {
        const p = JSON.parse(localStorage.getItem("nhan_su_profile") || "{}");
        chucVu = (p.chuc_vu || "").toLowerCase();
      }
    } catch (e) {}
    if (cap === 1 || chucVu.includes("kế toán tổng hợp")) return "all";
    return "none";
  }
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
