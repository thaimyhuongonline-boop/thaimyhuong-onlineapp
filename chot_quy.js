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

  /**
   * Chuẩn hóa mọi định dạng ngày (dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd, ISO UTC) về YYYY-MM-DD
   */
  function chuanHoaNgayISO(s) {
    if (!s) return '';
    const str = String(s).trim();
    // 1. DD/MM/YYYY hoặc DD-MM-YYYY
    let m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    // 2. YYYY-MM-DD
    m = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    // 3. ISO Datetime / UTC -> chuyển sang giờ địa phương VN (UTC+7)
    if (str.includes('T') || str.includes(':')) {
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        const dVN = new Date(dt.getTime() + (dt.getTimezoneOffset() === 0 ? 7 * 3600 * 1000 : 0));
        const y = dVN.getFullYear();
        const mo = String(dVN.getMonth() + 1).padStart(2, '0');
        const d = String(dVN.getDate()).padStart(2, '0');
        return `${y}-${mo}-${d}`;
      }
    }
    return '';
  }

  /**
   * Parse giá trị mệnh giá số học an toàn từ chuỗi (vd "500.000đ" -> 500000, 500 -> 500000)
   */
  function parseMenhGia(m) {
    if (typeof m === 'number') {
      if (m <= 500) return m * 1000;
      return m;
    }
    const str = String(m || '').trim();
    const digits = str.replace(/[^\d]/g, '');
    const num = parseInt(digits, 10) || 0;
    if (num <= 500) return num * 1000;
    return num;
  }

  /**
   * Định dạng nhãn hiển thị đầy đủ của mệnh giá (vd: 500000 -> "500.000đ")
   */
  function formatMenhGiaLabel(m) {
    const num = parseMenhGia(m);
    return fmtTien(num) + 'đ';
  }

  /**
   * Trích xuất CHÍNH XÁC tổng tiền mặt thu được từ chuyến xe (loại bỏ hoàn toàn Chuyển khoản và Công nợ)
   * Xử lý thanh toán hỗn hợp (Split payment): chỉ lấy đúng phần Tiền mặt
   */
  function tinhTienMatCuaDot(dot) {
    if (!dot) return 0;

    // 1. Nhận diện hình thức thanh toán 100% không phải tiền mặt
    const ht = String(dot.hinh_thuc_thanh_toan || dot.hinh_thuc || dot.hinhThuc || '').toLowerCase().trim();
    const is100PhanTramCK = (ht === 'chuyển khoản' || ht === 'chuyen_khoan' || ht === 'ck' || ht === 'ngân hàng') ||
                            ((ht.includes('chuyển khoản') || ht.includes('ngân hàng')) && !ht.includes('tiền mặt') && !ht.includes('tien_mat'));
    const is100PhanTramNo = (ht === 'công nợ' || ht === 'cong_no' || ht === 'nợ') ||
                            (ht.includes('công nợ') && !ht.includes('tiền mặt') && !ht.includes('tien_mat'));

    // 2. Tiền đếm từ số tờ tiền mặt (nếu có bảng kê mệnh giá)
    let tienDemTungXe = 0;
    MENH_GIA_QUY.forEach(m => {
      const cot = COT_SL_MENH_GIA[m];
      const sl = parseInt(dot[cot] || (dot.soToDemTien && (dot.soToDemTien[m] || dot.soToDemTien[String(m)])) || (dot.soToMap && (dot.soToMap[m] || dot.soToMap[String(m)])) || 0) || 0;
      tienDemTungXe += sl * m;
    });

    // 3. Đọc các trường tiền mặt, chuyển khoản, công nợ rõ ràng
    const tmKhaiBao = [dot.tong_tien_mat, dot.tongTienMat, dot.tien_mat, dot.tienMat].find(v => v !== undefined && v !== null);
    const ckKhaiBao = parseFloat(dot.tong_chuyen_khoan || dot.tongChuyenKhoan || dot.chuyen_khoan || dot.chuyenKhoan || 0) || 0;
    const noKhaiBao = parseFloat(dot.tong_con_no || dot.tongNoPhatSinh || dot.no_phat_sinh || dot.tongNo || 0) || 0;

    // Nếu đã khai báo rõ ràng tiền mặt (kể cả = 0)
    if (tmKhaiBao !== undefined) {
      const tm = Math.max(0, parseFloat(tmKhaiBao) || 0);
      if (tm > 0) return tm;
      // tm === 0 mà có CK hoặc Nợ hoặc hình thức 100% CK/Nợ -> Chắc chắn tiền mặt = 0
      if (tm === 0 && (ckKhaiBao > 0 || noKhaiBao > 0 || is100PhanTramCK || is100PhanTramNo)) {
        return 0;
      }
    }

    // Nếu 100% hình thức là CK hoặc Nợ và không có tiền đếm từ số tờ
    if ((is100PhanTramCK || is100PhanTramNo) && tienDemTungXe === 0) {
      return 0;
    }

    // Nếu có tiền đếm từ số tờ > 0
    if (tienDemTungXe > 0) return tienDemTungXe;
    if (dot.tong_tien_dem !== undefined && dot.tong_tien_dem !== null && parseFloat(dot.tong_tien_dem) > 0) {
      return parseFloat(dot.tong_tien_dem);
    }
    if (dot.tongTienDem !== undefined && dot.tongTienDem !== null && parseFloat(dot.tongTienDem) > 0) {
      return parseFloat(dot.tongTienDem);
    }

    // 4. Nếu có danh sách chi tiết các hóa đơn (danhSachChiTiet) -> Bóc tách CHỈ LẤY TIỀN MẶT
    if (Array.isArray(dot.danhSachChiTiet) && dot.danhSachChiTiet.length > 0) {
      let mat = 0;
      dot.danhSachChiTiet.forEach(h => {
        const htH = String(h.hinh_thuc_thanh_toan || h.hinhThuc || h.hinh_thuc || '').toLowerCase().trim();
        const isHDCK = (htH === 'chuyển khoản' || htH === 'chuyen_khoan' || htH === 'ck' || htH === 'ngân hàng') ||
                       ((htH.includes('chuyển khoản') || htH.includes('ngân hàng')) && !htH.includes('tiền mặt') && !htH.includes('tien_mat'));
        const isHDNo = (htH === 'công nợ' || htH === 'cong_no' || htH === 'nợ') ||
                       (htH.includes('công nợ') && !htH.includes('tiền mặt') && !htH.includes('tien_mat'));
        if (isHDCK || isHDNo) {
          return;
        }
        const tmH = [h.tienMat, h.tien_mat, h.tien_mat_thu].find(v => v !== undefined && v !== null);
        if (tmH !== undefined) {
          mat += Math.max(0, parseFloat(tmH) || 0);
          return;
        }
        const stH = parseFloat(h.thanhTien || h.thanh_tien || h.so_tien || h.tongTien || 0) || 0;
        const ckH = parseFloat(h.chuyenKhoan || h.chuyen_khoan || 0) || 0;
        const noH = parseFloat(h.congNo || h.no_phat_sinh || h.no || 0) || 0;
        if (stH > 0) {
          if (ckH > 0 || noH > 0) {
            mat += Math.max(0, stH - ckH - noH);
          } else {
            mat += stH;
          }
        }
      });
      const thuNo = parseFloat(dot.thuNoCu || dot.thu_no_cu || 0) || 0;
      const chi = parseFloat(dot.tienChi || dot.tien_chi || 0) || 0;
      const thoi = parseFloat(dot.tienThoi || dot.tien_thoi || 0) || 0;
      const hoanTM = parseFloat(dot.tongHoanTienMat || 0) || 0;
      const phaiThu = Math.max(0, mat + thuNo - chi + thoi - hoanTM);
      if (phaiThu > 0) return phaiThu;
      if (mat > 0) return mat;
      return 0;
    }

    // 5. Nếu có số tiền khai báo (soTienPhaiThu, so_tien_nop, tongTien, soTien...):
    const stKhaiBao = [dot.soTienPhaiThu, dot.so_tien_nop, dot.soTien, dot.tongTien, dot.tong_tien].find(v => v !== undefined && v !== null);
    if (stKhaiBao !== undefined) {
      const st = Math.max(0, parseFloat(stKhaiBao) || 0);
      if (st > 0) {
        if (ckKhaiBao >= st || noKhaiBao >= st || (ckKhaiBao + noKhaiBao >= st && tmKhaiBao === undefined)) {
          return 0;
        }
        if (is100PhanTramCK || is100PhanTramNo) {
          return 0;
        }
        if (ckKhaiBao > 0 || noKhaiBao > 0) {
          return Math.max(0, st - ckKhaiBao - noKhaiBao);
        }
        return st;
      }
    }

    // Tuyệt đối KHÔNG fallback về dot.tongTien hay dot.thanh_tien
    return 0;
  }

  /**
   * Trích xuất CHÍNH XÁC tổng tiền mặt thu được từ nhân viên Sale (loại bỏ hoàn toàn CK và Công nợ)
   */
  function tinhTienMatCuaSale(sale) {
    if (!sale) return 0;

    const ht = String(sale.hinh_thuc || sale.hinh_thuc_thanh_toan || sale.hinhThuc || '').toLowerCase().trim();
    const is100PhanTramCK = (ht === 'chuyển khoản' || ht === 'chuyen_khoan' || ht === 'ck' || ht === 'ngân hàng') ||
                            ((ht.includes('chuyển khoản') || ht.includes('ngân hàng')) && !ht.includes('tiền mặt') && !ht.includes('tien_mat'));
    const is100PhanTramNo = (ht === 'công nợ' || ht === 'cong_no' || ht === 'nợ') ||
                            (ht.includes('công nợ') && !ht.includes('tiền mặt') && !ht.includes('tien_mat'));

    // 1. Tiền đếm từ số tờ tiền mặt
    let tienDemSale = 0;
    MENH_GIA_QUY.forEach(m => {
      const cot = COT_SL_MENH_GIA[m];
      const sl = parseInt(sale[cot] || (sale.soToDem && (sale.soToDem[m] || sale.soToDem[String(m)])) || 0) || 0;
      tienDemSale += sl * m;
    });
    if (tienDemSale > 0) return tienDemSale;

    // 2. Khai báo tiền mặt riêng biệt
    const tmKhaiBao = [sale.tien_mat, sale.tienMat, sale.tong_tien_mat, sale.tongTienMat].find(v => v !== undefined && v !== null);
    const ckKhaiBao = parseFloat(sale.chuyen_khoan || sale.chuyenKhoan || 0) || 0;
    const noKhaiBao = parseFloat(sale.cong_no || sale.no_phat_sinh || sale.no || 0) || 0;

    if (tmKhaiBao !== undefined) {
      const tm = Math.max(0, parseFloat(tmKhaiBao) || 0);
      if (tm > 0) return tm;
      if (tm === 0 && (ckKhaiBao > 0 || noKhaiBao > 0 || is100PhanTramCK || is100PhanTramNo)) {
        return 0;
      }
    }

    if (is100PhanTramCK || is100PhanTramNo) return 0;

    const stNop = parseFloat(sale.so_tien_nop || sale.soTien || sale.tong_tien_dem || 0) || 0;
    if (stNop > 0) {
      if (ckKhaiBao + noKhaiBao >= stNop && tmKhaiBao === undefined) return 0;
      if (ckKhaiBao > 0 || noKhaiBao > 0) {
        return Math.max(0, stNop - ckKhaiBao - noKhaiBao);
      }
      return stNop;
    }
    return 0;
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
        console.warn('Lỗi xoá chi_phat_sinh_ngay cloud:', e);
      }
    }
    return { ok: true };
  }

  // ----------------------------------------------------
  // 6. HỢP NHẤT DỮ LIỆU ĐẾM TIỀN & CHỐT QUỸ THEO NGÀY
  // ----------------------------------------------------
  function hopNhatKiemQuyTheoNgay(ngayKiemDem, ngayPhatSinh, dsPhieuXe = [], dsPhieuSale = []) {
    const kdISO = chuanHoaNgayISO(ngayKiemDem) || layNgayHomNayISO();
    const psISO = chuanHoaNgayISO(ngayPhatSinh) || '';

    // 1. Lọc các phiếu xe đã quyết toán nộp tiền
    const xeNopTrongNgay = (dsPhieuXe || []).filter(p => {
      // Chỉ tính các chuyến xe đã quyết toán hoặc có phiếu nộp tiền
      const daQuyetToan = p.daQuyetToan === true || p.da_quyet_toan === true || !!p.thoiGianQuyetToan || !!p.ma_phieu || !!p.ma_dot || (parseFloat(p.tong_tien_mat || 0) > 0) || (parseFloat(p.tong_tien_dem || 0) > 0) || (parseFloat(p.tongTienDem || 0) > 0);
      if (!daQuyetToan) return false;

      const pNop = chuanHoaNgayISO(p.ngay_nop || p.thoiGianQuyetToan || p.ngayGiao || p.ngayRaw || p.tao_luc || p.taoLuc);
      const pPS = chuanHoaNgayISO(p.ngay_phat_sinh || p.ngayGiao || p.ngayRaw || p.thoiGianQuyetToan || p.tao_luc || p.taoLuc);

      if (psISO && kdISO) {
        return (pNop === kdISO || pPS === psISO || pPS === kdISO || pNop === psISO);
      }
      if (kdISO) {
        return (pNop === kdISO || pPS === kdISO);
      }
      if (psISO) {
        return (pPS === psISO || pNop === psISO);
      }
      return true;
    });

    // 2. Lọc các phiếu sale nộp vào ngày kiểm đếm
    const saleNopTrongNgay = (dsPhieuSale || []).filter(p => {
      const pNop = chuanHoaNgayISO(p.ngay_nop || p.tao_luc || p.ngayPhatSinh);
      const pPS = chuanHoaNgayISO(p.ngay_phat_sinh || p.ngayPhatSinh || p.ngay_nop);
      if (psISO && kdISO) {
        return (pNop === kdISO || pPS === psISO || pPS === kdISO || pNop === psISO);
      }
      if (kdISO) {
        return (pNop === kdISO || pPS === kdISO);
      }
      if (psISO) {
        return (pPS === psISO || pNop === psISO);
      }
      return true;
    });

    // 3. Cộng dồn số tờ từng mệnh giá (500.000đ -> 1.000đ)
    const menhGiaChiTiet = [];
    let tongSoToToanBo = 0;
    let tongTienMatFromBills = 0;
    let tongTienXeBills = 0;
    let tongTienSaleBills = 0;

    MENH_GIA_QUY.forEach(m => {
      const cot = COT_SL_MENH_GIA[m];
      let soToXe = 0;
      xeNopTrongNgay.forEach(x => {
        const sl = parseInt(x[cot] || (x.soToDemTien && (x.soToDemTien[m] || x.soToDemTien[String(m)])) || (x.soToMap && (x.soToMap[m] || x.soToMap[String(m)])) || 0) || 0;
        soToXe += sl;
      });

      let soToSale = 0;
      saleNopTrongNgay.forEach(s => {
        const sl = parseInt(s[cot] || (s.soToDemTien && (s.soToDemTien[m] || s.soToDemTien[String(m)])) || 0) || 0;
        soToSale += sl;
      });

      const tongSoTo = soToXe + soToSale;
      const thanhTien = tongSoTo * m; // Số lượng * Mệnh giá (VNĐ)
      const thanhTien1000 = Math.round(thanhTien / 1000);

      tongSoToToanBo += tongSoTo;
      tongTienMatFromBills += thanhTien;
      tongTienXeBills += soToXe * m;
      tongTienSaleBills += soToSale * m;

      menhGiaChiTiet.push({
        menhGia: m,
        menhGiaLabel: formatMenhGiaLabel(m), // "500.000đ", "200.000đ"...
        menhGiaK: m / 1000,
        soToXe: soToXe,
        soToSale: soToSale,
        soLuong: tongSoTo,
        thanhTien: thanhTien,
        thanhTien1000: thanhTien1000
      });
    });

    // 4. Lập danh sách nguồn tiền minh bạch (Traceability) & tính tổng tiền xe thực tế
    let tongTienXeThucTe = 0;
    const nguonTienChiTiet = [];
    xeNopTrongNgay.forEach((x, i) => {
      // Tiền đếm từ số tờ của xe này
      let tienDemTungXe = 0;
      MENH_GIA_QUY.forEach(m => {
        const cot = COT_SL_MENH_GIA[m];
        const sl = parseInt(x[cot] || (x.soToDemTien && (x.soToDemTien[m] || x.soToDemTien[String(m)])) || (x.soToMap && (x.soToMap[m] || x.soToMap[String(m)])) || 0) || 0;
        tienDemTungXe += sl * m;
      });

      // Tiền quyết toán thực tế của chuyến xe
      const tienQuyetToan = tinhTienMatCuaDot(x);
      const st = tienDemTungXe > 0 ? tienDemTungXe : tienQuyetToan;
      tongTienXeThucTe += st;

      const mapSoTo = {};
      MENH_GIA_QUY.forEach(m => {
        const cot = COT_SL_MENH_GIA[m];
        mapSoTo[m] = parseInt(x[cot] || (x.soToDemTien && (x.soToDemTien[m] || x.soToDemTien[String(m)])) || (x.soToMap && (x.soToMap[m] || x.soToMap[String(m)])) || 0) || 0;
      });

      nguonTienChiTiet.push({
        stt: i + 1,
        loaiNguon: 'xe',
        nhanLoai: '🚚 Chuyến Xe',
        tenNguon: x.xe || x.maDot || x.ma_dot || 'Chuyến xe',
        nguoiNop: x.nguoi_nop || x.taiXe || x.tai_xe || '--',
        ngayPhatSinh: chuyenDinhDangNgayVN(chuanHoaNgayISO(x.ngay_phat_sinh || x.ngayGiao || x.ngayRaw) || kdISO),
        soTien: st,
        soToMap: mapSoTo,
        maGoc: x.ma_phieu || x.maDot || x.ma_dot || ''
      });
    });

    let tongTienSaleThucTe = 0;
    saleNopTrongNgay.forEach((s, i) => {
      let tienDemSale = 0;
      MENH_GIA_QUY.forEach(m => {
        const cot = COT_SL_MENH_GIA[m];
        const sl = parseInt(s[cot] || 0) || 0;
        tienDemSale += sl * m;
      });
      const tienQuyetToanSale = tinhTienMatCuaSale(s);
      const st = tienDemSale > 0 ? tienDemSale : tienQuyetToanSale;
      tongTienSaleThucTe += st;

      const mapSoTo = {};
      MENH_GIA_QUY.forEach(m => {
        const cot = COT_SL_MENH_GIA[m];
        mapSoTo[m] = parseInt(s[cot] || 0) || 0;
      });

      nguonTienChiTiet.push({
        stt: nguonTienChiTiet.length + 1,
        loaiNguon: 'sale',
        nhanLoai: '💼 Nhân viên Sale',
        tenNguon: s.ten_nv_sale || s.nguoiNop || 'Sale',
        nguoiNop: s.ten_nv_sale || s.nguoiNop || '--',
        ngayPhatSinh: chuyenDinhDangNgayVN(chuanHoaNgayISO(s.ngay_phat_sinh || s.ngayPhatSinh) || kdISO),
        soTien: st,
        soToMap: mapSoTo,
        maGoc: s.ma_phieu || s.maPhieu || s.id || ''
      });
    });

    // Đồng bộ chính xác tổng tiền xe & tổng tiền sale bằng tổng cột số tiền thực tế
    const finalTongTienXe = tongTienXeThucTe;
    const finalTongTienSale = tongTienSaleThucTe;
    const finalTongTienMat = (tongTienMatFromBills > 0 && tongTienMatFromBills >= (finalTongTienXe + finalTongTienSale))
      ? tongTienMatFromBills
      : (finalTongTienXe + finalTongTienSale);

    return {
      ngayKiemDem: kdISO,
      ngayPhatSinh: psISO || kdISO,
      menhGiaChiTiet: menhGiaChiTiet,
      tongSoTo: tongSoToToanBo,
      tongTienMat: finalTongTienMat,
      tongTien1000: Math.round(finalTongTienMat / 1000),
      tongTienXe: finalTongTienXe,
      tongTienSale: finalTongTienSale,
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
    docBanChotQuyNgay,
    parseMenhGia,
    formatMenhGiaLabel,
    chuanHoaNgayISO,
    tinhTienMatCuaDot,
    tinhTienMatCuaSale
  };

})(typeof window !== 'undefined' ? window : globalThis);
