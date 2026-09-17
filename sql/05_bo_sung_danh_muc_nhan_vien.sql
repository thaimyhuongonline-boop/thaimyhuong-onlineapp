-- ============================================================================
-- 05_bo_sung_danh_muc_nhan_vien.sql
-- BỔ SUNG CÁC BẢNG DANH MỤC NHÂN SỰ: GIAO HÀNG, TÀI XẾ & KINH DOANH
-- DỰ ÁN: CÔNG TY TNHH THÁI MỸ HƯƠNG (oedidnctnteeegkdcwaa)
-- ============================================================================

-- 1. BẢNG NHÂN VIÊN GIAO HÀNG & TÀI XẾ
CREATE TABLE IF NOT EXISTS public.nv_giao_hang_tai_xe (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_nv VARCHAR(50) UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    vai_tro VARCHAR(100) DEFAULT 'Tài xế & Giao hàng', -- 'Tài xế', 'Nhân viên giao hàng', 'Nhân viên thu tiền', 'Tài xế & Giao hàng'
    so_dien_thoai VARCHAR(50),
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tìm kiếm
CREATE INDEX IF NOT EXISTS idx_nv_gh_tx_hoten ON public.nv_giao_hang_tai_xe(ho_ten);

-- Bật RLS
ALTER TABLE public.nv_giao_hang_tai_xe ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_nv_gh_tx_all" ON public.nv_giao_hang_tai_xe;
CREATE POLICY "policy_nv_gh_tx_all" ON public.nv_giao_hang_tai_xe FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Nạp dữ liệu mặc định ban đầu nếu chưa có
INSERT INTO public.nv_giao_hang_tai_xe (ma_nv, ho_ten, vai_tro, so_dien_thoai, ghi_chu)
VALUES
    ('TX01', 'SINH', 'Tài xế', '0905001001', 'Lái xe tải HD1 (Sáng & Chiều)'),
    ('TX02', 'HẢI', 'Tài xế', '0905001002', 'Lái xe tải HD2 (Sáng & Chiều)'),
    ('GH01', 'ĐẠT', 'Nhân viên giao hàng & Thu tiền', '0905001003', 'Giao hàng và đối soát thu nộp tiền'),
    ('GH02', 'NAM', 'Nhân viên giao hàng', '0905001004', 'Nhân viên giao nhận hàng'),
    ('GH03', 'TUẤN', 'Nhân viên giao hàng', '0905001005', 'Nhân viên giao nhận hàng')
ON CONFLICT (ma_nv) DO UPDATE
SET ho_ten = EXCLUDED.ho_ten, vai_tro = EXCLUDED.vai_tro;

-- 2. BẢNG NHÂN VIÊN KINH DOANH
CREATE TABLE IF NOT EXISTS public.nv_kinh_doanh (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_nv VARCHAR(50) UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(50),
    email VARCHAR(150),
    khu_vuc TEXT,
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tìm kiếm
CREATE INDEX IF NOT EXISTS idx_nv_kd_hoten ON public.nv_kinh_doanh(ho_ten);

-- Bật RLS
ALTER TABLE public.nv_kinh_doanh ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_nv_kd_all" ON public.nv_kinh_doanh;
CREATE POLICY "policy_nv_kd_all" ON public.nv_kinh_doanh FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Nạp dữ liệu mẫu ban đầu cho NVKD
INSERT INTO public.nv_kinh_doanh (ma_nv, ho_ten, so_dien_thoai, email, khu_vuc, ghi_chu)
VALUES
    ('NVKD01', 'Nguyễn Tống Duy Nam', '0902 978 458', 'duynam.nguyen@thaimyhuong.vn', 'BIÊN HOÀ', 'Kinh doanh phụ trách tuyến Biên Hoà'),
    ('NVKD02', 'Nguyễn Hồng Phúc', '0708105164', 'hongphuc.nguyen@thaimyhuong.vn', 'Đà Nẵng', 'Kinh doanh phụ trách đại lý Đà Nẵng'),
    ('NVKD03', 'Nguyễn Văn An', '0905111222', 'an.nguyen@thaimyhuong.vn', 'Đà Nẵng (Hòa Xuân, Cẩm Lệ)', 'Kinh doanh phụ trách đại lý Đà Nẵng'),
    ('NVKD04', 'Trần Thị Mai', '0905333444', 'mai.tran@thaimyhuong.vn', 'Quảng Nam (Điện Bàn, Hội An)', 'Kinh doanh phụ trách đại lý Quảng Nam')
ON CONFLICT (ma_nv) DO UPDATE
SET ho_ten = EXCLUDED.ho_ten, khu_vuc = EXCLUDED.khu_vuc;

