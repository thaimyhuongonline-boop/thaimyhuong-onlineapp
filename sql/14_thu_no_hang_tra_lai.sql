-- ============================================================================
-- 14_thu_no_hang_tra_lai.sql
-- CHI TIẾT MẶT HÀNG KHÁCH TRẢ LẠI ĐỂ TRỪ NỢ (Sổ Theo Dõi Công Nợ)
-- Chạy script này 1 lần trong Supabase SQL Editor (sau sql/07 và sql/08).
--
-- Khách đang nợ nhưng không bán được hàng → trả lại hàng thay cho tiền. Khoản trả
-- hàng được ghi thành 1 dòng thu_no hình thức "Trả lại hàng". Cột dưới đây lưu
-- ĐÚNG các mặt hàng + số lượng khách trả (chọn từ các mặt hàng của hoá đơn), dạng:
--   [{ "maHang": "...", "tenHang": "...", "dvt": "...", "km": false,
--      "soLuong": 2, "thanhTien": 500000 }, ...]
-- Chưa chạy file này thì app vẫn ghi được khoản trả hàng, chi tiết mặt hàng chỉ
-- nằm trong ghi chú của dòng thu.
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

ALTER TABLE public.thu_no ADD COLUMN IF NOT EXISTS hang_tra_lai JSONB;
