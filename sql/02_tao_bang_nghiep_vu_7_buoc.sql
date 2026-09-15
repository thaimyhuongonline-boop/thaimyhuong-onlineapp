-- ============================================================================
-- 02_tao_bang_nghiep_vu_7_buoc.sql
-- TẠO CÁC BẢNG NGHIỆP VỤ 7 BƯỚC CHO THÁI MỸ HƯƠNG (KIOTVIET -> MISA)
-- Chạy script này trong Supabase SQL Editor
-- ============================================================================

-- 1. BẢNG DATA_KIOT (Dữ liệu thô nạp từ file KiotViet)
CREATE TABLE IF NOT EXISTS public.data_kiot (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_dot VARCHAR(100),
    ma_hd VARCHAR(100) NOT NULL,
    thoi_gian TIMESTAMPTZ,
    ma_kh VARCHAR(100),
    ten_kh TEXT,
    ma_hang VARCHAR(100),
    ten_hang TEXT,
    so_luong NUMERIC(15, 3) DEFAULT 0,
    don_gia NUMERIC(15, 2) DEFAULT 0,
    giam_gia_sp NUMERIC(15, 2) DEFAULT 0,
    giam_gia_hd NUMERIC(15, 2) DEFAULT 0,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    nguoi_ban VARCHAR(100),
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_kiot_ma_hd ON public.data_kiot(ma_hd);
CREATE INDEX IF NOT EXISTS idx_data_kiot_ma_dot ON public.data_kiot(ma_dot);

-- 2. BẢNG LƯU TRỮ (Hồ sơ đợt điều động xe - 19 cột tương ứng sheet LƯU TRỮ)
CREATE TABLE IF NOT EXISTS public.luu_tru (
    ma_hd VARCHAR(100) PRIMARY KEY, -- Khóa chính chống trùng hóa đơn
    stt INT,
    ngay_giao VARCHAR(20),
    xe VARCHAR(50),
    tai_xe VARCHAR(100),
    giao_hang VARCHAR(100),
    thu_tien VARCHAR(100),
    ten_kh TEXT,
    nguoi_ban VARCHAR(100),
    ma_kh VARCHAR(100),
    doanh_so NUMERIC(15, 2) DEFAULT 0,
    giam_gia_sp NUMERIC(15, 2) DEFAULT 0,
    giam_gia_hd NUMERIC(15, 2) DEFAULT 0,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    tien_mat NUMERIC(15, 2) DEFAULT 0,
    chuyen_khoan NUMERIC(15, 2) DEFAULT 0,
    tai_khoan_nhan VARCHAR(150),
    tk_misa VARCHAR(20),
    tra_ve NUMERIC(15, 2) DEFAULT 0,
    no_phat_sinh NUMERIC(15, 2) DEFAULT 0,
    ma_dot VARCHAR(100),
    da_kiem_don BOOLEAN DEFAULT FALSE,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_luu_tru_xe ON public.luu_tru(xe);
CREATE INDEX IF NOT EXISTS idx_luu_tru_ma_dot ON public.luu_tru(ma_dot);
CREATE INDEX IF NOT EXISTS idx_luu_tru_ma_kh ON public.luu_tru(ma_kh);

-- 3. BẢNG CHI TIẾT HÓA ĐƠN (Lưu trữ vĩnh viễn từng mặt hàng - Nguồn cho MISA)
CREATE TABLE IF NOT EXISTS public.chi_tiet_hoa_don (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_hd VARCHAR(100) NOT NULL,
    ma_dot VARCHAR(100),
    ngay_ct VARCHAR(20),
    xe VARCHAR(50),
    ma_kh VARCHAR(100),
    ten_kh TEXT,
    ma_hang VARCHAR(100) NOT NULL,
    ten_hang TEXT,
    dvt VARCHAR(50),
    so_luong NUMERIC(15, 3) DEFAULT 0, -- Chứa số lượng lẻ 0.5, 0.25
    don_gia NUMERIC(15, 2) DEFAULT 0,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    quy_cach NUMERIC DEFAULT 1,
    la_khuyen_mai BOOLEAN DEFAULT FALSE,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cthd_ma_hd ON public.chi_tiet_hoa_don(ma_hd);
CREATE INDEX IF NOT EXISTS idx_cthd_ma_hang ON public.chi_tiet_hoa_don(ma_hang);
CREATE INDEX IF NOT EXISTS idx_cthd_ma_dot ON public.chi_tiet_hoa_don(ma_dot);

-- 4. BẢNG KIỂM ĐƠN GIAO VỀ (Lưu vết kiểm tra giao nhận thực tế)
CREATE TABLE IF NOT EXISTS public.kiem_don (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_dot VARCHAR(100) NOT NULL,
    ma_hd VARCHAR(100) NOT NULL,
    xe VARCHAR(50),
    ngay_giao VARCHAR(20),
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    tien_mat NUMERIC(15, 2) DEFAULT 0,
    chuyen_khoan NUMERIC(15, 2) DEFAULT 0,
    tai_khoan_nhan VARCHAR(150),
    tk_misa VARCHAR(20),
    tra_ve NUMERIC(15, 2) DEFAULT 0,
    con_no NUMERIC(15, 2) DEFAULT 0,
    giao_lai BOOLEAN DEFAULT FALSE,
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG ĐƠN GIAO LẠI (Chờ xếp chuyến sau khi không giao được)
CREATE TABLE IF NOT EXISTS public.don_giao_lai (
    ma_hd VARCHAR(100) PRIMARY KEY,
    ma_kh VARCHAR(100),
    ten_kh TEXT,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    tien_goc NUMERIC(15, 2) DEFAULT 0,
    ngay_don_goc VARCHAR(20),
    dot_goc VARCHAR(100),
    xe_goc VARCHAR(50),
    trang_thai VARCHAR(50) DEFAULT 'cho_giao_lai', -- cho_giao_lai, da_xep_chuyen_lai
    chuyen_moi VARCHAR(50),
    ngay_xep_moi VARCHAR(20),
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG PHIẾU NỘP TIỀN & ĐẾM MỆNH GIÁ (Bước 6)
CREATE TABLE IF NOT EXISTS public.phieu_nop_tien (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_phieu VARCHAR(100) UNIQUE NOT NULL,
    ma_dot VARCHAR(100),
    xe VARCHAR(50),
    ngay_nop VARCHAR(20),
    nguoi_nop VARCHAR(100),
    thu_quy VARCHAR(100),
    tong_tien_mat NUMERIC(15, 2) DEFAULT 0,
    tong_chuyen_khoan NUMERIC(15, 2) DEFAULT 0,
    tong_tra_ve NUMERIC(15, 2) DEFAULT 0,
    tong_con_no NUMERIC(15, 2) DEFAULT 0,
    -- Chi tiết các mệnh giá tiền mặt
    sl_500k INT DEFAULT 0,
    sl_200k INT DEFAULT 0,
    sl_100k INT DEFAULT 0,
    sl_50k INT DEFAULT 0,
    sl_20k INT DEFAULT 0,
    sl_10k INT DEFAULT 0,
    sl_5k INT DEFAULT 0,
    sl_2k INT DEFAULT 0,
    sl_1k INT DEFAULT 0,
    chenh_lech NUMERIC(15, 2) DEFAULT 0,
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG SỔ NỘP TIỀN XE (Ghi nhận nộp tiền theo xe hàng ngày - chống trùng xe + ngày)
CREATE TABLE IF NOT EXISTS public.so_nop_tien_xe (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    khoa_xe_ngay VARCHAR(100) UNIQUE NOT NULL, -- VD: 'HD1_SANG_2026-09-15'
    xe VARCHAR(50) NOT NULL,
    ngay_nop VARCHAR(20) NOT NULL,
    tai_xe VARCHAR(100),
    so_don INT DEFAULT 0,
    doanh_so NUMERIC(15, 2) DEFAULT 0,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    tien_mat NUMERIC(15, 2) DEFAULT 0,
    chuyen_khoan NUMERIC(15, 2) DEFAULT 0,
    tra_ve NUMERIC(15, 2) DEFAULT 0,
    no_phat_sinh NUMERIC(15, 2) DEFAULT 0,
    trang_thai VARCHAR(50) DEFAULT 'da_chot',
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CÁC BẢNG CÔNG NỢ KHÁCH HÀNG
CREATE TABLE IF NOT EXISTS public.no_khac (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngay_ct VARCHAR(20),
    ma_kh VARCHAR(100) NOT NULL,
    ten_kh TEXT,
    so_tien NUMERIC(15, 2) DEFAULT 0,
    noi_dung TEXT,
    nguoi_tao VARCHAR(100),
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.thu_no (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngay_thu VARCHAR(20),
    ma_kh VARCHAR(100) NOT NULL,
    ten_kh TEXT,
    so_tien NUMERIC(15, 2) DEFAULT 0,
    hinh_thuc VARCHAR(50) DEFAULT 'TienMat', -- TienMat, ChuyenKhoan
    tai_khoan_nhan VARCHAR(150),
    nguoi_thu VARCHAR(100),
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);
