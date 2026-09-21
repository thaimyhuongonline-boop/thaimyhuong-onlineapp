-- ============================================================================
-- 06_cong_no_xoa_mem.sql
-- XOÁ MỀM ĐƠN NỢ + NHẬT KÝ KIỂM TOÁN (dùng chung mọi máy, có hoàn tác)
-- Chạy script này 1 lần trong Supabase SQL Editor.
--
-- Nguyên tắc: KHÔNG sửa/xoá bản ghi gốc ở bảng luu_tru (giữ nguyên số liệu
-- hạch toán MISA). Đơn nợ bị xoá chỉ được ghi vào bảng này và bị ẩn khỏi
-- Sổ Theo Dõi Công Nợ. Hoàn tác = đánh dấu da_hoan_tac = TRUE.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cong_no_da_xoa (
    id            TEXT PRIMARY KEY,               -- id đơn nợ, dạng NO_<mã HĐ>
    ma_hd         TEXT,
    ma_kh         TEXT,
    ten_kh        TEXT,
    so_tien_no    NUMERIC DEFAULT 0,
    da_thu        NUMERIC DEFAULT 0,
    con_lai       NUMERIC DEFAULT 0,
    du_lieu_goc   JSONB,                          -- bản chụp đầy đủ để hoàn tác
    ly_do         TEXT,
    nguoi_xoa     TEXT,                           -- họ tên (SĐT) người xoá
    xoa_luc       TIMESTAMPTZ DEFAULT NOW(),
    da_hoan_tac   BOOLEAN DEFAULT FALSE,
    nguoi_hoan_tac TEXT,
    hoan_tac_luc  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cong_no_da_xoa_ma_hd ON public.cong_no_da_xoa (ma_hd);
CREATE INDEX IF NOT EXISTS idx_cong_no_da_xoa_hoan_tac ON public.cong_no_da_xoa (da_hoan_tac);

ALTER TABLE public.cong_no_da_xoa ENABLE ROW LEVEL SECURITY;

-- Nhật ký kiểm toán: cho đọc, thêm, sửa (hoàn tác); KHÔNG cho xoá bản ghi nhật ký.
DROP POLICY IF EXISTS "policy_doc_cong_no_da_xoa" ON public.cong_no_da_xoa;
CREATE POLICY "policy_doc_cong_no_da_xoa" ON public.cong_no_da_xoa FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_cong_no_da_xoa" ON public.cong_no_da_xoa;
CREATE POLICY "policy_ghi_cong_no_da_xoa" ON public.cong_no_da_xoa FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "policy_sua_cong_no_da_xoa" ON public.cong_no_da_xoa;
CREATE POLICY "policy_sua_cong_no_da_xoa" ON public.cong_no_da_xoa FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
