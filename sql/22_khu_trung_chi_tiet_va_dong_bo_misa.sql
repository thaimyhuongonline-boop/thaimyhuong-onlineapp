-- =====================================================================
-- 22_khu_trung_chi_tiet_va_dong_bo_misa.sql
-- Khử trùng lặp dòng chi tiết hàng hóa (chi_tiet_hoa_don) & tự động
-- đồng bộ ma_dot theo luu_tru (khắc phục lỗi HH_TONGHOP cho xe ĐEN CHIỀU 03/10)
-- =====================================================================

-- 1. Khôi phục ma_dot trên chi_tiet_hoa_don cho các hóa đơn trên luu_tru đang thiếu dòng theo ma_dot hiện hành
-- (VD: chuyến ĐEN CHIỀU ngày 03/10/2026 — DOT_ENCHIU_20261003_5637)
INSERT INTO public.chi_tiet_hoa_don (
  ma_hd, ma_dot, ngay_ct, xe, ma_kh, ten_kh, ma_hang, ten_hang, dvt, so_luong, don_gia, thanh_tien, quy_cach, la_khuyen_mai
)
SELECT DISTINCT ON (lt.ma_hd, ct.ma_hang, ct.don_gia, ct.so_luong)
  lt.ma_hd,
  lt.ma_dot,
  lt.ngay_giao,
  lt.xe,
  COALESCE(NULLIF(ct.ma_kh, ''), lt.ma_kh),
  COALESCE(NULLIF(ct.ten_kh, ''), lt.ten_kh),
  ct.ma_hang,
  ct.ten_hang,
  ct.dvt,
  ct.so_luong,
  ct.don_gia,
  ct.thanh_tien,
  ct.quy_cach,
  ct.la_khuyen_mai
FROM public.luu_tru lt
JOIN public.chi_tiet_hoa_don ct
  ON UPPER(BTRIM(ct.ma_hd)) = UPPER(BTRIM(lt.ma_hd))
WHERE NOT EXISTS (
  SELECT 1
  FROM public.chi_tiet_hoa_don ct_cur
  WHERE ct_cur.ma_dot = lt.ma_dot
    AND UPPER(BTRIM(ct_cur.ma_hd)) = UPPER(BTRIM(lt.ma_hd))
    AND ct_cur.ma_hang <> 'HH_TONGHOP'
)
  AND ct.ma_hang <> 'HH_TONGHOP'
ORDER BY lt.ma_hd, ct.ma_hang, ct.don_gia, ct.so_luong, ct.tao_luc DESC, ct.id DESC;

-- 2. Xóa các bản ghi chi_tiet_hoa_don mồ côi (thuộc các ma_dot nháp không còn tồn tại trong luu_tru)
DELETE FROM public.chi_tiet_hoa_don ct
WHERE ct.ma_dot IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.luu_tru lt WHERE lt.ma_dot = ct.ma_dot
  )
  AND EXISTS (
    SELECT 1 FROM public.luu_tru lt2
    JOIN public.chi_tiet_hoa_don ct2
      ON ct2.ma_dot = lt2.ma_dot AND UPPER(BTRIM(ct2.ma_hd)) = UPPER(BTRIM(ct.ma_hd))
    WHERE UPPER(BTRIM(lt2.ma_hd)) = UPPER(BTRIM(ct.ma_hd))
  );

-- 3. Khử các dòng bị nhân đôi (duplicate) trong cùng (ma_dot, ma_hd, ma_hang, don_gia, so_luong)
-- khi tổng tiền chi_tiet_hoa_don của hóa đơn đó đang bị gấp đôi/gấp nhiều lần so với luu_tru.thanh_tien
WITH tong_hd AS (
  SELECT
    ct.ma_dot,
    UPPER(BTRIM(ct.ma_hd)) AS ma_hd_norm,
    SUM(COALESCE(ct.thanh_tien, 0)) AS sum_ct,
    MAX(COALESCE(lt.thanh_tien, 0)) AS tien_lt
  FROM public.chi_tiet_hoa_don ct
  LEFT JOIN public.luu_tru lt
    ON lt.ma_dot = ct.ma_dot AND UPPER(BTRIM(lt.ma_hd)) = UPPER(BTRIM(ct.ma_hd))
  GROUP BY ct.ma_dot, UPPER(BTRIM(ct.ma_hd))
),
dong_danh_so AS (
  SELECT
    ct.id,
    ROW_NUMBER() OVER (
      PARTITION BY ct.ma_dot, UPPER(BTRIM(ct.ma_hd)), UPPER(BTRIM(ct.ma_hang)), ROUND(COALESCE(ct.don_gia, 0)::numeric, 2), ROUND(COALESCE(ct.so_luong, 0)::numeric, 3)
      ORDER BY ct.tao_luc DESC NULLS LAST, ct.id DESC
    ) AS rn,
    th.sum_ct,
    th.tien_lt
  FROM public.chi_tiet_hoa_don ct
  JOIN tong_hd th
    ON th.ma_dot = ct.ma_dot AND th.ma_hd_norm = UPPER(BTRIM(ct.ma_hd))
)
DELETE FROM public.chi_tiet_hoa_don
WHERE id IN (
  SELECT id FROM dong_danh_so
  WHERE rn > 1 AND (tien_lt <= 0 OR sum_ct > tien_lt + 1000)
);
