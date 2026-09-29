/* ====================================================================
 * HẠN MỨC CÔNG NỢ KHÁCH HÀNG — dùng chung (Theo Dõi Công Nợ, Bước 2 Quyết Toán)
 * --------------------------------------------------------------------
 * Mỗi khách có 1 hạn mức gồm số NGÀY được nợ (tính từ ngày nợ của từng hoá đơn) và số TIỀN
 * nợ tối đa (0 = không giới hạn). Khách cá nhân dùng hạn mức MẶC ĐỊNH (ban đầu 05 ngày ·
 * 6.000.000 đ, sửa được). Có thể tạo NHÓM KHÁCH HÀNG (vd. chuỗi AU MART) với hạn mức riêng;
 * khách trong nhóm dùng hạn mức của nhóm thay cho mặc định cá nhân. Hạn mức tiền của nhóm:
 *   • 'tong_nhom'  — TỔNG nợ của cả nhóm không vượt hạn mức (cả chuỗi dùng chung 1 hạn mức)
 *   • 'tung_khach' — MỖI khách trong nhóm được nợ tối đa hạn mức đó
 * Lưu trên Supabase bảng nhom_han_muc_cong_no (sql/15_han_muc_cong_no.sql) để mọi máy dùng
 * chung; máy chủ chưa có bảng thì tạm lưu trên máy này (localStorage).
 * Hạn mức chỉ để CẢNH BÁO — không tự chặn nghiệp vụ.
 * ==================================================================== */
const BANG_HAN_MUC = "nhom_han_muc_cong_no";
const ID_HAN_MUC_CA_NHAN = "__CA_NHAN_MAC_DINH__";
const HAN_MUC_CA_NHAN_MAC_DINH = { soNgay: 5, soTien: 6000000 };
const KHOA_LS_HAN_MUC = "tmh_han_muc_cong_no";

let _cauHinhHanMuc = null; // { caNhan:{soNgay,soTien}, nhom:[...], nguon:'cloud'|'may', loi }

function khoaTenKhachHM(t) {
  return String(t || "").normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
}

function laLoiThieuBangHM(err) {
  if (!err) return false;
  const msg = String(err.message || err.details || err.hint || "");
  return err.code === "PGRST205" || err.code === "42P01" || /Could not find the table/i.test(msg) || /nhom_han_muc_cong_no/i.test(msg);
}

function _soNguyenKhongAm(v, macDinh) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? macDinh : Math.round(n);
}

function _nguoiCapNhatHM() {
  try {
    const p = JSON.parse(localStorage.getItem("nhan_su_profile") || "{}");
    const ten = p.ho_ten || "Không rõ";
    return p.so_dien_thoai ? `${ten} (${p.so_dien_thoai})` : ten;
  } catch (e) { return "Không rõ"; }
}

function _docHanMucTrenMay() {
  try { const ds = JSON.parse(localStorage.getItem(KHOA_LS_HAN_MUC) || "[]"); return Array.isArray(ds) ? ds : []; } catch (e) { return []; }
}

function _ghiHanMucTrenMay(ds) {
  try { localStorage.setItem(KHOA_LS_HAN_MUC, JSON.stringify(ds || [])); } catch (e) {}
}

/** Đọc cấu hình hạn mức (máy chủ → bản sao trên máy). epTaiLai = true để bỏ bộ nhớ đệm. */
async function taiCauHinhHanMuc(epTaiLai) {
  if (_cauHinhHanMuc && !epTaiLai) return _cauHinhHanMuc;
  let dong = null, loi = "", thieuBang = false;
  if (typeof sb !== "undefined") {
    try {
      const { data, error } = await sb.from(BANG_HAN_MUC).select("*");
      if (error) { loi = error.message || String(error); thieuBang = laLoiThieuBangHM(error); }
      else dong = data || [];
    } catch (e) { loi = (e && e.message) || String(e); }
  }
  let nguon = "cloud";
  if (dong) _ghiHanMucTrenMay(dong);           // bản sao để dùng khi mất mạng
  else { nguon = "may"; dong = _docHanMucTrenMay(); }

  const rowCN = dong.find(r => r.id === ID_HAN_MUC_CA_NHAN);
  _cauHinhHanMuc = {
    caNhan: rowCN
      ? { soNgay: _soNguyenKhongAm(rowCN.han_muc_ngay, HAN_MUC_CA_NHAN_MAC_DINH.soNgay), soTien: _soNguyenKhongAm(rowCN.han_muc_tien, HAN_MUC_CA_NHAN_MAC_DINH.soTien) }
      : Object.assign({}, HAN_MUC_CA_NHAN_MAC_DINH),
    nhom: dong.filter(r => r && r.id && r.id !== ID_HAN_MUC_CA_NHAN).map(r => ({
      id: r.id,
      ten: r.ten_nhom || "",
      soNgay: _soNguyenKhongAm(r.han_muc_ngay, 0),
      soTien: _soNguyenKhongAm(r.han_muc_tien, 0),
      cachTinh: r.cach_tinh === "tung_khach" ? "tung_khach" : "tong_nhom",
      thanhVien: Array.isArray(r.thanh_vien) ? r.thanh_vien.filter(tv => tv && (tv.tenKH || tv.maKH)) : [],
      ghiChu: r.ghi_chu || "",
      nguoiCapNhat: r.nguoi_cap_nhat || "",
      capNhatLuc: r.cap_nhat_luc || ""
    })).sort((a, b) => a.ten.localeCompare(b.ten, "vi")),
    nguon: nguon,
    thieuBang: thieuBang,
    loi: loi
  };
  return _cauHinhHanMuc;
}

