/* ====================================================================
 * chot_quy.js — MODULE QUẢN LÝ THU TIỀN SALE, CHI PHÁT SINH & CHỐT QUỸ
 * Công ty TNHH Thái Mỹ Hương
 * ====================================================================
 * Chức năng chính:
 * 1. Chuẩn hóa thu tiền sale: Bắt buộc chọn đúng ngày phát sinh thực tế & đính kèm bảng kê mệnh giá.
 * 2. Hợp nhất tự động: Gom bảng đếm tiền Xe + Sale thành "Bảng kiểm quỹ tiền mặt" chung theo mẫu chuẩn.
 * 3. Minh bạch nguồn tiền: Truy xuất chi tiết từng xe, từng sale (mã, số tiền, số tờ).
 * 4. Tính toán chốt quỹ & nộp ngân hàng: [Tổng thu sale/xe] - [Các khoản chi] = [Tiền mặt đem nộp NH].
 * 5. Chi phát sinh theo ngày: Hỗ trợ chi cả SAU KHI chốt quỹ, tự động cấn trừ tính [Tiền mặt lưu két].
 * 6. Kiểm soát lỗi (Edge cases): Cảnh báo bảng kê trống, lệch số tiền; chống âm quỹ két.
 * ==================================================================== */

(function (window) {
  'use strict';

  const MENH_GIA_QUY = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

  const COT_SL_MENH_GIA = {
    500000: 'sl_500k',
    200000: 'sl_200k',
    100000: 'sl_100k',
    50000: 'sl_50k',
    20000: 'sl_20k',
    10000: 'sl_10k',
    5000: 'sl_5k',
    2000: 'sl_2k',
    1000: 'sl_1k'
  };

  const KEY_STORAGE_SALE = 'tmh_thu_tien_sale';
  const KEY_STORAGE_CHI = 'tmh_chi_phat_sinh_ngay';
  const KEY_STORAGE_CHOT_QUY = 'tmh_chot_quy_ngay';

  // ----------------------------------------------------
  // HÀM TIỆN ÍCH DÙNG CHUNG
  // ----------------------------------------------------
  function fmtTien(n) {
    if (isNaN(n) || n === null || n === undefined) return '0';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function fmtK(n) {
    if (isNaN(n) || n === null || n === undefined) return '0';
    const nghin = Math.round(n / 1000);
    return nghin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function layNgayHomNayISO() {
    const d = new Date();
    const nam = d.getFullYear();
    const thang = String(d.getMonth() + 1).padStart(2, '0');
    const ngay = String(d.getDate()).padStart(2, '0');
    return `${nam}-${thang}-${ngay}`;
  }

  function layNgayHomQuaISO() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const nam = d.getFullYear();
    const thang = String(d.getMonth() + 1).padStart(2, '0');
    const ngay = String(d.getDate()).padStart(2, '0');
    return `${nam}-${thang}-${ngay}`;
  }

  function chuyenDinhDangNgayVN(iso) {
    if (!iso) return '--';
    const s = String(iso).slice(0, 10);
    const p = s.split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return s;
  }

  function escapeH(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ----------------------------------------------------
  // 1. VALIDATION NGHIỆP VỤ NGÀY THÁNG & BẢNG KÊ NỘP TIỀN
  // ----------------------------------------------------
  /**
   * Validate ngày phát sinh tiền hàng thực tế
   * @param {string} ngayPhatSinh - YYYY-MM-DD
   * @param {string} ngayNop - YYYY-MM-DD (tuỳ chọn)
   */
  function validateNgayPhatSinh(ngayPhatSinh, ngayNop = null) {
    if (!ngayPhatSinh || typeof ngayPhatSinh !== 'string' || !ngayPhatSinh.trim()) {
      return { valid: false, message: 'Bắt buộc phải nhập ngày phát sinh tiền hàng thực tế!' };
    }
    const ps = ngayPhatSinh.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ps)) {
      return { valid: false, message: 'Ngày phát sinh không đúng định dạng YYYY-MM-DD!' };
    }
    const today = layNgayHomNayISO();
    if (ps > today) {
      return { valid: false, message: 'Ngày phát sinh thực tế không được lớn hơn ngày hiện tại (không thể ở tương lai)!' };
    }
    if (ngayNop && typeof ngayNop === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ngayNop.trim())) {
      const nop = ngayNop.trim();
      if (nop < ps) {
        return { valid: false, message: `Ngày nộp tiền (${chuyenDinhDangNgayVN(nop)}) không thể trước ngày phát sinh tiền hàng (${chuyenDinhDangNgayVN(ps)})!` };
      }
    }
    return { valid: true, message: 'Hợp lệ' };
  }

  /**
   * Validate bảng kê nộp tiền theo mệnh giá / số tờ
   * @param {Object} soToObj - { 500000: số tờ, 200000: số tờ, ... }
   * @param {number} soTienKhaiBao - Số tiền nộp khai báo
   */
  function validateBangKeNopTien(soToObj, soTienKhaiBao) {
    const soTo = soToObj || {};
    let tongTienDem = 0;
    let tongSoTo = 0;

    MENH_GIA_QUY.forEach(m => {
      const sl = Math.max(0, parseInt(soTo[m] || soTo[String(m)] || 0) || 0);
      tongSoTo += sl;
      tongTienDem += sl * m;
    });

    const stKhaiBao = Math.max(0, parseFloat(soTienKhaiBao) || 0);

    if (tongSoTo === 0 || tongTienDem === 0) {
      return {
        valid: false,
        tongTienDem: 0,
        tongSoTo: 0,
        chenhLech: -stKhaiBao,
        message: 'Bảng kê nộp tiền trống! Bắt buộc phải đếm tiền và nhập số lượng tờ theo từng mệnh giá.'
      };
    }

    const chenhLech = tongTienDem - stKhaiBao;
    if (Math.abs(chenhLech) > 0) {
      return {
        valid: false,
        tongTienDem: tongTienDem,
        tongSoTo: tongSoTo,
        chenhLech: chenhLech,
        message: `Bảng kê tiền nộp không khớp số tiền khai báo!\n\n• Tổng tiền đếm được: ${fmtTien(tongTienDem)} đ (${fmtTien(tongSoTo)} tờ)\n• Số tiền nộp khai báo: ${fmtTien(stKhaiBao)} đ\n• Chênh lệch: ${chenhLech > 0 ? '+' : ''}${fmtTien(chenhLech)} đ\n\nVui lòng kiểm đếm và điều chỉnh lại số tờ cho chính xác.`
      };
    }

    return {
      valid: true,
      tongTienDem: tongTienDem,
      tongSoTo: tongSoTo,
      chenhLech: 0,
      message: 'Bảng kê hợp lệ và khớp 100% số tiền nộp.'
    };
  }

  // ----------------------------------------------------
  // 2. QUẢN LÝ DỮ LIỆU THU TIỀN SALE
  // ----------------------------------------------------
  function docThuTienSaleLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY_STORAGE_SALE) || '[]');
    } catch (e) {
      return [];
    }
  }

  function ghiThuTienSaleLocal(ds) {
    try {
      localStorage.setItem(KEY_STORAGE_SALE, JSON.stringify(ds || []));
    } catch (e) {
      console.warn('Lỗi ghi local thu_tien_sale:', e);
    }
  }

  async function taiDanhSachThuTienSaleCloud(tuNgay = null, denNgay = null) {
    let ds = docThuTienSaleLocal();
    if (typeof sb !== 'undefined') {
      try {
        let q = sb.from('thu_tien_sale').select('*').order('tao_luc', { ascending: false }).limit(2000);
        if (tuNgay) q = q.gte('ngay_nop', tuNgay);
        if (denNgay) q = q.lte('ngay_nop', denNgay);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          ds = data;
          ghiThuTienSaleLocal(ds);
        }
      } catch (err) {
        console.warn('Lỗi đọc bảng thu_tien_sale từ Supabase:', err);
      }
    }
    return ds;
  }

  async function luuPhieuThuSale(phieu) {
    // 1. Validation ngày phát sinh & ngày nộp
    const vNgay = validateNgayPhatSinh(phieu.ngay_phat_sinh, phieu.ngay_nop);
    if (!vNgay.valid) {
      return { ok: false, error: vNgay.message };
    }

    // 2. Validation bảng kê nộp tiền
    const soToObj = {};
    MENH_GIA_QUY.forEach(m => {
      soToObj[m] = phieu[COT_SL_MENH_GIA[m]] || phieu.soToDem?.[m] || 0;
    });
    const vBangKe = validateBangKeNopTien(soToObj, phieu.so_tien_nop);
    if (!vBangKe.valid) {
      return { ok: false, error: vBangKe.message };
    }

    // 3. Chuẩn bị bản ghi
    const maPhieu = phieu.ma_phieu || `PTS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const banGhi = {
      ma_phieu: maPhieu,
      ma_nv_sale: phieu.ma_nv_sale || '',
      ten_nv_sale: (phieu.ten_nv_sale || 'Nhân viên Sale').trim(),
      ngay_phat_sinh: phieu.ngay_phat_sinh,
      ngay_nop: phieu.ngay_nop || layNgayHomNayISO(),
      so_tien_nop: parseFloat(phieu.so_tien_nop) || 0,
      nguoi_nhan: phieu.nguoi_nhan || 'Thủ quỹ / Kế toán',
      noi_dung: (phieu.noi_dung || '').trim(),
      sl_500k: soToObj[500000] || 0,
      sl_200k: soToObj[200000] || 0,
      sl_100k: soToObj[100000] || 0,
      sl_50k: soToObj[50000] || 0,
      sl_20k: soToObj[20000] || 0,
      sl_10k: soToObj[10000] || 0,
      sl_5k: soToObj[5000] || 0,
      sl_2k: soToObj[2000] || 0,
      sl_1k: soToObj[1000] || 0,
      tong_tien_dem: vBangKe.tongTienDem,
      chenh_lech: 0,
      trang_thai: 'da_thu',
      ghi_chu: (phieu.ghi_chu || '').trim(),
      tao_luc: phieu.tao_luc || new Date().toISOString(),
      cap_nhat_luc: new Date().toISOString()
    };

    // 4. Lưu local
    const dsLocal = docThuTienSaleLocal();
    const idx = dsLocal.findIndex(x => x.ma_phieu === maPhieu);
    if (idx >= 0) dsLocal[idx] = banGhi; else dsLocal.unshift(banGhi);
    ghiThuTienSaleLocal(dsLocal);

    // 5. Lưu Cloud Supabase
    if (typeof sb !== 'undefined') {
      try {
        if (typeof upsertSupabaseTuTu === 'function') {
          await upsertSupabaseTuTu('thu_tien_sale', [banGhi], { onConflict: 'ma_phieu' });
        } else {
          await sb.from('thu_tien_sale').upsert([banGhi], { onConflict: 'ma_phieu' });
        }
      } catch (eCloud) {
        console.warn('Lỗi lưu thu_tien_sale lên cloud:', eCloud);
      }
    }

    return { ok: true, data: banGhi };
  }

  async function xoaPhieuThuSale(maPhieu) {
    const dsLocal = docThuTienSaleLocal().filter(x => x.ma_phieu !== maPhieu);
    ghiThuTienSaleLocal(dsLocal);

    if (typeof sb !== 'undefined') {
      try {
        await sb.from('thu_tien_sale').delete().eq('ma_phieu', maPhieu);
      } catch (e) {
        console.warn('Lỗi xóa thu_tien_sale cloud:', e);
      }
    }
    return { ok: true };
  }

  // ----------------------------------------------------
  // 3. QUẢN LÝ CHI PHÁT SINH THEO NGÀY
  // ----------------------------------------------------
  function docChiPhatSinhLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY_STORAGE_CHI) || '[]');
    } catch (e) {
      return [];
    }
  }

  function ghiChiPhatSinhLocal(ds) {
    try {
      localStorage.setItem(KEY_STORAGE_CHI, JSON.stringify(ds || []));
    } catch (e) {
      console.warn('Lỗi ghi local chi_phat_sinh_ngay:', e);
    }
  }

  async function taiDanhSachChiPhatSinhCloud(tuNgay = null, denNgay = null) {
    let ds = docChiPhatSinhLocal();
    if (typeof sb !== 'undefined') {
      try {
        let q = sb.from('chi_phat_sinh_ngay').select('*').order('tao_luc', { ascending: false }).limit(2000);
        if (tuNgay) q = q.gte('ngay_chi', tuNgay);
        if (denNgay) q = q.lte('ngay_chi', denNgay);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          ds = data;
          ghiChiPhatSinhLocal(ds);
        }
      } catch (err) {
        console.warn('Lỗi đọc chi_phat_sinh_ngay từ Supabase:', err);
      }
    }
    return ds;
  }

  async function luuKhoanChiPhatSinh(khoan) {
    if (!khoan.hang_muc || !khoan.hang_muc.trim()) {
      return { ok: false, error: 'Vui lòng chọn hoặc nhập hạng mục chi!' };
    }
    if (!khoan.noi_dung || !khoan.noi_dung.trim()) {
      return { ok: false, error: 'Vui lòng nhập nội dung chi tiết khoản chi!' };
    }
    const soTien = parseFloat(khoan.so_tien) || 0;
    if (soTien <= 0) {
      return { ok: false, error: 'Số tiền chi phải lớn hơn 0 đ!' };
    }
    const ngayChi = khoan.ngay_chi || layNgayHomNayISO();

    const maChi = khoan.ma_chi || `CHI_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const banGhi = {
      ma_chi: maChi,
      ngay_chi: ngayChi,
      hang_muc: khoan.hang_muc.trim(),
      noi_dung: khoan.noi_dung.trim(),
      so_tien: soTien,
      nguoi_chi: (khoan.nguoi_chi || 'Thủ quỹ').trim(),
      nguoi_nhan: (khoan.nguoi_nhan || '').trim(),
      chung_tu: (khoan.chung_tu || '').trim(),
      sau_chot_quy: !!khoan.sau_chot_quy,
      ghi_chu: (khoan.ghi_chu || '').trim(),
      tao_luc: khoan.tao_luc || new Date().toISOString(),
      cap_nhat_luc: new Date().toISOString()
    };

    // Lưu local
    const dsLocal = docChiPhatSinhLocal();
    const idx = dsLocal.findIndex(x => x.ma_chi === maChi);
    if (idx >= 0) dsLocal[idx] = banGhi; else dsLocal.unshift(banGhi);
    ghiChiPhatSinhLocal(dsLocal);

    // Lưu cloud
    if (typeof sb !== 'undefined') {
      try {
        if (typeof upsertSupabaseTuTu === 'function') {
          await upsertSupabaseTuTu('chi_phat_sinh_ngay', [banGhi], { onConflict: 'ma_chi' });
        } else {
          await sb.from('chi_phat_sinh_ngay').upsert([banGhi], { onConflict: 'ma_chi' });
        }
      } catch (e) {
        console.warn('Lỗi lưu chi_phat_sinh_ngay cloud:', e);
      }
    }

    return { ok: true, data: banGhi };
  }

  async function xoaKhoanChiPhatSinh(maChi) {
    const dsLocal = docChiPhatSinhLocal().filter(x => x.ma_chi !== maChi);
    ghiChiPhatSinhLocal(dsLocal);

    if (typeof sb !== 'undefined') {
      try {
        await sb.from('chi_phat_sinh_ngay').delete().eq('ma_chi', maChi);
      } catch (e) {
        console.warn('Lỗi xóa chi_phat_sinh_ngay cloud:', e);
      }
    }
    return { ok: true };
  }

  // ----------------------------------------------------
  // 4. HỢP NHẤT DỮ LIỆU TIỀN MẶT XE + SALE THÀNH BẢNG KIỂM QUỸ
  // ----------------------------------------------------
  /**
   * Gom và hợp nhất số tờ từng mệnh giá của tất cả Xe và Sale theo ngày
   * @param {string} ngayKiemDem - YYYY-MM-DD
   * @param {string} ngayPhatSinh - YYYY-MM-DD (tuỳ chọn)
   * @param {Array} dsPhieuXe - Danh sách phiếu nộp tiền xe
   * @param {Array} dsPhieuSale - Danh sách phiếu nộp tiền sale
   */
  function hopNhatKiemQuyTheoNgay(ngayKiemDem, ngayPhatSinh, dsPhieuXe = [], dsPhieuSale = []) {
    const kdISO = (ngayKiemDem || layNgayHomNayISO()).slice(0, 10);
    const psISO = ngayPhatSinh ? ngayPhatSinh.slice(0, 10) : '';

    // 1. Lọc các phiếu xe nộp vào ngày kiểm đếm (hoặc ngày phát sinh tương ứng)
    const xeNopTrongNgay = (dsPhieuXe || []).filter(p => {
      const pNop = (p.ngay_nop || p.ngayGiao || '').slice(0, 10);
      const pPS = (p.ngay_phat_sinh || p.ngayGiao || '').slice(0, 10);
      if (psISO) {
        return (pNop === kdISO || pPS === psISO);
      }
      return pNop === kdISO;
    });

    // 2. Lọc các phiếu sale nộp vào ngày kiểm đếm
    const saleNopTrongNgay = (dsPhieuSale || []).filter(p => {
      const pNop = (p.ngay_nop || '').slice(0, 10);
      const pPS = (p.ngay_phat_sinh || '').slice(0, 10);
      if (psISO) {
        return (pNop === kdISO || pPS === psISO);
      }
      return pNop === kdISO;
    });

    // 3. Cộng dồn số tờ từng mệnh giá
    const menhGiaChiTiet = [];
    let tongSoToToanBo = 0;
    let tongTienMatToanBo = 0;
    let tongTienXe = 0;
    let tongTienSale = 0;

    MENH_GIA_QUY.forEach(m => {
      const cot = COT_SL_MENH_GIA[m];
      let soToXe = 0;
      xeNopTrongNgay.forEach(x => {
        const sl = parseInt(x[cot] || (x.soToDemTien && x.soToDemTien[m]) || 0) || 0;
        soToXe += sl;
      });

      let soToSale = 0;
      saleNopTrongNgay.forEach(s => {
        const sl = parseInt(s[cot] || 0) || 0;
        soToSale += sl;
      });

      const tongSoTo = soToXe + soToSale;
      const thanhTien = tongSoTo * m;
      const thanhTien1000 = Math.round(thanhTien / 1000);

      tongSoToToanBo += tongSoTo;
      tongTienMatToanBo += thanhTien;
      tongTienXe += soToXe * m;
      tongTienSale += soToSale * m;

      menhGiaChiTiet.push({
        menhGia: m,
        menhGiaK: m / 1000,
        soToXe: soToXe,
        soToSale: soToSale,
        soLuong: tongSoTo,
        thanhTien: thanhTien,
        thanhTien1000: thanhTien1000
      });
    });

    // 4. Lập danh sách nguồn tiền minh bạch (Traceability)
    const nguonTienChiTiet = [];
    xeNopTrongNgay.forEach((x, i) => {
      const st = parseFloat(x.tong_tien_dem || x.tongTienDem || x.tong_tien_mat || 0);
      nguonTienChiTiet.push({
        stt: i + 1,
        loaiNguon: 'xe',
        nhanLoai: '🚚 Chuyến Xe',
        tenNguon: x.xe || x.ma_dot || 'Chuyến xe',
        nguoiNop: x.nguoi_nop || x.tai_xe || x.taiXe || '--',
        ngayPhatSinh: x.ngay_giao || x.ngayGiao || x.ngay_nop || kdISO,
        soTien: st,
        soToMap: {
          500000: x.sl_500k || x.soToDemTien?.[500000] || 0,
          200000: x.sl_200k || x.soToDemTien?.[200000] || 0,
          100000: x.sl_100k || x.soToDemTien?.[100000] || 0,
          50000: x.sl_50k || x.soToDemTien?.[50000] || 0,
          20000: x.sl_20k || x.soToDemTien?.[20000] || 0,
          10000: x.sl_10k || x.soToDemTien?.[10000] || 0,
          5000: x.sl_5k || x.soToDemTien?.[5000] || 0,
          2000: x.sl_2k || x.soToDemTien?.[2000] || 0,
          1000: x.sl_1k || x.soToDemTien?.[1000] || 0
        },
        maGoc: x.ma_phieu || x.ma_dot || ''
      });
    });

    saleNopTrongNgay.forEach((s, i) => {
      const st = parseFloat(s.tong_tien_dem || s.so_tien_nop || 0);
      nguonTienChiTiet.push({
        stt: nguonTienChiTiet.length + 1,
        loaiNguon: 'sale',
        nhanLoai: '💼 Nhân viên Sale',
        tenNguon: s.ten_nv_sale || 'Sale',
        nguoiNop: s.ten_nv_sale || '--',
        ngayPhatSinh: s.ngay_phat_sinh || kdISO,
        soTien: st,
        soToMap: {
          500000: s.sl_500k || 0,
          200000: s.sl_200k || 0,
          100000: s.sl_100k || 0,
          50000: s.sl_50k || 0,
          20000: s.sl_20k || 0,
          10000: s.sl_10k || 0,
          5000: s.sl_5k || 0,
          2000: s.sl_2k || 0,
          1000: s.sl_1k || 0
        },
        maGoc: s.ma_phieu || ''
      });
    });

    return {
      ngayKiemDem: kdISO,
      ngayPhatSinh: psISO || kdISO,
      menhGiaChiTiet: menhGiaChiTiet,
      tongSoTo: tongSoToToanBo,
      tongTienMat: tongTienMatToanBo,
      tongTien1000: Math.round(tongTienMatToanBo / 1000),
      tongTienXe: tongTienXe,
      tongTienSale: tongTienSale,
      soChuyenXe: xeNopTrongNgay.length,
      soPhieuSale: saleNopTrongNgay.length,
      nguonTienChiTiet: nguonTienChiTiet
    };
  }

  // ----------------------------------------------------
  // 5. TÍNH TOÁN CHỐT QUỸ, TIỀN NỘP NGÂN HÀNG & LƯU KÉT
  // ----------------------------------------------------
  /**
   * Tính toán cân đối chốt quỹ
   * Công thức: [Tổng thu sale/xe] - [Các khoản chi] = [Tiền mặt đem đi nộp ngân hàng]
   * Hỗ trợ chi phát sinh sau chốt -> cấn trừ tính [Tiền mặt lưu két]
   * Xử lý an toàn không bị âm quỹ két
   */
  function tinhToanChotQuy(tongThuXe, tongThuSale, dsChiTruocChot = [], dsChiSauChot = [], tienNopNHThucTe = null) {
    let thuXe = 0;
    let thuSale = 0;
    let chiTruoc = dsChiTruocChot;
    let chiSau = dsChiSauChot;
    let nopNH = tienNopNHThucTe;

    // Hỗ trợ truyền linh hoạt:
    // Kiểu 1: tinhToanChotQuy(tongThuXe, tongThuSale, dsChiTruocChot, dsChiSauChot, tienNopNH)
    // Kiểu 2: tinhToanChotQuy(tongThuToanBo, dsChiTruocChot, dsChiSauChot, tienNopNH)
    if (Array.isArray(tongThuSale)) {
      thuXe = Math.max(0, parseFloat(tongThuXe) || 0);
      thuSale = 0;
      chiTruoc = tongThuSale;
      chiSau = Array.isArray(dsChiTruocChot) ? dsChiTruocChot : [];
      nopNH = (dsChiSauChot !== null && typeof dsChiSauChot === 'number') ? dsChiSauChot : tienNopNHThucTe;
    } else {
      thuXe = Math.max(0, parseFloat(tongThuXe) || 0);
      thuSale = Math.max(0, parseFloat(tongThuSale) || 0);
    }
    const tongThu = thuXe + thuSale;

    // Chi phát sinh trong ngày (trước chốt quỹ)
    let tongChiTruocChot = 0;
    (chiTruoc || []).forEach(c => {
      // Bỏ qua các khoản chi đánh dấu sau_chot_quy nếu nằm chung danh sách
      if (!c.sau_chot_quy && !c.sauChotQuy) {
        tongChiTruocChot += Math.max(0, parseFloat(c.so_tien || c.soTien || 0) || 0);
      }
    });

    // Công thức nghiệp vụ: [Tổng tiền thu từ sale/xe] - [Các khoản chi] = [Tiền mặt đem đi nộp ngân hàng]
    const tienNopMacDinh = Math.max(0, tongThu - tongChiTruocChot);
    const tienNopNganHang = (nopNH !== null && nopNH !== undefined)
      ? Math.max(0, parseFloat(nopNH) || 0)
      : tienNopMacDinh;

    // Tiền mặt dự kiến lưu két trước khi có chi sau chốt
    const tienLuuKetBanDau = Math.max(0, (tongThu - tongChiTruocChot) - tienNopNganHang);

    // Chi phát sinh sau khi đã chốt quỹ
    let tongChiSauChot = 0;
    (chiSau || []).forEach(c => {
      tongChiSauChot += Math.max(0, parseFloat(c.so_tien || c.soTien || 0) || 0);
    });
    // Nếu chiSau là danh sách chung có cờ sau_chot_quy
    if (Array.isArray(chiTruoc)) {
      chiTruoc.forEach(c => {
        if (c.sau_chot_quy || c.sauChotQuy) {
          tongChiSauChot += Math.max(0, parseFloat(c.so_tien || c.soTien || 0) || 0);
        }
      });
    }

    // Cấn trừ khoản chi sau chốt để tính tiền mặt lưu két cuối cùng
    // Edge case: Xử lý không bị âm quỹ két
    const chenhLechSauChot = tienLuuKetBanDau - tongChiSauChot;
    const tienMatLuuKet = Math.max(0, chenhLechSauChot);
    const canhBaoAmQuy = chenhLechSauChot < 0;
    const soTienThieuKet = canhBaoAmQuy ? Math.abs(chenhLechSauChot) : 0;

    return {
      tongThuXe: thuXe,
      tongThuSale: thuSale,
      tongThu: tongThu,
      tongChiTruocChot: tongChiTruocChot,
      tienNopNganHang: tienNopNganHang,
      tongChiSauChot: tongChiSauChot,
      tienLuuKetBanDau: tienLuuKetBanDau,
      tienMatLuuKet: tienMatLuuKet,
      canhBaoAmQuy: canhBaoAmQuy,
      soTienThieuKet: soTienThieuKet
    };
  }

  // ----------------------------------------------------
  // 6. LƯU BẢNG CHỐT QUỸ NGÀY LÊN CLOUD & LOCAL
  // ----------------------------------------------------
  function docChotQuyLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY_STORAGE_CHOT_QUY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function ghiChotQuyLocal(ds) {
    try {
      localStorage.setItem(KEY_STORAGE_CHOT_QUY, JSON.stringify(ds || []));
    } catch (e) {
      console.warn('Lỗi ghi local chot_quy_ngay:', e);
    }
  }

  async function luuBanChotQuyNgay(thongTin) {
    const maChot = thongTin.ma_chot_quy || `CQ_${(thongTin.ngay_kiem_dem || layNgayHomNayISO()).replace(/-/g, '')}_${(thongTin.ngay_phat_sinh || '').replace(/-/g, '')}`;

    const banGhi = {
      ma_chot_quy: maChot,
      ngay_kiem_dem: thongTin.ngay_kiem_dem || layNgayHomNayISO(),
      ngay_phat_sinh: thongTin.ngay_phat_sinh || thongTin.ngay_kiem_dem,
      nguoi_chot: thongTin.nguoi_chot || 'Kế toán tổng hợp',
      tong_thu_xe: parseFloat(thongTin.tong_thu_xe) || 0,
      tong_thu_sale: parseFloat(thongTin.tong_thu_sale) || 0,
      tong_thu_tong_hop: parseFloat(thongTin.tong_thu_tong_hop) || 0,
      tong_chi_phat_sinh: parseFloat(thongTin.tong_chi_phat_sinh) || 0,
      tien_nop_ngan_hang: parseFloat(thongTin.tien_nop_ngan_hang) || 0,
      chi_sau_chot: parseFloat(thongTin.chi_sau_chot) || 0,
      tien_mat_luu_ket: parseFloat(thongTin.tien_mat_luu_ket) || 0,
      sl_500k: thongTin.sl_500k || 0,
      sl_200k: thongTin.sl_200k || 0,
      sl_100k: thongTin.sl_100k || 0,
      sl_50k: thongTin.sl_50k || 0,
      sl_20k: thongTin.sl_20k || 0,
      sl_10k: thongTin.sl_10k || 0,
      sl_5k: thongTin.sl_5k || 0,
      sl_2k: thongTin.sl_2k || 0,
      sl_1k: thongTin.sl_1k || 0,
      trang_thai: thongTin.trang_thai || 'da_chot',
      chi_tiet_nguon_tien: thongTin.chi_tiet_nguon_tien || [],
      ghi_chu: (thongTin.ghi_chu || '').trim(),
      tao_luc: thongTin.tao_luc || new Date().toISOString(),
      cap_nhat_luc: new Date().toISOString()
    };

    // Lưu local
    const dsLocal = docChotQuyLocal();
    const idx = dsLocal.findIndex(x => x.ma_chot_quy === maChot);
    if (idx >= 0) dsLocal[idx] = banGhi; else dsLocal.unshift(banGhi);
    ghiChotQuyLocal(dsLocal);

    // Lưu cloud
    if (typeof sb !== 'undefined') {
      try {
        if (typeof upsertSupabaseTuTu === 'function') {
          await upsertSupabaseTuTu('chot_quy_ngay', [banGhi], { onConflict: 'ma_chot_quy' });
        } else {
          await sb.from('chot_quy_ngay').upsert([banGhi], { onConflict: 'ma_chot_quy' });
        }
      } catch (e) {
        console.warn('Lỗi lưu chot_quy_ngay cloud:', e);
      }
    }

    return { ok: true, data: banGhi };
  }

  async function docBanChotQuyNgay(ngayKiemDem, ngayPhatSinh = null) {
    const ds = docChotQuyLocal();
    let tim = ds.find(x => x.ngay_kiem_dem === ngayKiemDem && (!ngayPhatSinh || x.ngay_phat_sinh === ngayPhatSinh));
    if (!tim && typeof sb !== 'undefined') {
      try {
        let q = sb.from('chot_quy_ngay').select('*').eq('ngay_kiem_dem', ngayKiemDem);
        if (ngayPhatSinh) q = q.eq('ngay_phat_sinh', ngayPhatSinh);
        const { data } = await q.maybeSingle();
        if (data) tim = data;
      } catch (e) {}
    }
    return tim || null;
  }

  // ----------------------------------------------------
  // XUẤT MODULE RA WINDOW
  // ----------------------------------------------------
  window.TMHChotQuy = {
    MENH_GIA_QUY,
    COT_SL_MENH_GIA,
    fmtTien,
    fmtK,
    layNgayHomNayISO,
    layNgayHomQuaISO,
    chuyenDinhDangNgayVN,
    escapeH,
    validateNgayPhatSinh,
    validateBangKeNopTien,
    docThuTienSaleLocal,
    ghiThuTienSaleLocal,
    taiDanhSachThuTienSaleCloud,
    luuPhieuThuSale,
    xoaPhieuThuSale,
    docChiPhatSinhLocal,
    ghiChiPhatSinhLocal,
    taiDanhSachChiPhatSinhCloud,
    luuKhoanChiPhatSinh,
    xoaKhoanChiPhatSinh,
    hopNhatKiemQuyTheoNgay,
    tinhToanChotQuy,
    docChotQuyLocal,
    ghiChotQuyLocal,
    luuBanChotQuyNgay,
    docBanChotQuyNgay
  };

})(typeof window !== 'undefined' ? window : globalThis);
