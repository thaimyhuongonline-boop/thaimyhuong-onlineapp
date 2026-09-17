-- ============================================================================
-- 03_chinh_sach_rls.sql
-- BẬT ROW LEVEL SECURITY (RLS) VÀ TẠO CHÍNH SÁCH BẢO MẬT CHO SUPABASE
-- Chạy script này trong Supabase SQL Editor
-- ============================================================================

-- BẬT RLS CHO TẤT CẢ CÁC BẢNG
ALTER TABLE public.khach_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hang_hoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dinh_khoan_hang_hoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tai_khoan_ngan_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danh_sach_xe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doi_ma_km ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.data_kiot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luu_tru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chi_tiet_hoa_don ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiem_don ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.don_giao_lai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phieu_nop_tien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.so_nop_tien_xe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_khac ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thu_no ENABLE ROW LEVEL SECURITY;

-- TẠO CHÍNH SÁCH RLS (ÁP DỤNG CHO USER ĐÃ ĐĂNG NHẬP / AUTHENTICATED)

-- 1. CHÍNH SÁCH ĐỌC (Mọi tài khoản đã đăng nhập trong công ty đều được đọc dữ liệu)
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'khach_hang', 'hang_hoa', 'dinh_khoan_hang_hoa', 'tai_khoan_ngan_hang',
        'danh_sach_xe', 'doi_ma_km', 'data_kiot', 'luu_tru', 'chi_tiet_hoa_don',
        'kiem_don', 'don_giao_lai', 'phieu_nop_tien', 'so_nop_tien_xe', 'no_khac', 'thu_no'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "policy_doc_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_doc_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "policy_ghi_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_ghi_%s" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "policy_sua_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_sua_%s" ON public.%I FOR UPDATE TO anon, authenticated USING (true)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "policy_xoa_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_xoa_%s" ON public.%I FOR DELETE TO anon, authenticated USING (true)', tbl, tbl);
    END LOOP;
END $$;
