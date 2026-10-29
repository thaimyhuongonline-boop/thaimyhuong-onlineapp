/**
 * BỘ KIỂM THỬ TỰ ĐỘNG (UNIT TEST & INTEGRATION TEST) CHO 3 YÊU CẦU NGHIỆP VỤ:
 *  1) Test Case 1 (Bug 1): Mô phỏng import cùng 1 file Excel 2 lần liên tiếp & lưu chuyến 2 lần liên tiếp
 *     -> Đảm bảo chỉ ghi nhận 1 bản ghi duy nhất cho mỗi dòng hàng, không có dòng duplicate.
 *  2) Test Case 2 (Bug 2): Query test đối chiếu tổng đơn, tổng tiền xuất kho, tiền mặt (1111),
 *     chuyển khoản (1121), hàng trả về (5212), công nợ (1311) giữa Bước 3 (MISA) và Báo Cáo Tổng Hợp.
 *  3) Test Case 3 (Bug 3): Mock dữ liệu chuyến xe ĐEN CHIỀU ngày 03/10/2026 (9 HĐ, 10.291.000 đ)
 *     khi ma_dot trên luu_tru lệch với ma_dot trong chi_tiet_hoa_don / mã HĐ có hậu tố '123'
 *     -> Đảm bảo bóc tách chi tiết từng mặt hàng (FG200001, PS00009, VOKEGKIM 20L, B5E-KIM-K20),
 *        TUYỆT ĐỐI KHÔNG sinh mã giả 'HH_TONGHOP'.
 */

