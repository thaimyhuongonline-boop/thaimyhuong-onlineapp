/* ====================================================================
 * PHIẾU THU AMIS (TIỀN MẶT & TIỀN GỬI) — BƯỚC 3
 * --------------------------------------------------------------------
 * Lập 2 file nhập khẩu phiếu thu vào AMIS Accounting đúng mẫu
 * "phieu_thu_tien_mat_full.xls" và "phieu_thu_tien_gui_full.xls", điền theo hướng dẫn
 * "Cách điền phiếu thu.docx":
 *   • Ngày hạch toán = Ngày chứng từ = ngày thực tế thu tiền (dd/mm/yyyy)
 *   • Số chứng từ PT00001, PT00002… chạy theo thứ tự, KHÔNG trùng (khoản đã xuất giữ nguyên số)
 *   • Mã / Tên đối tượng = mã / tên khách hàng (như Bảng quyết toán Bước 2)
 *   • Diễn giải (hạch toán) = "Thu tiền của <tên khách>"
 *   • TK Nợ: tiền mặt 1111; tiền gửi 1121 chi tiết theo tài khoản nhận tiền (11211 … 11215)
 *   • TK Có 1311 (thu nợ khách hàng); Số tiền chỉ nhập số; Mã đối tượng (hạch toán) = mã khách
 * Nguồn dữ liệu (mỗi khoản = 1 phiếu thu):
 *   1. Tiền thu theo hoá đơn ở Bước 2 của chuyến / ngày đang chọn phía trên (chuyến đã quyết toán):
 *      phần tiền mặt → phiếu thu tiền mặt, phần chuyển khoản → phiếu thu tiền gửi. Phần khách trả
 *      DƯ không tính ở đây (đã nằm ở sổ tiền khách trả trước — nguồn 3).
 *   2. Thu nợ khách hàng (khu vực "Cấn trừ công nợ" bên trên) bằng tiền mặt / chuyển khoản.
 *   3. Tiền khách trả trước / trả dư NHẬN vào (hoàn tiền cho khách là phiếu chi — không lấy).
 * Thứ tự nhập MISA: file bán hàng của Bước 3 (MỌI hoá đơn Nợ 1311 – Có 5111) → phiếu thu tiền mặt →
 * phiếu thu tiền gửi. Khách lẻ (không có mã) dùng mã "KHÁCH LẺ".
 * File xuất có thêm cột "Ngày gạch nợ" TRƯỚC cột A (ngày ghi nhận gạch nợ trên app — khách chuyển khoản
 * trước, ngày n+x mới phát hiện) để kế toán đối chiếu; cột này không dán vào mẫu AMIS (dán từ cột B).
 * ==================================================================== */

// Tài khoản MISA của từng tài khoản ngân hàng — theo "Cách điền phiếu thu.docx"
const TK_NGAN_HANG_PHIEU_THU = [
  { soTK: "0041000266096", tk: "11211", tenNH: "Vietcombank", ten: "VCB – 0041000266096" },
  { soTK: "3704376789", tk: "11212", tenNH: "Vietcombank", ten: "VCB – 3704376789" },
  { soTK: "20166789", tk: "11213", tenNH: "Techcombank", ten: "TCB – 20166789" },
  { soTK: "040089722561", tk: "11214", tenNH: "SCB", ten: "SCB – 040089722561" },
  { soTK: "2016056789", tk: "11215", tenNH: "MB Bank", ten: "MB – 2016056789" }
];
const TK_TIEN_MAT_PHIEU_THU = "1111";
const TK_TIEN_GUI_CHUNG_PHIEU_THU = "1121";
const TK_CO_PHIEU_THU = "1311";
// Bán hàng: MỌI hoá đơn hạch toán công nợ Nợ 1311 – Có 5111; tiền khách trả nhập sau bằng phiếu thu
const TK_CONG_NO_BAN_HANG = "1311";
// Khách lẻ (không có mã khách hàng trên KiotViet) → mã đối tượng trong MISA
const MA_KHACH_LE_MISA = "KHÁCH LẺ";
const LY_DO_PHIEU_THU = "Thu tiền khách hàng (không theo hóa đơn)";
// Cột thêm vào TRƯỚC cột A của 2 file phiếu thu (chỉ để ghi chú, không thuộc mẫu AMIS)
const COT_NGAY_GACH_NO_PT = "Ngày gạch nợ";
const KHOA_LS_SO_PHIEU_THU = "tmh_so_phieu_thu_misa";

// Tiêu đề cột đúng từng chữ theo 2 file mẫu AMIS (dòng 8)
const TIEU_DE_PT_TIEN_MAT = ["Ngày hạch toán (*)", "Ngày chứng từ (*)", "Số chứng từ (*)", "Mã đối tượng ", "Tên đối tượng", "Người nộp", "Địa chỉ",
  "Lý do nộp", "Diễn giải lý do nộp", "Mã nhân viên thu", "Số lượng chứng từ kèm theo", "Diễn giải (hạch toán)", "TK Nợ (*)", "TK Có (*)", "Số tiền",
  "Mã đối tượng (hạch toán)", "Số TK ngân hàng", "Tên ngân hàng", "Số khế ước đi vay", "Số khế ước cho vay", "Mã khoản mục chi phí", "Mã đơn vị",
  "Mã đối tượng THCP", "Mã công trình", "Số đơn đặt hàng", "Số đơn mua hàng", "Số hợp đồng mua", "Số hợp đồng bán", "Mã thống kê", "CP không hợp lý"];
const TIEU_DE_PT_TIEN_GUI = ["Ngày hạch toán (*)", "Ngày chứng từ (*)", "Số chứng từ (*)", "Mã đối tượng ", "Tên đối tượng", "Địa chỉ", "Nộp vào TK",
  "Mở tại ngân hàng", "Lý do thu", "Diễn giải lý do thu", "Mã nhân viên thu", "Diễn giải (hạch toán)", "TK Nợ (*)", "TK Có (*)", "Số tiền",
  "Mã đối tượng (hạch toán)", "Số khế ước đi vay", "Số khế ước cho vay", "Mã khoản mục chi phí", "Mã đơn vị", "Mã đối tượng THCP", "Mã công trình",
  "Số đơn đặt hàng", "Số đơn mua hàng", "Số hợp đồng mua", "Số hợp đồng bán", "Mã thống kê", "CP không hợp lý"];

