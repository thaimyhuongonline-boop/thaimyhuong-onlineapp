-- ============================================================================
-- 13_hang_tra_ve.sql
-- CHI TIẾT HÀNG TRẢ VỀ (TRẢ 1 PHẦN) THEO TỪNG HOÁ ĐƠN — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
--
-- Ở Bước 2, hoá đơn "Trả 1 phần" được chọn đúng các mặt hàng & số lượng khách trả lại.
-- Danh sách này lưu vào cột hang_tra_ve của bảng luu_tru để Bước 3 (MISA) trên MỌI máy
-- trừ đúng các mặt hàng đó. Chưa chạy file này thì vẫn dùng được trên máy đã lưu quyết toán.
--
-- Mỗi phần tử: { maHang, tenHang, dvt, km, soLuong, thanhTien }
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS hang_tra_ve JSONB;