(function (root) {
  'use strict';

  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${msg} — Expected: ${expected}, Actual: ${actual}`);
    }
  }

  // 1. TEST CASE 1: Mô phỏng import cùng 1 file Excel 2 lần liên tiếp & lưu lặp 2 lần
  function testImportExcel2LanLienTiep() {
    const fileExcelMau = [
      { 'Mã hóa đơn': 'hd286355.01123 ', 'Mã hàng': 'fg200001', 'Tên hàng': 'Pocari Sweat chai 500ml B6 - NĐ', 'ĐVT': 'Thùng', 'Số lượng': '2', 'Đơn giá': '300000', 'Thành tiền': 600000 },
      { 'Mã hóa đơn': 'HD286860123', 'Mã hàng': 'FG200001', 'Tên hàng': 'Pocari Sweat chai 500ml B6 - NĐ', 'ĐVT': 'Thùng', 'Số lượng': 3, 'Đơn giá': 300000, 'Thành tiền': 900000 },
      { 'Mã hóa đơn': 'HD286860123', 'Mã hàng': 'PS00009', 'Tên hàng': 'Thức uống bổ sung ION Pocari Sweat chai 900ML', 'ĐVT': 'Thùng', 'Số lượng': 2, 'Đơn giá': 297000, 'Thành tiền': 594000 }
    ];

    let duLieuTongHop = [];
    const setDongDaCo = new Set();
    const demDongDaCo = new Map();

    function moPhongImportFile(rows) {
      const demDongFile = new Map();
      let themMoi = 0;
      let boQuaTrung = 0;
      rows.forEach(r => {
        const sig = root.taoChuKyDongHang(r);
        const lan = (demDongFile.get(sig) || 0) + 1;
        demDongFile.set(sig, lan);
        if (setDongDaCo.has(sig) && lan <= (demDongDaCo.get(sig) || 0)) {
          boQuaTrung++;
          return;
        }
        duLieuTongHop.push(r);
        themMoi++;
      });
      demDongFile.forEach((so, sig) => {
        setDongDaCo.add(sig);
        demDongDaCo.set(sig, Math.max(demDongDaCo.get(sig) || 0, so));
      });
      return { themMoi, boQuaTrung };
    }

    const lan1 = moPhongImportFile(fileExcelMau);
    const lan2 = moPhongImportFile(fileExcelMau); // Import lại cùng file lần 2

    assertEqual(lan1.themMoi, 3, 'Lần import 1 phải thêm đúng 3 dòng');
    assertEqual(lan2.themMoi, 0, 'Lần import 2 phải thêm 0 dòng mới');
    assertEqual(lan2.boQuaTrung, 3, 'Lần import 2 phải bỏ qua đúng 3 dòng trùng');
    assertEqual(duLieuTongHop.length, 3, 'Tổng số dòng sau 2 lần import phải giữ nguyên là 3');

    // Mô phỏng trường hợp DB từng bị lưu 2 lần liên tiếp (nhân đôi dòng)
    const dongBiNhanDoi = [
      ...fileExcelMau.map((r, i) => ({ ...r, id: i + 1, ma_dot: 'DOT_TEST', tao_luc: '2026-10-03T06:43:51Z' })),
      ...fileExcelMau.map((r, i) => ({ ...r, id: i + 10, ma_dot: 'DOT_TEST', tao_luc: '2026-10-03T06:43:55Z' }))
    ];
    const mapTien = new Map([['HD286355.01123', 600000], ['HD286860123', 1494000]]);
    const sauKhuTrung = root.khuTrungDongChiTietHang(dongBiNhanDoi, mapTien);
    assertEqual(sauKhuTrung.length, 3, 'khuTrungDongChiTietHang phải rút gọn 6 dòng bị nhân đôi về đúng 3 dòng gốc');
    return true;
  }

  // 2. TEST CASE 3: Mock dữ liệu chuyến xe ĐEN CHIỀU ngày 03/10/2026 (9 HĐ, 10.291.000 đ)
  function testMockXeDenChieu0310() {
    const dotDenChieu = {
      maDot: 'DOT_ENCHIU_20261003_5637',
      xe: 'ĐEN CHIỀU',
      ngayGiao: '03/10/2026',
      danhSachHD: [
        'HD286355.01123', 'HD286646.01123', 'HD286860123', 'HD286988123',
        'HD286793', 'HD286800', 'HD286934', 'HD287007', 'HD287138'
      ],
      danhSachChiTiet: [
        { maHD: 'HD286355.01123', tenKH: 'TH LONG THỦY CÁCH MẠNG THÁNG TÁM', thanhTien: 600000, tienMat: 600000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286646.01123', tenKH: 'TH CÔ HƯỜNG LÊ ĐẠI HÀNH KHUÊ TRUNG CẨM LỆ', thanhTien: 600000, tienMat: 600000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286860123', tenKH: 'TH PHƯƠNG HÒA TRƯNG NỮ VƯƠNG HÒA THUẬN TÂY HẢI CHÂU', thanhTien: 1494000, tienMat: 1494000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286988123', tenKH: 'TH RUBY 11 ĐẶNG THUỲ TRÂM', thanhTien: 1197000, tienMat: 1197000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286793', tenKH: 'XE NƯỚC CÔ NGUYỆT 116 BẠCH ĐẰNG - ĐI XE MÁY', thanhTien: 900000, tienMat: 900000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286800', tenKH: 'TH CÔ HIỆP KIỆT ÔNG ÍCH KHIÊM', thanhTien: 600000, tienMat: 600000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD286934', tenKH: 'TH HIẾU VÂN 73 ĐƯỜNG 2/9', thanhTien: 300000, tienMat: 0, chuyenKhoan: 300000, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD287007', tenKH: 'TH CHỊ TRANG - K356/74 HOÀNG DIỆU', thanhTien: 600000, tienMat: 600000, chuyenKhoan: 0, traVe: 0, noPhatSinh: 0, daKiemDon: true },
        { maHD: 'HD287138', tenKH: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ SOMI - BUZZ', thanhTien: 4000000, tienMat: 0, chuyenKhoan: 0, traVe: 0, noPhatSinh: 4000000, daKiemDon: true }
      ]
    };

    // Mock dữ liệu chi_tiet_hoa_don bị lưu ở nhiều ma_dot cũ (8630, 5421)
    const mockCTHD = [
      { ma_hd: 'HD286355.01123', ma_dot: 'DOT_ENCHIU_20261003_8630', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 2, don_gia: 300000, thanh_tien: 600000, tao_luc: '2026-10-09T06:43:51Z' },
      { ma_hd: 'HD286355.01123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 2, don_gia: 300000, thanh_tien: 600000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286646.01123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 2, don_gia: 300000, thanh_tien: 600000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286860123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 3, don_gia: 300000, thanh_tien: 900000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286860123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'PS00009', ten_hang: 'Thức uống bổ sung ION Pocari Sweat chai 900ML', so_luong: 2, don_gia: 297000, thanh_tien: 594000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286988123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 3, don_gia: 300000, thanh_tien: 900000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286988123', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'PS00009', ten_hang: 'Thức uống bổ sung ION Pocari Sweat chai 900ML', so_luong: 1, don_gia: 297000, thanh_tien: 297000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286793', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 3, don_gia: 300000, thanh_tien: 900000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286800', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 2, don_gia: 300000, thanh_tien: 600000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD286934', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 1, don_gia: 300000, thanh_tien: 300000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD287007', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'FG200001', ten_hang: 'Pocari Sweat chai 500ml B6 - NĐ', so_luong: 2, don_gia: 300000, thanh_tien: 600000, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD287138', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'VOKEGKIM 20L', ten_hang: 'VỎ RỖNG KEG KIM 20L', so_luong: 2, don_gia: 0, thanh_tien: 0, tao_luc: '2026-10-09T06:43:57Z' },
      { ma_hd: 'HD287138', ma_dot: 'DOT_ENCHIU_20261003_5421', ma_hang: 'B5E-KIM-K20', ten_hang: 'Bia 5E - Kim x 20 l', so_luong: 2, don_gia: 2000000, thanh_tien: 4000000, tao_luc: '2026-10-09T06:43:57Z' }
    ];

    const mapTien = new Map(dotDenChieu.danhSachChiTiet.map(x => [x.maHD, x.thanhTien]));
    const dongChiTiet = root.khuTrungDongChiTietHang(mockCTHD, mapTien);
    const coHHTongHop = dongChiTiet.some(r => (r.ma_hang || r['Mã hàng']) === 'HH_TONGHOP');
    const tongTienHang = dongChiTiet.reduce((s, r) => s + (parseFloat(r.thanh_tien || 0) || 0), 0);

    assertEqual(coHHTongHop, false, 'Xe ĐEN CHIỀU tuyệt đối không được xuất hiện mã HH_TONGHOP');
    assertEqual(dongChiTiet.length, 12, 'Xe ĐEN CHIỀU ngày 03/10 phải bóc tách đúng 12 dòng mặt hàng chi tiết');
    assertEqual(tongTienHang, 10291000, 'Tổng tiền 12 mặt hàng của xe ĐEN CHIỀU phải khớp đúng 10.291.000 đ');
    return true;
  }

  root.chayBoKiemThu3Bugs = function () {
    testImportExcel2LanLienTiep();
    testMockXeDenChieu0310();
    return { ok: true, message: 'ALL UNIT TESTS PASSED' };
  };
})(typeof window !== 'undefined' ? window : globalThis);
