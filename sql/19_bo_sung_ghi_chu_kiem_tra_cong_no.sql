-- ============================================================================
-- 19_bo_sung_ghi_chu_kiem_tra_cong_no.sql
-- BỔ SUNG CỘT GHI CHÚ, HÌNH THỨC THANH TOÁN VÀ ĐÃ KIỂM TRA CHO CÔNG NỢ & LƯU TRỮ
-- Chạy script này 1 lần trong Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================
-- 1. Bảng luu_tru (quản lý chi tiết từng hoá đơn của chuyến xe):
--    - ghi_chu: Lưu ghi chú hoá đơn nhập từ Bước 2, đồng bộ sang Sổ công nợ
--    - hinh_thuc_thanh_toan: Lưu hình thức thanh toán (Tiền mặt, Chuyển khoản, ...)
--    - da_kiem_tra: Đánh dấu đã kiểm tra đối soát từng đơn trong Lịch sử đơn nợ
-- 2. Bảng cong_no_ngoai_bang_ke (đơn nợ thêm thủ công):
--    - da_kiem_tra: Đánh dấu đã kiểm tra đối soát
-- ============================================================================

-- 1. Bổ sung các cột vào bảng luu_tru
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS hinh_thuc_thanh_toan VARCHAR(100);
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS da_kiem_tra BOOLEAN DEFAULT FALSE;

-- 2. Bổ sung cột da_kiem_tra vào bảng cong_no_ngoai_bang_ke
ALTER TABLE public.cong_no_ngoai_bang_ke ADD COLUMN IF NOT EXISTS da_kiem_tra BOOLEAN DEFAULT FALSE;

-- 3. Cấp quyền UPDATE (sửa) an toàn cho anon & authenticated trên bảng cong_no_ngoai_bang_ke
DROP POLICY IF EXISTS "policy_sua_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke;
CREATE POLICY "policy_sua_cong_no_ngoai_bang_ke" ON public.cong_no_ngoai_bang_ke 
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Đảm bảo quyền UPDATE trên bảng luu_tru
DROP POLICY IF EXISTS "policy_sua_luu_tru" ON public.luu_tru;
CREATE POLICY "policy_sua_luu_tru" ON public.luu_tru 
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
