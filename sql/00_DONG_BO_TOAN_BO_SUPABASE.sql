-- ============================================================================
-- 00_DONG_BO_TOAN_BO_SUPABASE.sql
-- SCRIPT TỔNG HỢP KHỞI TẠO ĐẦY ĐỦ CÁC BẢNG & CHÍNH SÁCH BẢO MẬT RLS CHO APP
-- CÔNG TY TNHH THÁI MỸ HƯƠNG (Quy trình 7 Bước KiotViet -> MISA)
-- 
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Đăng nhập trang quản trị Supabase (https://supabase.com/dashboard)
-- 2. Vào mục "SQL Editor" ở menu bên trái
-- 3. Sao chép toàn bộ nội dung file này, dán vào và bấm nút "RUN" (hoặc Ctrl + Enter)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BẢNG KHO FILE KIOT TẠM (Bước 1: Giúp đồng bộ file giữa các máy tính & tài khoản)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.file_kiot_tam (
    id VARCHAR(150) PRIMARY KEY,
    ten_file TEXT NOT NULL,
    so_hd INT DEFAULT 0,
    so_dong INT DEFAULT 0,
    tong_doanh_so NUMERIC(15, 2) DEFAULT 0,
    thoi_gian VARCHAR(50),
    du_lieu JSONB,
    nguoi_tao VARCHAR(100),
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. BẢNG DỮ LIỆU THÔ DATA_KIOT
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. BẢNG LƯU TRỮ (Bước 2 & 3: Hồ sơ 18-19 cột đối soát chi tiết chuyến xe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.luu_tru (
    ma_hd VARCHAR(100) PRIMARY KEY,
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
    ghi_chu TEXT,
    la_giao_lai BOOLEAN DEFAULT FALSE,
    da_quyet_toan BOOLEAN DEFAULT FALSE,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS la_giao_lai BOOLEAN DEFAULT FALSE;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS da_quyet_toan BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_luu_tru_xe ON public.luu_tru(xe);
CREATE INDEX IF NOT EXISTS idx_luu_tru_ma_dot ON public.luu_tru(ma_dot);
CREATE INDEX IF NOT EXISTS idx_luu_tru_ma_kh ON public.luu_tru(ma_kh);

-- ----------------------------------------------------------------------------
-- 4. BẢNG CHI TIẾT HÓA ĐƠN (Bước 2 & 3: Chi tiết từng dòng hàng hóa phục vụ MISA)
-- ----------------------------------------------------------------------------
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
    so_luong NUMERIC(15, 3) DEFAULT 0,
    don_gia NUMERIC(15, 2) DEFAULT 0,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    quy_cach NUMERIC DEFAULT 1,
    la_khuyen_mai BOOLEAN DEFAULT FALSE,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cthd_ma_hd ON public.chi_tiet_hoa_don(ma_hd);
CREATE INDEX IF NOT EXISTS idx_cthd_ma_hang ON public.chi_tiet_hoa_don(ma_hang);
CREATE INDEX IF NOT EXISTS idx_cthd_ma_dot ON public.chi_tiet_hoa_don(ma_dot);

-- ----------------------------------------------------------------------------
-- 5. BẢNG KIỂM ĐƠN GIAO VỀ (Bước 4)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 6. BẢNG ĐƠN GIAO LẠI (Bước 4 -> Bước 2)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.don_giao_lai (
    ma_hd VARCHAR(100) PRIMARY KEY,
    ma_kh VARCHAR(100),
    ten_kh TEXT,
    thanh_tien NUMERIC(15, 2) DEFAULT 0,
    tien_goc NUMERIC(15, 2) DEFAULT 0,
    ngay_don_goc VARCHAR(20),
    dot_goc VARCHAR(100),
    xe_goc VARCHAR(50),
    trang_thai VARCHAR(50) DEFAULT 'cho_giao_lai',
    chuyen_moi VARCHAR(50),
    ngay_xep_moi VARCHAR(20),
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. BẢNG PHIẾU NỘP TIỀN & SỔ NỘP TIỀN XE (Bước 6)
-- ----------------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS public.so_nop_tien_xe (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    khoa_xe_ngay VARCHAR(100) UNIQUE NOT NULL,
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

-- ----------------------------------------------------------------------------
-- 8. CÁC BẢNG DANH MỤC NỀN TẢNG
-- ----------------------------------------------------------------------------
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

INSERT INTO public.tai_khoan_ngan_hang (ten_tk, so_tk, ten_ngan_hang, chu_tai_khoan, tk_misa, mac_dinh)
VALUES
('VCB - 0041000266096 (Thái Mỹ Hương)', '0041000266096', 'Vietcombank', 'CÔNG TY TNHH THÁI MỸ HƯƠNG', '11211', TRUE),
('VCB - 0041000123456 (Cá nhân Đạt)', '0041000123456', 'Vietcombank', 'NGUYỄN TẤN ĐẠT', '11212', FALSE),
('MBBank - 0905801918 (Cá nhân)', '0905801918', 'MBBank', 'THÁI MỸ HƯƠNG', '11213', FALSE),
('Tiền mặt lái xe', 'TIEN_MAT', 'Tiền mặt', 'Lái xe thu nộp', '1111', FALSE)
ON CONFLICT (ten_tk) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.doi_ma_km (
    ma_km VARCHAR(100) PRIMARY KEY,
    ten_km TEXT,
    ma_that VARCHAR(100) NOT NULL,
    ten_that TEXT,
    ghi_chu TEXT
);

CREATE TABLE IF NOT EXISTS public.nv_giao_hang_tai_xe (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_nv VARCHAR(50) UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    vai_tro VARCHAR(100),
    so_dien_thoai VARCHAR(50),
    ghi_chu TEXT
);

CREATE TABLE IF NOT EXISTS public.nv_kinh_doanh (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_nv VARCHAR(50) UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(50),
    email VARCHAR(100),
    khu_vuc VARCHAR(150),
    ghi_chu TEXT
);

-- Bảng Hàng Hóa & Quy Cách
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
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS dvt VARCHAR(50) DEFAULT 'Thùng';
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS quy_cach NUMERIC DEFAULT 1;
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS gia_ban NUMERIC DEFAULT 0;
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS tao_luc TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.hang_hoa ADD COLUMN IF NOT EXISTS cap_nhat_luc TIMESTAMPTZ DEFAULT NOW();

-- Bảng Khách Hàng
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
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS dia_chi TEXT;
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS dien_thoai VARCHAR(50);
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS khu_vuc VARCHAR(150);
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS ma_so_thue VARCHAR(50);
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS nguoi_tao VARCHAR(100);
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS tao_luc TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS cap_nhat_luc TIMESTAMPTZ DEFAULT NOW();

-- Bảng Định Khoản Hàng Hóa (Xuất MISA)
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

-- Bảng Danh Sách Xe
CREATE TABLE IF NOT EXISTS public.danh_sach_xe (
    ma_xe VARCHAR(50) PRIMARY KEY,
    bien_so VARCHAR(50),
    loai_xe VARCHAR(100),
    tai_xe_mac_dinh VARCHAR(100),
    ghi_chu TEXT
);

INSERT INTO public.danh_sach_xe (ma_xe, bien_so, loai_xe, tai_xe_mac_dinh, ghi_chu)
VALUES
('XE01', '', 'HĐ1 SÁNG', 'SINH', 'HĐ1 SÁNG'),
('XE02', '', 'HĐ2 SÁNG', 'HẢI', 'HĐ2 SÁNG'),
('XE03', '', 'HĐ3 SÁNG', 'ĐẠT', 'HĐ3 SÁNG'),
('XE04', '', 'HĐ1 CHIỀU', 'SINH', 'HĐ1 CHIỀU'),
('XE05', '', 'HĐ2 CHIỀU', 'HẢI', 'HĐ2 CHIỀU'),
('XE06', '', 'HĐ3 CHIỀU', 'ĐẠT', 'HĐ3 CHIỀU'),
('XE07', '', 'THUÊ SÁNG', '', 'THUÊ SÁNG'),
('XE08', '', 'THUÊ CHIỀU', '', 'THUÊ CHIỀU'),
('XE09', '', 'ĐEN SÁNG', '', 'ĐEN SÁNG'),
('XE10', '', 'ĐEN CHIỀU', '', 'ĐEN CHIỀU'),
('XE11', '', 'ĐỎ SÁNG', '', 'ĐỎ SÁNG'),
('XE12', '', 'ĐỎ CHIỀU', '', 'ĐỎ CHIỀU'),
('XE13', '', 'XANH SÁNG', '', 'XANH SÁNG'),
('XE14', '', 'XANH CHIỀU', '', 'XANH CHIỀU'),
('XE15', '', 'NGUYEN NISSIN', '', 'NGUYEN NISSIN'),
('XE16', '', 'NGHĨA NS', '', 'NGHĨA NS'),
('XE17', '', 'VY EM NS', '', 'VY EM NS'),
('XE18', '', 'VŨ', '', 'VŨ'),
('XE19', '', 'NGUYỆT', '', 'NGUYỆT'),
('XE20', '', 'NAM', '', 'NAM')
ON CONFLICT (ma_xe) DO UPDATE 
SET loai_xe = EXCLUDED.loai_xe, tai_xe_mac_dinh = EXCLUDED.tai_xe_mac_dinh, ghi_chu = EXCLUDED.ghi_chu;

-- ----------------------------------------------------------------------------
-- 9. BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP TOÀN QUYỀN ĐỌC/GHI/SỬA/XÓA
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'file_kiot_tam', 'data_kiot', 'luu_tru', 'chi_tiet_hoa_don',
        'kiem_don', 'don_giao_lai', 'phieu_nop_tien', 'so_nop_tien_xe',
        'khach_hang', 'hang_hoa', 'dinh_khoan_hang_hoa', 'danh_sach_xe',
        'tai_khoan_ngan_hang', 'doi_ma_km', 'nv_giao_hang_tai_xe', 'nv_kinh_doanh'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Bật RLS
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- Xóa policies cũ nếu có
        EXECUTE format('DROP POLICY IF EXISTS "policy_doc_%s" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "policy_ghi_%s" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "policy_sua_%s" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "policy_xoa_%s" ON public.%I', tbl, tbl);
        
        -- Cấp quyền toàn diện cho anon và authenticated
        EXECUTE format('CREATE POLICY "policy_doc_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_ghi_%s" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_sua_%s" ON public.%I FOR UPDATE TO anon, authenticated USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_xoa_%s" ON public.%I FOR DELETE TO anon, authenticated USING (true)', tbl, tbl);
    END LOOP;
END $$;
