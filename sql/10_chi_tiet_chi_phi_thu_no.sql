-- ============================================================================
-- 10_chi_tiet_chi_phi_thu_no.sql
-- CHI TIẾT NHIỀU DÒNG CHO "CHI PHÍ XE" & "THU NỢ CŨ" Ở BƯỚC 2 (chạy 1 lần trong Supabase SQL Editor)
-- ============================================================================
--
-- Bước 2 nay cho nhập Chi phí phát sinh xe thành NHIỀU KHOẢN (nội dung + số tiền, có tổng
-- để tập hợp chi phí) và Thu nợ cũ theo TỪNG KHÁCH HÀNG (khách nào trả bao nhiêu, tự cấn
-- trừ vào Sổ Theo Dõi Công Nợ khi lưu quyết toán).
--
-- Hai cột dưới đây lưu các danh sách chi tiết đó lên phiếu nộp tiền để MÁY KHÁC mở lại
-- chuyến xe vẫn thấy đủ từng dòng. Chưa chạy file này thì app vẫn hoạt động bình thường
-- (tổng tiền vẫn đồng bộ), chỉ là máy khác sẽ thấy các khoản gộp thành 1 dòng.
--
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS danh_sach_chi_phi JSONB;  -- [{ noiDung, soTien }]
ALTER TABLE public.phieu_nop_tien ADD COLUMN IF NOT EXISTS danh_sach_thu_no JSONB;   -- [{ tenKH, maKH, soTien, uuTienIds, ngoaiSo }]

-- Bước 2 đọc lại các khoản thu nợ mà chính chuyến xe đã ghi (theo ma_dot) để khi lưu lại
-- chỉ ghi PHẦN CHÊNH LỆCH — không bao giờ trừ nợ trùng dù bấm Lưu nhiều lần.
CREATE INDEX IF NOT EXISTS idx_thu_no_ma_dot ON public.thu_no(ma_dot);
