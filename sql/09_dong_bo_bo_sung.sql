-- ============================================================================
-- 09_dong_bo_bo_sung.sql
-- KHẮC PHỤC 2 LỖI ĐỒNG BỘ GIỮA CÁC MÁY (chạy 1 lần trong Supabase SQL Editor)
-- ============================================================================
--
-- LỖI 1: "Thêm Đơn Ngoài Bảng Kê" ở Theo Dõi Công Nợ trước đây chỉ lưu vào
-- localStorage của máy đang thao tác — máy khác KHÔNG BAO GIỜ thấy được đơn nợ
-- này, kể cả khi bấm "Tải Lại Dữ Liệu". Nay các đơn này được lưu lên bảng
-- cong_no_ngoai_bang_ke bên dưới để mọi máy đều đọc được.
--
-- LỖI 2: Khi quyết toán 1 chuyến xe ở Bước 2, các số liệu "Chi phí phát sinh",
-- "Thu nợ cũ", "Tiền thối", số tờ đếm tiền... chỉ được lưu ĐẦY ĐỦ vào
-- localStorage của máy vừa quyết toán. Máy khác mở lại chuyến xe đó (ví dụ để
-- xem/in lại Biên bản quyết toán) sẽ thấy các số liệu này bị RESET VỀ 0, vì
-- bảng phieu_nop_tien trước đây không có cột riêng cho từng số liệu (chỉ gộp
-- chung vào 1 dòng ghi_chú dạng chữ, không đọc lại được). Nay bổ sung các cột
-- số liệu riêng để đọc lại đúng trên mọi máy.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- LỖI 1: Bảng lưu các đơn nợ nhập thủ công ngoài bảng kê KiotViet
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cong_no_ngoai_bang_ke (
    id TEXT PRIMARY KEY,              -- id đơn nợ, dạng NO_<mã HĐ>
    ma_hd TEXT,
    ma_kh TEXT,
    ten_kh TEXT,
    nguoi_ban TEXT,
    xe TEXT,
    tai_xe TEXT,
    ngay_giao TEXT,
    tien_hd NUMERIC(15, 2) DEFAULT 0,
    so_tien_no NUMERIC(15, 2) DEFAULT 0,
    ghi_chu TEXT,
    nguoi_tao TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cong_no_ngoai_bang_ke ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_doc_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke;
CREATE POLICY "policy_doc_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke;
CREATE POLICY "policy_ghi_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- LỖI 2: Bổ sung cột số liệu quyết toán riêng cho bảng phiếu nộp tiền
-- (tự tạo bảng đầy đủ nếu máy chủ chưa có, không cần chạy sql/02 trước)
-- ---------------------------------------------------------------------------
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

ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS tien_chi NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS noi_dung_chi TEXT;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS thu_no_cu NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS ghi_chu_thu_no_cu TEXT;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS tien_thoi NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS ghi_chu_phieu TEXT;
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS danh_sach_don_no_dang_thu JSONB;

CREATE INDEX IF NOT EXISTS idx_phieu_nop_tien_ma_dot ON public.phieu_nop_tien(ma_dot);

ALTER TABLE public.phieu_nop_tien ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_doc_phieu_nop_tien" ON public.phieu_nop_tien;
CREATE POLICY "policy_doc_phieu_nop_tien" ON public.phieu_nop_tien FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_phieu_nop_tien" ON public.phieu_nop_tien;
CREATE POLICY "policy_ghi_phieu_nop_tien" ON public.phieu_nop_tien FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "policy_sua_phieu_nop_tien" ON public.phieu_nop_tien;
CREATE POLICY "policy_sua_phieu_nop_tien" ON public.phieu_nop_tien FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