let danhSachPhieuThuMisa = [];   // các khoản phiếu thu đang hiện (xem trước)
let danhMucNHPhieuThu = [];      // danh mục tài khoản ngân hàng (tai_khoan_ngan_hang)
let ghiChuPhieuThuMisa = [];     // ghi chú (chuyến chưa quyết toán…)

function chuSoPT(s) { return String(s || "").replace(/\D/g, ""); }

function ngayVNPhieuThu(v) {
  const s = String(v || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[3].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[1]}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  return "";
}

// Thời điểm ghi trên máy chủ (ISO, giờ UTC) → ngày Việt Nam dd/mm/yyyy (giờ +7); không đọc được → ""
function ngayVNTuThoiDiemPT(v) {
  const t = Date.parse(String(v || ""));
  if (isNaN(t)) return "";
  return ngayVNPhieuThu(new Date(t + 7 * 3600 * 1000).toISOString().slice(0, 10));
}

function khoaNgayPT(ngayVN) {
  const m = String(ngayVN || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}${m[2]}${m[1]}` : "99999999";
}

async function napDanhMucNHPhieuThu() {
  try { danhMucNHPhieuThu = JSON.parse(localStorage.getItem("tmh_danh_muc_tai_khoan_ngan_hang") || "[]") || []; } catch (e) { danhMucNHPhieuThu = []; }
  if (typeof sb !== "undefined") {
    try {
      const { data, error } = await sb.from("tai_khoan_ngan_hang").select("*");
      if (!error && Array.isArray(data) && data.length) danhMucNHPhieuThu = data;
    } catch (e) {}
  }
}

/**
 * Tài khoản MISA của tài khoản nhận tiền (vd "TCB - 20166789", "VCB - 0041000266096 (Thái Mỹ Hương)").
 * Ưu tiên bảng theo hướng dẫn; tài khoản khác lấy tk_misa trong Danh mục (nếu không trùng mã với
 * tài khoản khác trong hướng dẫn); không xác định được → 1121 + cảnh báo.
 */
function timTKNganHangPT(taiKhoanNhan) {
  const chuoi = String(taiKhoanNhan || "").trim();
  const cacSo = (chuoi.match(/\d{6,}/g) || []).map(chuSoPT);
  const khopSo = so => cacSo.some(x => x === so || x.endsWith(so) || so.endsWith(x));
  const hd = TK_NGAN_HANG_PHIEU_THU.find(h => khopSo(h.soTK));
  if (hd) return { tk: hd.tk, soTK: hd.soTK, tenNH: hd.tenNH, canhBao: "" };
  const dm = danhMucNHPhieuThu.find(d => (d.ten_tk && String(d.ten_tk).trim() === chuoi) || (chuSoPT(d.so_tk).length >= 6 && khopSo(chuSoPT(d.so_tk))));
  if (dm) {
    const soDM = chuSoPT(dm.so_tk) || cacSo[0] || "";
    const tkDM = String(dm.tk_misa || "").trim();
    const trung = tkDM && TK_NGAN_HANG_PHIEU_THU.find(h => h.tk === tkDM && h.soTK !== soDM);
    if (tkDM && !trung) return { tk: tkDM, soTK: soDM, tenNH: dm.ten_ngan_hang || "", canhBao: "" };
    return {
      tk: TK_TIEN_GUI_CHUNG_PHIEU_THU, soTK: soDM, tenNH: dm.ten_ngan_hang || "",
      canhBao: trung ? `TK MISA ${tkDM} của "${chuoi}" trong Danh mục trùng với ${trung.ten} (theo hướng dẫn) — đang để 1121, cần kiểm tra`
        : `Tài khoản "${chuoi}" chưa có TK MISA trong Danh mục — đang để 1121`
    };
  }
  return { tk: TK_TIEN_GUI_CHUNG_PHIEU_THU, soTK: cacSo[0] || "", tenNH: "", canhBao: chuoi ? `Chưa xác định TK MISA của tài khoản "${chuoi}" — đang để 1121` : "Chưa ghi tài khoản nhận tiền — đang để 1121" };
}

function docSoPhieuThuMisa() {
  try {
    const st = JSON.parse(localStorage.getItem(KHOA_LS_SO_PHIEU_THU) || "null");
    if (st && typeof st === "object") return { soTiepTheo: parseInt(st.soTiepTheo, 10) || 1, theoKhoa: st.theoKhoa || {} };
  } catch (e) {}
  return { soTiepTheo: 1, theoKhoa: {} };
}

function ghiSoPhieuThuMisa(st) {
  try { localStorage.setItem(KHOA_LS_SO_PHIEU_THU, JSON.stringify(st)); } catch (e) {}
}

function dinhDangSoPT(n) { return "PT" + String(n).padStart(5, "0"); }

// Tách phần tiền trừ vào hoá đơn / phần khách trả dư (dùng chung khach_tra_truoc.js nếu có)
function tachTienHoaDonPT(tienMat, chuyenKhoan, phaiTra) {
  if (typeof tachPhanDuTT === "function") return tachPhanDuTT(tienMat, chuyenKhoan, phaiTra);
  const tmNo = Math.min(tienMat, Math.max(0, phaiTra));
  const ckNo = Math.min(chuyenKhoan, Math.max(0, phaiTra - tmNo));
  return { tmNo, ckNo, tmDu: tienMat - tmNo, ckDu: chuyenKhoan - ckNo };
}

/**
 * Hình thức tiền của một khoản thu (thu_no / khach_tra_truoc.hinh_thuc) → 'ck' (chuyển khoản, TK 1121x) hay 'tm' (tiền mặt, TK 1111).
 * Chấp nhận "Chuyển khoản", "chuyen khoan", "CK"… (không phân biệt hoa thường / dấu); các giá trị khác → tiền mặt như trước đây.
 */
function phanLoaiHinhThucTien(hinhThuc) {
  const s = String(hinhThuc || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  return (/chuyen\s*khoan/.test(s) || s === "ck") ? "ck" : "tm";
}

/**
 * Dựng danh sách các khoản phiếu thu từ dữ liệu thô (hàm thuần — không đọc giao diện, dùng chung cho thẻ tóm tắt,
 * bảng xem trước và file Excel nên 3 nơi luôn cùng một nguồn):
 *   dsDot   — các chuyến đang chọn (đã quyết toán mới lập phiếu thu theo hoá đơn)
 *   dsThuNo — danhSachThuNoMisa (thu nợ + khách trả trước / trả dư)
 *   bat     — { hoaDon, thuNo, traTruoc }: nguồn nào đang được tích chọn
 *   st      — { theoKhoa } số chứng từ đã cấp trước đó
 */
function dungDanhSachPhieuThu(dsDot, dsThuNo, bat, st) {
  const theoKhoa = new Map();
  const ghiChu = [];
  const them = r => { if (!theoKhoa.has(r.khoa) && r.soTien > 0.5) theoKhoa.set(r.khoa, r); };
  bat = bat || {};
  dsDot = Array.isArray(dsDot) ? dsDot : [];
  dsThuNo = Array.isArray(dsThuNo) ? dsThuNo : [];

  // 1. Tiền thu theo hoá đơn ở Bước 2 (chuyến / ngày đang chọn phía trên)
  if (bat.hoaDon) {
    const chuaQT = [];
    const daXetHD = new Set();
    let traDu = 0, soHDDu = 0;   // phần khách trả DƯ so với hoá đơn (không vào phiếu thu theo hoá đơn)
    // Chuyến đã quyết toán xét trước (hoá đơn giao lại có ở 2 chuyến → lấy chuyến có số liệu quyết toán)
    dsDot.slice().sort((a, b) => Number(!!b.daQuyetToan) - Number(!!a.daQuyetToan)).forEach(dot => {
      if (!dot.daQuyetToan) { chuaQT.push(dot.xe || dot.maDot); return; }
      const ngay = ngayVNPhieuThu(dot.ngayGiao || dot.ngayRaw);
      (dot.danhSachChiTiet || []).forEach(h => {
        const maHD = String(h.maHD || h.ma_hd || "").trim().toUpperCase();
        if (!maHD) return;
        const tienHD = soTienAnToan(h.tienHD || h.thanhTien);
        const phaiTra = Math.max(0, tienHD - soTienAnToan(h.traVe));
        const tach = tachTienHoaDonPT(soTienAnToan(h.tienMat), soTienAnToan(h.chuyenKhoan), phaiTra);
        if (!daXetHD.has(maHD)) { daXetHD.add(maHD); const du = Math.round(tach.tmDu + tach.ckDu); if (du > 0) { traDu += du; soHDDu++; } }
        const goc = {
          ngay: ngay, maKH: String(h.maKH || "").trim().toUpperCase(), tenKH: String(h.tenKH || "Khách Lẻ").trim(),
          nguon: "hoa_don", tenNguon: "Thu tiền hoá đơn (Bước 2)", thamChieu: `HĐ ${maHD} — xe ${dot.xe || ""}`,
          // Tiền thu theo hoá đơn khi giao hàng: gạch luôn trong chuyến → ngày gạch nợ = ngày giao
          ngayGachNo: ngay
        };
        if (tach.tmNo > 0.5) them(Object.assign({}, goc, { khoa: `HD|${maHD}|TM`, loai: "tm", soTien: Math.round(tach.tmNo) }));
        if (tach.ckNo > 0.5) them(Object.assign({}, goc, { khoa: `HD|${maHD}|CK`, loai: "ck", soTien: Math.round(tach.ckNo), nh: timTKNganHangPT(h.taiKhoanNhan) }));
      });
    });
    if (traDu > 0) ghiChu.push(`ℹ️ ${soHDDu} hoá đơn khách trả DƯ tổng ${Math.round(traDu).toLocaleString("vi-VN")} đ so với tiền hoá đơn — phần dư không nằm ở nguồn "Tiền thu theo hoá đơn" mà ở nguồn "Khách trả trước / trả dư" (sổ tiền khách trả trước).`);
    if (chuaQT.length) ghiChu.push(`⏳ ${chuaQT.length} chuyến CHƯA quyết toán ở Bước 2 nên chưa lập phiếu thu: ${chuaQT.join(", ")}`);
    if (!dsDot.length) ghiChu.push("ℹ️ Chưa chọn chuyến xe / ngày ở phía trên nên chưa có phiếu thu theo hoá đơn.");
  }

  // 2 & 3. Thu nợ khách hàng + tiền khách trả trước NHẬN vào (khu vực Cấn trừ công nợ) — chỉ khoản tiền VÀO
  dsThuNo.forEach(r => {
    const laTraTruoc = r.nguon === "tra_truoc";
    if (laTraTruoc ? !bat.traTruoc : !bat.thuNo) return;
    if (r.chiRa || laKhoanThuNoDaHuy(r) || !(soTienAnToan(r.soTien) > 0) || (r.tkNo !== "1111" && r.tkNo !== "1121")) return;
    them({
      khoa: (laTraTruoc ? "TT|" : "TN|") + r.id,
      loai: r.tkNo === "1121" ? "ck" : "tm",
      ngay: ngayVNPhieuThu(r.ngayThu),
      maKH: String(r.maKH || "").trim().toUpperCase(), tenKH: String(r.tenKH || "Khách Lẻ").trim(),
      soTien: Math.round(soTienAnToan(r.soTien)),
      nguon: laTraTruoc ? "tra_truoc" : "thu_no",
      tenNguon: laTraTruoc ? "Khách trả trước / trả dư" : "Thu nợ khách hàng",
      thamChieu: laTraTruoc ? `Trả trước ${r.soCT || ""}` : `HĐ ${r.soCT || ""}`,
      nh: r.tkNo === "1121" ? timTKNganHangPT(r.tkNganHang) : null,
      // Ngày gạch nợ: ngày thực tế ghi nhận trên app (khách chuyển khoản trước nhưng ngày n+x mới phát hiện, gạch nợ)
      ngayGachNo: ngayVNTuThoiDiemPT(r.taoLuc) || ngayVNPhieuThu(r.ngayThu)
    });
  });

  const ds = Array.from(theoKhoa.values()).map(r => {
    // Khách lẻ (không có mã, hoặc mã cũ KH_LE) → mã "KHÁCH LẺ" trong MISA
    const maKH = r.maKH && r.maKH !== "KH_LE" ? r.maKH : MA_KHACH_LE_MISA;
    const canhBao = [];
    if (!r.ngay) canhBao.push("Không rõ ngày thu");
    if (r.loai === "ck" && r.nh && r.nh.canhBao) canhBao.push(r.nh.canhBao);
    return Object.assign(r, {
      maKH: maKH,
      tkNo: r.loai === "tm" ? TK_TIEN_MAT_PHIEU_THU : (r.nh ? r.nh.tk : TK_TIEN_GUI_CHUNG_PHIEU_THU),
      tkCo: TK_CO_PHIEU_THU,
      soCTDaCap: ((st && st.theoKhoa) || {})[r.khoa] || "",
      canhBao: canhBao
    });
  }).sort((a, b) => khoaNgayPT(a.ngay).localeCompare(khoaNgayPT(b.ngay)) || (a.loai === b.loai ? 0 : (a.loai === "tm" ? -1 : 1)) || a.khoa.localeCompare(b.khoa));

  return { ds: ds, ghiChu: ghiChu };
}

/** Dựng danh sách các khoản phiếu thu từ dữ liệu Bước 3 đang hiện */
function taoDanhSachPhieuThuMisa() {
  const layChk = id => { const el = document.getElementById(id); return !el || el.checked; };
  const dsDot = (typeof cheDoNgayMisa !== "undefined" && cheDoNgayMisa) ? cheDoNgayMisa.dsDot : ((typeof dotHienTai !== "undefined" && dotHienTai) ? [dotHienTai] : []);
  const dsThuNo = (typeof danhSachThuNoMisa !== "undefined" && Array.isArray(danhSachThuNoMisa)) ? danhSachThuNoMisa : [];
  const kq = dungDanhSachPhieuThu(dsDot, dsThuNo,
    { hoaDon: layChk("ptNguonHoaDon"), thuNo: layChk("ptNguonThuNo"), traTruoc: layChk("ptNguonTraTruoc") }, docSoPhieuThuMisa());
  danhSachPhieuThuMisa = kq.ds;
  ghiChuPhieuThuMisa = kq.ghiChu;
  return kq.ds;
}

/**
 * Lọc các khoản cần xuất / cần hiện (hàm thuần): đúng loại tài khoản (tm → chỉ TK 1111; ck → chỉ TK 1121x),
 * bỏ khoản đã xuất phiếu thu nếu boQuaDaXuat. Thẻ tóm tắt, bảng xem trước và file Excel đều lấy qua hàm này.
 */
function locPhieuThuCanXuat(ds, loai, boQuaDaXuat) {
  return (ds || []).filter(r => {
    if (!(r.soTien > 0.5)) return false;
    if (r.loai === "tm" ? r.tkNo !== TK_TIEN_MAT_PHIEU_THU : String(r.tkNo || "").indexOf(TK_TIEN_GUI_CHUNG_PHIEU_THU) !== 0) return false;
    if (loai && r.loai !== loai) return false;
    return !(boQuaDaXuat && r.soCTDaCap);
  });
}

/* ====================================================================
 * TỔNG HỢP KHU VỰC "CẤN TRỪ CÔNG NỢ" (Thu nợ tiền mặt TK 1111 / chuyển khoản TK 1121) — hàm thuần, không đụng giao diện
 * Mỗi khoản (danhSachThuNoMisa) có: id, nguon ('thu_no' | 'tra_truoc'), soTien, tkNo, tkCo, chiRa (hoàn tiền = tiền đi ra).
 * Thẻ "Thu nợ tiền mặt / chuyển khoản / Tổng", chân bảng và các dòng của bảng đều lấy từ cùng 1 danh sách hợp lệ.
 * ==================================================================== */

/** Số tiền an toàn: null / undefined / "" / chữ / NaN / Infinity → 0; chấp nhận "1.234.567", "1,234,567", "1234.5", "-500" */
function soTienAnToan(v) {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;
  let s = String(v).trim().replace(/\s|đ|₫|vnđ|vnd/gi, "");
  if (!s) return 0;
  if (/^[-+]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");       // 1.234.567,5 (kiểu VN)
  else if (/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");                      // 1,234,567.5
  else if (/^[-+]?\d+,\d+$/.test(s)) s = s.replace(",", ".");                                       // 1234,5
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return 0;                                                 // còn chữ → không phải số
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

/** Phiếu đã hủy / không hợp lệ (các cột trạng thái nếu có) → bỏ qua */
function laKhoanThuNoDaHuy(r) {
  if (!r) return true;
  if (r.da_huy === true || r.daHuy === true || r.huy === true) return true;
  const tt = String(r.trang_thai || r.trangThai || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  return /^(huy|da huy|cancel|canceled|cancelled|khong hop le|invalid|void|nhap|ban nhap|draft)/.test(tt);
}

/**
 * Lọc các khoản hợp lệ để tính tổng + hiển thị: bỏ phiếu hủy, số tiền ≤ 0 / không phải số, TK tiền không phải 1111 / 1121,
 * và bỏ khoản TRÙNG (cùng nguon + id) để không cộng 2 lần khi dữ liệu nạp chồng. Trả về bản sao có soTien đã chuẩn hoá.
 */
function locKhoanThuNoHopLe(ds) {
  const daCo = new Set();
  const kq = [];
  (Array.isArray(ds) ? ds : []).forEach(r => {
    if (!r || laKhoanThuNoDaHuy(r)) return;
    const soTien = soTienAnToan(r.soTien);   // số âm / 0 / không phải số → bỏ (hoàn tiền đã có cờ chiRa, soTien luôn dương)
    if (!(soTien > 0)) return;
    const tkTien = r.chiRa ? r.tkCo : r.tkNo;
    if (tkTien !== TK_TIEN_MAT_PHIEU_THU && tkTien !== TK_TIEN_GUI_CHUNG_PHIEU_THU) return;
    if (r.id !== undefined && r.id !== null && r.id !== "") {
      const khoa = (r.nguon || "") + "|" + r.id;
      if (daCo.has(khoa)) return;
      daCo.add(khoa);
    }
    kq.push(Object.assign({}, r, { soTien: soTien, tkTien: tkTien, soTienCoDau: r.chiRa ? -soTien : soTien }));
  });
  return kq;
}

/** Tổng thu nợ tiền mặt (1111) / chuyển khoản (1121): khoản tiền VÀO cộng, hoàn tiền (chiRa) trừ */
function tinhTongThuNoMisa(ds) {
  const hopLe = locKhoanThuNoHopLe(ds);
  let tm = 0, ck = 0;
  hopLe.forEach(r => { if (r.tkTien === TK_TIEN_MAT_PHIEU_THU) tm += r.soTienCoDau; else ck += r.soTienCoDau; });
  return { tm: tm, ck: ck, tong: tm + ck, soDong: hopLe.length, soBoQua: (Array.isArray(ds) ? ds.length : 0) - hopLe.length, dsHopLe: hopLe };
}

/** Tổng hợp số phiếu / số tiền theo loại (hàm thuần) — nguồn duy nhất cho các thẻ "Phiếu thu tiền mặt / tiền gửi" */
function tinhTongPhieuThu(ds) {
  const kq = { tm: { so: 0, tong: 0 }, ck: { so: 0, tong: 0 }, tong: 0, soPhieu: 0, theoNguon: { hoa_don: 0, thu_no: 0, tra_truoc: 0 } };
  (ds || []).forEach(r => {
    const o = r.loai === "ck" ? kq.ck : kq.tm;
    const st = soTienAnToan(r.soTien);
    o.so++; o.tong += st; kq.tong += st; kq.soPhieu++;
    if (kq.theoNguon[r.nguon] !== undefined) kq.theoNguon[r.nguon] += st;
  });
  return kq;
}

function layPhieuThuCanXuat(loai) {
  const boQuaDaXuat = !!(document.getElementById("ptBoQuaDaXuat") || {}).checked;
  return locPhieuThuCanXuat(danhSachPhieuThuMisa, loai, boQuaDaXuat);
}

/** Số chứng từ sẽ cấp cho các khoản chưa có số (xem trước — chưa lưu) */
function duKienSoPhieuThu(dsXuat, luu) {
  const st = docSoPhieuThuMisa();
  const oSo = document.getElementById("ptSoTiepTheo");
  let so = Math.max(1, parseInt(oSo && oSo.value, 10) || st.soTiepTheo || 1);
  const daDung = new Set(Object.values(st.theoKhoa));
  const kq = new Map();
  dsXuat.forEach(r => {
    if (st.theoKhoa[r.khoa]) { kq.set(r.khoa, st.theoKhoa[r.khoa]); return; }
    let s = dinhDangSoPT(so++);
    while (daDung.has(s)) s = dinhDangSoPT(so++);
    daDung.add(s);
    kq.set(r.khoa, s);
    if (luu) st.theoKhoa[r.khoa] = s;
  });
  if (luu) {
    st.soTiepTheo = so;
    ghiSoPhieuThuMisa(st);
  }
  return kq;
}

async function veBangPhieuThuMisa() {
  const tbody = document.getElementById("tbodyPhieuThuMisa");
  if (!tbody) return;
  if (!danhMucNHPhieuThu.length) await napDanhMucNHPhieuThu();
  taoDanhSachPhieuThuMisa();
  const st = docSoPhieuThuMisa();
  const oSo = document.getElementById("ptSoTiepTheo");
  if (oSo && !oSo.dataset.daSua) oSo.value = st.soTiepTheo;

  const dsHien = layPhieuThuCanXuat("");
  // Thẻ tóm tắt = đúng tổng của danh sách đang hiện = đúng dữ liệu file Excel sẽ xuất (cùng 1 hàm lọc + 1 hàm tính tổng)
  const tongHien = tinhTongPhieuThu(dsHien);
  const setHien = new Set(dsHien);
  const daAnTatCa = danhSachPhieuThuMisa.length - dsHien.length;
  // Khoản đã xuất phiếu thu đang bị ẩn (thẻ chỉ tính phần CHƯA xuất nên có thể = 0 đ dù vẫn còn khoản đã xuất)
  const tongAn = tinhTongPhieuThu(locPhieuThuCanXuat(danhSachPhieuThuMisa, "", false).filter(r => r.soCTDaCap && !setHien.has(r)));
  const dat = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const phanAn = o => o.so ? ` · ẩn ${o.so} phiếu đã xuất (${formatTien(o.tong)} đ)` : "";
  dat("kpiPTTienMat", formatTien(tongHien.tm.tong) + " đ");
  dat("kpiPTTienMatSub", `${tongHien.tm.so} phiếu thu · Nợ 1111 / Có 1311${phanAn(tongAn.tm)}`);
  dat("kpiPTTienGui", formatTien(tongHien.ck.tong) + " đ");
  dat("kpiPTTienGuiSub", `${tongHien.ck.so} phiếu thu · Nợ 1121x / Có 1311${phanAn(tongAn.ck)}`);
  const soCanhBao = dsHien.filter(r => r.canhBao.length).length;
  dat("kpiPTCanhBao", soCanhBao ? `${soCanhBao} khoản` : "Không có");

  const elGhiChu = document.getElementById("ghiChuPhieuThuMisa");
  if (elGhiChu) {
    const daAn = danhSachPhieuThuMisa.length - dsHien.length;
    const dong = ghiChuPhieuThuMisa.slice();
    if (dsHien.length) dong.push(`ℹ️ Đối chiếu: ${formatTien(tongHien.tong)} đ = hoá đơn ${formatTien(tongHien.theoNguon.hoa_don)} + thu nợ ${formatTien(tongHien.theoNguon.thu_no)} + trả trước / trả dư ${formatTien(tongHien.theoNguon.tra_truoc)} (khu vực "Cấn trừ công nợ" phía trên chỉ gồm thu nợ + trả trước và đã trừ các khoản hoàn tiền).`);
    if (daAn) dong.push(`✅ Ẩn ${daAn} khoản đã xuất phiếu thu trước đó (bỏ tích "Bỏ qua khoản đã xuất" để xuất lại đúng số cũ).`);
    elGhiChu.innerHTML = dong.map(x => `<div>${escapeHtml(x)}</div>`).join("");
    elGhiChu.style.display = dong.length ? "" : "none";
  }

  if (!dsHien.length) {
    // Giải thích vì sao trống: khoản đã xuất phiếu thu trước đó bị ẩn (mặc định) → có nút hiện lại
    const nutHienDaXuat = daAnTatCa
      ? ` <b>${daAnTatCa} khoản đã xuất phiếu thu trước đó đang bị ẩn</b> — <button type="button" class="btn btn-outline" style="height:26px; padding:0 8px; font-size:11.5px;" onclick="hienCaKhoanDaXuatPhieuThu()">Hiện cả khoản đã xuất</button>`
      : "";
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:26px; color:var(--text-muted);">Không có khoản thu nào để lập phiếu thu (theo chuyến / ngày đang chọn ở Phần 1 và bộ lọc thu nợ ở Phần 2).${nutHienDaXuat}</td></tr>`;
    dat("footPTTien", "0");
    doiChieuTheVoiBangPhieuThu();
    return;
  }
  tbody.innerHTML = dsHien.map((r, i) => `
    <tr data-loai="${r.loai}" data-so-tien="${r.soTien}">
      <td style="text-align:center;">${i + 1}</td>
      <td style="text-align:center;">${r.loai === "tm" ? '<span class="badge-status badge-done" style="font-size:10.5px;">💵 Tiền mặt</span>' : '<span class="badge-status" style="font-size:10.5px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">🏦 Tiền gửi</span>'}</td>
      <td>${escapeHtml(r.ngay || "--")}</td>
      <td style="font-family:monospace; font-weight:700;">${r.soCTDaCap ? escapeHtml(r.soCTDaCap) : '<span style="font-size:10.5px; color:#b45309; font-family:inherit;">cấp khi xuất</span>'}</td>
      <td style="font-family:monospace;">${escapeHtml(r.maKH)}</td>
      <td style="font-weight:700;">${escapeHtml(r.tenKH)}</td>
      <td style="font-size:11.5px;">${escapeHtml(r.tenNguon)}<div style="color:var(--text-muted);">${escapeHtml(r.thamChieu || "")}</div></td>
      <td style="text-align:center; font-weight:800;">${escapeHtml(r.tkNo)}</td>
      <td style="text-align:center; font-weight:800;">${escapeHtml(r.tkCo)}</td>
      <td style="text-align:right; font-weight:800; color:#15803d;">${formatTien(r.soTien)}</td>
      <td style="font-size:11.5px;">${r.loai === "ck" && r.nh ? escapeHtml([r.nh.tenNH, r.nh.soTK].filter(Boolean).join(" – ")) : "--"}</td>
      <td style="font-size:11px;">${r.canhBao.length ? `<span style="color:#b91c1c; font-weight:700;">⚠️ ${escapeHtml(r.canhBao.join("; "))}</span>` : (r.soCTDaCap ? '<span style="color:#15803d; font-weight:700;">✅ Đã xuất</span>' : '<span style="color:#15803d;">Hợp lệ</span>')}</td>
    </tr>`).join("");
  dat("footPTTien", formatTien(tongHien.tong));
  doiChieuTheVoiBangPhieuThu();   // thẻ phải = bảng (số phiếu + tổng tiền); lệch thì báo đỏ + in bảng chẩn đoán
  if (/[?&]debugPhieuThu=1/.test(location.search)) chanDoanPhieuThuMisa();
}

