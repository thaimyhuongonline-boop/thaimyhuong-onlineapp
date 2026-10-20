/* ====================================================================
 * buoc2_chot_quy_ui.js — UI CONTROLLER CHO THU TIỀN SALE & CHỐT QUỸ NGÀY
 * Công ty TNHH Thái Mỹ Hương
 * ==================================================================== */

(function (window) {
  'use strict';

  // Biến trạng thái bảng đếm tiền Sale
  const SO_TO_SALE = {
    500000: 0, 200000: 0, 100000: 0, 50000: 0, 20000: 0, 10000: 0, 5000: 0, 2000: 0, 1000: 0
  };

  let duLieuChotQuyHienTai = null;

  // ----------------------------------------------------
  // A. KHỞI TẠO & ĐIỀU HƯỚNG TAB
  // ----------------------------------------------------
  function khoiTaoTabThuTienSale() {
    // 1. Mặc định ngày phát sinh là hôm nay hoặc hôm qua
    const inpPS = document.getElementById('saleNgayPhatSinh');
    const inpNop = document.getElementById('saleNgayNop');
    if (inpPS && !inpPS.value) inpPS.value = TMHChotQuy.layNgayHomNayISO();
    if (inpNop && !inpNop.value) inpNop.value = TMHChotQuy.layNgayHomNayISO();

    // 2. Nạp danh mục nhân viên kinh doanh vào dropdown
    napDropdownSale();

    // 3. Render bảng đếm mệnh giá tiền nộp của Sale
    veBangDemTienSale();

    // 4. Render danh sách các phiếu thu Sale đã lập
    taiVaVeDanhSachPhieuSale();
  }

  function napDropdownSale() {
    const sel = document.getElementById('saleNhanVien');
    if (!sel) return;

    let dsNVKD = [];
    try {
      const dmLocal = JSON.parse(localStorage.getItem('tmh_danh_muc_kinh_doanh') || '[]');
      if (Array.isArray(dmLocal) && dmLocal.length) dsNVKD = dmLocal;
    } catch (e) {}

    if (!dsNVKD.length && typeof sb !== 'undefined') {
      sb.from('nv_kinh_doanh').select('*').then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length) {
          localStorage.setItem('tmh_danh_muc_kinh_doanh', JSON.stringify(data));
          capNhatOptionsSale(data);
        }
      });
    }

    if (!dsNVKD.length) {
      dsNVKD = [
        { ma_nv: 'NVKD01', ho_ten: 'Nguyễn Tống Duy Nam' },
        { ma_nv: 'NVKD02', ho_ten: 'Nguyễn Hồng Phúc' },
        { ma_nv: 'NVKD03', ho_ten: 'Nguyễn Văn An' },
        { ma_nv: 'NVKD04', ho_ten: 'Trần Thị Mai' }
      ];
    }
    capNhatOptionsSale(dsNVKD);
  }

  function capNhatOptionsSale(ds) {
    const sel = document.getElementById('saleNhanVien');
    if (!sel) return;
    const curVal = sel.value;
    sel.innerHTML = '<option value="">-- Chọn nhân viên Sale / Kinh doanh --</option>';
    ds.forEach(nv => {
      const opt = document.createElement('option');
      opt.value = nv.ho_ten || nv.ten || nv.ma_nv;
      opt.setAttribute('data-manv', nv.ma_nv || '');
      opt.textContent = `👤 ${nv.ho_ten || nv.ten} ${nv.ma_nv ? `(${nv.ma_nv})` : ''}`;
      sel.appendChild(opt);
    });
    if (curVal) sel.value = curVal;
  }

  // ----------------------------------------------------
  // B. BẢNG ĐẾM TIỀN MẶT CỦA SALE (BẮT BUỘC ĐÍNH KÈM)
  // ----------------------------------------------------
  function veBangDemTienSale() {
    const tbody = document.getElementById('tbodyDemTienSale');
    if (!tbody) return;

    tbody.innerHTML = TMHChotQuy.MENH_GIA_QUY.map(m => {
      const sl = SO_TO_SALE[m] || 0;
      const tt = sl * m;
      return `
        <tr>
          <td style="font-weight:700; color:var(--text-main); font-size:12.5px;">${TMHChotQuy.fmtTien(m)} đ</td>
          <td style="text-align:center;">
            <input type="number" min="0" class="input-table" style="text-align:center; font-weight:800; width:90px; height:28px;"
              value="${sl > 0 ? sl : ''}" placeholder="0"
              oninput="nhapSoToSale(${m}, this.value)">
          </td>
          <td style="text-align:right; font-weight:700; color:#16a34a; font-size:12.5px;" id="ttSale_${m}">
            ${TMHChotQuy.fmtTien(tt)} đ
          </td>
        </tr>
      `;
    }).join('');

    capNhatTongBangDemSale();
  }

  function nhapSoToSale(menhGia, val) {
    const mg = (typeof TMHChotQuy !== 'undefined' && TMHChotQuy.parseMenhGia) ? TMHChotQuy.parseMenhGia(menhGia) : menhGia;
    const sl = Math.max(0, parseInt(val) || 0);
    SO_TO_SALE[mg] = sl;
    const elTT = document.getElementById(`ttSale_${mg}`);
    if (elTT) elTT.textContent = TMHChotQuy.fmtTien(sl * mg) + ' đ';
    capNhatTongBangDemSale();
  }

  function capNhatTongBangDemSale() {
    let tongTo = 0;
    let tongTien = 0;
    TMHChotQuy.MENH_GIA_QUY.forEach(m => {
      const sl = SO_TO_SALE[m] || 0;
      tongTo += sl;
      tongTien += sl * m;
    });

    const elTongTo = document.getElementById('tongSoToSale');
    const elTongTien = document.getElementById('tongTienDemSale');
    if (elTongTo) elTongTo.textContent = TMHChotQuy.fmtTien(tongTo) + ' tờ';
    if (elTongTien) elTongTien.textContent = TMHChotQuy.fmtTien(tongTien) + ' đ';

    // Cập nhật trạng thái khớp / lệch với số tiền nộp khai báo
    const inpKhaiBao = document.getElementById('saleSoTienNop');
    const stKhaiBao = parseTienVN(inpKhaiBao ? inpKhaiBao.value : 0);
    const boxStatus = document.getElementById('boxTrangThaiDemSale');
    if (!boxStatus) return;

    if (tongTo === 0) {
      boxStatus.style.background = '#fef2f2';
      boxStatus.style.color = '#b91c1c';
      boxStatus.style.borderColor = '#fecaca';
      boxStatus.innerHTML = '⚠️ Bảng kê nộp tiền đang trống! Vui lòng nhập số tờ theo từng mệnh giá.';
    } else if (stKhaiBao <= 0) {
      boxStatus.style.background = '#eff6ff';
      boxStatus.style.color = '#1d4ed8';
      boxStatus.style.borderColor = '#bfdbfe';
      boxStatus.innerHTML = `Đã đếm: <b>${TMHChotQuy.fmtTien(tongTien)} đ</b> (${TMHChotQuy.fmtTien(tongTo)} tờ). Hãy nhập số tiền nộp khai báo để đối soát.`;
    } else {
      const diff = tongTien - stKhaiBao;
      if (diff === 0) {
        boxStatus.style.background = '#f0fdf4';
        boxStatus.style.color = '#15803d';
        boxStatus.style.borderColor = '#86efac';
        boxStatus.innerHTML = `✅ <b>KHỚP 100%:</b> Tổng tiền đếm ${TMHChotQuy.fmtTien(tongTien)} đ (${TMHChotQuy.fmtTien(tongTo)} tờ) trùng khớp hoàn toàn số tiền nộp khai báo.`;
      } else {
        boxStatus.style.background = '#fef2f2';
        boxStatus.style.color = '#b91c1c';
        boxStatus.style.borderColor = '#fecaca';
        boxStatus.innerHTML = `❌ <b>CHƯA KHỚP (LỆCH ${diff > 0 ? '+' : ''}${TMHChotQuy.fmtTien(diff)} đ):</b> Tiền đếm ${TMHChotQuy.fmtTien(tongTien)} đ ≠ Khai báo ${TMHChotQuy.fmtTien(stKhaiBao)} đ. Vui lòng kiểm đếm lại!`;
      }
    }
  }

  function xoaBangDemSale() {
    TMHChotQuy.MENH_GIA_QUY.forEach(m => { SO_TO_SALE[m] = 0; });
    veBangDemTienSale();
  }

  function dienNhanhTienSaleTuBangDem() {
    let tongTien = 0;
    TMHChotQuy.MENH_GIA_QUY.forEach(m => { tongTien += (SO_TO_SALE[m] || 0) * m; });
    if (tongTien > 0) {
      const inp = document.getElementById('saleSoTienNop');
      if (inp) {
        inp.value = TMHChotQuy.fmtTien(tongTien);
        capNhatTongBangDemSale();
      }
    }
  }

  function parseTienVN(val) {
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (!val) return 0;
    const clean = String(val).replace(/[^\d.,-]/g, '').trim();
    if (!clean) return 0;
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
  }

  // ----------------------------------------------------
  // C. LƯU PHIẾU THU TIỀN SALE (CÓ VALIDATION CHẶT CHẼ)
  // ----------------------------------------------------
  async function luuFormThuTienSale() {
    const inpPS = document.getElementById('saleNgayPhatSinh');
    const inpNop = document.getElementById('saleNgayNop');
    const selNV = document.getElementById('saleNhanVien');
    const inpNoiDung = document.getElementById('saleNoiDung');
    const inpTien = document.getElementById('saleSoTienNop');
    const inpNhan = document.getElementById('saleNguoiNhan');
    const inpGhiChu = document.getElementById('saleGhiChu');

    const ngayPS = (inpPS ? inpPS.value : '').trim();
    const ngayNop = (inpNop ? inpNop.value : layNgayHomNayISO()).trim();
    const tenSale = (selNV ? selNV.value : '').trim();
    const maNV = (selNV && selNV.selectedOptions && selNV.selectedOptions[0]) ? (selNV.selectedOptions[0].getAttribute('data-manv') || '') : '';
    const noiDung = (inpNoiDung ? inpNoiDung.value : '').trim();
    const soTien = parseTienVN(inpTien ? inpTien.value : 0);
    const nguoiNhan = (inpNhan ? inpNhan.value : 'Thủ quỹ').trim();
    const ghiChu = (inpGhiChu ? inpGhiChu.value : '').trim();

    // 1. Validate ngày phát sinh & ngày nộp
    const vNgay = TMHChotQuy.validateNgayPhatSinh(ngayPS, ngayNop);
    if (!vNgay.valid) {
      alert('⚠️ ' + vNgay.message);
      if (inpPS) inpPS.focus();
      return;
    }

    // 2. Validate nhân viên sale
    if (!tenSale) {
      alert('⚠️ Vui lòng chọn hoặc nhập Nhân viên Sale nộp tiền!');
      if (selNV) selNV.focus();
      return;
    }

    // 3. Validate số tiền nộp
    if (soTien <= 0) {
      alert('⚠️ Vui lòng nhập số tiền nộp lớn hơn 0 đ!');
      if (inpTien) inpTien.focus();
      return;
    }

    // 4. Validate bảng kê nộp tiền theo mệnh giá (bắt buộc)
    const vBangKe = TMHChotQuy.validateBangKeNopTien(SO_TO_SALE, soTien);
    if (!vBangKe.valid) {
      alert('⚠️ LỖI BẢNG KÊ NỘP TIỀN:\n\n' + vBangKe.message);
      return;
    }

    const payload = {
      ma_nv_sale: maNV,
      ten_nv_sale: tenSale,
      ngay_phat_sinh: ngayPS,
      ngay_nop: ngayNop,
      so_tien_nop: soTien,
      nguoi_nhan: nguoiNhan,
      noi_dung: noiDung || `Thu tiền bán hàng sale ${tenSale}`,
      sl_500k: SO_TO_SALE[500000] || 0,
      sl_200k: SO_TO_SALE[200000] || 0,
      sl_100k: SO_TO_SALE[100000] || 0,
      sl_50k: SO_TO_SALE[50000] || 0,
      sl_20k: SO_TO_SALE[20000] || 0,
      sl_10k: SO_TO_SALE[10000] || 0,
      sl_5k: SO_TO_SALE[5000] || 0,
      sl_2k: SO_TO_SALE[2000] || 0,
      sl_1k: SO_TO_SALE[1000] || 0,
      ghi_chu: ghiChu
    };

    const res = await TMHChotQuy.luuPhieuThuSale(payload);
    if (!res.ok) {
      alert('❌ Không lưu được phiếu: ' + res.error);
      return;
    }

    alert(`✅ ĐÃ LƯU PHIẾU THU TIỀN SALE THÀNH CÔNG!\n\n• Nhân viên: ${tenSale}\n• Ngày phát sinh: ${TMHChotQuy.chuyenDinhDangNgayVN(ngayPS)}\n• Ngày nộp: ${TMHChotQuy.chuyenDinhDangNgayVN(ngayNop)}\n• Số tiền: ${TMHChotQuy.fmtTien(soTien)} đ (${TMHChotQuy.fmtTien(vBangKe.tongSoTo)} tờ)\n• Dữ liệu đã sẵn sàng để đổ vào Bảng Chốt Quỹ.`);

    // Reset form
    if (inpNoiDung) inpNoiDung.value = '';
    if (inpTien) inpTien.value = '';
    if (inpGhiChu) inpGhiChu.value = '';
    xoaBangDemSale();

    // Tải lại danh sách
    taiVaVeDanhSachPhieuSale();
  }

  async function taiVaVeDanhSachPhieuSale() {
    const tbody = document.getElementById('tbodyDanhSachPhieuSale');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--text-muted);">⏳ Đang tải danh sách phiếu thu Sale...</td></tr>';
    const ds = await TMHChotQuy.taiDanhSachThuTienSaleCloud();

    const badgeSale = document.getElementById('badgeSoPhieuSale');
    if (badgeSale) {
      badgeSale.textContent = ds.length;
      badgeSale.style.display = ds.length > 0 ? 'inline-block' : 'none';
    }

    if (!ds.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted);">Chưa có phiếu thu tiền Sale nào.</td></tr>';
      return;
    }

    tbody.innerHTML = ds.map((p, i) => {
      const toStr = [];
      if (p.sl_500k) toStr.push(`500k: <b>${p.sl_500k}</b>`);
      if (p.sl_200k) toStr.push(`200k: <b>${p.sl_200k}</b>`);
      if (p.sl_100k) toStr.push(`100k: <b>${p.sl_100k}</b>`);
      if (p.sl_50k) toStr.push(`50k: <b>${p.sl_50k}</b>`);
      if (p.sl_20k) toStr.push(`20k: <b>${p.sl_20k}</b>`);
      if (p.sl_10k) toStr.push(`10k: <b>${p.sl_10k}</b>`);
      if (p.sl_5k) toStr.push(`5k: <b>${p.sl_5k}</b>`);
      if (p.sl_2k) toStr.push(`2k: <b>${p.sl_2k}</b>`);
      if (p.sl_1k) toStr.push(`1k: <b>${p.sl_1k}</b>`);

      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:var(--text-muted);">${i + 1}</td>
          <td style="font-family:monospace; font-weight:700; font-size:11px;">${TMHChotQuy.escapeH(p.ma_phieu || '')}</td>
          <td style="text-align:center; white-space:nowrap; font-size:11.5px; font-weight:700; color:#0369a1;">
            ${TMHChotQuy.chuyenDinhDangNgayVN(p.ngay_phat_sinh)}
          </td>
          <td style="text-align:center; white-space:nowrap; font-size:11.5px;">
            ${TMHChotQuy.chuyenDinhDangNgayVN(p.ngay_nop)}
          </td>
          <td><b>${TMHChotQuy.escapeH(p.ten_nv_sale || '--')}</b></td>
          <td style="font-size:11.5px;">${TMHChotQuy.escapeH(p.noi_dung || '--')}</td>
          <td class="num-cell" style="color:#16a34a; font-weight:900; font-size:13px; text-align:right;">
            ${TMHChotQuy.fmtTien(p.so_tien_nop)} đ
          </td>
          <td style="font-size:10.5px; color:#475569; max-width:240px;">
            ${toStr.join(' · ') || '--'}
          </td>
          <td style="font-size:11px; text-align:center;">${TMHChotQuy.escapeH(p.nguoi_nhan || '--')}</td>
          <td style="text-align:center; white-space:nowrap;">
            <button type="button" class="btn btn-outline" style="height:24px; padding:0 6px; font-size:11px; color:#dc2626; border-color:#fca5a5;"
              onclick="xoaPhieuSaleUI(${TMHChotQuy.escapeH(JSON.stringify(p.ma_phieu))})" title="Xoá phiếu thu này">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function xoaPhieuSaleUI(maPhieu) {
    if (!confirm(`⚠️ Bạn có chắc muốn xoá phiếu thu tiền Sale [${maPhieu}]?`)) return;
    await TMHChotQuy.xoaPhieuThuSale(maPhieu);
    taiVaVeDanhSachPhieuSale();
  }

  // ----------------------------------------------------
  // D. HỢP NHẤT DỮ LIỆU & BẢNG CHỐT QUỸ THEO NGÀY
  // ----------------------------------------------------
  function khoiTaoTabChotQuy() {
    const inpKD = document.getElementById('cqNgayKiemDem');
    const inpPS = document.getElementById('cqNgayPhatSinh');
    if (inpKD && !inpKD.value) inpKD.value = TMHChotQuy.layNgayHomNayISO();
    if (inpPS && !inpPS.value) inpPS.value = TMHChotQuy.layNgayHomQuaISO();

    taiDuLieuChotQuy();
  }

  async function taiDuLieuChotQuy() {
    const inpKD = document.getElementById('cqNgayKiemDem');
    const inpPS = document.getElementById('cqNgayPhatSinh');
    const ngayKD = (inpKD ? inpKD.value : layNgayHomNayISO()).trim();
    const ngayPS = (inpPS ? inpPS.value : '').trim();

    // 1. Tải phiếu xe (từ window.danhSachTatCaDot, local lịch sử đợt hoặc Supabase)
    const mapXe = new Map();

    // 1a. Từ in-memory window.danhSachTatCaDot
    if (typeof window !== 'undefined' && Array.isArray(window.danhSachTatCaDot)) {
      window.danhSachTatCaDot.filter(d => !!d.daQuyetToan).forEach(d => {
        const ma = d.maDot || d.ma_dot || (d.xe + '_' + (d.ngayGiao || d.ngayRaw));
        if (ma) mapXe.set(ma, d);
      });
    }

    // 1b. Từ LocalStorage
    try {
      const rawDot = localStorage.getItem('tmh_lich_su_dot') || '[]';
      const arr = JSON.parse(rawDot);
      (arr || []).filter(d => !!d.daQuyetToan).forEach(d => {
        const ma = d.maDot || d.ma_dot || (d.xe + '_' + (d.ngayGiao || d.ngayRaw));
        if (ma && !mapXe.has(ma)) {
          mapXe.set(ma, d);
        }
      });
    } catch (e) {}

    // 1c. Bổ sung từ Supabase luu_tru (docLuuTruMoiNhat) khi đứng ở màn hình độc lập
    if (typeof docLuuTruMoiNhat === 'function') {
      try {
        const { data: dataLT } = await docLuuTruMoiNhat(2000);
        if (dataLT && Array.isArray(dataLT)) {
          dataLT.filter(d => !!d.daQuyetToan).forEach(d => {
            const ma = d.maDot || d.ma_dot || (d.xe + '_' + (d.ngayGiao || d.ngayRaw));
            if (ma && !mapXe.has(ma)) {
              mapXe.set(ma, d);
            }
          });
        }
      } catch (e) {}
    }

    // 1d. Từ Supabase phieu_nop_tien
    if (typeof sb !== 'undefined') {
      try {
        const { data } = await sb.from('phieu_nop_tien').select('*').limit(1000);
        if (data && data.length) {
          const setMa = new Set(Array.from(mapXe.keys()).map(m => `PNP_${m}`));
          data.forEach(p => {
            if (!setMa.has(p.ma_phieu) && !mapXe.has(p.ma_phieu)) {
              mapXe.set(p.ma_phieu, p);
            }
          });
        }
      } catch (e) {}
    }

    const dsXe = Array.from(mapXe.values());

    // 2. Tải phiếu Sale
    const dsSale = await TMHChotQuy.taiDanhSachThuTienSaleCloud();

    // 3. Tải chi phát sinh
    const dsChi = await TMHChotQuy.taiDanhSachChiPhatSinhCloud(ngayKD, ngayKD);

    // 4. Hợp nhất dữ liệu kiểm quỹ
    duLieuChotQuyHienTai = TMHChotQuy.hopNhatKiemQuyTheoNgay(ngayKD, ngayPS, dsXe, dsSale);

    // 5. Tách chi trước chốt và chi sau chốt
    const chiTruocChot = dsChi.filter(c => !c.sau_chot_quy);
    const chiSauChot = dsChi.filter(c => !!c.sau_chot_quy);

    // 6. Tính toán chốt quỹ & nộp ngân hàng & lưu két
    const kqTinh = TMHChotQuy.tinhToanChotQuy(
      duLieuChotQuyHienTai.tongTienXe,
      duLieuChotQuyHienTai.tongTienSale,
      chiTruocChot,
      chiSauChot
    );

    duLieuChotQuyHienTai.kqTinh = kqTinh;
    duLieuChotQuyHienTai.dsChiTruocChot = chiTruocChot;
    duLieuChotQuyHienTai.dsChiSauChot = chiSauChot;

    // 7. Render giao diện
    veGiaoDienChotQuy();
  }

  function veGiaoDienChotQuy() {
    if (!duLieuChotQuyHienTai) return;
    const d = duLieuChotQuyHienTai;
    const t = d.kqTinh;

    // A. 4 THẺ TỔNG QUAN TÀI CHÍNH (KPI)
    const kpiThuXe = document.getElementById('cqKpiThuXe');
    const kpiThuSale = document.getElementById('cqKpiThuSale');
    const kpiTongChi = document.getElementById('cqKpiTongChi');
    const kpiNopNH = document.getElementById('cqKpiNopNH');

    if (kpiThuXe) kpiThuXe.textContent = TMHChotQuy.fmtTien(d.tongTienXe) + ' đ';
    if (kpiThuSale) kpiThuSale.textContent = TMHChotQuy.fmtTien(d.tongTienSale) + ' đ';
    if (kpiTongChi) kpiTongChi.textContent = TMHChotQuy.fmtTien(t.tongChiTruocChot + t.tongChiSauChot) + ' đ';
    if (kpiNopNH) kpiNopNH.textContent = TMHChotQuy.fmtTien(t.tienNopNganHang) + ' đ';

    const kpiSubNopNH = document.getElementById('cqKpiSubNopNH');
    if (kpiSubNopNH) {
      kpiSubNopNH.textContent = `= Thu (${TMHChotQuy.fmtTien(t.tongThu)}) - Chi (${TMHChotQuy.fmtTien(t.tongChiTruocChot)})`;
    }

    // B. BẢNG KIỂM QUỸ TIỀN MẶT THEO ĐÚNG MẪU EXCEL CỦA NGƯỜI DÙNG
    const elNgayKD = document.getElementById('cqHeaderNgayKD');
    const elNgayPS = document.getElementById('cqHeaderNgayPS');
    if (elNgayKD) elNgayKD.textContent = TMHChotQuy.chuyenDinhDangNgayVN(d.ngayKiemDem);
    if (elNgayPS) elNgayPS.textContent = TMHChotQuy.chuyenDinhDangNgayVN(d.ngayPhatSinh);

    const tbodyMenhGia = document.getElementById('tbodyKiemQuyMenhGia');
    if (tbodyMenhGia) {
      tbodyMenhGia.innerHTML = d.menhGiaChiTiet.map(r => `
        <tr>
          <td style="text-align:center; font-weight:800; font-size:13px;">${r.menhGiaLabel || (TMHChotQuy.formatMenhGiaLabel ? TMHChotQuy.formatMenhGiaLabel(r.menhGia) : (TMHChotQuy.fmtTien(r.menhGia) + 'đ'))}</td>
          <td style="text-align:center; font-weight:800; color:#0369a1; font-size:13px;">${r.soLuong > 0 ? TMHChotQuy.fmtTien(r.soLuong) : '0'}</td>
          <td style="text-align:right; font-weight:800; color:#16a34a; font-size:13px;">${TMHChotQuy.fmtTien(r.thanhTien)} đ</td>
        </tr>
      `).join('');
    }

    const footTongCong = document.getElementById('cqFootTongCong1000');
    if (footTongCong) footTongCong.textContent = TMHChotQuy.fmtTien(d.tongTienMat) + ' đ';

    const footTongSoTo = document.getElementById('cqFootTongSoTo');
    if (footTongSoTo) footTongSoTo.textContent = TMHChotQuy.fmtTien(d.tongSoTo);

    // Bảng nhỏ: TỔNG QUỸ TIỀN MẶT
    const elNgayKDMini = document.getElementById('cqMiniNgayKD');
    const elNgayPSMini = document.getElementById('cqMiniNgayPS');
    const elSoTienMini = document.getElementById('cqMiniSoTien');
    const elTongCongMini = document.getElementById('cqMiniTongCong');

    if (elNgayKDMini) elNgayKDMini.textContent = TMHChotQuy.chuyenDinhDangNgayVN(d.ngayKiemDem);
    if (elNgayPSMini) elNgayPSMini.textContent = TMHChotQuy.chuyenDinhDangNgayVN(d.ngayPhatSinh);
    if (elSoTienMini) elSoTienMini.textContent = TMHChotQuy.fmtTien(d.tongTienMat) + ' đ';
    if (elTongCongMini) elTongCongMini.textContent = TMHChotQuy.fmtTien(d.tongTienMat) + ' đ';

    // C. BẢNG MINH BẠCH NGUỒN TIỀN (TRẬT TỰ & CHI TIẾT TỪNG XE, TỪNG SALE)
    const tbodyNguon = document.getElementById('tbodyNguonTienChotQuy');
    if (tbodyNguon) {
      if (!d.nguonTienChiTiet.length) {
        tbodyNguon.innerHTML = '<tr><td colspan="15" style="text-align:center; padding:20px; color:var(--text-muted);">Chưa có chuyến xe hoặc nhân viên Sale nào nộp tiền vào ngày kiểm đếm này.</td></tr>';
      } else {
        tbodyNguon.innerHTML = d.nguonTienChiTiet.map(n => `
          <tr>
            <td style="text-align:center; font-weight:700; color:var(--text-muted);">${n.stt}</td>
            <td style="white-space:nowrap; font-weight:700;">
              ${n.loaiNguon === 'xe' 
                ? `<span class="badge-status" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">${n.nhanLoai}</span>` 
                : `<span class="badge-status" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">${n.nhanLoai}</span>`}
            </td>
            <td><b>${TMHChotQuy.escapeH(n.tenNguon)}</b></td>
            <td>${TMHChotQuy.escapeH(n.nguoiNop)}</td>
            <td style="text-align:center; font-size:11.5px;">${TMHChotQuy.chuyenDinhDangNgayVN(n.ngayPhatSinh)}</td>
            <td class="num-cell" style="color:#16a34a; font-weight:900; text-align:right;">${TMHChotQuy.fmtTien(n.soTien)} đ</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[500000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[200000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[100000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[50000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[20000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[10000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[5000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[2000] || '-'}</td>
            <td style="text-align:center; font-size:11px;">${n.soToMap[1000] || '-'}</td>
          </tr>
        `).join('');
      }
    }

    // D. BẢNG CHI PHÁT SINH TRONG NGÀY
    const tbodyChi = document.getElementById('tbodyChiPhatSinhNgay');
    const allChi = [...d.dsChiTruocChot, ...d.dsChiSauChot];
    if (tbodyChi) {
      if (!allChi.length) {
        tbodyChi.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:18px; color:var(--text-muted);">Chưa có khoản chi phát sinh nào trong ngày kiểm đếm này.</td></tr>';
      } else {
        tbodyChi.innerHTML = allChi.map((c, i) => `
          <tr>
            <td style="text-align:center; font-weight:700; color:var(--text-muted);">${i + 1}</td>
            <td style="font-weight:700; color:#b91c1c;">${TMHChotQuy.escapeH(c.hang_muc || 'Chi phát sinh')}</td>
            <td>${TMHChotQuy.escapeH(c.noi_dung)}</td>
            <td class="num-cell" style="color:#dc2626; font-weight:800; text-align:right;">${TMHChotQuy.fmtTien(c.so_tien)} đ</td>
            <td>${TMHChotQuy.escapeH(c.nguoi_nhan || '--')}</td>
            <td style="font-size:11px; font-family:monospace;">${TMHChotQuy.escapeH(c.chung_tu || '--')}</td>
            <td style="text-align:center;">
              ${c.sau_chot_quy 
                ? `<span class="badge-status" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;">⚡ Chi sau chốt quỹ</span>` 
                : `<span class="badge-status" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Trước chốt</span>`}
            </td>
            <td style="text-align:center;">
              <button type="button" class="btn btn-outline" style="height:24px; padding:0 6px; font-size:11px; color:#dc2626; border-color:#fca5a5;"
                onclick="xoaChiUI(${TMHChotQuy.escapeH(JSON.stringify(c.ma_chi))})" title="Xoá khoản chi này">
                🗑️
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // E. KHỐI TỔNG KẾT TIỀN MẶT LƯU KÉT & CẢNH BÁO ÂM QUỸ
    const elChiSauChot = document.getElementById('cqTongChiSauChot');
    const elTienLuuKet = document.getElementById('cqTienMatLuuKet');
    const boxCanhBaoAm = document.getElementById('cqBoxCanhBaoAmQuy');

    if (elChiSauChot) elChiSauChot.textContent = TMHChotQuy.fmtTien(t.tongChiSauChot) + ' đ';
    if (elTienLuuKet) elTienLuuKet.textContent = TMHChotQuy.fmtTien(t.tienMatLuuKet) + ' đ';

    if (boxCanhBaoAm) {
      if (t.canhBaoAmQuy) {
        boxCanhBaoAm.style.display = 'block';
        boxCanhBaoAm.innerHTML = `⚠️ <b>CẢNH BÁO ÂM QUỸ KÉT:</b> Khoản chi phát sinh sau chốt (${TMHChotQuy.fmtTien(t.tongChiSauChot)} đ) vượt quá tiền mặt tồn quỹ (${TMHChotQuy.fmtTien(t.tienLuuKetBanDau)} đ)! Quỹ két đang bị âm <b>${TMHChotQuy.fmtTien(t.soTienThieuKet)} đ</b>. Vui lòng cấp thêm tiền mặt vào két hoặc kiểm tra lại khoản chi!`;
      } else {
        boxCanhBaoAm.style.display = 'none';
      }
    }
  }

  // ----------------------------------------------------
  // E. QUẢN LÝ CHI PHÁT SINH (MODAL THÊM CHI)
  // ----------------------------------------------------
  function moModalThemChi(sauChot = false) {
    const modal = document.getElementById('modalThemChiPhatSinh');
    if (!modal) return;
    const inpNgay = document.getElementById('chiNgayChi');
    const inpKD = document.getElementById('cqNgayKiemDem');
    if (inpNgay) inpNgay.value = (inpKD && inpKD.value) ? inpKD.value : TMHChotQuy.layNgayHomNayISO();

    const chkSauChot = document.getElementById('chiSauChotQuy');
    if (chkSauChot) chkSauChot.checked = !!sauChot;

    document.getElementById('chiHangMuc').value = 'Xăng dầu';
    document.getElementById('chiNoiDung').value = '';
    document.getElementById('chiSoTien').value = '';
    document.getElementById('chiNguoiNhan').value = '';
    document.getElementById('chiChungTu').value = '';

    modal.style.display = 'flex';
  }

  function dongModalThemChi() {
    const modal = document.getElementById('modalThemChiPhatSinh');
    if (modal) modal.style.display = 'none';
  }

  async function luuModalChi() {
    const hangMuc = document.getElementById('chiHangMuc')?.value || '';
    const noiDung = document.getElementById('chiNoiDung')?.value || '';
    const soTien = parseTienVN(document.getElementById('chiSoTien')?.value || 0);
    const ngayChi = document.getElementById('chiNgayChi')?.value || TMHChotQuy.layNgayHomNayISO();
    const nguoiNhan = document.getElementById('chiNguoiNhan')?.value || '';
    const chungTu = document.getElementById('chiChungTu')?.value || '';
    const sauChot = !!document.getElementById('chiSauChotQuy')?.checked;

    if (!noiDung.trim()) {
      alert('⚠️ Vui lòng nhập nội dung chi tiết khoản chi!');
      return;
    }
    if (soTien <= 0) {
      alert('⚠️ Vui lòng nhập số tiền chi lớn hơn 0 đ!');
      return;
    }

    const res = await TMHChotQuy.luuKhoanChiPhatSinh({
      ngay_chi: ngayChi,
      hang_muc: hangMuc,
      noi_dung: noiDung,
      so_tien: soTien,
      nguoi_nhan: nguoiNhan,
      chung_tu: chungTu,
      sau_chot_quy: sauChot
    });

    if (!res.ok) {
      alert('❌ Lỗi: ' + res.error);
      return;
    }

    dongModalThemChi();
    taiDuLieuChotQuy();
  }

  async function xoaChiUI(maChi) {
    if (!confirm('⚠️ Bạn có chắc muốn xoá khoản chi này?')) return;
    await TMHChotQuy.xoaKhoanChiPhatSinh(maChi);
    taiDuLieuChotQuy();
  }

  // ----------------------------------------------------
  // F. THỰC HIỆN HOÀN TẤT CHỐT QUỸ & IN / XUẤT EXCEL
  // ----------------------------------------------------
  async function hoanTatChotQuyNgay() {
    if (!duLieuChotQuyHienTai) return;
    const d = duLieuChotQuyHienTai;
    const t = d.kqTinh;

    if (d.tongTienMat <= 0) {
      if (!confirm('⚠️ Ngày kiểm đếm này hiện chưa có tiền mặt thu được từ Xe hoặc Sale. Bạn có chắc muốn chốt quỹ với số tiền 0 đ?')) {
        return;
      }
    }

    const thongTin = {
      ngay_kiem_dem: d.ngayKiemDem,
      ngay_phat_sinh: d.ngayPhatSinh,
      nguoi_chot: 'Kế toán tổng hợp',
      tong_thu_xe: d.tongTienXe,
      tong_thu_sale: d.tongTienSale,
      tong_thu_tong_hop: t.tongThu,
      tong_chi_phat_sinh: t.tongChiTruocChot,
      tien_nop_ngan_hang: t.tienNopNganHang,
      chi_sau_chot: t.tongChiSauChot,
      tien_mat_luu_ket: t.tienMatLuuKet,
      sl_500k: d.menhGiaChiTiet.find(r => r.menhGia === 500000)?.soLuong || 0,
      sl_200k: d.menhGiaChiTiet.find(r => r.menhGia === 200000)?.soLuong || 0,
      sl_100k: d.menhGiaChiTiet.find(r => r.menhGia === 100000)?.soLuong || 0,
      sl_50k: d.menhGiaChiTiet.find(r => r.menhGia === 50000)?.soLuong || 0,
      sl_20k: d.menhGiaChiTiet.find(r => r.menhGia === 20000)?.soLuong || 0,
      sl_10k: d.menhGiaChiTiet.find(r => r.menhGia === 10000)?.soLuong || 0,
      sl_5k: d.menhGiaChiTiet.find(r => r.menhGia === 5000)?.soLuong || 0,
      sl_2k: d.menhGiaChiTiet.find(r => r.menhGia === 2000)?.soLuong || 0,
      sl_1k: d.menhGiaChiTiet.find(r => r.menhGia === 1000)?.soLuong || 0,
      trang_thai: 'da_chot',
      chi_tiet_nguon_tien: d.nguonTienChiTiet
    };

    const res = await TMHChotQuy.luuBanChotQuyNgay(thongTin);
    if (!res.ok) {
      alert('❌ Lỗi lưu chốt quỹ: ' + res.error);
      return;
    }

    alert(`🎉 ĐÃ HOÀN TẤT CHỐT QUỸ NGÀY ${TMHChotQuy.chuyenDinhDangNgayVN(d.ngayKiemDem)}!\n\n` +
      `• Tổng thu từ Xe + Sale: ${TMHChotQuy.fmtTien(t.tongThu)} đ (${TMHChotQuy.fmtTien(d.tongSoTo)} tờ)\n` +
      `• Chi phát sinh trong ngày: ${TMHChotQuy.fmtTien(t.tongChiTruocChot)} đ\n` +
      `• Tiền mặt đem nộp Ngân hàng: ${TMHChotQuy.fmtTien(t.tienNopNganHang)} đ\n` +
      `• Tiền mặt lưu két hiện tại: ${TMHChotQuy.fmtTien(t.tienMatLuuKet)} đ\n\n` +
      `Dữ liệu đã được chốt và đồng bộ lên hệ thống.`);
  }

  function inBangKiemQuy() {
    window.print();
  }

  function xuatExcelKiemQuy() {
    if (!duLieuChotQuyHienTai || typeof XLSX === 'undefined') {
      alert('Không thể xuất Excel lúc này!');
      return;
    }
    const d = duLieuChotQuyHienTai;
    const wb = XLSX.utils.book_new();

    const rows = [
      ['KIỂM QUỸ TIỀN MẶT'],
      ['NGÀY KIỂM ĐẾM', TMHChotQuy.chuyenDinhDangNgayVN(d.ngayKiemDem)],
      ['NGÀY PHÁT SINH TIỀN HÀNG', TMHChotQuy.chuyenDinhDangNgayVN(d.ngayPhatSinh)],
      ['Mệnh giá', 'Số lượng', 'Thành tiền']
    ];

    d.menhGiaChiTiet.forEach(r => {
      rows.push([r.menhGiaLabel || (TMHChotQuy.formatMenhGiaLabel ? TMHChotQuy.formatMenhGiaLabel(r.menhGia) : r.menhGia), r.soLuong, r.thanhTien]);
    });
    rows.push(['Tổng cộng', d.tongSoTo, d.tongTienMat]);
    rows.push([]);
    rows.push(['TỔNG QUỸ TIỀN MẶT']);
    rows.push(['STT', 'NGÀY KIỂM ĐẾM', 'NGÀY PHÁT SINH TIỀN HÀNG', 'SỐ TIỀN']);
    rows.push([1, TMHChotQuy.chuyenDinhDangNgayVN(d.ngayKiemDem), TMHChotQuy.chuyenDinhDangNgayVN(d.ngayPhatSinh), d.tongTienMat]);
    rows.push(['TỔNG CỘNG', '', '', d.tongTienMat]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Kiem_Quy_Tien_Mat');
    XLSX.writeFile(wb, `Kiem_Quy_Tien_Mat_${d.ngayKiemDem}.xlsx`);
  }

  // ----------------------------------------------------
  // XUẤT CÁC HÀM UI TOÀN CỤC
  // ----------------------------------------------------
  window.khoiTaoTabThuTienSale = khoiTaoTabThuTienSale;
  window.nhapSoToSale = nhapSoToSale;
  window.xoaBangDemSale = xoaBangDemSale;
  window.dienNhanhTienSaleTuBangDem = dienNhanhTienSaleTuBangDem;
  window.luuFormThuTienSale = luuFormThuTienSale;
  window.xoaPhieuSaleUI = xoaPhieuSaleUI;
  window.khoiTaoTabChotQuy = khoiTaoTabChotQuy;
  window.taiDuLieuChotQuy = taiDuLieuChotQuy;
  window.moModalThemChi = moModalThemChi;
  window.dongModalThemChi = dongModalThemChi;
  window.luuModalChi = luuModalChi;
  window.xoaChiUI = xoaChiUI;
  window.hoanTatChotQuyNgay = hoanTatChotQuyNgay;
  window.inBangKiemQuy = inBangKiemQuy;
  window.xuatExcelKiemQuy = xuatExcelKiemQuy;

})(typeof window !== 'undefined' ? window : globalThis);