/** Ghi (thêm / sửa) các dòng hạn mức. Máy chủ chưa có bảng → lưu trên máy này. */
async function luuCacDongHanMuc(dsDong) {
  const luc = new Date().toISOString();
  const nguoi = _nguoiCapNhatHM();
  const ds = dsDong.map(r => Object.assign({}, r, { cap_nhat_luc: luc, nguoi_cap_nhat: nguoi }));
  if (typeof sb !== "undefined") {
    try {
      const { error } = await sb.from(BANG_HAN_MUC).upsert(ds, { onConflict: "id" });
      if (!error) { await taiCauHinhHanMuc(true); return { ok: true, nguon: "cloud" }; }
      if (!laLoiThieuBangHM(error)) return { ok: false, loi: error.message || String(error) };
    } catch (e) { return { ok: false, loi: (e && e.message) || String(e) }; }
  }
  const tren = _docHanMucTrenMay();
  ds.forEach(r => {
    const i = tren.findIndex(x => x.id === r.id);
    if (i >= 0) tren[i] = r; else tren.push(r);
  });
  _ghiHanMucTrenMay(tren);
  await taiCauHinhHanMuc(true);
  return { ok: true, nguon: "may" };
}

async function xoaDongHanMuc(id) {
  if (typeof sb !== "undefined") {
    try {
      const { error } = await sb.from(BANG_HAN_MUC).delete().eq("id", id);
      if (!error) { await taiCauHinhHanMuc(true); return { ok: true, nguon: "cloud" }; }
      if (!laLoiThieuBangHM(error)) return { ok: false, loi: error.message || String(error) };
    } catch (e) { return { ok: false, loi: (e && e.message) || String(e) }; }
  }
  _ghiHanMucTrenMay(_docHanMucTrenMay().filter(x => x.id !== id));
  await taiCauHinhHanMuc(true);
  return { ok: true, nguon: "may" };
}

/** Dòng dữ liệu (dạng bảng) của 1 nhóm */
function dongTuNhomHM(n) {
  return {
    id: n.id, ten_nhom: n.ten, loai: "nhom", han_muc_ngay: _soNguyenKhongAm(n.soNgay, 0), han_muc_tien: _soNguyenKhongAm(n.soTien, 0),
    cach_tinh: n.cachTinh === "tung_khach" ? "tung_khach" : "tong_nhom",
    thanh_vien: (n.thanhVien || []).map(tv => ({ maKH: tv.maKH || "", tenKH: tv.tenKH || "" })), ghi_chu: n.ghiChu || ""
  };
}

function dongTuCaNhanHM(cn) {
  return {
    id: ID_HAN_MUC_CA_NHAN, ten_nhom: "Khách cá nhân (mặc định)", loai: "ca_nhan_mac_dinh",
    han_muc_ngay: _soNguyenKhongAm(cn.soNgay, HAN_MUC_CA_NHAN_MAC_DINH.soNgay), han_muc_tien: _soNguyenKhongAm(cn.soTien, HAN_MUC_CA_NHAN_MAC_DINH.soTien),
    cach_tinh: "tung_khach", thanh_vien: [], ghi_chu: "Áp dụng cho mọi khách không thuộc nhóm nào"
  };
}

function laThanhVienHM(tv, kh) {
  const ma = String((kh && kh.maKH) || "").trim().toUpperCase();
  const ten = khoaTenKhachHM(kh && kh.tenKH);
  const maTV = String(tv.maKH || "").trim().toUpperCase();
  return (ma && maTV && ma === maTV) || (ten && khoaTenKhachHM(tv.tenKH) === ten);
}

/** Nhóm của khách (theo mã KH, không có mã thì theo tên) — null nếu là khách cá nhân */
function timNhomCuaKhachHM(cfg, kh) {
  if (!cfg) return null;
  return cfg.nhom.find(n => n.thanhVien.some(tv => laThanhVienHM(tv, kh))) || null;
}

/** Hạn mức đang áp dụng cho 1 khách */
function hanMucCuaKhachHM(cfg, kh) {
  const c = cfg || { caNhan: HAN_MUC_CA_NHAN_MAC_DINH, nhom: [] };
  const n = timNhomCuaKhachHM(c, kh);
  return n
    ? { nhom: n, soNgay: n.soNgay, soTien: n.soTien, cachTinh: n.cachTinh }
    : { nhom: null, soNgay: c.caNhan.soNgay, soTien: c.caNhan.soTien, cachTinh: "tung_khach" };
}