/**
 * Đối chiếu NGAY TRÊN GIAO DIỆN: số phiếu + tổng tiền ở 2 thẻ "Phiếu thu tiền mặt / tiền gửi" phải bằng số dòng +
 * tổng cột "Số tiền" của "Bảng Phiếu Thu Chuẩn AMIS (xem trước)" (đọc lại từ chính các ô đã hiển thị).
 * Lệch → báo đỏ ở khung ghi chú + console.table để biết dòng nào gây lệch.
 */
function doiChieuTheVoiBangPhieuThu() {
  const tbody = document.getElementById("tbodyPhieuThuMisa");
  if (!tbody) return null;
  const soTuChuoi = t => { const m = String(t || "").match(/\d[\d.]*/); return m ? parseInt(m[0].replace(/\./g, ""), 10) || 0 : 0; };
  const text = id => (document.getElementById(id) || {}).textContent || "";
  const bang = { tm: { so: 0, tong: 0 }, ck: { so: 0, tong: 0 } };
  Array.from(tbody.querySelectorAll("tr[data-loai]")).forEach(tr => {
    const o = bang[tr.dataset.loai === "ck" ? "ck" : "tm"];
    o.so++; o.tong += soTuChuoi(tr.children[9] && tr.children[9].textContent);   // cột "Số tiền" đang hiện
  });
  const the = {
    tm: { so: soTuChuoi(text("kpiPTTienMatSub")), tong: soTuChuoi(text("kpiPTTienMat")) },
    ck: { so: soTuChuoi(text("kpiPTTienGuiSub")), tong: soTuChuoi(text("kpiPTTienGui")) }
  };
  const khop = ["tm", "ck"].every(k => bang[k].so === the[k].so && bang[k].tong === the[k].tong);
  if (!khop) {
    console.error("❌ Phiếu thu: thẻ tổng hợp KHÔNG khớp bảng xem trước", { the: the, bang: bang });
    chanDoanPhieuThuMisa();
    const el = document.getElementById("ghiChuPhieuThuMisa");
    if (el) {
      el.innerHTML += `<div style="color:#b91c1c; font-weight:700;">❌ Thẻ tổng hợp (TM ${the.tm.so} phiếu / ${formatTien(the.tm.tong)} đ · CK ${the.ck.so} phiếu / ${formatTien(the.ck.tong)} đ) KHÔNG khớp bảng bên dưới (TM ${bang.tm.so} / ${formatTien(bang.tm.tong)} đ · CK ${bang.ck.so} / ${formatTien(bang.ck.tong)} đ). Bấm "Làm mới" và báo kỹ thuật (mở F12 xem bảng chẩn đoán).</div>`;
      el.style.display = "";
    }
  }
  return { khop: khop, the: the, bang: bang };
}

