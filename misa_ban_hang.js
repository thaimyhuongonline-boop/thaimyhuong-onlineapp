/* ====================================================================
 * FILE BÁN HÀNG THEO MẪU NHẬP KHẨU MISA (69 CỘT A … BQ) — BƯỚC 3
 * --------------------------------------------------------------------
 * Nút "Tải File Excel Import MISA" xuất đúng mẫu "Template mẫu misa bán hàng.xlsx" của kế toán
 * (sheet "XUẤT MISA BÁN HÀNG", tiêu đề cột ở dòng 1, dữ liệu từ dòng 2).
 * Từ 2026-10-08: bỏ cột "Số xe" ở đầu (trước là cột A) — số xe ghi vào cột BI "Mã thống kê", nên file
 * nhập thẳng vào MISA không phải xoá cột A; các cột còn lại lùi 1 chữ so với mẫu cũ 70 cột:
 *   • Cột B  Phương thức thanh toán: mặc định "Chưa thu tiền" (tiền khách trả nhập sau bằng phiếu thu)
 *   • Cột H, I  Số chứng từ / Số phiếu xuất: dòng 2 là SỐ BẮT ĐẦU (BH00001 / PXK00001 — sửa được trên
 *     Excel), các dòng dưới là CÔNG THỨC tự chạy số theo từng hoá đơn (cột Z) như file mẫu
 *   • Cột V  Diễn giải: "Bán hàng cho khách hàng <tên khách ở cột O>"
 *   • Cột AH TK Nợ: mặc định 1311 (hàng khuyến mại đổi mã: 13881 như file mẫu)
 *   • Cột Z  Số chứng từ kèm theo (Phiếu xuất) = mã hoá đơn KiotViet
 *   • Thuế GTGT, TK doanh thu, TK giá vốn, mã kho, TK kho: theo Danh mục "Định khoản hàng hoá".
 *     Giá KiotViet đã gồm thuế → Thành tiền (AM) = tiền hàng trước thuế, Tiền thuế GTGT (AW) = phần còn lại,
 *     Đơn giá (AL) = Thành tiền / Số lượng — cộng lại đúng bằng tiền hoá đơn
 *   • Hàng khuyến mại: mã KM có trong Danh mục "Đổi mã khuyến mãi" → đổi sang mã hàng thật, cột AF "Có"
 *   • Mã nhân viên bán hàng (X): mã MISA (NVKD…) khai trong Danh mục "Nhân viên kinh doanh" (bỏ qua mã tự sinh
 *     KD_… từ KiotViet); người bán chưa có mã → khi xuất file hiện bảng để kế toán nhập mã 1 lần (lưu lên máy chủ)
 *   • Cột BI Mã thống kê = số xe (chuyến) của hoá đơn
 * Dữ liệu lấy từ danhSachDongMisa của Bước 3 (đã trừ hàng trả về) — không đổi số liệu trên màn hình.
 * ==================================================================== */

// Tiêu đề cột đúng từng chữ theo file mẫu (dòng 1, cột A … BQ — mẫu MISA, không có cột "Số xe")
const TIEU_DE_BAN_HANG_MISA = ["Hình thức bán hàng", "Phương thức thanh toán", "Kiêm phiếu xuất kho", "Lập kèm hóa đơn", "Đã lập hóa đơn",
  "Ngày hạch toán (*)", "Ngày chứng từ (*)", "Số chứng từ (*)", "Số phiếu xuất", "Mẫu số HĐ", "Ký hiệu HĐ", "Số hóa đơn", "Ngày hóa đơn",
  "Mã khách hàng", "Tên khách hàng", "Địa chỉ", "Mã số thuế", "Đơn vị giao đại lý", "Người nộp", "Nộp vào TK", "Tên ngân hàng",
  "Diễn giải/Lý do nộp", "Lý do xuất", "Mã nhân viên bán hàng", "Số chứng từ kèm theo (Phiếu thu)", "Số chứng từ kèm theo (Phiếu xuất)",
  "Hạn thanh toán", "Mã hàng (*)", "Thuộc combo", "Tên hàng", "Là dòng ghi chú", "Hàng khuyến mại", "Chiết khấu thương mại",
  "TK Tiền/Chi phí/Nợ (*)", "TK Doanh thu/Có (*)", "ĐVT", "Số lượng", "Đơn giá", "Thành tiền", "Tỷ lệ CK (%)", "Tiền chiết khấu",
  "TK chiết khấu", "Giá tính thuế XK", "% thuế xuất khẩu", "Tiền thuế xuất khẩu", "TK thuế xuất khẩu", "% thuế GTGT", "% thuế suất KHAC",
  "Tiền thuế GTGT", "TK thuế GTGT", "Biển kiểm soát", "Điểm đi", "Điểm đến", "HH không TH trên tờ khai thuế GTGT", "Mã khoản mục chi phí",
  "Mã đơn vị", "Mã đối tượng THCP", "Mã công trình", "Số đơn đặt hàng", "Số hợp đồng bán", "Mã thống kê", "Số khế ước cho vay",
  "CP không hợp lý", "Mã kho", "TK giá vốn", "TK Kho", "Đơn giá vốn", "Tiền vốn", "Hàng hóa giữ hộ/bán hộ"];
