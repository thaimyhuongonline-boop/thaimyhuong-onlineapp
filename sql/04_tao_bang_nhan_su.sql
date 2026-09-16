-- ============================================================================
-- 04_tao_bang_nhan_su.sql
-- TẠO CÁC BẢNG QUẢN LÝ NHÂN SỰ, SƠ ĐỒ TỔ CHỨC & MA TRẬN PHÂN QUYỀN
-- DÀNH CHO CÔNG TY TNHH THÁI MỸ HƯƠNG (HOẠT ĐỘNG HOÀN TOÀN TRÊN VERCEL)
-- Chạy script này trong Supabase SQL Editor (Dự án: oedidnctnteeegkdcwaa)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BẢNG DANH MỤC PHÂN CẤP (Khối, Bộ phận, Chức vụ, Vị trí)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.danh_muc (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loai VARCHAR(50) NOT NULL, -- 'khoi', 'bo_phan', 'chuc_vu', 'vi_tri'
    gia_tri VARCHAR(150) NOT NULL,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_danh_muc_loai_giatri UNIQUE (loai, gia_tri)
);

CREATE INDEX IF NOT EXISTS idx_danh_muc_loai ON public.danh_muc(loai);

-- ----------------------------------------------------------------------------
-- 2. BẢNG MÔ TẢ CÔNG VIỆC (JD - Job Description)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mo_ta_cviec (
    vi_tri VARCHAR(150) PRIMARY KEY,
    mo_ta TEXT NOT NULL,
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. BẢNG MA TRẬN PHÂN QUYỀN THEO VỊ TRÍ (Quyền truy cập chức năng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phan_quyen_vi_tri (
    vi_tri VARCHAR(150) PRIMARY KEY,
    cac_quyen TEXT NOT NULL, -- Lưu chuỗi JSON phân quyền module: {"nhan_su":"all","buoc1":"all",...}
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. BẢNG HỒ SƠ NHÂN SỰ ĐỘC LẬP (Không dùng auth.users của Supabase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nhan_su (
    so_cccd VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(50) UNIQUE,
    mat_khau_app VARCHAR(100) DEFAULT '123456',
    email VARCHAR(150),
    vai_tro_app VARCHAR(50) DEFAULT 'Người dùng', -- 'Người dùng', 'Quản trị viên', 'Admin'
    trang_thai_lam_viec VARCHAR(50) DEFAULT 'Còn làm việc', -- 'Còn làm việc', 'Đã nghỉ việc', 'Đang bàn giao', 'Nghỉ thai sản'
    ngay_vao_lam DATE,
    ngay_sinh DATE,
    ngay_cap_cccd DATE,
    noi_cap_cccd VARCHAR(150) DEFAULT 'CCSQLHCVTTXH',
    khoi TEXT,               -- Phân khối (hỗ trợ kiêm nhiệm ghép chuỗi dấu |)
    bo_phan TEXT,            -- Phân bộ phận (ghép chuỗi |)
    chuc_vu TEXT,            -- Chức vụ (ghép chuỗi |)
    vi_tri_cong_viec TEXT,   -- Vị trí công việc (ghép chuỗi |)
    ngan_hang VARCHAR(150),
    so_tai_khoan VARCHAR(100),
    lien_he_khan_cap TEXT,
    ghi_chu TEXT,
    so_bhxh VARCHAR(50),
    tham_gia_bhxh BOOLEAN DEFAULT FALSE,
    anh_dai_dien TEXT,
    anh_cccd_truoc TEXT,
    anh_cccd_sau TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nhan_su_sdt ON public.nhan_su(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_nhan_su_trang_thai ON public.nhan_su(trang_thai_lam_viec);

-- ----------------------------------------------------------------------------
-- 5. TẠO VIEW CHỮ HOA ĐỒNG BỘ CHO SUPABASE POSTGREST
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public."DANH_MUC" AS SELECT * FROM public.danh_muc;
CREATE OR REPLACE VIEW public."MO_TA_CVIEC" AS SELECT * FROM public.mo_ta_cviec;
CREATE OR REPLACE VIEW public."PHAN_QUYEN_VI_TRI" AS SELECT * FROM public.phan_quyen_vi_tri;
CREATE OR REPLACE VIEW public."NHAN_SU" AS SELECT * FROM public.nhan_su;

-- ----------------------------------------------------------------------------
-- 6. BẬT ROW LEVEL SECURITY (RLS) & CHÍNH SÁCH BẢO MẬT LINH HOẠT CHO VERCEL
-- Cho phép cả tài khoản quản trị và truy cập nội bộ đọc/ghi an toàn
-- ----------------------------------------------------------------------------
ALTER TABLE public.danh_muc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_ta_cviec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phan_quyen_vi_tri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_su ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY['danh_muc', 'mo_ta_cviec', 'phan_quyen_vi_tri', 'nhan_su'];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Quyền Xem
        EXECUTE format('DROP POLICY IF EXISTS "policy_doc_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_doc_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl, tbl);
        
        -- Quyền Thêm mới
        EXECUTE format('DROP POLICY IF EXISTS "policy_ghi_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_ghi_%s" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl, tbl);
        
        -- Quyền Chỉnh sửa
        EXECUTE format('DROP POLICY IF EXISTS "policy_sua_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_sua_%s" ON public.%I FOR UPDATE TO anon, authenticated USING (true)', tbl, tbl);
        
        -- Quyền Xóa
        EXECUTE format('DROP POLICY IF EXISTS "policy_xoa_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_xoa_%s" ON public.%I FOR DELETE TO anon, authenticated USING (true)', tbl, tbl);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 7. CẤU HÌNH STORAGE BUCKET LƯU ẢNH THẺ CCCD & AVATAR
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('nhan_su', 'nhan_su', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép upload và tải ảnh từ bucket nhan_su công khai
DROP POLICY IF EXISTS "nhan_su_storage_doc" ON storage.objects;
CREATE POLICY "nhan_su_storage_doc" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'nhan_su');

DROP POLICY IF EXISTS "nhan_su_storage_upload" ON storage.objects;
CREATE POLICY "nhan_su_storage_upload" ON storage.objects
FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'nhan_su');

DROP POLICY IF EXISTS "nhan_su_storage_sua" ON storage.objects;
CREATE POLICY "nhan_su_storage_sua" ON storage.objects
FOR UPDATE TO anon, authenticated USING (bucket_id = 'nhan_su');

DROP POLICY IF EXISTS "nhan_su_storage_xoa" ON storage.objects;
CREATE POLICY "nhan_su_storage_xoa" ON storage.objects
FOR DELETE TO anon, authenticated USING (bucket_id = 'nhan_su');

-- ----------------------------------------------------------------------------
-- 8. NẠP DỮ LIỆU DANH MỤC KHỞI TẠO (Cơ cấu phòng ban chuẩn Thái Mỹ Hương)
-- ----------------------------------------------------------------------------
INSERT INTO public.danh_muc (loai, gia_tri) VALUES
-- Khối
('khoi', 'Ban Giám đốc'),
('khoi', 'Bộ Phận Kiểm Duyệt'),
('khoi', 'Khối Văn Phòng'),
('khoi', 'Khối Kho Vận'),

-- Bộ phận
('bo_phan', 'BAN GIÁM ĐỐC'),
('bo_phan', 'BỘ PHẬN KIỂM DUYỆT'),
('bo_phan', 'KẾ TOÁN'),
('bo_phan', 'ADMIN'),
('bo_phan', 'THỦ QUỸ'),
('bo_phan', 'ĐỘI XE'),
('bo_phan', 'KHO'),

-- Chức vụ
('chuc_vu', 'Giám đốc Điều hành'),
('chuc_vu', 'Phó Giám đốc Tài chính'),
('chuc_vu', 'Trưởng BP Kiểm Duyệt'),
('chuc_vu', 'Kế toán trưởng'),
('chuc_vu', 'Nhân viên Kế toán'),
('chuc_vu', 'Thủ quỹ'),
('chuc_vu', 'Chuyên viên Nhân sự'),
('chuc_vu', 'Đội trưởng Đội xe'),
('chuc_vu', 'Lái xe vận tải'),
('chuc_vu', 'Thủ kho'),
('chuc_vu', 'Nhân viên Giao hàng'),

-- Vị trí công việc
('vi_tri', 'Giám đốc Điều hành'),
('vi_tri', 'Phó Giám đốc Tài chính'),
('vi_tri', 'Trưởng BP Kiểm Duyệt'),
('vi_tri', 'Kiểm soát chứng từ & Kiểm đơn'),
('vi_tri', 'Kế toán bán hàng & MISA'),
('vi_tri', 'Kế toán công nợ & Đối soát'),
('vi_tri', 'Thủ quỹ tiền mặt & Ngân hàng'),
('vi_tri', 'Quản trị nhân sự & Hành chính'),
('vi_tri', 'Lái xe tải HD1 (1.4 tấn)'),
('vi_tri', 'Lái xe tải HD2 (2.5 tấn)'),
('vi_tri', 'Thủ kho & Soạn hàng'),
('vi_tri', 'Phụ xe & Giao nhận hàng')
ON CONFLICT (loai, gia_tri) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. NẠP MÔ TẢ CÔNG VIỆC MẪU (JD CHO TỪNG VỊ TRÍ)
-- ----------------------------------------------------------------------------
INSERT INTO public.mo_ta_cviec (vi_tri, mo_ta) VALUES
('Giám đốc Điều hành', '• Điều hành chiến lược tổng thể toàn công ty.
• Phê duyệt các kế hoạch tài chính, hạn mức công nợ và ngân sách.
• Ký duyệt các báo cáo quyết toán và định hướng kinh doanh.'),

('Phó Giám đốc Tài chính', '• Giám sát toàn bộ dòng tiền, kiểm soát doanh thu KiotViet và hạch toán MISA.
• Quản lý tài khoản ngân hàng Vietcombank/MBBank của công ty.
• Phê duyệt bảng kê nộp tiền và đối soát công nợ khách hàng lớn.'),

('Trưởng BP Kiểm Duyệt', '• Phụ trách kiểm duyệt quy trình xuất kho và đối soát dữ liệu 7 bước.
• Giám sát tính chính xác giữa hóa đơn KiotViet và chứng từ MISA.
• Phê duyệt các khoản chênh lệch và điều chuyển đơn giao lại.'),

('Kiểm soát chứng từ & Kiểm đơn', '• Tiếp nhận chứng từ giao hàng từ lái xe tại Bước 4.
• Đối chiếu tiền mặt, chuyển khoản và phân tách các đơn giao lại.
• Khóa sổ kiểm đơn sau mỗi đợt điều động xe.'),

('Kế toán bán hàng & MISA', '• Nạp file Excel KiotViet tại Bước 1 và tạo phiếu xuất kho tại Bước 2.
• Chuyển đổi mã khuyến mãi sang mã hàng thật theo bảng quy cách.
• Kết xuất file Excel chuẩn 69 cột MISA tại Bước 7.'),

('Kế toán công nợ & Đối soát', '• Theo dõi chi tiết công nợ phát sinh theo từng khách hàng.
• Cập nhật các khoản thu nợ và đối soát chênh lệch tiền hàng.
• Xuất báo cáo công nợ định kỳ phục vụ nhắc nợ.'),

('Thủ quỹ tiền mặt & Ngân hàng', '• Kiểm đếm chi tiết từng mệnh giá tiền mặt lái xe nộp về tại Bước 6.
• Quản lý Sổ nộp tiền xe và khóa quỹ tiền mặt cuối ngày.
• Đối chiếu sao kê tiền gửi ngân hàng theo các tài khoản công ty.'),

('Quản trị nhân sự & Hành chính', '• Quản lý hồ sơ nhân viên, thẻ CCCD, sổ BHXH và hợp đồng lao động.
• Quản trị sơ đồ tổ chức, theo dõi kiêm nhiệm và phân quyền phần mềm.
• Phối hợp hỗ trợ các phòng ban trong công tác hành chính nội bộ.'),

('Lái xe tải HD1 (1.4 tấn)', '• Chịu trách nhiệm vận chuyển và bảo quản hàng hóa trên xe HD1 (Sáng & Chiều).
• Giao hàng đúng tuyến, thu tiền mặt/chuyển khoản từ khách theo danh sách.
• Nộp đầy đủ tiền hàng và phiếu kiểm đơn về cho Thủ quỹ/Kế toán sau mỗi chuyến.'),

('Lái xe tải HD2 (2.5 tấn)', '• Chịu trách nhiệm xe tải HD2 (Sáng & Chiều) phụ trách tuyến hàng nặng/xa.
• Kiểm tra số lượng thùng hàng khi nhận tại kho trước khi lăn bánh.
• Bàn giao hóa đơn, tiền mặt và báo cáo ngay các phát sinh đơn hàng.'),

('Thủ kho & Soạn hàng', '• Quản lý xuất - nhập - tồn hàng hóa tại kho Thái Mỹ Hương.
• Soạn hàng theo đúng Phiếu xuất kho Bước 2 giao cho từng xe.
• Kiểm đếm hàng trả về từ lái xe và nhập lại kho theo quy định.')
ON CONFLICT (vi_tri) DO UPDATE SET mo_ta = EXCLUDED.mo_ta;

-- ----------------------------------------------------------------------------
-- 10. NẠP MA TRẬN PHÂN QUYỀN MẪU THEO VỊ TRÍ
-- ----------------------------------------------------------------------------
INSERT INTO public.phan_quyen_vi_tri (vi_tri, cac_quyen) VALUES
('Giám đốc Điều hành', '{"trangchu":"all","buoc1":"all","buoc2":"all","buoc3":"all","buoc4":"all","buoc5":"all","buoc6":"all","buoc7":"all","congno":"all","danhmuc":"all","nhansu":"all","taikhoan":"all"}'),
('Phó Giám đốc Tài chính', '{"trangchu":"all","buoc1":"all","buoc2":"all","buoc3":"all","buoc4":"all","buoc5":"all","buoc6":"all","buoc7":"all","congno":"all","danhmuc":"all","nhansu":"all","taikhoan":"dept"}'),
('Trưởng BP Kiểm Duyệt', '{"trangchu":"all","buoc1":"dept","buoc2":"dept","buoc3":"all","buoc4":"all","buoc5":"all","buoc6":"dept","buoc7":"dept","congno":"dept","danhmuc":"dept","nhansu":"dept"}'),
('Kiểm soát chứng từ & Kiểm đơn', '{"trangchu":"self","buoc3":"self","buoc4":"all","buoc5":"all","buoc6":"self"}'),
('Kế toán bán hàng & MISA', '{"trangchu":"all","buoc1":"all","buoc2":"all","buoc3":"all","buoc4":"self","buoc5":"all","buoc6":"self","buoc7":"all","congno":"all","danhmuc":"all","nhansu":"self"}'),
('Kế toán công nợ & Đối soát', '{"trangchu":"all","buoc3":"self","buoc4":"self","buoc5":"all","congno":"all","danhmuc":"self","nhansu":"self"}'),
('Thủ quỹ tiền mặt & Ngân hàng', '{"trangchu":"all","buoc4":"self","buoc5":"self","buoc6":"all","congno":"self","danhmuc":"self","nhansu":"self"}'),
('Quản trị nhân sự & Hành chính', '{"trangchu":"all","nhansu":"all","danhmuc":"dept","congno":"self"}'),
('Lái xe tải HD1 (1.4 tấn)', '{"trangchu":"self","buoc2":"self","buoc4":"self","buoc6":"self","nhansu":"self"}'),
('Lái xe tải HD2 (2.5 tấn)', '{"trangchu":"self","buoc2":"self","buoc4":"self","buoc6":"self","nhansu":"self"}'),
('Thủ kho & Soạn hàng', '{"trangchu":"self","buoc2":"all","nhansu":"self"}')
ON CONFLICT (vi_tri) DO UPDATE SET cac_quyen = EXCLUDED.cac_quyen;

-- ----------------------------------------------------------------------------
-- 11. NẠP DỮ LIỆU NHÂN SỰ MẪU CHUẨN THỰC TẾ THÁI MỸ HƯƠNG
-- ----------------------------------------------------------------------------
INSERT INTO public.nhan_su (
    so_cccd, ho_ten, so_dien_thoai, mat_khau_app, email, vai_tro_app,
    trang_thai_lam_viec, ngay_vao_lam, ngay_sinh, ngay_cap_cccd, noi_cap_cccd,
    khoi, bo_phan, chuc_vu, vi_tri_cong_viec,
    ngan_hang, so_tai_khoan, lien_he_khan_cap, ghi_chu,
    so_bhxh, tham_gia_bhxh
) VALUES
-- 1. Ban Giám đốc
('048085001234', 'Nguyễn Tấn Đạt', '0903160116', 'Dat@2026', 'dat.nguyen@thaimyhuong.com', 'Admin',
 'Còn làm việc', '2018-01-01', '1985-05-15', '2021-06-10', 'CCSQLHCVTTXH',
 'Ban Giám đốc', 'BAN GIÁM ĐỐC', 'Giám đốc Điều hành', 'Giám đốc Điều hành',
 'Vietcombank', '0041000123456', '0905801918 (Vợ)', 'Điều hành chung toàn bộ hệ thống',
 '4818001234', true),

('048088005678', 'Thái Mỹ Hương', '0905801918', 'Huong@2026', 'huong.thai@thaimyhuong.com', 'Admin',
 'Còn làm việc', '2018-01-01', '1988-10-20', '2021-08-15', 'CCSQLHCVTTXH',
 'Ban Giám đốc', 'BAN GIÁM ĐỐC', 'Phó Giám đốc Tài chính', 'Phó Giám đốc Tài chính',
 'Vietcombank', '0041000266096', '0903160116 (Chồng)', 'Phụ trách tài chính và đối soát MISA',
 '4818005678', true),

-- 2. Bộ phận Kiểm Duyệt
('048092009876', 'Đặng Thị Lan', '0905851918', '123456', 'lan.dang@thaimyhuong.com', 'Quản trị viên',
 'Còn làm việc', '2020-03-15', '1992-04-12', '2022-02-18', 'CCSQLHCVTTXH',
 'Bộ Phận Kiểm Duyệt', 'BỘ PHẬN KIỂM DUYỆT', 'Trưởng BP Kiểm Duyệt', 'Trưởng BP Kiểm Duyệt',
 'Vietcombank', '0041000998877', '0905123987 (Mẹ)', 'Kiểm soát chốt đợt giao hàng và MISA',
 '4820009876', true),

-- 3. Khối Văn Phòng - Kế toán & Thủ quỹ
('048094002345', 'Lê Thị Ngọc', '0914123456', '123456', 'ngoc.le@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2021-06-01', '1994-08-25', '2022-09-05', 'CCSQLHCVTTXH',
 'Khối Văn Phòng', 'KẾ TOÁN', 'Nhân viên Kế toán', 'Kế toán bán hàng & MISA',
 'Vietcombank', '0041000334455', '0913456789 (Bố)', 'Chuyên trách Bước 1, Bước 2 và Bước 7 MISA',
 '4821002345', true),

('048095006789', 'Phạm Thị Mai', '0935678901', '123456', 'mai.pham@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2021-08-15', '1995-12-08', '2022-11-20', 'CCSQLHCVTTXH',
 'Khối Văn Phòng', 'THỦ QUỸ', 'Thủ quỹ', 'Thủ quỹ tiền mặt & Ngân hàng',
 'MBBank', '0935678901', '0987654321 (Chồng)', 'Phụ trách Bước 6 bảng kê nộp tiền và Sổ nộp xe',
 '4821006789', true),

('048096001122', 'Trần Thị Thảo', '0905112233', '123456', 'thao.tran@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2022-02-10', '1996-03-14', '2023-01-10', 'CCSQLHCVTTXH',
 'Khối Văn Phòng', 'ADMIN', 'Chuyên viên Nhân sự', 'Quản trị nhân sự & Hành chính',
 'Techcombank', '19034567890123', '0905334455 (Chị)', 'Hồ sơ nhân viên, văn thư và tài sản',
 '4822001122', true),

-- 4. Khối Kho Vận - Lái xe & Kho
('048089004455', 'Nguyễn Văn Sinh', '0905345678', '123456', 'sinh.nguyen@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2019-05-20', '1989-09-02', '2021-12-05', 'CCSQLHCVTTXH',
 'Khối Kho Vận', 'ĐỘI XE', 'Lái xe vận tải', 'Lái xe tải HD1 (1.4 tấn)',
 'Vietcombank', '0041000556677', '0905998877 (Vợ)', 'Lái xe HD1 phụ trách tuyến Sáng & Chiều',
 '4819004455', true),

('048090007788', 'Trần Văn Hải', '0905789012', '123456', 'hai.tran@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2019-07-15', '1990-11-18', '2022-03-12', 'CCSQLHCVTTXH',
 'Khối Kho Vận', 'ĐỘI XE', 'Lái xe vận tải', 'Lái xe tải HD2 (2.5 tấn)',
 'Vietcombank', '0041000778899', '0905665544 (Vợ)', 'Lái xe HD2 phụ trách tuyến Sáng & Chiều',
 '4819007788', true),

('048093003344', 'Hoàng Minh Tuấn', '0934567890', '123456', 'tuan.hoang@thaimyhuong.com', 'Người dùng',
 'Còn làm việc', '2020-10-01', '1993-07-30', '2022-08-22', 'CCSQLHCVTTXH',
 'Khối Kho Vận', 'KHO', 'Thủ kho', 'Thủ kho & Soạn hàng',
 'Agribank', '2000123456789', '0912345678 (Mẹ)', 'Phụ trách xuất nhập tồn kho và kiểm thùng hàng',
 '4820003344', true)
ON CONFLICT (so_cccd) DO NOTHING;

-- ============================================================================
-- HOÀN TẤT THIẾT LẬP CƠ SỞ DỮ LIỆU NHÂN SỰ CHO THÁI MỸ HƯƠNG
-- ============================================================================