/**
 * In ra console (F12) mảng dữ liệu TRƯỚC khi cộng và kết quả SAU khi cộng để tìm dòng gây lệch.
 * Gọi tay: chanDoanPhieuThuMisa()  ·  hoặc mở trang với ?debugPhieuThu=1 để tự in mỗi lần vẽ lại.
 */
function chanDoanPhieuThuMisa() {
  const boQua = !!(document.getElementById("ptBoQuaDaXuat") || {}).checked;
  const hien = new Set(locPhieuThuCanXuat(danhSachPhieuThuMisa, "", boQua));
  const dsChiTiet = danhSachPhieuThuMisa.map(r => ({
    khoa: r.khoa, loai: r.loai, tkNo: r.tkNo, nguon: r.nguon, ngay: r.ngay, tenKH: r.tenKH,
    soTien: r.soTien, kieuSoTien: typeof r.soTien, soCT: r.soCTDaCap || "", hienTrongThe: hien.has(r)
  }));
  console.log("📋 Phiếu thu — mảng TRƯỚC khi cộng (" + dsChiTiet.length + " khoản; bỏ qua đã xuất = " + boQua + ")");
  console.table(dsChiTiet);
  const tong = tinhTongPhieuThu(Array.from(hien));
  console.log("📊 Phiếu thu — SAU khi cộng");
  console.table({
    "Tiền mặt (1111)": { soPhieu: tong.tm.so, tongTien: tong.tm.tong },
    "Tiền gửi (1121x)": { soPhieu: tong.ck.so, tongTien: tong.ck.tong },
    "Tổng": { soPhieu: tong.soPhieu, tongTien: tong.tong }
  });
  return dsChiTiet;
}

