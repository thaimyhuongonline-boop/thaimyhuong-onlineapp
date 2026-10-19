-- ============================================================================
-- 20_chot_quy_thu_tien_sale_chi_phat_sinh.sql
-- QUẢN LÝ THU TIỀN SALE HẰNG NGÀY, CHI PHÁT SINH & CHỐT QUỸ TIỀN MẶT
-- DỰ ÁN: CÔNG TY TNHH THÁI MỸ HƯƠNG (oedidnctnteeegkdcwaa)
-- ============================================================================
-- 1. Bảng thu_tien_sale: Phiếu nộp tiền của Sale kèm Bảng kê đếm tiền theo mệnh giá
-- 2. Bảng chi_phat_sinh_ngay: Quản lý chi phí phát sinh theo ngày (trước & sau chốt quỹ)
-- 3. Bảng chốt quỹ theo ngày (chot_quy_ngay): Hợp nhất Xe + Sale thành Bảng kiểm quỹ
--    Công thức: [Tổng thu sale/xe] - [Các khoản chi] = [Tiền mặt đem đi nộp ngân hàng]
--    Cấn trừ chi sau chốt để tính [Tiền mặt lưu két]
-- ============================================================================

-- 1. BẢNG PHIẾU THU TIỀN SALE HẰNG NGÀY
CREATE TABLE IF NOT EXISTS public.thu_tien_sale (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_phieu VARCHAR(100) UNIQUE NOT NULL,
    ma_nv_sale VARCHAR(50),
    ten_nv_sale VARCHAR(150) NOT NULL,
    ngay_phat_sinh VARCHAR(20) NOT NULL, -- YYYY-MM-DD: Ngày phát sinh tiền hàng thực tế
    ngay_nop VARCHAR(20) NOT NULL,       -- YYYY-MM-DD: Ngày nộp tiền / kiểm đếm
    so_tien_nop NUMERIC(15, 2) NOT NULL DEFAULT 0,
    nguoi_nhan VARCHAR(100),             -- Kế toán / Thủ quỹ nhận tiền
    noi_dung TEXT,                       -- Chi tiết thu tiền khách nào / đơn nào
    -- 9 Mệnh giá tiền nộp chi tiết
    sl_500k INT DEFAULT 0,
    sl_200k INT DEFAULT 0,
    sl_100k INT DEFAULT 0,
    sl_50k INT DEFAULT 0,
    sl_20k INT DEFAULT 0,
    sl_10k INT DEFAULT 0,
    sl_5k INT DEFAULT 0,
    sl_2k INT DEFAULT 0,
    sl_1k INT DEFAULT 0,
    tong_tien_dem NUMERIC(15, 2) DEFAULT 0,
    chenh_lech NUMERIC(15, 2) DEFAULT 0,
    trang_thai VARCHAR(50) DEFAULT 'da_thu',
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thu_tien_sale_ngay_nop ON public.thu_tien_sale(ngay_nop);
CREATE INDEX IF NOT EXISTS idx_thu_tien_sale_ngay_ps ON public.thu_tien_sale(ngay_phat_sinh);
CREATE INDEX IF NOT EXISTS idx_thu_tien_sale_sale ON public.thu_tien_sale(ten_nv_sale);

-- 2. BẢNG CHI PHÁT SINH THEO NGÀY
CREATE TABLE IF NOT EXISTS public.chi_phat_sinh_ngay (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_chi VARCHAR(100) UNIQUE NOT NULL,
    ngay_chi VARCHAR(20) NOT NULL,       -- YYYY-MM-DD
    hang_muc VARCHAR(150) NOT NULL,      -- Xăng dầu, tiếp khách, bốc xếp, văn phòng phẩm...
    noi_dung TEXT NOT NULL,
    so_tien NUMERIC(15, 2) NOT NULL DEFAULT 0,
    nguoi_chi VARCHAR(100),
    nguoi_nhan VARCHAR(100),
    chung_tu VARCHAR(100),
    sau_chot_quy BOOLEAN DEFAULT FALSE,  -- True = Chi phát sinh sau khi đã hoàn tất chốt quỹ
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chi_phat_sinh_ngay_ngay ON public.chi_phat_sinh_ngay(ngay_chi);

-- 3. BẢNG CHỐT QUỸ TIỀN MẶT THEO NGÀY
CREATE TABLE IF NOT EXISTS public.chot_quy_ngay (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_chot_quy VARCHAR(100) UNIQUE NOT NULL, -- VD: CQ_20261017_20261016
    ngay_kiem_dem VARCHAR(20) NOT NULL,       -- YYYY-MM-DD
    ngay_phat_sinh VARCHAR(20) NOT NULL,      -- YYYY-MM-DD
    nguoi_chot VARCHAR(100) NOT NULL,         -- Kế toán tổng hợp / Thủ quỹ
    tong_thu_xe NUMERIC(15, 2) DEFAULT 0,     -- Tổng tiền thu từ các chuyến xe
    tong_thu_sale NUMERIC(15, 2) DEFAULT 0,   -- Tổng tiền thu từ nhân viên Sale
    tong_thu_tong_hop NUMERIC(15, 2) DEFAULT 0, -- = tong_thu_xe + tong_thu_sale
    tong_chi_phat_sinh NUMERIC(15, 2) DEFAULT 0,
    tien_nop_ngan_hang NUMERIC(15, 2) DEFAULT 0, -- = tong_thu_tong_hop - tong_chi_phat_sinh
    chi_sau_chot NUMERIC(15, 2) DEFAULT 0,
    tien_mat_luu_ket NUMERIC(15, 2) DEFAULT 0,
    -- Hợp nhất số lượng tờ 9 mệnh giá của Xe + Sale
    sl_500k INT DEFAULT 0,
    sl_200k INT DEFAULT 0,
    sl_100k INT DEFAULT 0,
    sl_50k INT DEFAULT 0,
    sl_20k INT DEFAULT 0,
    sl_10k INT DEFAULT 0,
    sl_5k INT DEFAULT 0,
    sl_2k INT DEFAULT 0,
    sl_1k INT DEFAULT 0,
    trang_thai VARCHAR(50) DEFAULT 'da_chot', -- 'cho_chot', 'da_chot', 'da_nop_nh'
    chi_tiet_nguon_tien JSONB,                -- Chi tiết từng xe, từng sale (mã, tên, số tiền, số tờ)
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chot_quy_kiem_dem ON public.chot_quy_ngay(ngay_kiem_dem);
CREATE INDEX IF NOT EXISTS idx_chot_quy_phat_sinh ON public.chot_quy_ngay(ngay_phat_sinh);

-- 4. BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN TOÀN DIỆN CHO ANON & AUTHENTICATED
ALTER TABLE public.thu_tien_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chi_phat_sinh_ngay ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chot_quy_ngay ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_thu_tien_sale_all" ON public.thu_tien_sale;
CREATE POLICY "policy_thu_tien_sale_all" ON public.thu_tien_sale FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "policy_chi_phat_sinh_ngay_all" ON public.chi_phat_sinh_ngay;
CREATE POLICY "policy_chi_phat_sinh_ngay_all" ON public.chi_phat_sinh_ngay FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "policy_chot_quy_ngay_all" ON public.chot_quy_ngay;
CREATE POLICY "policy_chot_quy_ngay_all" ON public.chot_quy_ngay FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