// Độ rộng cột như file mẫu
const DO_RONG_COT_BAN_HANG_MISA = [21, 13, 10, 11, 13, 11, 13, 11, 10, 10, 10, 10, 12, 36, 78, 6, 10, 9, 10, 10, 13, 99, 9, 12, 14, 12, 13, 14, 12,
  55, 13, 11, 11, 10, 9, 6, 8, 9, 11, 10, 13, 12, 14, 11, 13, 11, 11, 10, 10, 12, 13, 7, 9, 11, 13, 9, 12, 12, 10, 9, 11, 13, 6, 7, 6, 7, 7, 8, 12];
const TEN_SHEET_BAN_HANG_MISA = "XUẤT MISA BÁN HÀNG";
const SO_BAT_DAU_BH_MISA = "BH00001";     // ô H2 — số chứng từ bắt đầu
const SO_BAT_DAU_PXK_MISA = "PXK00001";   // ô I2 — số phiếu xuất bắt đầu
const PHUONG_THUC_TT_BAN_HANG_MISA = "Chưa thu tiền";
const TK_NO_BAN_HANG_MISA = "1311";
const TK_NO_HANG_KM_MISA = "13881";
const MA_DONG_HOA_DON_GTGT_MISA = "HĐ";   // dòng "Hóa Đơn GTGT" trên KiotViet — không phải hàng hoá, loại khỏi file
const TK_THUE_GTGT_BAN_HANG_MISA = "33311";
const MA_KHO_MAC_DINH_MISA = "KHO01";
const TK_KHO_MAC_DINH_MISA = "1561";
// Đổi mã khuyến mãi mặc định — giống dữ liệu gốc của Danh mục "Đổi mã khuyến mãi" (dùng khi máy chưa có danh mục)
const DOI_MA_KM_MAC_DINH_MISA = [
  { ma_km: "20TANG1", ma_that: "18301", ten_that: "Mì Cay Nissin Mì Xào Hương Vị Gà Cay Phô Mai Hàn Quốc" },
  { ma_km: "KMP900", ma_that: "PS00009", ten_that: "Thức uống bổ sung ION Pocari Sweat chai 900ML" },
  { ma_km: "KM500", ma_that: "FG200001", ten_that: "Pocari Sweat chai 500ml B6 - NĐ" },
  { ma_km: "SP000118", ma_that: "25000066", ten_that: "Nước cốt dừa Xim Mom Cooks 200ml" },
  { ma_km: "SP000119", ma_that: "20100436", ten_that: "Nước cốt dừa Xim Mom Cooks 400ml" }
];

let danhMucBanHangMisa = null;   // { dinhKhoan: Map, doiMaKM: Map, nhanVien: Map }

function khoaMaHangBH(ma) { return String(ma === null || ma === undefined ? "" : ma).trim().toUpperCase(); }

// "Nguyễn Hồng Phúc - 0708105164" → "nguyễn hồng phúc" (so tên người bán KiotViet với Danh mục)
function khoaTenNVBH(ten) {
  return String(ten || "").normalize("NFC").split(/\s+-\s+/)[0].replace(/\s+/g, " ").trim().toLowerCase();
}

async function docBangDanhMucBH(tenBang, khoaLS) {
  let cucBo = [], damMay = [];
  if (khoaLS) {
    try { cucBo = JSON.parse(localStorage.getItem(khoaLS) || "[]") || []; } catch (e) { cucBo = []; }
  }
  if (typeof sb !== "undefined") {
    try {
      const { data, error } = await sb.from(tenBang).select("*");
      if (!error && Array.isArray(data)) damMay = data;
    } catch (e) {}
  }
  return { cucBo: Array.isArray(cucBo) ? cucBo : [], damMay: damMay };
}

/** Nạp Danh mục Định khoản hàng hoá, Đổi mã khuyến mãi, Nhân viên kinh doanh (máy này trước, đám mây ghi đè) */
async function napDanhMucBanHangMisa() {
  const [dk, km, nv] = await Promise.all([
    docBangDanhMucBH("dinh_khoan_hang_hoa", "tmh_danh_muc_dinh_khoan_hang_hoa"),
    docBangDanhMucBH("doi_ma_km", "tmh_danh_muc_doi_ma_km"),
    docBangDanhMucBH("nv_kinh_doanh", "")   // mã nhân viên MISA chỉ lấy từ đám mây (tránh dữ liệu mẫu trên máy)
  ]);

  const dinhKhoan = new Map();
  dk.cucBo.concat(dk.damMay).forEach(r => {
    const ma = khoaMaHangBH(r && r.ma_hang);
    if (ma) dinhKhoan.set(ma, r);
  });

  const doiMaKM = new Map();
  (km.cucBo.length ? km.cucBo : DOI_MA_KM_MAC_DINH_MISA).concat(km.damMay).forEach(r => {
    const maKM = khoaMaHangBH(r && r.ma_km), maThat = String((r && r.ma_that) || "").trim();
    if (maKM && maThat) doiMaKM.set(maKM, { ma: maThat, ten: String(r.ten_that || "").trim() });
  });

  const nhanVien = new Map();
  nv.damMay.forEach(r => {
    const ma = String((r && r.ma_nv) || "").trim(), ten = khoaTenNVBH(r && (r.ho_ten || r.ten_nv));
    if (ma && ten && !/^KD_/i.test(ma)) nhanVien.set(ten, ma);
  });

  danhMucBanHangMisa = { dinhKhoan: dinhKhoan, doiMaKM: doiMaKM, nhanVien: nhanVien, nhanVienDong: nv.damMay };
  return danhMucBanHangMisa;
}

