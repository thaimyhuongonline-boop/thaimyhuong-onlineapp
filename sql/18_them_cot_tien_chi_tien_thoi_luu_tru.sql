-- ============================================================================
-- 18_them_cot_tien_chi_tien_thoi_luu_tru.sql
-- THÊM CỘT TIỀN CHI & TIỀN THỐI VÀO BẢNG luu_tru — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
-- Bước 2 lưu 2 giá trị này khi quyết toán chuyến xe:
--   tien_chi  : Chi phí phát sinh xe (xăng dầu, bến bãi, cầu đường...) — tài xế chi từ tiền nộp
--   tien_thoi : Tiền thối trả lại tài xế (hoàn tạm ứng) sau khi quyết toán
-- Cả 2 là giá trị cấp chuyến (maDot), giống nhau cho mọi hoá đơn trong cùng 1 chuyến.
-- Báo cáo tổng hợp đọc và tổng hợp theo từng chuyến (chống cộng trùng).
-- Chạy lại nhiều lần cũng an toàn (ADD COLUMN IF NOT EXISTS).
-- ============================================================================

ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS tien_chi  NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS tien_thoi NUMERIC(15, 2) DEFAULT 0;
