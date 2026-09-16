-- ============================================================================
-- 04_he_thong_nhan_su_va_phan_quyen.sql
-- HỆ THỐNG TÀI KHOẢN NHÂN SỰ & MA TRẬN PHÂN QUYỀN CHUẨN TÂN VĨNH LỢI
-- DỰ ÁN: CÔNG TY TNHH THÁI MỸ HƯƠNG (oedidnctnteeegkdcwaa)
-- ============================================================================

-- 1. TẠO BẢNG NHÂN SỰ (ID LÀ SỐ ĐIỆN THOẠI)
CREATE TABLE IF NOT EXISTS public.nhan_su (
    so_dien_thoai VARCHAR(50) PRIMARY KEY,               -- ID đăng nhập duy nhất là Số điện thoại
    ho_ten VARCHAR(150) NOT NULL,                        -- Họ và tên nhân viên
    chuc_vu VARCHAR(150) NOT NULL,                       -- Chức vụ / Vị trí công việc
    phan_loai_tk INT NOT NULL DEFAULT 3,                 -- 1: Toàn quyền, 2: Cấp quản lý, 3: Nhân sự
    mat_khau_app VARCHAR(100) NOT NULL DEFAULT '123456', -- Mật khẩu đăng nhập app
    trang_thai VARCHAR(50) NOT NULL DEFAULT 'hoat_dong', -- 'hoat_dong', 'khoa'
    email VARCHAR(150),
    so_cccd VARCHAR(50),
    khoi VARCHAR(100) DEFAULT 'Khối Văn Phòng',
    bo_phan VARCHAR(100) DEFAULT 'Phòng Kế Toán',
    ngay_vao_lam DATE,
    ghi_chu TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_nhan_su_sdt ON public.nhan_su(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_nhan_su_chuc_vu ON public.nhan_su(chuc_vu);
CREATE INDEX IF NOT EXISTS idx_nhan_su_phan_loai ON public.nhan_su(phan_loai_tk);

-- 2. TẠO BẢNG MA TRẬN PHÂN QUYỀN THEO CHỨC VỤ (PHONG CÁCH TÂN VĨNH LỢI)
CREATE TABLE IF NOT EXISTS public.phan_quyen_vi_tri (
    chuc_vu VARCHAR(150) PRIMARY KEY,                    -- Tên chức vụ
    cac_quyen JSONB NOT NULL DEFAULT '{}'::jsonb,        -- Quyền từng tab: {"so_do":"all", "ban_hang":"all", ...}
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẬT ROW LEVEL SECURITY (RLS) MỞ CHO ANON & AUTHENTICATED
ALTER TABLE public.nhan_su ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phan_quyen_vi_tri ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách toàn quyền cho bảng nhan_su
DROP POLICY IF EXISTS "policy_nhan_su_all" ON public.nhan_su;
CREATE POLICY "policy_nhan_su_all" ON public.nhan_su FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Tạo chính sách toàn quyền cho bảng phan_quyen_vi_tri
DROP POLICY IF EXISTS "policy_phan_quyen_all" ON public.phan_quyen_vi_tri;
CREATE POLICY "policy_phan_quyen_all" ON public.phan_quyen_vi_tri FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA ĐỂ TEST NGAY)
-- Chèn tài khoản mẫu ban đầu:
INSERT INTO public.nhan_su (so_dien_thoai, ho_ten, chuc_vu, phan_loai_tk, mat_khau_app, trang_thai, khoi, bo_phan)
VALUES
    ('0903160116', 'Ban Giám Đốc', 'Giám đốc Điều hành', 1, '123456', 'hoat_dong', 'Khối Ban Điều Hành', 'Ban Giám Đốc'),
    ('0901000001', 'Kế Toán Bán Hàng', 'Kế toán Bán hàng', 3, '123456', 'hoat_dong', 'Khối Kinh Doanh', 'Phòng Bán Hàng'),
    ('0901000002', 'Kế Toán Công Nợ', 'Kế toán Công nợ', 3, '123456', 'hoat_dong', 'Khối Tài Chính', 'Phòng Kế Toán'),
    ('0901000003', 'Kế Toán Tổng Hợp', 'Kế toán Tổng hợp', 2, '123456', 'hoat_dong', 'Khối Tài Chính', 'Phòng Kế Toán'),
    ('0901000004', 'Kiểm Duyệt Viên', 'Kiểm duyệt viên', 2, '123456', 'hoat_dong', 'Khối Kiểm Soát', 'Ban Kiểm Soát')
ON CONFLICT (so_dien_thoai) DO UPDATE 
SET ho_ten = EXCLUDED.ho_ten, chuc_vu = EXCLUDED.chuc_vu, phan_loai_tk = EXCLUDED.phan_loai_tk;

-- Chèn ma trận phân quyền mẫu chuẩn theo 4 cấp quyền (all = Toàn quyền, dept = Cấp Quản lý, self = Cá nhân, none = Không):
INSERT INTO public.phan_quyen_vi_tri (chuc_vu, cac_quyen)
VALUES
    ('Giám đốc Điều hành', '{"trangchu":"all", "sodotochuc":"all", "ban_hang":"all", "cong_no":"all", "tong_hop":"all", "kiem_duyet":"all", "danhmuc":"all", "taikhoan":"all"}'::jsonb),
    ('Kế toán Bán hàng',   '{"trangchu":"self", "sodotochuc":"self", "ban_hang":"all", "cong_no":"none", "tong_hop":"none", "kiem_duyet":"none", "danhmuc":"self", "taikhoan":"none"}'::jsonb),
    ('Kế toán Công nợ',   '{"trangchu":"self", "sodotochuc":"self", "ban_hang":"dept", "cong_no":"all", "tong_hop":"none", "kiem_duyet":"none", "danhmuc":"self", "taikhoan":"none"}'::jsonb),
    ('Kế toán Tổng hợp',   '{"trangchu":"dept", "sodotochuc":"dept", "ban_hang":"dept", "cong_no":"dept", "tong_hop":"all", "kiem_duyet":"dept", "danhmuc":"all", "taikhoan":"none"}'::jsonb),
    ('Kiểm duyệt viên',    '{"trangchu":"all", "sodotochuc":"dept", "ban_hang":"dept", "cong_no":"dept", "tong_hop":"dept", "kiem_duyet":"all", "danhmuc":"dept", "taikhoan":"none"}'::jsonb),
    ('Thủ kho',            '{"trangchu":"self", "sodotochuc":"self", "ban_hang":"dept", "cong_no":"none", "tong_hop":"none", "kiem_duyet":"none", "danhmuc":"none", "taikhoan":"none"}'::jsonb),
    ('Tài xế',             '{"trangchu":"self", "sodotochuc":"self", "ban_hang":"self", "cong_no":"none", "tong_hop":"none", "kiem_duyet":"none", "danhmuc":"none", "taikhoan":"none"}'::jsonb)
ON CONFLICT (chuc_vu) DO UPDATE
SET cac_quyen = EXCLUDED.cac_quyen;
