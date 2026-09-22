-- ============================================================================
-- 07_thu_no_dong_bo.sql
-- ĐỒNG BỘ SỔ THU NỢ LÊN SUPABASE (chống thu trùng khi nhiều người/máy cùng thao tác)
-- Chạy script này 1 lần trong Supabase SQL Editor.
--
-- Vấn đề trước đây: mỗi lần "Thu Nợ Tại Quỹ" chỉ được lưu vào localStorage của
-- từng máy. Máy khác không thấy khoản vừa thu nên có thể thu lại lần nữa cho
-- cùng một đơn nợ. Từ nay, mỗi lần thu nợ (kể cả thu nợ cũ khi quyết toán
-- chuyến xe ở Bước 2) đều được ghi thành 1 dòng trong bảng thu_no bên dưới,
-- và mọi máy đều tổng hợp lại từ bảng này trước khi cho phép thu tiếp.
-- ============================================================================

-- Bảng thu_no đã được tạo ở sql/02_tao_bang_nghiep_vu_7_buoc.sql — bổ sung các
-- cột còn thiếu để gắn mỗi lần thu vào đúng 1 đơn nợ cụ thể (id_don_no, ma_hd).
ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS id_don_no TEXT;
ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS ma_hd VARCHAR(100);
ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS ma_dot VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_thu_no_id_don_no ON public.thu_no(id_don_no);
CREATE INDEX IF NOT EXISTS idx_thu_no_ma_hd ON public.thu_no(ma_hd);

ALTER TABLE public.thu_no ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_doc_thu_no" ON public.thu_no;
CREATE POLICY "policy_doc_thu_no" ON public.thu_no FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_thu_no" ON public.thu_no;
CREATE POLICY "policy_ghi_thu_no" ON public.thu_no FOR INSERT TO anon, authenticated WITH CHECK (true);
