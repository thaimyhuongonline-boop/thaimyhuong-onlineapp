/* ====================================================================
 * danh_muc_dieu_xe.js — ĐỒNG BỘ DANH MỤC XE & NHÂN SỰ ĐIỀU XE LÊN SUPABASE
 * THÁI MỸ HƯƠNG — dùng cho Bước 1 (Điều xe & Phiếu xuất kho)
 * ====================================================================
 * Trước đây nút "+ Thêm / Sửa / Xoá" ở Bước 1 chỉ ghi vào bộ nhớ trình duyệt của máy
 * đang dùng → đổi máy / đăng nhập lại / mở trang Danh Mục là mất, phải tạo lại.
 * Nay danh sách được đồng bộ 2 chiều với đúng các bảng của trang Danh Mục:
 *   • Xe vận chuyển  → bảng danh_sach_xe (ma_xe, loai_xe, ...)
 *   • Tài xế / NV giao hàng / NV thu tiền → bảng nv_giao_hang_tai_xe (ma_nv, ho_ten, vai_tro, ...)
 * Cách đồng bộ: so danh sách trên máy với "ảnh chụp" danh sách máy chủ ở lần đồng bộ trước
 *   - mục mới có trên máy            → thêm lên máy chủ
 *   - mục bị xoá / đổi tên trên máy  → xoá / sửa trên máy chủ
 *   - mục máy khác thêm / xoá        → cập nhật về máy này
 * Code cũ của Bước 1 giữ nguyên (vẫn ghi vào bộ nhớ máy như trước), chỉ cần gọi DMDX.dongBo()
 * sau mỗi lần thay đổi. Mất mạng / máy chủ chưa có bảng thì vẫn dùng được trên máy này và
 * lần đồng bộ sau sẽ tự ghi bù lên.
 * ==================================================================== */