function lamMoiPhieuThuMisa() {
  danhMucNHPhieuThu = [];
  veBangPhieuThuMisa();
}

function suaSoPhieuThuTiepTheo(el) {
  el.dataset.daSua = "1";
  veBangPhieuThuMisa();
}

function luuSoPhieuThuTiepTheo() {
  const oSo = document.getElementById("ptSoTiepTheo");
  const so = parseInt(oSo && oSo.value, 10);
  if (!(so >= 1)) { alert("⚠️ Số phiếu thu tiếp theo phải là số nguyên ≥ 1."); return; }
  const st = docSoPhieuThuMisa();
  if (!confirm(`Đặt số phiếu thu TIẾP THEO là ${dinhDangSoPT(so)}?\n\nCác khoản đã xuất trước đó vẫn giữ nguyên số cũ; số đã dùng sẽ tự bỏ qua để không trùng.`)) return;
  st.soTiepTheo = so;
  ghiSoPhieuThuMisa(st);
  delete oSo.dataset.daSua;
  veBangPhieuThuMisa();
  hienThiToast(`✅ Số phiếu thu tiếp theo: ${dinhDangSoPT(so)}`);
}

/**
 * Định dạng file Excel xuất cho MISA (dùng chung các file của Bước 3): dòng 1 là tiêu đề cột — nền xanh
 * nhạt, chữ đậm, xuống dòng, kẻ viền, có bộ lọc; dữ liệu từ dòng 2 có viền mảnh. Chỉ đổi giao diện,
 * không đổi dữ liệu. cotSo: chỉ số (0-based) các cột số tiền → định dạng #,##0.
 */
