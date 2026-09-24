/* ====================================================================
 * khach_tra_truoc.js — SỔ TIỀN KHÁCH TRẢ TRƯỚC / TRẢ DƯ (DƯ CÓ TK 131)
 * THÁI MỸ HƯƠNG — dùng chung cho Theo Dõi Công Nợ, Bước 2 và Bước 3
 * ====================================================================
 * - Nhận tiền (khách trả trước, trả dư hoá đơn, thu nợ vượt số nợ) và hoàn tiền cho
 *   khách được ghi vào bảng khach_tra_truoc (sql/12) — chỉ thêm, không sửa / xoá.
 * - Cấn trừ (dùng tiền trả trước để trừ vào đơn nợ) được ghi thành 1 dòng thu_no có
 *   hinh_thuc = 'Cấn trừ trả trước' → sổ công nợ trên mọi máy tự trừ đúng như 1 lần
 *   thu nợ, còn Bước 3 KHÔNG đẩy dòng này lên MISA (không có tiền thật đi vào quỹ;
 *   MISA tự bù trừ trong TK 131 của khách).
 * - Số dư trả trước của khách = Tổng nhận − Tổng hoàn − Tổng đã cấn trừ.
 * - Luôn HỎI TRƯỚC khi cấn trừ — không bao giờ tự trừ.
 * ==================================================================== */

const BANG_TRA_TRUOC = "khach_tra_truoc";
const HINH_THUC_CAN_TRU_TT = "Cấn trừ trả trước";
const GHI_CHU_CAN_TRU_TT = "Cấn trừ tiền khách trả trước";
const TEN_NGUON_TT = {
  tra_truoc: "Khách trả trước",
  thu_tai_quy_du: "Thu nợ tại quỹ — phần trả dư",
  buoc2_du_hoa_don: "Bước 2 — trả dư hoá đơn",
  buoc2_du_thu_no: "Bước 2 — thu nợ cũ vượt số nợ",
  buoc2_hoan_ck_du: "Bước 2 — khách chuyển khoản dư, tài xế hoàn tiền mặt",
  hoan_tien: "Hoàn tiền cho khách"
};

// Khoá khách hàng giống sổ công nợ (theo tên khách hàng)
function khoaKhachTT(ten) {
  return String(ten || "").trim().replace(/\s+/g, " ").toUpperCase();
}

function laLoiThieuBangTT(err) {
  if (!err) return false;
  const msg = String(err.message || err.details || err.hint || "");
  return err.code === "PGRST205" || err.code === "42P01" || /Could not find the table/i.test(msg) || /khach_tra_truoc/i.test(msg);
}

function laDongCanTruTT(r) {
  return String((r && r.hinh_thuc) || "") === HINH_THUC_CAN_TRU_TT;
}

function nguoiThucHienTT() {
  try {
    const p = JSON.parse(localStorage.getItem("nhan_su_profile") || "{}");
    const ten = p.ho_ten || "Không rõ";
    return p.so_dien_thoai ? `${ten} (${p.so_dien_thoai})` : ten;
  } catch (e) { return "Không rõ"; }
}