/* --------------------------------------------------------------------
 * MÃ NHÂN VIÊN BÁN HÀNG (cột X) — người bán KiotViet ↔ mã nhân viên trên MISA (NVKD…)
 * Danh mục "Nhân viên kinh doanh" trên máy chủ chỉ có mã tự sinh KD_… (KiotViet không có mã MISA), nên
 * kế toán nhập mã MISA 1 lần ở bảng dưới; mã lưu vào bảng nv_kinh_doanh (dòng cùng tên, mã NVKD…)
 * và mọi máy dùng chung. Bước 1 nhận nhân viên theo tên nên không thêm trùng.
 * -------------------------------------------------------------------- */

function tenNVHienThiBH(ten) { return String(ten || "").normalize("NFC").split(/\s+-\s+/)[0].replace(/\s+/g, " ").trim(); }

function escBH(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Người bán có trong các dòng Bước 3: [{ khoa, ten, tenDayDu, soHD, ma }] (chưa có mã xếp trước) + số HĐ không có tên người bán */
function dsNhanVienBanHangMisa(dsDong, dm) {
  dm = dm || danhMucBanHangMisa || { nhanVien: new Map() };
  const theoKhoa = new Map(), hdKhongTen = new Set();
  (dsDong || []).forEach(r => {
    const nguoiBan = r.nguoiBan || r.nguoiBanQT || "";
    const khoa = khoaTenNVBH(nguoiBan);
    if (!khoa) { hdKhongTen.add(String(r.soCT || "")); return; }
    if (!theoKhoa.has(khoa)) theoKhoa.set(khoa, { khoa: khoa, ten: tenNVHienThiBH(nguoiBan), tenDayDu: String(nguoiBan).trim(), hd: new Set(), ma: dm.nhanVien.get(khoa) || "" });
    theoKhoa.get(khoa).hd.add(String(r.soCT || ""));
  });
  const ds = Array.from(theoKhoa.values()).map(x => ({ khoa: x.khoa, ten: x.ten, tenDayDu: x.tenDayDu, soHD: x.hd.size, ma: x.ma }));
  ds.sort((a, b) => (!!a.ma - !!b.ma) || a.ten.localeCompare(b.ten, "vi"));
  return { ds: ds, soHDKhongTen: hdKhongTen.size };
}

/** Ghi mã MISA của các người bán lên Danh mục "Nhân viên kinh doanh" (máy chủ). Trả về danh sách lỗi (rỗng = xong) */
async function luuMaNhanVienMisa(dsCap) {
  if (typeof sb === "undefined") return ["Chưa kết nối được máy chủ"];
  const { data, error } = await sb.from("nv_kinh_doanh").select("*");
  if (error || !Array.isArray(data)) return ["Không đọc được Danh mục Nhân viên kinh doanh: " + ((error && error.message) || "lỗi máy chủ")];
  const loi = [];
  for (const x of dsCap) {
    const maMoi = String(x.ma || "").trim().toUpperCase();
    if (!maMoi) continue;
    const laMaMisa = r => r && r.ma_nv && !/^KD_/i.test(String(r.ma_nv).trim());
    const cuaNV = data.filter(r => laMaMisa(r) && khoaTenNVBH(r.ho_ten || r.ten_nv) === x.khoa);
    if (cuaNV.some(r => String(r.ma_nv).trim().toUpperCase() === maMoi)) continue;   // đã đúng mã
    const trung = data.find(r => String(r.ma_nv || "").trim().toUpperCase() === maMoi && khoaTenNVBH(r.ho_ten || r.ten_nv) !== x.khoa);
    if (trung) { loi.push(`${maMoi} đang là mã của "${trung.ho_ten || trung.ten_nv}" — không gán cho ${x.ten}`); continue; }
    let kq;
    try {
      kq = cuaNV.length
        ? await sb.from("nv_kinh_doanh").update({ ma_nv: maMoi }).eq("id", cuaNV[0].id).select()
        : await sb.from("nv_kinh_doanh").insert({ ma_nv: maMoi, ho_ten: x.ten, ghi_chu: "Mã nhân viên bán hàng trên MISA — nhập ở Bước 3" }).select();
    } catch (e) { kq = { error: e }; }
    if (!kq || kq.error || !Array.isArray(kq.data) || !kq.data.length) {
      loi.push(`${x.ten} (${maMoi}): ${(kq && kq.error && kq.error.message) || "máy chủ không ghi được"}`);
      continue;
    }
    if (cuaNV.length) cuaNV[0].ma_nv = maMoi; else data.push(kq.data[0]);
  }
  return loi;
}

/**
 * Bảng nhập mã nhân viên bán hàng MISA cho người bán của các dòng Bước 3.
 * tuyChon.khiXuat = true: mở từ nút xuất file (có nút "Bỏ qua, xuất để trống").
 * Trả về Promise: "luu" (đã lưu & nạp lại Danh mục) | "boqua" | null (đóng / huỷ).
 */
function moBangMaNhanVienMisa(dsDong, tuyChon) {
  tuyChon = tuyChon || {};
  const { ds, soHDKhongTen } = dsNhanVienBanHangMisa(dsDong);
  return new Promise(resolve => {
    const cu = document.getElementById("tmhModalMaNVMisa");
    if (cu) cu.remove();
    const soThieu = ds.filter(x => !x.ma).length;
    const hang = ds.map((x, i) => `
      <tr style="${x.ma ? "" : "background:#fffbeb;"}">
        <td style="padding:6px 8px; border-bottom:1px solid #eef0f2;"><b>${escBH(x.ten)}</b>${x.tenDayDu !== x.ten ? `<div style="font-size:11px; color:#64748b;">${escBH(x.tenDayDu)}</div>` : ""}</td>
        <td style="padding:6px 8px; border-bottom:1px solid #eef0f2; text-align:center;">${x.soHD}</td>
        <td style="padding:6px 8px; border-bottom:1px solid #eef0f2;">
          <input type="text" class="form-control" data-i="${i}" value="${escBH(x.ma)}" placeholder="VD: NVKD05" style="width:130px; text-transform:uppercase; font-weight:700;">
        </td>
      </tr>`).join("");
    const el = document.createElement("div");
    el.id = "tmhModalMaNVMisa";
    el.className = "tmh-modal-overlay";
    el.innerHTML = `
      <div class="tmh-modal-box" style="max-width:640px;">
        <div class="tmh-modal-header">
          <div class="tmh-modal-title">👤 Mã nhân viên bán hàng trên MISA</div>
          <button type="button" class="tmh-modal-close" data-nut="dong">✕</button>
        </div>
        <div class="tmh-modal-body">
          <div style="font-size:12.5px; color:#334155; line-height:1.5;">
            Cột <b>X "Mã nhân viên bán hàng"</b> của file MISA lấy mã nhân viên trên MISA (<b>NVKD…</b>) theo tên người bán KiotViet.
            ${soThieu ? `<span style="color:#b45309; font-weight:700;">${soThieu} người bán chưa có mã</span> (nền vàng) — nhập mã rồi bấm Lưu.` : "Tất cả người bán đã có mã — có thể sửa nếu sai."}
            Mã lưu vào Danh mục <b>"Nhân viên kinh doanh"</b> trên máy chủ, các lần xuất sau và máy khác tự điền.
            ${soHDKhongTen ? `<br>ℹ️ ${soHDKhongTen} hoá đơn không có tên người bán trên KiotViet → cột X để trống.` : ""}
          </div>
          ${ds.length ? `<div style="max-height:52vh; overflow:auto; border:1px solid #e2e8f0; border-radius:6px;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead><tr style="background:#f1f5f9; position:sticky; top:0;">
                <th style="padding:6px 8px; text-align:left;">Người bán (KiotViet)</th>
                <th style="padding:6px 8px; width:70px;">Số HĐ</th>
                <th style="padding:6px 8px; text-align:left; width:150px;">Mã NV trên MISA</th>
              </tr></thead>
              <tbody>${hang}</tbody>
            </table></div>` : `<div style="color:#64748b;">Không có người bán nào trong dữ liệu đang xem.</div>`}
          <div data-loi style="display:none; color:#b91c1c; font-size:12.5px; font-weight:700;"></div>
        </div>
        <div class="tmh-modal-footer">
          <button type="button" class="btn btn-outline" data-nut="dong">Huỷ</button>
          ${tuyChon.khiXuat ? `<button type="button" class="btn btn-outline" data-nut="boqua">Bỏ qua, xuất để trống</button>` : ""}
          ${ds.length ? `<button type="button" class="btn btn-primary" data-nut="luu">💾 Lưu mã${tuyChon.khiXuat ? " & xuất file" : ""}</button>` : ""}
        </div>
      </div>`;
    document.body.appendChild(el);
    void el.offsetWidth;   // cho hiệu ứng mở chạy
    el.classList.add("show");
    const xong = kq => { el.remove(); resolve(kq); };
    const oLoi = el.querySelector("[data-loi]");
    const baoLoi = s => { oLoi.innerHTML = s; oLoi.style.display = s ? "" : "none"; };
    el.querySelectorAll('[data-nut="dong"]').forEach(b => b.onclick = () => xong(null));
    const nutBoQua = el.querySelector('[data-nut="boqua"]');
    if (nutBoQua) nutBoQua.onclick = () => xong("boqua");
    const nutLuu = el.querySelector('[data-nut="luu"]');
    if (nutLuu) nutLuu.onclick = async () => {
      const dsCap = [], daDung = new Map(), loi = [];
      el.querySelectorAll("input[data-i]").forEach(inp => {
        const x = ds[+inp.dataset.i], ma = inp.value.trim().toUpperCase();
        if (!ma || ma === String(x.ma || "").toUpperCase()) return;
        if (/^KD_/.test(ma)) { loi.push(`${escBH(x.ten)}: "${escBH(ma)}" là mã tự sinh của KiotViet, không phải mã MISA`); return; }
        dsCap.push({ khoa: x.khoa, ten: x.ten, ma: ma });
      });
      el.querySelectorAll("input[data-i]").forEach(inp => {
        const ma = inp.value.trim().toUpperCase(), x = ds[+inp.dataset.i];
        if (!ma) return;
        if (daDung.has(ma)) loi.push(`Mã ${escBH(ma)} bị nhập cho 2 người: ${escBH(daDung.get(ma))} và ${escBH(x.ten)}`);
        else daDung.set(ma, x.ten);
      });
      if (loi.length) { baoLoi("⚠️ " + loi.join("<br>⚠️ ")); return; }
      baoLoi("");
      nutLuu.disabled = true;
      nutLuu.textContent = "⏳ Đang lưu...";
      const loiLuu = dsCap.length ? await luuMaNhanVienMisa(dsCap) : [];
      try { await napDanhMucBanHangMisa(); } catch (e) {}
      if (loiLuu.length) {
        nutLuu.disabled = false;
        nutLuu.textContent = `💾 Lưu mã${tuyChon.khiXuat ? " & xuất file" : ""}`;
        baoLoi("⚠️ Chưa lưu được: " + loiLuu.map(escBH).join("<br>⚠️ "));
        return;
      }
      if (typeof hienThiToast === "function" && dsCap.length) hienThiToast(`✅ Đã lưu mã MISA cho ${dsCap.length} nhân viên bán hàng`);
      xong("luu");
    };
  });
}

/** Nút "Mã NV bán hàng (MISA)" của Bước 3 — xem / sửa mã cho người bán của chuyến (ngày) đang chọn */
async function moMaNhanVienBanHangMisa() {
  const dsDong = (typeof danhSachDongMisa !== "undefined" && Array.isArray(danhSachDongMisa)) ? danhSachDongMisa : [];
  if (!dsDong.length) { alert("⚠️ Chọn chuyến xe (hoặc ngày) có dữ liệu trước để xem người bán."); return; }
  await napDanhMucBanHangMisa();
  await moBangMaNhanVienMisa(dsDong, {});
}

// Định khoản của mã hàng; KiotViet ghi "05102" còn Danh mục ghi "5102" (hoặc ngược lại) vẫn khớp
function timDinhKhoanBH(dm, maHang) {
  const ma = khoaMaHangBH(maHang);
  if (!ma) return null;
  if (dm.dinhKhoan.has(ma)) return dm.dinhKhoan.get(ma);
  const boSo0 = ma.replace(/^0+(?=.)/, "");
  if (dm.dinhKhoan.has(boSo0)) return dm.dinhKhoan.get(boSo0);
  for (const [k, v] of dm.dinhKhoan) if (k.replace(/^0+(?=.)/, "") === boSo0) return v;
  return null;
}

/**
 * Định khoản 1 dòng của Bước 3 ĐÚNG NHƯ file bán hàng tải về (taoWorkbookBanHangMisa — cột AB, AH, AI):
 *   • Hàng khuyến mại (mã KM đổi sang mã thật, tiền 0): Nợ 13881 – Có TK doanh thu của mã thật
 *   • Hàng trả lại: Nợ 5212 – Có 1311 (giữ bút toán của Bước 3)
 *   • Còn lại: Nợ 1311 – Có TK doanh thu của mặt hàng (51111 / 51112 … theo Danh mục "Định khoản hàng hoá")
 * Trả về { tkNo, tkCo, maHang, tenHang, laKM } — tkCo rỗng = mã hàng chưa có định khoản (file để trống cột AJ);
 * null khi chưa nạp được Danh mục (giữ nguyên định khoản cũ trên màn hình). r.tkNo / r.tkCo là định khoản gốc của Bước 3.
 */
function dinhKhoanDongBanHangMisa(r, dm) {
  dm = dm || danhMucBanHangMisa;
  if (!r || !dm || !dm.dinhKhoan || !dm.dinhKhoan.size) return null;
  let maHang = String(r.maHang || "").trim(), tenHang = String(r.tenHang || "").trim();
  const doiMa = dm.doiMaKM.get(khoaMaHangBH(maHang));
  if (doiMa) { maHang = doiMa.ma; tenHang = doiMa.ten || tenHang; }
  const tongTien = Math.round(parseFloat(r.thanhTien) || 0);
  const laKM = (!!doiMa || !!r.laKM) && tongTien === 0;
  const dk = timDinhKhoanBH(dm, maHang);
  if (dk && String(dk.ma_hang || "").trim() && khoaMaHangBH(dk.ma_hang) !== khoaMaHangBH(maHang)) maHang = String(dk.ma_hang).trim();
  const tkDoanhThu = String((dk && dk.tk_doanh_thu) || "").trim();
  const laTraLai = String(r.tkNo || "") === "5212";
  return {
    tkNo: laKM ? TK_NO_HANG_KM_MISA : (laTraLai ? "5212" : TK_NO_BAN_HANG_MISA),
    tkCo: laTraLai ? String(r.tkCo || "") : tkDoanhThu,
    maHang: maHang,
    tenHang: tenHang,
    laKM: laKM
  };
}

/**
 * Ghi định khoản của file MISA vào dòng của bảng Bước 3 (tkNoMisa, tkCoMisa) để màn hình hiển thị giống file tải về.
 * Không sửa r.tkNo / r.tkCo gốc (file bán hàng vẫn tự tính như cũ).
 */
function apDinhKhoanDongBanHangMisa(r) {
  const dk = dinhKhoanDongBanHangMisa(r);
  if (!dk) return r;
  r.tkNoMisa = dk.tkNo;
  r.tkCoMisa = dk.tkCo;
  r.maHangMisa = dk.maHang;
  r.tenHangMisa = dk.tenHang;
  r.chuaDinhKhoan = !dk.tkCo;
  return r;
}

// dd/mm/yyyy (hoặc yyyy-mm-dd) → số ngày của Excel; không đọc được → null
function soNgayExcelBH(v) {
  const s = String(v || "").trim();
  let ngay, thang, nam;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { nam = +m[1]; thang = +m[2]; ngay = +m[3]; }
  else {
    m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
    if (!m) return null;
    ngay = +m[1]; thang = +m[2]; nam = +m[3];
  }
  if (thang < 1 || thang > 12 || ngay < 1 || ngay > 31) return null;
  return Math.round(Date.UTC(nam, thang - 1, ngay) / 86400000) + 25569;
}

function soChungTuTiepBH(so) {
  const s = String(so);
  return s.slice(0, s.length - 5) + String((parseInt(s.slice(-5), 10) || 0) + 1).padStart(5, "0");
}

/**
 * Dựng workbook đúng mẫu MISA từ các dòng của Bước 3 (danhSachDongMisa).
 * Trả về { wb, soDong, soChungTu, soDau, soCuoi, tongTruocThue, tongThue, chuaDinhKhoan, chuaThueSuat, thieuMaNV }
 */
function taoWorkbookBanHangMisa(dsDong) {
  const dm = danhMucBanHangMisa || { dinhKhoan: new Map(), doiMaKM: new Map(), nhanVien: new Map() };
  const C = ten => XLSX.utils.decode_col(ten);
  const soCot = TIEU_DE_BAN_HANG_MISA.length;
  const soTK = v => /^\d+$/.test(String(v)) ? Number(v) : v;   // tài khoản dạng số như file mẫu
  const xeDangChon = (typeof dotHienTai !== "undefined" && dotHienTai && dotHienTai.xe) || "";

  // Dòng "HĐ — Hóa Đơn GTGT" của KiotViet chỉ ghi chú khách lấy hoá đơn (không phải hàng hoá, 0 đ) → không đưa vào file
  const laDongGhiChuHD = r => khoaMaHangBH(r.maHang).normalize("NFC") === MA_DONG_HOA_DON_GTGT_MISA && Math.round(parseFloat(r.thanhTien) || 0) === 0;
  const soDongGoc = dsDong.length;
  dsDong = dsDong.filter(r => !laDongGhiChuHD(r));

  // Các dòng của cùng 1 hoá đơn đứng liền nhau (công thức cột H, I chạy số theo cột Z), giữ thứ tự hoá đơn
  const theoHD = new Map();
  dsDong.forEach(r => {
    const k = String(r.soCT || "");
    if (!theoHD.has(k)) theoHD.set(k, []);
    theoHD.get(k).push(r);
  });
  const ds = [];
  theoHD.forEach(nhom => nhom.forEach(r => ds.push(r)));

  const kq = { soDong: ds.length, soDongBoHD: soDongGoc - ds.length, soChungTu: theoHD.size, tongTruocThue: 0, tongThue: 0, chuaDinhKhoan: new Map(), chuaThueSuat: new Map(), thieuMaNV: new Set() };
  const aoa = [TIEU_DE_BAN_HANG_MISA.slice()];
  let soBH = SO_BAT_DAU_BH_MISA, soPXK = SO_BAT_DAU_PXK_MISA;

  ds.forEach((r, i) => {
    const dong = new Array(soCot).fill(null);
    const maHD = String(r.soCT || "").trim();
    if (i > 0 && maHD !== String(ds[i - 1].soCT || "").trim()) { soBH = soChungTuTiepBH(soBH); soPXK = soChungTuTiepBH(soPXK); }

    // Hàng khuyến mại: mã KM → mã hàng thật (Danh mục "Đổi mã khuyến mãi")
    let maHang = String(r.maHang || "").trim(), tenHang = String(r.tenHang || "").trim();
    const doiMa = dm.doiMaKM.get(khoaMaHangBH(maHang));
    if (doiMa) { maHang = doiMa.ma; tenHang = doiMa.ten || tenHang; }
    const tongTien = Math.round(parseFloat(r.thanhTien) || 0);      // tiền dòng hàng KiotViet (đã gồm thuế)
    const soLuong = parseFloat(r.soLuong) || 0;
    const laKM = (!!doiMa || !!r.laKM) && tongTien === 0;

    const dk = timDinhKhoanBH(dm, maHang);
    // Mã chỉ khác số 0 ở đầu ("05301" ↔ "5301") → ghi theo mã trong Danh mục Định khoản (mã dùng trên MISA)
    if (dk && String(dk.ma_hang || "").trim() && khoaMaHangBH(dk.ma_hang) !== khoaMaHangBH(maHang)) maHang = String(dk.ma_hang).trim();
    const tkDoanhThu = String((dk && dk.tk_doanh_thu) || "").trim();
    const coThue = !!dk && dk.thue_suat !== null && dk.thue_suat !== undefined && dk.thue_suat !== "" && !isNaN(parseFloat(dk.thue_suat));
    if (!tkDoanhThu) kq.chuaDinhKhoan.set(maHang, tenHang);
    else if (!coThue) kq.chuaThueSuat.set(maHang, tenHang);
    const thueSuat = (laKM || !coThue) ? 0 : parseFloat(dk.thue_suat);
    const truocThue = thueSuat > 0 ? Math.round(tongTien / (1 + thueSuat / 100)) : tongTien;
    const tienThue = tongTien - truocThue;
    kq.tongTruocThue += truocThue;
    kq.tongThue += tienThue;

    const nguoiBan = r.nguoiBan || r.nguoiBanQT || "";
    const maNV = dm.nhanVien.get(khoaTenNVBH(nguoiBan)) || "";
    if (!maNV && nguoiBan) kq.thieuMaNV.add(khoaTenNVBH(nguoiBan));

    const tenKH = String(r.tenKH || "").trim();
    const ngay = soNgayExcelBH(r.ngayHT);
    // Hàng trả lại (Nợ 5212 – Có 1311) giữ đúng bút toán của Bước 3; còn lại Nợ 1311 – Có TK doanh thu của mặt hàng
    const laTraLai = String(r.tkNo || "") === "5212";

    // Chữ cột theo mẫu MISA 69 cột (đã bỏ cột "Số xe" — số xe ghi ở BI "Mã thống kê")
    dong[C("A")] = "Bán hàng hóa trong nước";
    dong[C("B")] = PHUONG_THUC_TT_BAN_HANG_MISA;
    dong[C("C")] = "Có";
    dong[C("D")] = "Không";
    dong[C("F")] = ngay !== null ? ngay : (r.ngayHT || null);
    dong[C("G")] = ngay !== null ? ngay : (r.ngayCT || r.ngayHT || null);
    dong[C("H")] = soBH;
    dong[C("I")] = soPXK;
    dong[C("N")] = r.maKH || null;
    dong[C("O")] = tenKH || null;
    dong[C("V")] = `Bán hàng cho khách hàng ${tenKH}`.trim();
    dong[C("X")] = maNV || null;
    dong[C("Z")] = maHD || null;
    dong[C("AB")] = maHang || null;
    dong[C("AD")] = tenHang || null;
    dong[C("AE")] = "Không";
    dong[C("AF")] = laKM ? "Có" : "Không";
    dong[C("AH")] = soTK(laKM ? TK_NO_HANG_KM_MISA : (laTraLai ? r.tkNo : TK_NO_BAN_HANG_MISA));
    dong[C("AI")] = laTraLai ? soTK(r.tkCo) : (tkDoanhThu ? soTK(tkDoanhThu) : null);
    dong[C("AJ")] = r.dvt || null;
    dong[C("AK")] = soLuong;
    dong[C("AL")] = soLuong ? Math.round(truocThue / soLuong) : 0;
    dong[C("AM")] = truocThue;
    dong[C("AU")] = thueSuat;
    dong[C("AW")] = tienThue;
    dong[C("AX")] = soTK(TK_THUE_GTGT_BAN_HANG_MISA);
    dong[C("BB")] = "Không";
    dong[C("BI")] = r.xe || xeDangChon || null;   // Mã thống kê = số xe
    dong[C("BK")] = "Không";
    dong[C("BL")] = String((dk && dk.ma_kho) || "").trim() || MA_KHO_MAC_DINH_MISA;
    const tkGiaVon = String((dk && dk.tk_gia_von) || "").trim();
    dong[C("BM")] = tkGiaVon ? soTK(tkGiaVon) : null;
    dong[C("BN")] = soTK(String((dk && dk.tk_kho) || "").trim() || TK_KHO_MAC_DINH_MISA);
    aoa.push(dong);
  });
  kq.soDau = SO_BAT_DAU_BH_MISA;
  kq.soCuoi = soBH;

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const o = (r, c) => ws[XLSX.utils.encode_cell({ r: r, c: c })];

  // Tiêu đề dòng 1: nền xanh nhạt, chữ đậm, tự xuống dòng (như file mẫu)
  for (let c = 0; c < soCot; c++) {
    const td = o(0, c);
    if (td) td.s = { font: { bold: true, sz: 10 }, fill: { patternType: "solid", fgColor: { rgb: "DCFCE7" } }, alignment: { wrapText: true, vertical: "bottom" } };
  }
  const cotNgay = [C("F"), C("G")], cotTien = [C("AM"), C("AW")], cotSoCT = C("H"), cotSoPXK = C("I");
  for (let r = 1; r < aoa.length; r++) {
    for (let c = 0; c < soCot; c++) {
      const d = o(r, c);
      if (!d) continue;
      d.s = { font: { sz: 10 } };
      if (typeof d.v !== "number") continue;
      if (cotNgay.indexOf(c) >= 0) { d.z = "dd/mm/yyyy"; d.s.numFmt = "dd/mm/yyyy"; }
      else if (cotTien.indexOf(c) >= 0) { d.z = "#,##0"; d.s.numFmt = "#,##0"; }
    }
    const n = r + 1;   // số dòng trên Excel
    if (r === 1) {
      // Ô H2, I2 tô vàng: SỐ BẮT ĐẦU — kế toán sửa để nối tiếp sổ MISA, các dòng dưới tự chạy
      [[cotSoCT, `★ NHẬP SỐ BẮT ĐẦU ở ô này (ví dụ BH00050 để nối tiếp sổ MISA). Các dòng dưới tự chạy.`],
       [cotSoPXK, `★ NHẬP SỐ BẮT ĐẦU ở ô này (ví dụ PXK00050). Các dòng dưới tự chạy.`]].forEach(x => {
        const d = o(r, x[0]);
        d.s = { font: { bold: true, sz: 10 }, fill: { patternType: "solid", fgColor: { rgb: "FDE047" } } };
        d.c = [{ a: "TMH", t: x[1] }];
        d.c.hidden = true;
      });
    } else {
      // Cùng hoá đơn (cột Z) với dòng trên → giữ số; khác hoá đơn → số trên + 1 (đúng công thức file mẫu)
      o(r, cotSoCT).f = `IF(Z${n}=Z${n - 1},H${n - 1},LEFT(H${n - 1},LEN(H${n - 1})-5)&TEXT(RIGHT(H${n - 1},5)+1,"00000"))`;
      o(r, cotSoPXK).f = `IF(Z${n}=Z${n - 1},I${n - 1},LEFT(I${n - 1},LEN(I${n - 1})-5)&TEXT(RIGHT(I${n - 1},5)+1,"00000"))`;
    }
  }
  ws["!cols"] = DO_RONG_COT_BAN_HANG_MISA.map(w => ({ wch: w }));
  ws["!rows"] = [{ hpt: 38.25 }];
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: aoa.length - 1, c: soCot - 1 } }) };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, TEN_SHEET_BAN_HANG_MISA);
  kq.wb = wb;
  return kq;
}

