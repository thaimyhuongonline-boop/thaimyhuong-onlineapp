-- ============================================================================
-- 08_thu_no_day_misa.sql
-- CẤN TRỪ CÔNG NỢ VÀO MISA (Bước 3) — đánh dấu các khoản thu nợ đã xuất MISA
-- Chạy script này 1 lần trong Supabase SQL Editor (sau khi đã chạy sql/07).
--
-- Trước đây: khoản "Thu Nợ Tại Quỹ" (Theo Dõi Công Nợ) chỉ giảm số nợ hiển thị
-- trên màn hình, KHÔNG hề sinh ra bút toán Nợ 1111/1121 - Có 131 cho kế toán,
-- nên MISA không bao giờ ghi nhận việc khách đã trả nợ (tiền mặt/ngân hàng
-- tăng, công nợ 131 giảm). Từ nay Bước 3 có thêm khu vực "Thu Nợ Khách Hàng"
-- đọc thẳng từ bảng thu_no để xuất đúng bút toán cấn trừ công nợ này.
-- ============================================================================

ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS da_day_misa BOOLEAN DEFAULT FALSE;
ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS thoi_gian_day_misa TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_thu_no_da_day_misa ON public.thu_no(da_day_misa);

-- Cho phép cập nhật (đánh dấu đã đẩy MISA) — bảng thu_no trước đây chỉ có
-- chính sách đọc (SELECT) và ghi mới (INSERT), chưa có chính sách UPDATE.
DROP POLICY IF EXISTS "policy_sua_thu_no" ON public.thu_no;
CREATE POLICY "policy_sua_thu_no" ON public.thu_no FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
