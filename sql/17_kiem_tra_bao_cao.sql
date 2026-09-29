-- ============================================================================
-- 17_kiem_tra_bao_cao.sql
-- Ô TÍCH "KIỂM TRA" TRONG BÁO CÁO TỔNG HỢP — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
-- Kế toán trưởng tích "đã kiểm tra" từng khoản trong các bảng chi tiết của Báo cáo tổng hợp
-- (tiền mặt, chuyển khoản, hàng trả về, nợ, thu nợ…). Mỗi dòng = 1 ô tích:
--   khoa            : nhóm bảng | khoản   (vd "ck|HD|DOT_XE1_20260929_1234|HD285854", "tienmat|thu_no|15")
--   da_kiem_tra     : true = đã tích, false = đã bỏ tích
--   nguoi_kiem_tra  : người tích / bỏ tích gần nhất,  kiem_tra_luc: thời điểm
-- Chưa chạy file này thì app vẫn tích được nhưng chỉ lưu trên máy đang dùng.
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kiem_tra_bao_cao (
    khoa TEXT PRIMARY KEY,
    da_kiem_tra BOOLEAN NOT NULL DEFAULT TRUE,
    nguoi_kiem_tra TEXT,
    kiem_tra_luc TIMESTAMPTZ DEFAULT NOW(),
    ghi_chu TEXT
);

ALTER TABLE public.kiem_tra_bao_cao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_doc_kiem_tra_bc" ON public.kiem_tra_bao_cao;
CREATE POLICY "policy_doc_kiem_tra_bc" ON public.kiem_tra_bao_cao FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_kiem_tra_bc" ON public.kiem_tra_bao_cao;
CREATE POLICY "policy_ghi_kiem_tra_bc" ON public.kiem_tra_bao_cao FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "policy_sua_kiem_tra_bc" ON public.kiem_tra_bao_cao;
CREATE POLICY "policy_sua_kiem_tra_bc" ON public.kiem_tra_bao_cao FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