/** "YYYY-MM-DD" | "DD/MM/YYYY" | "D/M/YYYY" | Date → "YYYY-MM-DD" (không đọc được → "") */
function ngayISOHanMuc(v) {
  if (!v) return "";
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

function ngayHomNayHanMuc() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Số ngày từ ngày nợ đến hôm nay (null nếu không rõ ngày) */
function soNgayNoHanMuc(ngayNo, homNay) {
  const a = ngayISOHanMuc(ngayNo), b = ngayISOHanMuc(homNay || ngayHomNayHanMuc());
  if (!a || !b) return null;
  return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000);
}

/**
 * Đánh giá hạn mức cho danh sách đơn nợ còn phải thu.
 * @param cfg   cấu hình (taiCauHinhHanMuc)
 * @param dsDon [{ maHD, maKH, tenKH, conLai, ngayNo }]
 * @returns {{ theoKhach: Map<khoá tên KH, {...}>, tongNhom: Map<id nhóm, số nợ> }}
 *   mỗi khách: { tenKH, maKH, hanMuc, tongNo, noSoVoiHanMuc, vuotTien, dsQuaHan:[{maHD, tuoi, quaHan, conLai}], quaHan, viPham }
 */
function danhGiaHanMucCongNo(cfg, dsDon, homNay) {
  const hn = homNay || ngayHomNayHanMuc();
  const theoKhach = new Map();
  (dsDon || []).forEach(d => {
    const cl = parseFloat(d.conLai) || 0;
    if (cl <= 0.5) return;
    const k = khoaTenKhachHM(d.tenKH || "Khách Lẻ");
    if (!theoKhach.has(k)) theoKhach.set(k, { tenKH: d.tenKH || "Khách Lẻ", maKH: d.maKH || "", hanMuc: hanMucCuaKhachHM(cfg, d), tongNo: 0, dsQuaHan: [] });
    const g = theoKhach.get(k);
    g.tongNo += cl;
    if (!g.maKH && d.maKH) g.maKH = d.maKH;
    const tuoi = soNgayNoHanMuc(d.ngayNo, hn);
    if (g.hanMuc.soNgay > 0 && tuoi !== null && tuoi > g.hanMuc.soNgay) {
      g.dsQuaHan.push({ maHD: d.maHD || "", tuoi: tuoi, quaHan: tuoi - g.hanMuc.soNgay, conLai: cl });
    }
  });
  const tongNhom = new Map();
  theoKhach.forEach(g => { if (g.hanMuc.nhom) tongNhom.set(g.hanMuc.nhom.id, (tongNhom.get(g.hanMuc.nhom.id) || 0) + g.tongNo); });
  theoKhach.forEach(g => {
    const hm = g.hanMuc;
    g.noSoVoiHanMuc = (hm.nhom && hm.cachTinh === "tong_nhom") ? (tongNhom.get(hm.nhom.id) || 0) : g.tongNo;
    g.vuotTien = hm.soTien > 0 && g.noSoVoiHanMuc > hm.soTien + 0.5;
    g.quaHan = g.dsQuaHan.length > 0;
    g.viPham = g.vuotTien || g.quaHan;
  });
  return { theoKhach: theoKhach, tongNhom: tongNhom };
}

/** Mô tả ngắn hạn mức: "05 ngày · 6.000.000 đ" */
function moTaHanMucHM(hm) {
  const tien = hm.soTien > 0 ? Math.round(hm.soTien).toLocaleString("vi-VN") + " đ" : "không giới hạn tiền";
  const ngay = hm.soNgay > 0 ? String(hm.soNgay).padStart(2, "0") + " ngày" : "không giới hạn ngày";
  return `${ngay} · ${tien}`;
}

/** Các dòng mô tả vi phạm của 1 khách (dùng cho cảnh báo) */
function moTaViPhamHM(g) {
  const hm = g.hanMuc;
  const phan = [];
  const noiHM = hm.nhom ? `nhóm "${hm.nhom.ten}"${hm.cachTinh === "tong_nhom" ? " (tính tổng cả nhóm)" : ""}` : "cá nhân";
  if (g.vuotTien) phan.push(`nợ ${Math.round(g.noSoVoiHanMuc).toLocaleString("vi-VN")} đ vượt hạn mức ${Math.round(hm.soTien).toLocaleString("vi-VN")} đ của ${noiHM}`);
  if (g.quaHan) {
    const lau = g.dsQuaHan.reduce((m, x) => Math.max(m, x.quaHan), 0);
    phan.push(`${g.dsQuaHan.length} đơn quá hạn ${hm.soNgay} ngày (lâu nhất quá ${lau} ngày: ${g.dsQuaHan.map(x => x.maHD).filter(Boolean).slice(0, 4).join(", ")}${g.dsQuaHan.length > 4 ? "…" : ""})`);
  }
  return phan;
}
