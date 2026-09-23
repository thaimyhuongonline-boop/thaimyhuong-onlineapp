-- ============================================================================
-- 12_khach_tra_truoc.sql
-- SỔ TIỀN KHÁCH TRẢ TRƯỚC / TRẢ DƯ (DƯ CÓ TK 131) — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
--
-- Ghi lại mọi khoản khách đưa THỪA hoặc TRẢ TRƯỚC (chưa có đơn nợ để trừ) và các lần
-- HOÀN TIỀN lại cho khách, để:
--   • tiền dư không bị "rơi" khỏi sổ sách (trước đây phần dư không được ghi ở đâu),
--   • trừ vào đơn nợ sau của khách — LUÔN HỎI TRƯỚC, không tự trừ,
--   • Bước 3 đẩy đúng bút toán MISA: nhận tiền Nợ 1111/1121 – Có 131; hoàn tiền Nợ 131 – Có 1111/1121.
--
-- Các lần CẤN TRỪ (dùng tiền trả trước để trừ nợ) KHÔNG ghi ở bảng này mà ghi thành 1 dòng
-- trong bảng thu_no (hinh_thuc = 'Cấn trừ trả trước') để sổ công nợ trên mọi máy tự trừ đúng.
--
-- Bảng CHỈ ĐƯỢC THÊM dòng mới; app không sửa / xoá được (trừ đánh dấu "đã đẩy MISA").
-- Điều chỉnh giảm (khi sửa lại quyết toán Bước 2) được ghi thành dòng số tiền âm.
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.khach_tra_truoc (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    luc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ngay VARCHAR(20),                       -- ngày nghiệp vụ YYYY-MM-DD
    ma_kh VARCHAR(100),
    ten_kh TEXT NOT NULL,
    loai VARCHAR(20) NOT NULL DEFAULT 'nhan', -- 'nhan' (nhận tiền trả trước / trả dư) | 'hoan' (hoàn tiền cho khách)
    so_tien NUMERIC(15, 2) NOT NULL,        -- dương; âm = điều chỉnh giảm khoản đã nhận
    hinh_thuc VARCHAR(50) DEFAULT 'Tiền mặt', -- 'Tiền mặt' | 'Chuyển khoản'
    tai_khoan_nhan VARCHAR(150),            -- tài khoản ngân hàng nhận / chi
    nguon VARCHAR(50),                      -- tra_truoc | thu_tai_quy_du | buoc2_du_hoa_don | buoc2_du_thu_no | hoan_tien
    ma_dot VARCHAR(100),                    -- chuyến xe (khoản dư ở Bước 2)
    ma_hd VARCHAR(100),                     -- hoá đơn liên quan (nếu có)
    nguoi_thuc_hien TEXT,
    ghi_chu TEXT,
    da_day_misa BOOLEAN DEFAULT FALSE,
    thoi_gian_day_misa TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ktt_ten_kh ON public.khach_tra_truoc(ten_kh);
CREATE INDEX IF NOT EXISTS idx_ktt_ma_dot ON public.khach_tra_truoc(ma_dot);
CREATE INDEX IF NOT EXISTS idx_ktt_ngay ON public.khach_tra_truoc(ngay);

ALTER TABLE public.khach_tra_truoc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_doc_khach_tra_truoc" ON public.khach_tra_truoc;
CREATE POLICY "policy_doc_khach_tra_truoc" ON public.khach_tra_truoc FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_khach_tra_truoc" ON public.khach_tra_truoc;
CREATE POLICY "policy_ghi_khach_tra_truoc" ON public.khach_tra_truoc FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "policy_sua_khach_tra_truoc" ON public.khach_tra_truoc;
CREATE POLICY "policy_sua_khach_tra_truoc" ON public.khach_tra_truoc FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Chỉ cho sửa 2 cột đánh dấu đẩy MISA (không sửa được số tiền / khách hàng đã ghi)
REVOKE UPDATE ON public.khach_tra_truoc FROM anon, authenticated;
GRANT UPDATE (da_day_misa, thoi_gian_day_misa) ON public.khach_tra_truoc TO anon, authenticated;
REVOKE DELETE ON public.khach_tra_truoc FROM anon, authenticated;

-- Tra cứu nhanh các lần cấn trừ tiền trả trước trong bảng thu_no
CREATE INDEX IF NOT EXISTS idx_thu_no_hinh_thuc ON public.thu_no(hinh_thuc);