function dinhDangTieuDeExcelMisa(ws, soDong, soCot, cotSo) {
  if (!ws || !soCot) return;
  const vien = { style: "thin", color: { rgb: "A6A6A6" } };
  const kieuVien = { top: vien, bottom: vien, left: vien, right: vien };
  const cotTien = new Set(cotSo || []);
  for (let c = 0; c < soCot; c++) {
    const o = ws[XLSX.utils.encode_cell({ r: 0, c: c })];
    if (o) o.s = {
      font: { bold: true, sz: 10, color: { rgb: /\(\*\)/.test(String(o.v || "")) ? "C00000" : "000000" } },
      fill: { patternType: "solid", fgColor: { rgb: "D9F2D0" } },
      alignment: { wrapText: true, vertical: "bottom", horizontal: "left" },
      border: kieuVien
    };
    for (let r = 1; r < soDong; r++) {
      const d = ws[XLSX.utils.encode_cell({ r: r, c: c })];
      if (!d) continue;
      d.s = { font: { sz: 10 }, border: kieuVien, alignment: { vertical: "center" } };
      if (cotTien.has(c) && typeof d.v === "number") { d.z = "#,##0"; d.s.numFmt = "#,##0"; }
    }
  }
  ws["!rows"] = [{ hpt: 45 }];
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(0, soDong - 1), c: soCot - 1 } }) };
}