/** Nút "Tải File Excel Import MISA" của Bước 3 — xuất file bán hàng đúng mẫu MISA */
async function xuatFileBanHangTheoMauMisa() {
  const dsDong = (typeof danhSachDongMisa !== "undefined" && Array.isArray(danhSachDongMisa)) ? danhSachDongMisa : [];
  if (!dsDong.length) { alert("⚠️ Không có dòng dữ liệu nào để xuất file MISA!"); return; }
  const tien = n => (typeof formatTien === "function") ? formatTien(n) : String(Math.round(n));
  const lietKe = map => Array.from(map.entries()).slice(0, 10).map(x => `• ${x[0]} — ${x[1]}`).join("\n") + (map.size > 10 ? `\n… và ${map.size - 10} mã khác` : "");

  try {
    await napDanhMucBanHangMisa();
    // Cột X "Mã nhân viên bán hàng": người bán chưa có mã MISA → bảng nhập mã (lưu Danh mục trên máy chủ) trước khi xuất
    if (typeof document !== "undefined" && dsNhanVienBanHangMisa(dsDong).ds.some(x => !x.ma)) {
      const chon = await moBangMaNhanVienMisa(dsDong, { khiXuat: true });
      if (!chon) return;   // bấm Huỷ → không xuất
    }
    const kq = taoWorkbookBanHangMisa(dsDong);
    if (!kq.soDong) { alert("⚠️ Không có dòng hàng hoá nào để xuất file MISA (chỉ có dòng ghi chú \"HĐ — Hóa Đơn GTGT\")."); return; }
    if (kq.chuaDinhKhoan.size && !confirm(`⚠️ ${kq.chuaDinhKhoan.size} mã hàng CHƯA có định khoản (TK doanh thu, TK giá vốn, thuế GTGT) trong Danh mục "Định khoản hàng hoá":\n\n` +
      lietKe(kq.chuaDinhKhoan) + `\n\nCác dòng này sẽ để trống TK doanh thu / TK giá vốn và thuế 0% — cần điền tay trên Excel (hoặc bổ sung Danh mục rồi xuất lại).\n\nBấm [OK] để vẫn xuất file, [Hủy] để bổ sung Danh mục trước.`)) return;

    const cheDoNgay = (typeof cheDoNgayMisa !== "undefined") ? cheDoNgayMisa : null;
    const dot = (typeof dotHienTai !== "undefined") ? dotHienTai : null;
    const tenFile = cheDoNgay
      ? `MISA_BanHang_TatCaXe_Ngay_${cheDoNgay.ngay.replace(/\//g, '-')}_${cheDoNgay.dsDot.length}xe.xlsx`
      : `MISA_BanHang_${dot ? String(dot.xe || '').replace(/[^a-zA-Z0-9]/g, '_') : 'TMH'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(kq.wb, tenFile, { compression: true });   // 69 cột → nén cho file gọn

    if (typeof hienThiToast === "function") hienThiToast("📥 Đã xuất file Excel bán hàng theo mẫu MISA!");
    alert(`✅ ĐÃ XUẤT FILE BÁN HÀNG THEO MẪU MISA!\n\n• Tên file: ${tenFile}\n• ${kq.soDong} dòng hàng — ${kq.soChungTu} chứng từ (${kq.soDau}${kq.soChungTu > 1 ? " … " + kq.soCuoi : ""})\n` +
      `• Tiền hàng trước thuế: ${tien(kq.tongTruocThue)} đ · Thuế GTGT: ${tien(kq.tongThue)} đ · Tổng: ${tien(kq.tongTruocThue + kq.tongThue)} đ\n\n` +
      `📌 Ô H2 và I2 (tô vàng) là SỐ BẮT ĐẦU của Số chứng từ / Số phiếu xuất — sửa cho nối tiếp sổ MISA, các dòng dưới tự chạy theo công thức.\n` +
      `📌 Mọi hoá đơn: "Chưa thu tiền" — Nợ 1311; tiền khách trả nhập sau bằng Phiếu thu ở cuối trang.\n` +
      `📌 Số xe ghi ở cột BI "Mã thống kê"; cột X "Mã nhân viên bán hàng" theo Danh mục Nhân viên kinh doanh.` +
      (kq.soDongBoHD ? `\n📌 Đã loại ${kq.soDongBoHD} dòng "HĐ — Hóa Đơn GTGT" (không phải hàng hoá) khỏi file.` : "") +
      (kq.chuaThueSuat.size ? `\n\n⚠️ ${kq.chuaThueSuat.size} mã hàng chưa có thuế suất trong Danh mục "Định khoản hàng hoá" (đang để 0%):\n${lietKe(kq.chuaThueSuat)}` : "") +
      (kq.thieuMaNV.size ? `\n\nℹ️ Cột X "Mã nhân viên bán hàng" để trống với ${kq.thieuMaNV.size} nhân viên chưa có mã MISA (NVKD…) — bấm nút "👤 Mã NV bán hàng (MISA)" để nhập.` : ""));
  } catch (err) {
    alert("Lỗi xuất file Excel: " + ((err && err.message) || err));
  }
}
