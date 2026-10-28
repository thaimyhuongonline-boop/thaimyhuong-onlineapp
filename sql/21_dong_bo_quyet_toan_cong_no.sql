-- ============================================================================
-- 21_dong_bo_quyet_toan_cong_no.sql
-- ĐỒNG BỘ TOÀN VẸN QUYẾT TOÁN THU TIỀN (BƯỚC 2) VÀ SỔ THEO DÕI CÔNG NỢ
-- DỰ ÁN: CÔNG TY TNHH THÁI MỸ HƯƠNG (oedidnctnteeegkdcwaa)
-- ============================================================================
-- 1. Bổ sung các cột nghiệp vụ còn thiếu cho bảng public.luu_tru:
--    - da_quyet_toan (BOOLEAN DEFAULT FALSE)
--    - ghi_chu (TEXT)
--    - hinh_thuc_thanh_toan (VARCHAR(100))
--    - da_kiem_tra (BOOLEAN DEFAULT FALSE)
--    - la_giao_lai (BOOLEAN DEFAULT FALSE)
-- 2. Tạo Index tối ưu hóa truy vấn công nợ theo ngày giao, nợ phát sinh, trạng thái quyết toán.
-- 3. Tạo RPC fn_quyet_toan_chuyen_xe (PostgreSQL ACID Transaction) lưu an toàn theo lô.
-- 4. Vá dữ liệu lịch sử ngày 26 (26/10/2026): gán da_quyet_toan = TRUE cho các hoá đơn đã kiểm đơn/quyết toán.
-- ============================================================================

-- 1. BỔ SUNG CỘT BẢNG luu_tru
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS da_quyet_toan BOOLEAN DEFAULT FALSE;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS hinh_thuc_thanh_toan VARCHAR(100);
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS da_kiem_tra BOOLEAN DEFAULT FALSE;
ALTER TABLE public.luu_tru ADD COLUMN IF NOT EXISTS la_giao_lai BOOLEAN DEFAULT FALSE;

-- 2. INDEX TỐI ƯU HIỆU NĂNG CHO SỔ CÔNG NỢ & BƯỚC 2
CREATE INDEX IF NOT EXISTS idx_luu_tru_no_phat_sinh ON public.luu_tru(no_phat_sinh);
CREATE INDEX IF NOT EXISTS idx_luu_tru_ngay_giao ON public.luu_tru(ngay_giao);
CREATE INDEX IF NOT EXISTS idx_luu_tru_da_quyet_toan ON public.luu_tru(da_quyet_toan);
CREATE INDEX IF NOT EXISTS idx_luu_tru_da_kiem_don ON public.luu_tru(da_kiem_don);