/**
 * Dựng mảng dữ liệu của file Excel phiếu thu (hàm thuần): dòng 1 = tiêu đề, từ dòng 2 = mỗi khoản 1 dòng.
 * ds = danh sách đã lọc bằng locPhieuThuCanXuat (chính danh sách đang hiện trên giao diện); soCT = Map khoa → số chứng từ.
 */
function dungDuLieuExcelPhieuThu(ds, loai, soCT) {
  const tieuDe = loai === "tm" ? TIEU_DE_PT_TIEN_MAT : TIEU_DE_PT_TIEN_GUI;
  const aoa = [[COT_NGAY_GACH_NO_PT].concat(tieuDe)];
  (ds || []).forEach(r => {
    const dienGiai = `Thu tiền của ${r.tenKH}`;
    const lyDoChiTiet = `${dienGiai} - ${r.thamChieu || r.tenNguon}`;
    const dong = new Array(tieuDe.length).fill("");
    dong[0] = r.ngay; dong[1] = r.ngay; dong[2] = soCT && soCT.get(r.khoa); dong[3] = r.maKH; dong[4] = r.tenKH;
    if (loai === "tm") {
      dong[5] = r.tenKH;                 // Người nộp
      dong[7] = LY_DO_PHIEU_THU;         // Lý do nộp
      dong[8] = lyDoChiTiet;             // Diễn giải lý do nộp
      dong[11] = dienGiai;               // Diễn giải (hạch toán)
      dong[12] = r.tkNo; dong[13] = r.tkCo; dong[14] = r.soTien; dong[15] = r.maKH;
    } else {
      dong[6] = r.nh ? r.nh.soTK : "";   // Nộp vào TK
      dong[7] = r.nh ? r.nh.tenNH : "";  // Mở tại ngân hàng
      dong[8] = LY_DO_PHIEU_THU;         // Lý do thu
      dong[9] = lyDoChiTiet;             // Diễn giải lý do thu
      dong[11] = dienGiai;               // Diễn giải (hạch toán)
      dong[12] = r.tkNo; dong[13] = r.tkCo; dong[14] = r.soTien; dong[15] = r.maKH;
    }
    aoa.push([r.ngayGachNo || ""].concat(dong));
  });
  return aoa;
}

/** Tổng cột "Số tiền" của mảng dữ liệu Excel (cột P vì có thêm cột A "Ngày gạch nợ") */
function tongCotSoTienExcelPhieuThu(aoa) {
  return (aoa || []).slice(1).reduce((s, d) => s + (parseFloat(d[15]) || 0), 0);
}

function xuatPhieuThuTienMat() { return xuatPhieuThuAMIS("tm"); }
function xuatPhieuThuTienGui() { return xuatPhieuThuAMIS("ck"); }

