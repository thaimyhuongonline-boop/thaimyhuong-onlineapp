-- ============================================================================
-- 16_tai_khoan_ngan_hang_theo_huong_dan.sql
-- ĐỒNG BỘ DANH MỤC TÀI KHOẢN NGÂN HÀNG VỚI "Cách điền phiếu thu.docx"
-- Chạy 1 lần trong Supabase SQL Editor (chạy lại nhiều lần cũng an toàn).
--
-- TK MISA (TK Nợ khi thu tiền gửi) của từng tài khoản ngân hàng:
--   VCB – 0041000266096 → 11211      VCB – 3704376789 → 11212
--   TCB – 20166789      → 11213      SCB – 040089722561 → 11214
--   MB  – 2016056789    → 11215
-- • Gán đúng tk_misa cho các tài khoản trên (nhận theo số tài khoản, giữ nguyên tên hiển thị
--   vì Bước 2 / Công nợ đã lưu tên này trên các khoản thu cũ).
-- • Tài khoản KHÁC đang giữ một trong các mã 11211…11215 (vd VCB 0041000178497 đang là 11214)
--   được bỏ mã (để trống) — tránh 2 tài khoản cùng 1 TK MISA. Cần mã riêng thì sửa trong Danh mục.
-- • Thêm SCB – 040089722561 và MB – 2016056789 nếu danh mục chưa có (để chọn được ở Bước 2).
-- ============================================================================

-- 1. Gán TK MISA theo số tài khoản
UPDATE public.tai_khoan_ngan_hang SET tk_misa = '11211'
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%0041000266096%';
UPDATE public.tai_khoan_ngan_hang SET tk_misa = '11212'
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%3704376789%';
UPDATE public.tai_khoan_ngan_hang SET tk_misa = '11213'
  WHERE regexp_replace(COALESCE(so_tk, ''), '\D', '', 'g') = '20166789'
     OR (COALESCE(so_tk, '') = '' AND ten_tk LIKE '%20166789%');
UPDATE public.tai_khoan_ngan_hang SET tk_misa = '11214'
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%040089722561%';
UPDATE public.tai_khoan_ngan_hang SET tk_misa = '11215'
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%2016056789%';

-- 2. Tài khoản khác đang giữ nhầm mã 11211…11215 → bỏ mã
UPDATE public.tai_khoan_ngan_hang SET tk_misa = ''
  WHERE tk_misa IN ('11211', '11212', '11213', '11214', '11215')
    AND regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') NOT LIKE '%0041000266096%'
    AND regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') NOT LIKE '%3704376789%'
    AND regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') NOT LIKE '%20166789%'
    AND regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') NOT LIKE '%040089722561%'
    AND regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') NOT LIKE '%2016056789%';

-- 3. Thêm SCB & MB nếu chưa có
INSERT INTO public.tai_khoan_ngan_hang (ten_tk, so_tk, ten_ngan_hang, chu_tai_khoan, tk_misa, mac_dinh, ghi_chu)
SELECT 'SCB - 040089722561', '040089722561', 'SCB', 'CÔNG TY TNHH THÁI MỸ HƯƠNG', '11214', FALSE, 'Theo hướng dẫn phiếu thu AMIS'
WHERE NOT EXISTS (SELECT 1 FROM public.tai_khoan_ngan_hang
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%040089722561%')
ON CONFLICT (ten_tk) DO NOTHING;

INSERT INTO public.tai_khoan_ngan_hang (ten_tk, so_tk, ten_ngan_hang, chu_tai_khoan, tk_misa, mac_dinh, ghi_chu)
SELECT 'MB - 2016056789', '2016056789', 'MB Bank', 'CÔNG TY TNHH THÁI MỸ HƯƠNG', '11215', FALSE, 'Theo hướng dẫn phiếu thu AMIS'
WHERE NOT EXISTS (SELECT 1 FROM public.tai_khoan_ngan_hang
  WHERE regexp_replace(COALESCE(so_tk, '') || ' ' || COALESCE(ten_tk, ''), '\D', '', 'g') LIKE '%2016056789%')
ON CONFLICT (ten_tk) DO NOTHING;

-- Kiểm tra kết quả
SELECT ten_tk, so_tk, ten_ngan_hang, tk_misa FROM public.tai_khoan_ngan_hang ORDER BY tk_misa, ten_tk;
