-- ============================================================================
-- 15_han_muc_cong_no.sql
-- HẠN MỨC CÔNG NỢ KHÁCH HÀNG & NHÓM KHÁCH HÀNG — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
--
-- Mỗi khách có 1 hạn mức gồm:
--   • han_muc_ngay : số NGÀY được nợ, tính từ ngày nợ của từng hoá đơn (0 = không giới hạn)
--   • han_muc_tien : số TIỀN nợ tối đa (0 = không giới hạn)
-- Dòng id = '__CA_NHAN_MAC_DINH__' là hạn mức MẶC ĐỊNH cho khách cá nhân (không thuộc nhóm nào),
-- ban đầu 05 ngày · 6.000.000 đ (sửa được trong app: Theo Dõi Công Nợ → ⚖️ Hạn Mức Công Nợ).
-- Các dòng còn lại là NHÓM KHÁCH HÀNG (vd. chuỗi AU MART) với hạn mức riêng; khách trong nhóm
-- dùng hạn mức của nhóm thay cho mặc định cá nhân. cach_tinh của hạn mức tiền:
--   • 'tong_nhom'  : TỔNG nợ của cả nhóm không vượt hạn mức
--   • 'tung_khach' : MỖI khách trong nhóm được nợ tối đa hạn mức đó
-- thanh_vien: danh sách khách của nhóm [{ "maKH": "...", "tenKH": "..." }, ...]
--
-- Hạn mức dùng để CẢNH BÁO (sổ công nợ tô đỏ khách vượt hạn mức / quá hạn; Bước 2 hỏi lại khi
-- lưu quyết toán phát sinh nợ vượt hạn mức) — không tự chặn nghiệp vụ.
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nhom_han_muc_cong_no (
    id TEXT PRIMARY KEY,
    ten_nhom TEXT NOT NULL,
    loai VARCHAR(30) NOT NULL DEFAULT 'nhom',          -- 'ca_nhan_mac_dinh' | 'nhom'
    han_muc_ngay INTEGER NOT NULL DEFAULT 5,
    han_muc_tien NUMERIC(15, 2) NOT NULL DEFAULT 6000000,
    cach_tinh VARCHAR(20) NOT NULL DEFAULT 'tong_nhom', -- 'tong_nhom' | 'tung_khach'
    thanh_vien JSONB NOT NULL DEFAULT '[]'::jsonb,
    ghi_chu TEXT,
    nguoi_cap_nhat TEXT,
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nhom_han_muc_cong_no ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_doc_han_muc" ON public.nhom_han_muc_cong_no;
CREATE POLICY "policy_doc_han_muc" ON public.nhom_han_muc_cong_no FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "policy_ghi_han_muc" ON public.nhom_han_muc_cong_no;
CREATE POLICY "policy_ghi_han_muc" ON public.nhom_han_muc_cong_no FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "policy_sua_han_muc" ON public.nhom_han_muc_cong_no;
CREATE POLICY "policy_sua_han_muc" ON public.nhom_han_muc_cong_no FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "policy_xoa_han_muc" ON public.nhom_han_muc_cong_no;
CREATE POLICY "policy_xoa_han_muc" ON public.nhom_han_muc_cong_no FOR DELETE TO anon, authenticated USING (true);

-- Hạn mức mặc định cho khách cá nhân: 05 ngày · 6.000.000 đ (không ghi đè nếu đã sửa trong app)
INSERT INTO public.nhom_han_muc_cong_no (id, ten_nhom, loai, han_muc_ngay, han_muc_tien, cach_tinh, thanh_vien, ghi_chu)
VALUES ('__CA_NHAN_MAC_DINH__', 'Khách cá nhân (mặc định)', 'ca_nhan_mac_dinh', 5, 6000000, 'tung_khach', '[]'::jsonb,
        'Áp dụng cho mọi khách không thuộc nhóm nào')
ON CONFLICT (id) DO NOTHING;