function ngayHomNayTT() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function soTienTT(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

/**
 * Đọc toàn bộ sổ trả trước.
 * @returns {Promise<{ok:boolean, thieuBang?:boolean, loi?:string, theoKhach?:Map}>}
 *   theoKhach: khoá khách -> { tenKH, maKH, nhan, hoan, canTru, soDu, lichSu[] }
 */
async function taiSoTraTruoc() {
  if (typeof sb === "undefined") return { ok: false, loi: "Chưa kết nối máy chủ" };
  let r1, r2;
  try {
    [r1, r2] = await Promise.all([
      sb.from(BANG_TRA_TRUOC).select("*").order("id", { ascending: true }),
      sb.from("thu_no").select("*").eq("hinh_thuc", HINH_THUC_CAN_TRU_TT)
    ]);
  } catch (e) {
    return { ok: false, loi: e.message || String(e) };
  }
  if (r1.error) return { ok: false, thieuBang: laLoiThieuBangTT(r1.error), loi: r1.error.message || "" };

  const theoKhach = new Map();
  const nhom = (ten, ma) => {
    const k = khoaKhachTT(ten);
    if (!theoKhach.has(k)) theoKhach.set(k, { khoa: k, tenKH: String(ten || "").trim(), maKH: ma || "", nhan: 0, hoan: 0, canTru: 0, soDu: 0, lichSu: [] });
    const g = theoKhach.get(k);
    if (!g.maKH && ma) g.maKH = ma;
    return g;
  };
  (r1.data || []).forEach(r => {
    const g = nhom(r.ten_kh, r.ma_kh);
    const st = soTienTT(r.so_tien);
    if (r.loai === "hoan") g.hoan += st; else g.nhan += st;
    g.lichSu.push({
      loai: r.loai === "hoan" ? "hoan" : "nhan", id: r.id, soTien: st, ngay: r.ngay || "", luc: r.luc || "",
      hinhThuc: r.hinh_thuc || "", taiKhoan: r.tai_khoan_nhan || "", nguon: r.nguon || "", maHD: r.ma_hd || "",
      maDot: r.ma_dot || "", nguoi: r.nguoi_thuc_hien || "", ghiChu: r.ghi_chu || "", daDayMisa: !!r.da_day_misa
    });
  });
  if (r2 && !r2.error) {
    (r2.data || []).forEach(r => {
      const st = soTienTT(r.so_tien);
      if (st <= 0) return;
      const g = nhom(r.ten_kh, r.ma_kh);
      g.canTru += st;
      g.lichSu.push({
        loai: "can_tru", id: r.id, soTien: st, ngay: r.ngay_thu || "", luc: r.tao_luc || "", maHD: r.ma_hd || "",
        idDonNo: r.id_don_no || "", nguoi: r.nguoi_thu || "", ghiChu: r.ghi_chu || ""
      });
    });
  }
  theoKhach.forEach(g => {
    g.soDu = Math.round(g.nhan - g.hoan - g.canTru);
    g.lichSu.sort((a, b) => (String(a.ngay) + String(a.luc)).localeCompare(String(b.ngay) + String(b.luc)));
  });
  return { ok: true, theoKhach: theoKhach, loiCanTru: (r2 && r2.error) ? (r2.error.message || "") : "" };
}

/** Ghi các dòng nhận / hoàn vào sổ (mỗi dòng: ngay, ma_kh, ten_kh, loai, so_tien, hinh_thuc, tai_khoan_nhan, nguon, ma_dot, ma_hd, ghi_chu) */
async function ghiSoTraTruoc(dsDong) {
  if (typeof sb === "undefined") return { ok: false, loi: "Chưa kết nối máy chủ" };
  const rows = (dsDong || []).filter(r => Math.abs(soTienTT(r.so_tien)) > 0).map(r => Object.assign({
    ngay: ngayHomNayTT(), loai: "nhan", hinh_thuc: "Tiền mặt", tai_khoan_nhan: "", nguon: "tra_truoc",
    ma_kh: "", ma_dot: "", ma_hd: "", ghi_chu: "", nguoi_thuc_hien: nguoiThucHienTT()
  }, r));
  if (!rows.length) return { ok: true, soDong: 0 };
  try {
    const { error } = await sb.from(BANG_TRA_TRUOC).insert(rows);
    if (error) return { ok: false, thieuBang: laLoiThieuBangTT(error), loi: error.message || "" };
  } catch (e) {
    return { ok: false, loi: e.message || String(e) };
  }
  if (typeof ghiNhatKy === "function") {
    rows.forEach(r => ghiNhatKy("tra_truoc", {
      doi_tuong: r.ten_kh,
      noi_dung: `${r.loai === "hoan" ? "Hoàn tiền trả trước cho" : "Ghi nhận tiền trả trước của"} khách ${r.ten_kh}: ${Math.round(soTienTT(r.so_tien)).toLocaleString("vi-VN")} đ (${r.hinh_thuc}${r.tai_khoan_nhan ? " — " + r.tai_khoan_nhan : ""}) — ${TEN_NGUON_TT[r.nguon] || r.nguon}`,
      chi_tiet: r
    }));
  }
  return { ok: true, soDong: rows.length };
}

/**
 * Cấn trừ tiền trả trước vào các đơn nợ của CÙNG khách hàng (chỉ gọi sau khi người dùng đã đồng ý).
 * Kiểm tra lại số dư trả trước & số nợ còn lại MỚI NHẤT trên máy chủ để không trừ trùng giữa các máy.
 * @param {string} tenKH
 * @param {Array<{don:Object, soTien:number}>} dsPhanBo  don = đơn nợ trong sổ công nợ (id, maHD, maDot, maKH, tenKH, soTienNo, daThu)
 */
async function canTruTraTruoc(tenKH, dsPhanBo, ghiChuThem) {
  if (typeof sb === "undefined") return { ok: false, loi: "Chưa kết nối máy chủ" };
  const phanBo = (dsPhanBo || []).filter(p => p && p.don && soTienTT(p.soTien) > 0);
  const tong = phanBo.reduce((s, p) => s + soTienTT(p.soTien), 0);
  if (!phanBo.length) return { ok: false, loi: "Chưa chọn số tiền cấn trừ." };

  const so = await taiSoTraTruoc();
  if (!so.ok) return { ok: false, thieuBang: so.thieuBang, loi: so.loi };
  const g = so.theoKhach.get(khoaKhachTT(tenKH));
  const soDu = g ? g.soDu : 0;
  if (soDu < tong - 0.5) {
    return { ok: false, loi: `Số dư trả trước của khách hiện chỉ còn ${Math.round(soDu).toLocaleString("vi-VN")} đ (có thể vừa được dùng / hoàn ở máy khác).` };
  }

  // Số nợ còn lại mới nhất của từng đơn (tránh trừ vượt khi đơn vừa được thu ở nơi khác)
  try {
    const { data, error } = await sb.from("thu_no").select("id_don_no, so_tien").in("id_don_no", phanBo.map(p => p.don.id));
    if (error) return { ok: false, loi: "Không kiểm tra được số nợ mới nhất: " + (error.message || "") };
    const daThuCloud = {};
    (data || []).forEach(r => { daThuCloud[r.id_don_no] = (daThuCloud[r.id_don_no] || 0) + soTienTT(r.so_tien); });
    for (const p of phanBo) {
      const conLai = Math.max(0, soTienTT(p.don.soTienNo) - Math.max(soTienTT(p.don.daThu), daThuCloud[p.don.id] || 0));
      if (soTienTT(p.soTien) > conLai + 0.5) {
        return { ok: false, loi: `Đơn ${p.don.maHD} hiện chỉ còn nợ ${Math.round(conLai).toLocaleString("vi-VN")} đ (có thể vừa được thu). Vui lòng tải lại và chọn lại.` };
      }
    }
  } catch (e) {
    return { ok: false, loi: e.message || String(e) };
  }

  const ngay = ngayHomNayTT();
  const rows = phanBo.map(p => ({
    id_don_no: p.don.id, ma_hd: p.don.maHD || "", ma_dot: p.don.maDot || "", ma_kh: p.don.maKH || (g && g.maKH) || "",
    ten_kh: p.don.tenKH || tenKH, so_tien: Math.round(soTienTT(p.soTien)), hinh_thuc: HINH_THUC_CAN_TRU_TT, tai_khoan_nhan: "",
    nguoi_thu: nguoiThucHienTT(), ghi_chu: GHI_CHU_CAN_TRU_TT + (ghiChuThem ? " — " + ghiChuThem : ""), ngay_thu: ngay
  }));
  try {
    const { error } = await sb.from("thu_no").insert(rows);
    if (error) return { ok: false, loi: error.message || "" };
  } catch (e) {
    return { ok: false, loi: e.message || String(e) };
  }
  if (typeof ghiNhatKy === "function") {
    ghiNhatKy("tra_truoc", {
      doi_tuong: tenKH,
      noi_dung: `Cấn trừ ${Math.round(tong).toLocaleString("vi-VN")} đ tiền trả trước của khách ${tenKH} vào: ` +
        rows.map(r => `${r.ma_hd} (${r.so_tien.toLocaleString("vi-VN")})`).join(", "),
      chi_tiet: { dong: rows }
    });
  }
  return { ok: true, tong: tong, soDuSau: soDu - tong };
}

/** Hoàn tiền trả trước cho khách (kiểm tra số dư mới nhất trước khi ghi) */
async function hoanTienTraTruoc(thongTin) {
  const soTien = Math.round(soTienTT(thongTin.soTien));
  if (soTien <= 0) return { ok: false, loi: "Số tiền hoàn phải lớn hơn 0." };
  const so = await taiSoTraTruoc();
  if (!so.ok) return { ok: false, thieuBang: so.thieuBang, loi: so.loi };
  const g = so.theoKhach.get(khoaKhachTT(thongTin.tenKH));
  const soDu = g ? g.soDu : 0;
  if (soDu < soTien - 0.5) {
    return { ok: false, loi: `Số dư trả trước của khách hiện chỉ còn ${Math.round(soDu).toLocaleString("vi-VN")} đ — không hoàn vượt số dư được.` };
  }
  return ghiSoTraTruoc([{
    ngay: thongTin.ngay || ngayHomNayTT(), ma_kh: thongTin.maKH || (g && g.maKH) || "", ten_kh: String(thongTin.tenKH).trim(),
    loai: "hoan", so_tien: soTien, hinh_thuc: thongTin.hinhThuc || "Tiền mặt", tai_khoan_nhan: thongTin.taiKhoan || "",
    nguon: "hoan_tien", ghi_chu: thongTin.ghiChu || ""
  }]);
}

/** Tách tiền khách đưa thành phần trừ nợ và phần dư — ưu tiên trừ nợ bằng tiền mặt trước, rồi chuyển khoản */
function tachPhanDuTT(tienMat, chuyenKhoan, soNoConLai) {
  const tmNo = Math.min(tienMat, Math.max(0, soNoConLai));
  const ckNo = Math.min(chuyenKhoan, Math.max(0, soNoConLai - tmNo));
  return { tmNo: tmNo, ckNo: ckNo, tmDu: tienMat - tmNo, ckDu: chuyenKhoan - ckNo };
}
