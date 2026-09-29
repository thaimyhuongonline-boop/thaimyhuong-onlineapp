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
 * Chỉ bổ sung — không thay đổi các file MISA đã có của Bước 3.
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
const LY_DO_PHIEU_THU = "Thu tiền khách hàng (không theo hóa đơn)";
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

/** Dựng danh sách các khoản phiếu thu từ dữ liệu Bước 3 đang hiện */
function taoDanhSachPhieuThuMisa() {
  const theoKhoa = new Map();
  const ghiChu = [];
  const them = r => { if (!theoKhoa.has(r.khoa) && r.soTien > 0.5) theoKhoa.set(r.khoa, r); };
  const layChk = id => { const el = document.getElementById(id); return !el || el.checked; };

  // 1. Tiền thu theo hoá đơn ở Bước 2 (chuyến / ngày đang chọn phía trên)
  if (layChk("ptNguonHoaDon")) {
    const dsDot = (typeof cheDoNgayMisa !== "undefined" && cheDoNgayMisa) ? cheDoNgayMisa.dsDot : ((typeof dotHienTai !== "undefined" && dotHienTai) ? [dotHienTai] : []);
    const chuaQT = [];
    // Chuyến đã quyết toán xét trước (hoá đơn giao lại có ở 2 chuyến → lấy chuyến có số liệu quyết toán)
    dsDot.slice().sort((a, b) => Number(!!b.daQuyetToan) - Number(!!a.daQuyetToan)).forEach(dot => {
      if (!dot.daQuyetToan) { chuaQT.push(dot.xe || dot.maDot); return; }
      const ngay = ngayVNPhieuThu(dot.ngayGiao || dot.ngayRaw);
      (dot.danhSachChiTiet || []).forEach(h => {
        const maHD = String(h.maHD || h.ma_hd || "").trim().toUpperCase();
        if (!maHD) return;
        const tienHD = parseFloat(h.tienHD || h.thanhTien || 0) || 0;
        const phaiTra = Math.max(0, tienHD - (parseFloat(h.traVe || 0) || 0));
        const tach = tachTienHoaDonPT(parseFloat(h.tienMat || 0) || 0, parseFloat(h.chuyenKhoan || 0) || 0, phaiTra);
        const goc = {
          ngay: ngay, maKH: String(h.maKH || "").trim().toUpperCase(), tenKH: String(h.tenKH || "Khách Lẻ").trim(),
          nguon: "hoa_don", tenNguon: "Thu tiền hoá đơn (Bước 2)", thamChieu: `HĐ ${maHD} — xe ${dot.xe || ""}`
        };
        if (tach.tmNo > 0.5) them(Object.assign({}, goc, { khoa: `HD|${maHD}|TM`, loai: "tm", soTien: Math.round(tach.tmNo) }));
        if (tach.ckNo > 0.5) them(Object.assign({}, goc, { khoa: `HD|${maHD}|CK`, loai: "ck", soTien: Math.round(tach.ckNo), nh: timTKNganHangPT(h.taiKhoanNhan) }));
      });
    });
    if (chuaQT.length) ghiChu.push(`⏳ ${chuaQT.length} chuyến CHƯA quyết toán ở Bước 2 nên chưa lập phiếu thu: ${chuaQT.join(", ")}`);
    if (!dsDot.length) ghiChu.push("ℹ️ Chưa chọn chuyến xe / ngày ở phía trên nên chưa có phiếu thu theo hoá đơn.");
  }

  // 2 & 3. Thu nợ khách hàng + tiền khách trả trước NHẬN vào (khu vực Cấn trừ công nợ) — chỉ khoản tiền VÀO
  const dsThuNo = (typeof danhSachThuNoMisa !== "undefined" && Array.isArray(danhSachThuNoMisa)) ? danhSachThuNoMisa : [];
  dsThuNo.forEach(r => {
    const laTraTruoc = r.nguon === "tra_truoc";
    if (laTraTruoc ? !layChk("ptNguonTraTruoc") : !layChk("ptNguonThuNo")) return;
    if (r.chiRa || !(parseFloat(r.soTien) > 0) || (r.tkNo !== "1111" && r.tkNo !== "1121")) return;
    them({
      khoa: (laTraTruoc ? "TT|" : "TN|") + r.id,
      loai: r.tkNo === "1121" ? "ck" : "tm",
      ngay: ngayVNPhieuThu(r.ngayThu),
      maKH: String(r.maKH || "").trim().toUpperCase(), tenKH: String(r.tenKH || "Khách Lẻ").trim(),
      soTien: Math.round(parseFloat(r.soTien) || 0),
      nguon: laTraTruoc ? "tra_truoc" : "thu_no",
      tenNguon: laTraTruoc ? "Khách trả trước / trả dư" : "Thu nợ khách hàng",
      thamChieu: laTraTruoc ? `Trả trước ${r.soCT || ""}` : `HĐ ${r.soCT || ""}`,
      nh: r.tkNo === "1121" ? timTKNganHangPT(r.tkNganHang) : null
    });
  });

  const st = docSoPhieuThuMisa();
  const ds = Array.from(theoKhoa.values()).map(r => {
    const maKH = r.maKH && r.maKH !== "KH_LE" ? r.maKH : "KH_LE";
    const canhBao = [];
    if (maKH === "KH_LE") canhBao.push("Khách chưa có mã — đang để KH_LE, cần có trong danh mục MISA");
    if (!r.ngay) canhBao.push("Không rõ ngày thu");
    if (r.loai === "ck" && r.nh && r.nh.canhBao) canhBao.push(r.nh.canhBao);
    return Object.assign(r, {
      maKH: maKH,
      tkNo: r.loai === "tm" ? TK_TIEN_MAT_PHIEU_THU : (r.nh ? r.nh.tk : TK_TIEN_GUI_CHUNG_PHIEU_THU),
      tkCo: TK_CO_PHIEU_THU,
      soCTDaCap: st.theoKhoa[r.khoa] || "",
      canhBao: canhBao
    });
  }).sort((a, b) => khoaNgayPT(a.ngay).localeCompare(khoaNgayPT(b.ngay)) || (a.loai === b.loai ? 0 : (a.loai === "tm" ? -1 : 1)) || a.khoa.localeCompare(b.khoa));

  danhSachPhieuThuMisa = ds;
  ghiChuPhieuThuMisa = ghiChu;
  return ds;
}

