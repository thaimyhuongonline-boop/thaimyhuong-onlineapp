-- ============================================================================
-- 01_tao_bang_danh_muc.sql
-- TẠO CÁC BẢNG DANH MỤC NỀN TẢNG CHO CÔNG TY TNHH THÁI MỸ HƯƠNG
-- Chạy script này trong Supabase SQL Editor
-- ============================================================================

-- 1. BẢNG KHÁCH HÀNG
CREATE TABLE IF NOT EXISTS public.khach_hang (
    ma_kh VARCHAR(100) PRIMARY KEY,
    ten_kh TEXT NOT NULL,
    dia_chi TEXT,
    dien_thoai VARCHAR(50),
    khu_vuc VARCHAR(150),
    ma_so_thue VARCHAR(50),
    nguoi_tao VARCHAR(100),
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG HÀNG HÓA & QUY CÁCH
CREATE TABLE IF NOT EXISTS public.hang_hoa (
    ma_hang VARCHAR(100) PRIMARY KEY,
    ten_hang TEXT NOT NULL,
    dvt VARCHAR(50) DEFAULT 'Thùng',
    quy_cach NUMERIC DEFAULT 1,
    gia_ban NUMERIC DEFAULT 0,
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG ĐỊNH KHOẢN HÀNG HÓA (Dành cho xuất MISA)
CREATE TABLE IF NOT EXISTS public.dinh_khoan_hang_hoa (
    ma_hang VARCHAR(100) PRIMARY KEY,
    ten_hang TEXT,
    thue_suat NUMERIC DEFAULT 10,
    tk_doanh_thu VARCHAR(20) DEFAULT '5111',
    tk_gia_von VARCHAR(20) DEFAULT '632',
    ma_kho VARCHAR(50) DEFAULT 'KHO01',
    tk_kho VARCHAR(20) DEFAULT '1561',
    tk_chi_phi VARCHAR(20) DEFAULT '641',
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG TÀI KHOẢN NGÂN HÀNG
CREATE TABLE IF NOT EXISTS public.tai_khoan_ngan_hang (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_tk VARCHAR(150) NOT NULL UNIQUE,
    so_tk VARCHAR(50),
    ten_ngan_hang VARCHAR(150),
    chu_tai_khoan VARCHAR(150),
    tk_misa VARCHAR(20) DEFAULT '11211',
    mac_dinh BOOLEAN DEFAULT FALSE,
    ghi_chu TEXT
);

-- Dữ liệu tài khoản ngân hàng mặc định
INSERT INTO public.tai_khoan_ngan_hang (ten_tk, so_tk, ten_ngan_hang, chu_tai_khoan, tk_misa, mac_dinh)
VALUES
('VCB - 0041000266096 (Thái Mỹ Hương)', '0041000266096', 'Vietcombank', 'CÔNG TY TNHH THÁI MỸ HƯƠNG', '11211', TRUE),
('VCB - 0041000123456 (Cá nhân Đạt)', '0041000123456', 'Vietcombank', 'NGUYỄN TẤN ĐẠT', '11212', FALSE),
('MBBank - 0905801918 (Cá nhân)', '0905801918', 'MBBank', 'THÁI MỸ HƯƠNG', '11213', FALSE),
('Tiền mặt lái xe', 'TIEN_MAT', 'Tiền mặt', 'Lái xe thu nộp', '1111', FALSE)
ON CONFLICT (ten_tk) DO NOTHING;

-- 5. BẢNG DANH SÁCH XE
CREATE TABLE IF NOT EXISTS public.danh_sach_xe (
    ma_xe VARCHAR(50) PRIMARY KEY,
    bien_so VARCHAR(50),
    loai_xe VARCHAR(100),
    tai_xe_mac_dinh VARCHAR(100),
    ghi_chu TEXT
);

INSERT INTO public.danh_sach_xe (ma_xe, bien_so, loai_xe, tai_xe_mac_dinh)
VALUES
('HD1 SÁNG', '43C-12345', 'Xe tải 1.4 tấn', 'SINH'),
('HD1 CHIỀU', '43C-12345', 'Xe tải 1.4 tấn', 'SINH'),
('HD2 SÁNG', '43C-67890', 'Xe tải 2.5 tấn', 'HẢI'),
('HD2 CHIỀU', '43C-67890', 'Xe tải 2.5 tấn', 'HẢI')
ON CONFLICT (ma_xe) DO NOTHING;

-- 6. BẢNG ĐỔI MÃ KHUYẾN MÃI (Ánh xạ mã KM sang mã thật xuất MISA)
CREATE TABLE IF NOT EXISTS public.doi_ma_km (
    ma_km VARCHAR(100) PRIMARY KEY,
    ma_that VARCHAR(100) NOT NULL,
    ten_that TEXT,
    quy_cach NUMERIC DEFAULT 1,
    ghi_chu TEXT
);