-- 3. HÀM RPC QUYẾT TOÁN CHUYẾN XE (ACID TRANSACTION)
-- Giúp lưu hàng loạt hoá đơn và phiếu nộp tiền trong 1 transaction an toàn, không sợ rớt mạng nửa chừng
CREATE OR REPLACE FUNCTION public.fn_quyet_toan_chuyen_xe(
    p_rows_luu_tru JSONB,
    p_phieu_nop JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_count INT := 0;
BEGIN
    -- 1. Upsert từng hoá đơn vào public.luu_tru
    IF p_rows_luu_tru IS NOT NULL AND jsonb_array_length(p_rows_luu_tru) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_rows_luu_tru)
        LOOP
            INSERT INTO public.luu_tru (
                ma_hd,
                ma_dot,
                ngay_giao,
                xe,
                tai_xe,
                ma_kh,
                ten_kh,
                so_dien_thoai,
                dia_chi,
                nv_ban_hang,
                trang_thai,
                da_kiem_don,
                tra_ve,
                tien_mat,
                chuyen_khoan,
                no_phat_sinh,
                thanh_tien,
                tien_chi,
                tien_thoi,
                da_quyet_toan,
                ghi_chu,
                hinh_thuc_thanh_toan,
                cap_nhat_luc
            ) VALUES (
                v_item->>'ma_hd',
                v_item->>'ma_dot',
                v_item->>'ngay_giao',
                v_item->>'xe',
                v_item->>'tai_xe',
                v_item->>'ma_kh',
                v_item->>'ten_kh',
                v_item->>'so_dien_thoai',
                v_item->>'dia_chi',
                v_item->>'nv_ban_hang',
                COALESCE(v_item->>'trang_thai', 'Giao'),
                COALESCE((v_item->>'da_kiem_don')::BOOLEAN, TRUE),
                COALESCE((v_item->>'tra_ve')::NUMERIC, 0),
                COALESCE((v_item->>'tien_mat')::NUMERIC, 0),
                COALESCE((v_item->>'chuyen_khoan')::NUMERIC, 0),
                COALESCE((v_item->>'no_phat_sinh')::NUMERIC, 0),
                COALESCE((v_item->>'thanh_tien')::NUMERIC, 0),
                COALESCE((v_item->>'tien_chi')::NUMERIC, 0),
                COALESCE((v_item->>'tien_thoi')::NUMERIC, 0),
                COALESCE((v_item->>'da_quyet_toan')::BOOLEAN, TRUE),
                v_item->>'ghi_chu',
                v_item->>'hinh_thuc_thanh_toan',
                NOW()
            )
            ON CONFLICT (ma_hd) DO UPDATE SET
                ma_dot = EXCLUDED.ma_dot,
                ngay_giao = EXCLUDED.ngay_giao,
                xe = EXCLUDED.xe,
                tai_xe = EXCLUDED.tai_xe,
                ma_kh = COALESCE(EXCLUDED.ma_kh, public.luu_tru.ma_kh),
                ten_kh = COALESCE(EXCLUDED.ten_kh, public.luu_tru.ten_kh),
                so_dien_thoai = COALESCE(EXCLUDED.so_dien_thoai, public.luu_tru.so_dien_thoai),
                dia_chi = COALESCE(EXCLUDED.dia_chi, public.luu_tru.dia_chi),
                nv_ban_hang = COALESCE(EXCLUDED.nv_ban_hang, public.luu_tru.nv_ban_hang),
                trang_thai = EXCLUDED.trang_thai,
                da_kiem_don = EXCLUDED.da_kiem_don,
                tra_ve = EXCLUDED.tra_ve,
                tien_mat = EXCLUDED.tien_mat,
                chuyen_khoan = EXCLUDED.chuyen_khoan,
                no_phat_sinh = EXCLUDED.no_phat_sinh,
                thanh_tien = EXCLUDED.thanh_tien,
                tien_chi = EXCLUDED.tien_chi,
                tien_thoi = EXCLUDED.tien_thoi,
                da_quyet_toan = EXCLUDED.da_quyet_toan,
                ghi_chu = EXCLUDED.ghi_chu,
                hinh_thuc_thanh_toan = EXCLUDED.hinh_thuc_thanh_toan,
                cap_nhat_luc = NOW();

            v_count := v_count + 1;
        END LOOP;
    END IF;

    -- 2. Ghi nhận phiếu nộp tiền nếu có
    IF p_phieu_nop IS NOT NULL AND (p_phieu_nop->>'ma_phieu') IS NOT NULL THEN
        BEGIN
            INSERT INTO public.bang_ke_nop_tien (
                ma_phieu,
                ma_dot,
                xe,
                tai_xe,
                ngay_nop,
                tong_tien,
                tien_mat,
                chuyen_khoan,
                chi_tiet,
                tao_luc
            ) VALUES (
                p_phieu_nop->>'ma_phieu',
                p_phieu_nop->>'ma_dot',
                p_phieu_nop->>'xe',
                p_phieu_nop->>'tai_xe',
                COALESCE(p_phieu_nop->>'ngay_nop', CURRENT_DATE::TEXT),
                COALESCE((p_phieu_nop->>'tong_tien')::NUMERIC, 0),
                COALESCE((p_phieu_nop->>'tien_mat')::NUMERIC, 0),
                COALESCE((p_phieu_nop->>'chuyen_khoan')::NUMERIC, 0),
                p_phieu_nop->'chi_tiet',
                NOW()
            )
            ON CONFLICT (ma_phieu) DO UPDATE SET
                tong_tien = EXCLUDED.tong_tien,
                tien_mat = EXCLUDED.tien_mat,
                chuyen_khoan = EXCLUDED.chuyen_khoan,
                chi_tiet = EXCLUDED.chi_tiet;
        EXCEPTION WHEN undefined_table THEN
            NULL;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'so_luong', v_count,
        'thoi_gian', NOW()
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$;

-- Cấp quyền thực thi cho anon và authenticated
GRANT EXECUTE ON FUNCTION public.fn_quyet_toan_chuyen_xe(JSONB, JSONB) TO anon, authenticated, service_role;

-- 4. VÁ DỮ LIỆU CŨ NGÀY 26 (26/10/2026)
UPDATE public.luu_tru
SET da_quyet_toan = TRUE
WHERE (ngay_giao IN ('26/10/2026', '2026-10-26') OR (tao_luc >= '2026-10-25 17:00:00+00' AND tao_luc <= '2026-10-26 23:59:59+00'))
  AND da_kiem_don = TRUE;

COMMENT ON FUNCTION public.fn_quyet_toan_chuyen_xe IS 'Hàm RPC quyết toán toàn vẹn hoá đơn chuyến xe giữa Bước 2 và Sổ Công Nợ';