function layPhieuThuCanXuat(loai) {
  const boQuaDaXuat = !!(document.getElementById("ptBoQuaDaXuat") || {}).checked;
  return danhSachPhieuThuMisa.filter(r => (!loai || r.loai === loai) && !(boQuaDaXuat && r.soCTDaCap));
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
  const tm = dsHien.filter(r => r.loai === "tm");
  const ck = dsHien.filter(r => r.loai === "ck");
  const cong = a => a.reduce((s, r) => s + r.soTien, 0);
  const dat = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  dat("kpiPTTienMat", formatTien(cong(tm)) + " đ");
  dat("kpiPTTienMatSub", `${tm.length} phiếu thu · Nợ 1111 / Có 1311`);
  dat("kpiPTTienGui", formatTien(cong(ck)) + " đ");
  dat("kpiPTTienGuiSub", `${ck.length} phiếu thu · Nợ 1121x / Có 1311`);
  const soCanhBao = dsHien.filter(r => r.canhBao.length).length;
  dat("kpiPTCanhBao", soCanhBao ? `${soCanhBao} khoản` : "Không có");

  const elGhiChu = document.getElementById("ghiChuPhieuThuMisa");
  if (elGhiChu) {
    const daAn = danhSachPhieuThuMisa.length - dsHien.length;
    const dong = ghiChuPhieuThuMisa.slice();
    if (daAn) dong.push(`✅ Ẩn ${daAn} khoản đã xuất phiếu thu trước đó (bỏ tích "Bỏ qua khoản đã xuất" để xuất lại đúng số cũ).`);
    elGhiChu.innerHTML = dong.map(x => `<div>${escapeHtml(x)}</div>`).join("");
    elGhiChu.style.display = dong.length ? "" : "none";
  }

  if (!dsHien.length) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:26px; color:var(--text-muted);">Không có khoản thu nào để lập phiếu thu (theo chuyến / ngày đang chọn và bộ lọc thu nợ phía trên).</td></tr>`;
    dat("footPTTien", "0");
    return;
  }
  tbody.innerHTML = dsHien.map((r, i) => `
    <tr>
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
  dat("footPTTien", formatTien(cong(dsHien)));
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

  const soCT = duKienSoPhieuThu(ds, true);   // cấp & lưu số chứng từ (khoản đã xuất giữ số cũ)
  const tieuDe = loai === "tm" ? TIEU_DE_PT_TIEN_MAT : TIEU_DE_PT_TIEN_GUI;
  const aoa = [
    [loai === "tm" ? "FILE MẪU PHIẾU THU ĐỂ NHẬP VÀO PHẦN MỀM AMIS ACCOUNTING" : "FILE MẪU PHIẾU THU TIỀN GỬI ĐỂ NHẬP VÀO PHẦN MỀM AMIS ACCOUNTING"],
    ["Hướng dẫn:"],
    ["- Điền dữ liệu vào các cột tương ứng trên file này"],
    ["- Các cột có dấu (*) là những cột bắt buộc"],
    ["- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản"],
    ["- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa"],
    Array.from({ length: tieuDe.length }, (_, i) => i === 11 ? "Chi tiết hạch toán" : ""),
    tieuDe.slice()
  ];
  ds.forEach(r => {
    const dienGiai = `Thu tiền của ${r.tenKH}`;
    const lyDoChiTiet = `${dienGiai} - ${r.thamChieu || r.tenNguon}`;
    const dong = new Array(tieuDe.length).fill("");
    dong[0] = r.ngay; dong[1] = r.ngay; dong[2] = soCT.get(r.khoa); dong[3] = r.maKH; dong[4] = r.tenKH;
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
    aoa.push(dong);
  });

  try {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [{ s: { r: 6, c: 11 }, e: { r: 6, c: tieuDe.length - 1 } }];
    ws["!cols"] = tieuDe.map((t, i) => ({ wch: [12, 12, 11, 14, 36, 24, 20, 30, 42, 12, 10, 40, 10, 9, 14, 16].concat(new Array(20).fill(12))[i] || 12 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, loai === "tm" ? "Phieu thu" : "Phieu thu tien gui");
    const ngays = ds.map(r => khoaNgayPT(r.ngay)).filter(k => k !== "99999999").sort();
    const khoang = ngays.length ? (ngays[0] === ngays[ngays.length - 1] ? ngays[0] : `${ngays[0]}-${ngays[ngays.length - 1]}`) : new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const tenFile = `${loai === "tm" ? "phieu_thu_tien_mat" : "phieu_thu_tien_gui"}_${khoang}.xls`;
    XLSX.writeFile(wb, tenFile, { bookType: "xls" });
    const soDau = soCT.get(ds[0].khoa), soCuoi = soCT.get(ds[ds.length - 1].khoa);
    await veBangPhieuThuMisa();
    alert(`✅ ĐÃ XUẤT PHIẾU THU ${tenLoai}!\n\n• File: ${tenFile}\n• ${ds.length} phiếu thu — tổng ${formatTien(ds.reduce((s, r) => s + r.soTien, 0))} đ\n• Số chứng từ: ${soDau}${ds.length > 1 ? " … " + soCuoi : ""}\n\n` +
      `📌 AMIS Accounting ➡ ${loai === "tm" ? "Quỹ ➡ Thu tiền" : "Ngân hàng ➡ Thu tiền gửi"} ➡ Nhập khẩu từ Excel ➡ chọn file vừa tải.`);
  } catch (err) {
    alert("❌ Lỗi xuất file phiếu thu: " + ((err && err.message) || err));
  }
}

/**
 * File bán hàng dùng KÈM phiếu thu: giống file "Tải File Excel Import MISA" nhưng mọi hoá đơn hạch toán
 * Nợ 1311 (tiền thu được ghi bằng phiếu thu Nợ 1111/1121x – Có 1311) → không ghi tiền 2 lần.
 */
function xuatFileBanHangGhiNo1311() {
  const dsDong = (typeof danhSachDongMisa !== "undefined" && Array.isArray(danhSachDongMisa)) ? danhSachDongMisa : [];
  if (!dsDong.length) { alert("⚠️ Chưa có dữ liệu bán hàng của chuyến / ngày đang chọn phía trên."); return; }
  const doiTK = tk => (tk === "1111" || tk === "1121" || tk === "131") ? TK_CO_PHIEU_THU : tk;
  const aoa = [["Ngày hạch toán (*)", "Ngày chứng từ (*)", "Số chứng từ (*)", "Mã khách hàng (*)", "Tên khách hàng", "Địa chỉ", "Mã số thuế", "Diễn giải",
    "Mã hàng (*)", "Tên hàng", "ĐVT", "Số lượng (*)", "Đơn giá", "Thành tiền (*)", "TK Nợ (*)", "TK Có (*)", "Tài khoản ngân hàng", "Nhân viên bán hàng"]];
  dsDong.forEach(r => aoa.push([r.ngayHT, r.ngayCT, r.soCT, r.maKH, r.tenKH, "", "", r.dienGiai, r.maHang, r.tenHang, r.dvt, r.soLuong, r.donGia,
    r.thanhTien, doiTK(r.tkNo), doiTK(r.tkCo), "", r.nguoiBan || ""]));
  try {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [13, 13, 16, 15, 28, 15, 14, 32, 16, 28, 10, 12, 14, 16, 10, 10, 20, 18].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChungTuBanHangMISA");
    const ten = (typeof cheDoNgayMisa !== "undefined" && cheDoNgayMisa)
      ? `MISA_BanHang_GhiNo1311_Ngay_${cheDoNgayMisa.ngay.replace(/\//g, "-")}.xlsx`
      : `MISA_BanHang_GhiNo1311_${(typeof dotHienTai !== "undefined" && dotHienTai) ? String(dotHienTai.xe || "").replace(/[^a-zA-Z0-9]/g, "_") : "TMH"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, ten);
    alert(`✅ ĐÃ XUẤT FILE BÁN HÀNG GHI NỢ 1311!\n\n• File: ${ten}\n• ${dsDong.length} dòng — mọi hoá đơn hạch toán Nợ 1311 / Có 5111\n\n` +
      `📌 Dùng file này THAY cho "Tải File Excel Import MISA" khi nhập phiếu thu cho tiền thu theo hoá đơn, để tiền không bị ghi 2 lần.`);
  } catch (err) {
    alert("❌ Lỗi xuất file: " + ((err && err.message) || err));
  }
}