(function () {
  const KHOA_XE = "tmh_danh_muc_xe";                  // [chuỗi hiển thị] — Bước 1 & các trang cũ dùng
  const KHOA_NV = "tmh_danh_muc_nv_giao_hang_tai_xe"; // dùng chung với trang Danh Mục
  const KHOA_ANH_XE = "tmh_dmdx_anh_xe";              // danh sách máy chủ ở lần đồng bộ trước
  const KHOA_ANH_NV = "tmh_dmdx_anh_nv";
  const BANG_XE = "danh_sach_xe";
  const BANG_NV = "nv_giao_hang_tai_xe";
  const GHI_CHU_THEM = "Thêm nhanh ở Bước 1 (điều xe)";

  function docJSON(k, macDinh) {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "null");
      return v == null ? macDinh : v;
    } catch (e) { return macDinh; }
  }
  function ghiJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  const hoa = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ").toUpperCase();
  const loiChu = e => (e && (e.message || e.details || e.hint)) || String(e || "lỗi");

  // ---------- Xe ----------
  function hienThiXe(r) {
    const ma = String(r.ma_xe || "").trim();
    const loai = String(r.loai_xe || "").trim();
    return loai && hoa(loai) !== hoa(ma) ? `${ma} (${loai})` : ma;
  }
  // "XE20 (TẢI 2 TẤN)" → { ma_xe: "XE20", loai_xe: "TẢI 2 TẤN" }; tên khác → cả chuỗi là mã xe
  function tachTenXe(s) {
    const t = String(s || "").trim();
    const m = t.match(/^(.+?)\s*\(([^()]+)\)\s*$/);
    return m ? { ma_xe: m[1].trim(), loai_xe: m[2].trim() } : { ma_xe: t, loai_xe: "" };
  }

  // ---------- Vai trò nhân sự ----------
  function vaiTroTuChu(s) {
    const t = String(s || "").toLowerCase();
    return {
      tx: t.includes("tài xế"),
      gh: t.includes("giao hàng") || t.includes("lơ xe"),
      tt: t.includes("thu tiền") || t.includes("kế toán")
    };
  }
  function chuVaiTro(f) {
    const ds = [];
    if (f.tx) ds.push("Tài xế");
    if (f.gh) ds.push("Giao hàng");
    if (f.tt) ds.push("Thu tiền");
    if (ds.length === 1) return f.tx ? "Tài xế" : (f.gh ? "Nhân viên giao hàng" : "Nhân viên thu tiền");
    return ds.join(" & ");
  }
  // Gộp thêm vai trò mới vào vai trò cũ (giữ nguyên cách ghi cũ nếu không có vai trò nào mới)
  function gopVaiTro(cu, moi) {
    const a = vaiTroTuChu(cu), b = vaiTroTuChu(moi);
    const g = { tx: a.tx || b.tx, gh: a.gh || b.gh, tt: a.tt || b.tt };
    if (g.tx === a.tx && g.gh === a.gh && g.tt === a.tt) return String(cu || "").trim();
    return chuVaiTro(g);
  }
  function chuanVaiTro(s) {
    const f = vaiTroTuChu(s);
    return (f.tx || f.gh || f.tt) ? chuVaiTro(f) : String(s || "").trim();
  }
  const tenCuaDong = r => String(r.ten_nv || r.ten || r.ho_ten || "").trim();
  const vaiTroCuaDong = r => String(r.vi_tri || r.chuc_vu || r.vai_tro || "").trim();
  const khoaDongNV = r => r.ma_nv ? hoa(r.ma_nv) : (r.id != null && r.id !== "" ? "#" + r.id : "");
  function locDongNV(q, s) {
    return s.ma_nv ? q.eq("ma_nv", s.ma_nv) : q.eq("id", s.id);
  }
  // Dòng nhân sự ghi trên máy: đủ cả tên cột của trang Danh Mục (ho_ten, vai_tro)
  // lẫn tên cũ của Bước 1 / các trang cũ (ten_nv, ten, vi_tri)
  function chuanHoaDongNV(r) {
    return Object.assign({}, r, { ten_nv: r.ho_ten, ten: r.ho_ten, vi_tri: r.vai_tro || "" });
  }
  function maNVMoi(vaiTro, dsMa) {
    const f = vaiTroTuChu(vaiTro);
    const tien = f.tx ? "TX" : (f.gh ? "GH" : "TT");
    let max = 0;
    dsMa.forEach(m => {
      const t = hoa(m);
      if (t.indexOf(tien) !== 0) return;
      const so = t.slice(tien.length);
      if (/^[0-9]+$/.test(so)) max = Math.max(max, parseInt(so, 10));
    });
    return tien + String(max + 1).padStart(2, "0");
  }
  async function themNVLenMayChu(row, dsMa) {
    for (let lan = 0; lan < 6; lan++) {
      const ma = maNVMoi(row.vai_tro, dsMa);
      const { error } = await sb.from(BANG_NV).insert([{
        ma_nv: ma, ho_ten: row.ho_ten, vai_tro: row.vai_tro, so_dien_thoai: row.so_dien_thoai || "", ghi_chu: row.ghi_chu || GHI_CHU_THEM
      }]);
      dsMa.push(ma);
      if (!error) return { ok: true, ma: ma };
      if (String(error.code) !== "23505") return { ok: false, error: error }; // 23505: trùng mã do máy khác vừa thêm → thử mã kế tiếp
    }
    return { ok: false, error: { message: "Không tạo được mã nhân viên mới" } };
  }

  // Chặn xoá hàng loạt khi danh sách trên máy bị mất bất thường (chỉ xoá khi người dùng xoá từng mục)
  const xoaHopLe = (soXoa, soTruoc, soTrenMay) => soXoa > 0 && soTrenMay > 0 && soXoa <= Math.max(3, Math.floor(soTruoc / 2));

  // ==================== ĐỒNG BỘ XE ====================
  async function taiXeMayChu() {
    const { data, error } = await sb.from(BANG_XE).select("*");
    if (error) throw error;
    return (data || []).filter(r => r && r.ma_xe);
  }

  async function dongBoXe(goiY) {
    let S;
    try { S = await taiXeMayChu(); } catch (e) { return { ok: false, loi: loiChu(e) }; }
    const L = docJSON(KHOA_XE, []).map(x => String(x || "").trim()).filter(Boolean);
    const anh = docJSON(KHOA_ANH_XE, null);
    const lanDau = !Array.isArray(anh);
    const P = lanDau ? [] : anh;
    const setL = new Set(L.map(hoa));
    const setP = new Set(P.map(x => hoa(x.hienThi)));
    const theoHT = new Map(S.map(r => [hoa(hienThiXe(r)), r]));
    const theoMa = new Map(S.map(r => [hoa(r.ma_xe), r]));
    const loi = [], chuaGhi = [];
    const boQua = new Set();

    // Sửa tên xe: cập nhật đúng dòng cũ (giữ biển số, tài xế mặc định... đã khai ở trang Danh Mục)
    if (goiY && goiY.doiTenXe) {
      const cu = hoa(goiY.doiTenXe.cu), moi = String(goiY.doiTenXe.moi || "").trim();
      const r = theoHT.get(cu);
      if (r && moi) {
        let t = tachTenXe(moi);
        const trung = theoMa.get(hoa(t.ma_xe));
        if (trung && trung !== r) t = { ma_xe: moi, loai_xe: "" };
        const { error } = await sb.from(BANG_XE).update({ ma_xe: t.ma_xe, loai_xe: t.loai_xe }).eq("ma_xe", r.ma_xe);
        if (error) loi.push(`Sửa xe "${goiY.doiTenXe.cu}": ${loiChu(error)}`);
        boQua.add(cu);
        boQua.add(hoa(moi));
      }
    }

    // Xe mới thêm trên máy này → thêm lên máy chủ
    for (const ht of L) {
      const k = hoa(ht);
      if (boQua.has(k) || setP.has(k) || theoHT.has(k)) continue;
      let t = tachTenXe(ht);
      if (theoMa.has(hoa(t.ma_xe))) {
        // Lần đồng bộ đầu: đây là danh sách mặc định cũ trên máy, máy chủ đã có xe này rồi
        if (lanDau) continue;
        t = { ma_xe: ht, loai_xe: "" };
        if (theoMa.has(hoa(ht))) continue;
      }
      if (t.ma_xe.length > 50) { loi.push(`Tên xe "${ht}" quá dài (tối đa 50 ký tự phần mã xe)`); chuaGhi.push(ht); continue; }
      const { error } = await sb.from(BANG_XE).insert([{ ma_xe: t.ma_xe, bien_so: "", loai_xe: t.loai_xe, tai_xe_mac_dinh: "", ghi_chu: GHI_CHU_THEM }]);
      if (error && String(error.code) !== "23505") { loi.push(`Thêm xe "${ht}": ${loiChu(error)}`); chuaGhi.push(ht); continue; }
      theoMa.set(hoa(t.ma_xe), { ma_xe: t.ma_xe, loai_xe: t.loai_xe });
    }

    // Xe đã xoá trên máy này → xoá trên máy chủ
    const canXoa = P.filter(x => !boQua.has(hoa(x.hienThi)) && !setL.has(hoa(x.hienThi)) && theoHT.has(hoa(x.hienThi)));
    if (xoaHopLe(canXoa.length, P.length, L.length)) {
      for (const x of canXoa) {
        const { error } = await sb.from(BANG_XE).delete().eq("ma_xe", theoHT.get(hoa(x.hienThi)).ma_xe);
        if (error) loi.push(`Xoá xe "${x.hienThi}": ${loiChu(error)}`);
      }
    }

    try { S = await taiXeMayChu(); } catch (e) { return { ok: false, loi: loiChu(e) }; }
    const dsMoi = S.slice()
      .sort((a, b) => String(a.ma_xe).localeCompare(String(b.ma_xe), "vi", { numeric: true }))
      .map(hienThiXe);
    // Xe thêm trên máy này mà chưa ghi được lên máy chủ: giữ lại, lần sau ghi bù
    chuaGhi.forEach(ht => { if (!dsMoi.some(x => hoa(x) === hoa(ht))) dsMoi.push(ht); });
    if (dsMoi.length) ghiJSON(KHOA_XE, dsMoi);
    ghiJSON(KHOA_ANH_XE, S.map(r => ({ hienThi: hienThiXe(r), ma_xe: r.ma_xe, bien_so: String(r.bien_so || "").trim() })));
    return { ok: !loi.length, loi: loi.join("\n"), soLuong: S.length };
  }

  // Biển số xe (cột "Biển Số Xe" ở trang Danh Mục) theo tên xe trong danh sách của Bước 1,
  // lấy từ lần đồng bộ gần nhất → ô chọn xe hiển thị biển số cho nhân sự dễ đọc.
  // Trả về hàm tra cứu: layBienSo("XE01 (HĐ1 SÁNG)") → "HĐ1 SÁNG" ("" nếu chưa khai biển số).
  function bienSoTheoXe() {
    const map = new Map();
    const anh = docJSON(KHOA_ANH_XE, []);
    (Array.isArray(anh) ? anh : []).forEach(x => {
      if (x && x.hienThi && x.bien_so) map.set(hoa(x.hienThi), String(x.bien_so).trim());
    });
    return ht => map.get(hoa(ht)) || "";
  }

  // ==================== ĐỒNG BỘ NHÂN SỰ ====================
  async function taiNVMayChu() {
    const { data, error } = await sb.from(BANG_NV).select("*");
    if (error) throw error;
    return (data || []).filter(r => r && String(r.ho_ten || "").trim());
  }

  async function dongBoNV() {
    let S;
    try { S = await taiNVMayChu(); } catch (e) { return { ok: false, loi: loiChu(e) }; }
    const L = docJSON(KHOA_NV, []).filter(r => r && tenCuaDong(r));
    const anh = docJSON(KHOA_ANH_NV, null);
    const P = Array.isArray(anh) ? anh : [];
    const theoKhoaP = new Map(P.map(x => [x.khoa, x]));
    const theoKhoaS = new Map(S.map(r => [khoaDongNV(r), r]));
    const theoTenS = new Map(S.map(r => [hoa(r.ho_ten), r]));
    const dsMa = S.map(r => r.ma_nv).filter(Boolean);
    const loi = [], chuaGhi = [];
    const khoaTrenMay = new Set();

    for (const r of L) {
      const ten = tenCuaDong(r), vaiTro = vaiTroCuaDong(r);
      const khoa = khoaDongNV(r);
      if (khoa) {
        khoaTrenMay.add(khoa);
        const p = theoKhoaP.get(khoa), s = theoKhoaS.get(khoa);
        if (p) {
          if (!s) continue; // máy khác đã xoá
          const capNhat = {};
          if (hoa(ten) !== hoa(p.ho_ten)) capNhat.ho_ten = ten;           // sửa tên ở Bước 1
          if (vaiTro !== String(p.vai_tro || "").trim()) capNhat.vai_tro = chuanVaiTro(vaiTro); // thêm vai trò
          if (!Object.keys(capNhat).length) continue;
          const { error } = await locDongNV(sb.from(BANG_NV).update(capNhat), s);
          if (error) loi.push(`Cập nhật "${ten}": ${loiChu(error)}`);
        } else if (!s && r.ma_nv && !theoTenS.has(hoa(ten))) {
          // Có mã nhưng máy chủ chưa có (ví dụ thêm ở trang Danh Mục lúc mất mạng) → ghi lên
          const { error } = await sb.from(BANG_NV).insert([{
            ma_nv: r.ma_nv, ho_ten: ten, vai_tro: chuanVaiTro(vaiTro), so_dien_thoai: r.so_dien_thoai || "", ghi_chu: r.ghi_chu || ""
          }]);
          if (error) { loi.push(`Thêm "${ten}": ${loiChu(error)}`); chuaGhi.push(r); }
          else { dsMa.push(r.ma_nv); theoTenS.set(hoa(ten), { ma_nv: r.ma_nv, ho_ten: ten, vai_tro: chuanVaiTro(vaiTro) }); }
        }
        continue;
      }
      // Chưa có mã: vừa thêm nhanh ở Bước 1 (hoặc trang cũ) → ghi lên máy chủ
      const s = theoTenS.get(hoa(ten));
      if (s) {
        const vtMoi = gopVaiTro(s.vai_tro, vaiTro);
        if (vtMoi !== String(s.vai_tro || "").trim()) {
          const { error } = s.ma_nv || s.id != null
            ? await locDongNV(sb.from(BANG_NV).update({ vai_tro: vtMoi }), s)
            : { error: null };
          if (error) { loi.push(`Cập nhật "${ten}": ${loiChu(error)}`); chuaGhi.push(r); }
          else s.vai_tro = vtMoi;
        }
        continue;
      }
      const vt = chuanVaiTro(vaiTro);
      const kq = await themNVLenMayChu({ ho_ten: ten, vai_tro: vt, so_dien_thoai: r.so_dien_thoai, ghi_chu: r.ghi_chu }, dsMa);
      if (kq.ok) theoTenS.set(hoa(ten), { ma_nv: kq.ma, ho_ten: ten, vai_tro: vt });
      else { loi.push(`Thêm "${ten}": ${loiChu(kq.error)}`); chuaGhi.push(r); }
    }

    // Nhân sự đã xoá trên máy này → xoá trên máy chủ
    const canXoa = P.filter(x => x.khoa && !khoaTrenMay.has(x.khoa) && theoKhoaS.has(x.khoa));
    if (xoaHopLe(canXoa.length, P.length, L.length)) {
      for (const x of canXoa) {
        const { error } = await locDongNV(sb.from(BANG_NV).delete(), theoKhoaS.get(x.khoa));
        if (error) loi.push(`Xoá "${x.ho_ten}": ${loiChu(error)}`);
      }
    }

    try { S = await taiNVMayChu(); } catch (e) { return { ok: false, loi: loiChu(e) }; }
    const dsMoi = S.slice()
      .sort((a, b) => String(a.ma_nv || "").localeCompare(String(b.ma_nv || ""), "vi", { numeric: true }))
      .map(chuanHoaDongNV);
    chuaGhi.forEach(r => { if (!dsMoi.some(x => hoa(x.ho_ten) === hoa(tenCuaDong(r)))) dsMoi.push(r); });
    if (dsMoi.length || !L.length) ghiJSON(KHOA_NV, dsMoi);
    ghiJSON(KHOA_ANH_NV, S.map(r => ({ khoa: khoaDongNV(r), ho_ten: r.ho_ten, vai_tro: r.vai_tro || "" })));
    return { ok: !loi.length, loi: loi.join("\n"), soLuong: S.length };
  }

  // ==================== GỌI CHUNG ====================
  let henDongBo = null;
  /**
   * Đồng bộ 2 chiều danh mục xe & nhân sự điều xe với máy chủ.
   * @param {{doiTenXe?: {cu:string, moi:string}}} goiY  gợi ý khi vừa đổi tên xe
   * @returns {Promise<{ok:boolean, loi?:string, xe?:Object, nv?:Object}>}
   */
  function dongBo(goiY) {
    if (henDongBo) return henDongBo.then(() => dongBo(goiY)); // chạy lần lượt, không chồng chéo
    const hua = (async () => {
      try {
        if (typeof sb === "undefined") return { ok: false, loi: "Chưa kết nối máy chủ" };
        const xe = await dongBoXe(goiY || {});
        const nv = await dongBoNV();
        return { ok: xe.ok && nv.ok, loi: [xe.loi, nv.loi].filter(Boolean).join("\n"), xe: xe, nv: nv };
      } catch (e) {
        return { ok: false, loi: loiChu(e) };
      }
    })();
    henDongBo = hua;
    hua.then(() => { if (henDongBo === hua) henDongBo = null; });
    return hua;
  }

  window.DMDX = { dongBo: dongBo, hienThiXe: hienThiXe, tachTenXe: tachTenXe, vaiTroTuChu: vaiTroTuChu, chuVaiTro: chuVaiTro, bienSoTheoXe: bienSoTheoXe };
})();
