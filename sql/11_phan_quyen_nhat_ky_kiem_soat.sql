-- ============================================================================
-- 11_phan_quyen_nhat_ky_kiem_soat.sql
-- NHẬT KÝ KIỂM SOÁT HẬU KỲ CHO MA TRẬN PHÂN QUYỀN (chạy 1 lần trong Supabase SQL Editor)
-- ============================================================================
--
-- Ghi lại: đăng nhập / đăng nhập sai, đăng xuất, thay đổi ma trận quyền & quyền riêng,
-- tạo / sửa / khoá / xoá tài khoản, thao tác bị chặn, phát hiện trang mới, và mọi lần ghi
-- dữ liệu lên máy chủ (gom theo bảng) — để đối chiếu, kiểm tra lại sau.
--
-- Nhật ký CHỈ ĐƯỢC THÊM, không có quyền sửa / xoá từ app (không tạo policy UPDATE / DELETE).
-- Chưa chạy file này thì app vẫn hoạt động bình thường, chỉ là chưa có nhật ký.
--
-- Ghi chú: quyền riêng của từng tài khoản được lưu ngay trong bảng phan_quyen_vi_tri
-- (dòng có chuc_vu = '@TK:<số điện thoại>') nên KHÔNG cần tạo bảng mới cho phần đó.
-- Chạy lại nhiều lần cũng an toàn.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nhat_ky_he_thong (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    luc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    loai VARCHAR(40) NOT NULL,             -- dang_nhap, dang_nhap_loi, dang_xuat, phan_quyen, tai_khoan, tu_choi, ghi_du_lieu, trang_moi
    sdt VARCHAR(150),                      -- số điện thoại (hoặc email với tài khoản Supabase chính thức)
    ho_ten TEXT,
    chuc_vu TEXT,
    cap INT,
    la_admin_supabase BOOLEAN DEFAULT FALSE,
    module VARCHAR(150),                   -- mục trong ma trận phân quyền (dieuxe, quyettoan, misa, congno...)
    trang VARCHAR(200),                    -- tên trang (file .html)
    doi_tuong TEXT,                        -- đối tượng bị tác động (số điện thoại, tên bảng, mã chức năng...)
    noi_dung TEXT,
    chi_tiet JSONB,
    thiet_bi TEXT
);

CREATE INDEX IF NOT EXISTS idx_nhat_ky_luc ON public.nhat_ky_he_thong(luc DESC);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_sdt ON public.nhat_ky_he_thong(sdt);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_loai ON public.nhat_ky_he_thong(loai);

ALTER TABLE public.nhat_ky_he_thong ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_doc_nhat_ky" ON public.nhat_ky_he_thong;
CREATE POLICY "policy_doc_nhat_ky" ON public.nhat_ky_he_thong FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "policy_ghi_nhat_ky" ON public.nhat_ky_he_thong;
CREATE POLICY "policy_ghi_nhat_ky" ON public.nhat_ky_he_thong FOR INSERT TO anon, authenticated WITH CHECK (true);