async function xuatPhieuThuAMIS(loai) {
  await veBangPhieuThuMisa();
  const ds = layPhieuThuCanXuat(loai);
  const tenLoai = loai === "tm" ? "TIỀN MẶT" : "TIỀN GỬI";
  if (!ds.length) { alert(`⚠️ Không có khoản thu ${tenLoai.toLowerCase()} nào để lập phiếu thu.`); return; }
  const coCanhBao = ds.filter(r => r.canhBao.length);
  if (coCanhBao.length && !confirm(`⚠️ ${coCanhBao.length} phiếu thu ${tenLoai} cần kiểm tra:\n\n` +
    coCanhBao.slice(0, 8).map(r => `• ${r.tenKH} (${formatTien(r.soTien)} đ): ${r.canhBao.join("; ")}`).join("\n") +
    (coCanhBao.length > 8 ? `\n… và ${coCanhBao.length - 8} khoản khác` : "") + `\n\nBấm [OK] để vẫn xuất file, [Hủy] để kiểm tra lại.`)) return;

  // Kiểm tra TRƯỚC khi cấp số chứng từ (bản xem trước số, chưa lưu): tổng cột "Số tiền" trong file PHẢI bằng
  // tổng thẻ tóm tắt — cùng danh sách đang hiện trên màn hình
  const tongThe = tinhTongPhieuThu(layPhieuThuCanXuat(loai))[loai].tong;
  const tongFile = tongCotSoTienExcelPhieuThu(dungDuLieuExcelPhieuThu(ds, loai, duKienSoPhieuThu(ds, false)));
  if (Math.abs(tongThe - tongFile) > 0.5) {
    alert(`❌ Tổng số tiền trong file (${formatTien(tongFile)} đ) không khớp tổng đang hiện trên màn hình (${formatTien(tongThe)} đ) nên KHÔNG xuất file. Bấm "Làm mới" rồi thử lại.`);
    return;
  }

  const soCT = duKienSoPhieuThu(ds, true);   // cấp & lưu số chứng từ (khoản đã xuất giữ số cũ)
  const tieuDe = loai === "tm" ? TIEU_DE_PT_TIEN_MAT : TIEU_DE_PT_TIEN_GUI;
  // Dòng 1 là tiêu đề cột, dữ liệu từ dòng 2 (bỏ 7 dòng hướng dẫn của file mẫu) — để copy nhanh
  // các dòng dữ liệu dán vào file mẫu AMIS (cột giữ đúng thứ tự như mẫu, từ cột B).
  // Cột A "Ngày gạch nợ" chỉ để kế toán ghi chú / đối chiếu (khoản khách chuyển trước, ngày n+x mới phát hiện
  // và gạch nợ) — không thuộc mẫu AMIS, không dán vào file mẫu.
  const aoa = dungDuLieuExcelPhieuThu(ds, loai, soCT);

  try {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 13 }].concat(tieuDe.map((t, i) => ({ wch: [12, 12, 11, 14, 36, 24, 20, 30, 42, 12, 10, 40, 10, 9, 14, 16].concat(new Array(20).fill(12))[i] || 12 })));
    dinhDangTieuDeExcelMisa(ws, aoa.length, tieuDe.length + 1, [15]);   // cột Số tiền (P) định dạng số
    // Ngày gạch nợ khác ngày thu (khách chuyển trước, phát hiện sau) → tô vàng để không bị sót
    let soGachNoMuon = 0;
    ds.forEach((r, i) => {
      const o = ws[XLSX.utils.encode_cell({ r: i + 1, c: 0 })];
      if (!o || !r.ngayGachNo || !r.ngay || r.ngayGachNo === r.ngay) return;
      o.s = Object.assign({}, o.s, { font: { bold: true, sz: 10, color: { rgb: "9A3412" } }, fill: { patternType: "solid", fgColor: { rgb: "FEF3C7" } } });
      soGachNoMuon++;
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, loai === "tm" ? "Phieu thu" : "Phieu thu tien gui");
    const ngays = ds.map(r => khoaNgayPT(r.ngay)).filter(k => k !== "99999999").sort();
    const khoang = ngays.length ? (ngays[0] === ngays[ngays.length - 1] ? ngays[0] : `${ngays[0]}-${ngays[ngays.length - 1]}`) : new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const tenFile = `${loai === "tm" ? "phieu_thu_tien_mat" : "phieu_thu_tien_gui"}_${khoang}.xlsx`;
    XLSX.writeFile(wb, tenFile);
    const soDau = soCT.get(ds[0].khoa), soCuoi = soCT.get(ds[ds.length - 1].khoa);
    await veBangPhieuThuMisa();
    alert(`✅ ĐÃ XUẤT PHIẾU THU ${tenLoai}!\n\n• File: ${tenFile}\n• ${ds.length} phiếu thu — tổng ${formatTien(ds.reduce((s, r) => s + r.soTien, 0))} đ\n• Số chứng từ: ${soDau}${ds.length > 1 ? " … " + soCuoi : ""}\n\n` +
      `📌 File có tiêu đề cột ở dòng 1, dữ liệu từ dòng 2: copy các dòng dữ liệu TỪ CỘT B dán vào file mẫu AMIS (${loai === "tm" ? "phieu_thu_tien_mat" : "phieu_thu_tien_gui"}) từ dòng 9, rồi AMIS ➡ ${loai === "tm" ? "Quỹ ➡ Thu tiền" : "Ngân hàng ➡ Thu tiền gửi"} ➡ Nhập khẩu từ Excel.\n` +
      `📌 Cột A "Ngày gạch nợ" = ngày ghi nhận gạch nợ trên app, chỉ để ghi chú / đối chiếu (không dán vào mẫu AMIS)` +
      (soGachNoMuon ? `.\n⚠️ ${soGachNoMuon} khoản có ngày gạch nợ KHÁC ngày thu (tô vàng ở cột A) — kiểm tra để không bị sót.` : "."));
  } catch (err) {
    alert("❌ Lỗi xuất file phiếu thu: " + ((err && err.message) || err));
  }
}

/** Bỏ tích "Bỏ qua khoản đã xuất phiếu thu" để hiện lại các khoản đã xuất (dùng cho nút ở bảng trống) */
function hienCaKhoanDaXuatPhieuThu() {
  const o = document.getElementById("ptBoQuaDaXuat");
  if (o) o.checked = false;
  return veBangPhieuThuMisa();
}
