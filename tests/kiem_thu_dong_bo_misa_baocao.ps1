# =====================================================================
# BỘ KIỂM THỬ TỰ ĐỘNG (TEST SUITE) ĐỐI CHIẾU DỮ LIỆU BƯỚC 1 - BƯỚC 2 - BƯỚC 3 (MISA) & BÁO CÁO TỔNG HỢP
# =====================================================================
$ErrorActionPreference = "Stop"
$url = "https://oedidnctnteeegkdcwaa.supabase.co/rest/v1"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGlkbmN0bnRlZWVna2Rjd2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzE3MTYsImV4cCI6MjEwNDkwNzcxNn0.3ZO5ZO9_VJ7vsr9qC586kXl4XAbDCjQcamP66FkDkTE"
$h = @{ apikey = $key; Authorization = "Bearer $key" }

function Assert-Equal($actual, $expected, $label) {
  if ($actual -ne $expected) {
    throw "[FAIL] $label : Expected=$expected, Actual=$actual"
  }
  Write-Host "[PASS] $label = $actual" -ForegroundColor Green
}

Write-Host "=== TEST 1: MO PHONG IMPORT CUNG 1 FILE EXCEL 2 LAN LIEN TIEP ===" -ForegroundColor Cyan
$mockExcel = @(
  @{ ma_hd = "hd286355.01123 "; ma_hang = "fg200001"; don_gia = "300000"; so_luong = "2"; thanh_tien = 600000 },
  @{ ma_hd = "HD286860123"; ma_hang = "FG200001"; don_gia = 300000; so_luong = 3; thanh_tien = 900000 },
  @{ ma_hd = "HD286860123"; ma_hang = "PS00009"; don_gia = 297000; so_luong = 2; thanh_tien = 594000 }
)
$setDongDaCo = @{}
$demDongDaCo = @{}
$duLieuTongHop = New-Object System.Collections.Generic.List[object]

function Invoke-MockImport($rows) {
  $demFile = @{}
  $added = 0
  $skipped = 0
  foreach ($r in $rows) {
    $sig = "{0}‖{1}‖{2}‖{3}" -f ([string]$r.ma_hd).Trim().ToUpper(), ([string]$r.ma_hang).Trim().ToUpper(), [math]::Round([double]$r.don_gia, 2), [math]::Round([double]$r.so_luong, 3)
    $lan = if ($demFile.ContainsKey($sig)) { $demFile[$sig] + 1 } else { 1 }
    $demFile[$sig] = $lan
    $daCo = if ($demDongDaCo.ContainsKey($sig)) { $demDongDaCo[$sig] } else { 0 }
    if ($setDongDaCo.ContainsKey($sig) -and $lan -le $daCo) {
      $skipped++
      continue
    }
    $duLieuTongHop.Add($r)
    $added++
  }
  foreach ($kv in $demFile.GetEnumerator()) {
    $setDongDaCo[$kv.Key] = $true
    $cu = if ($demDongDaCo.ContainsKey($kv.Key)) { $demDongDaCo[$kv.Key] } else { 0 }
    $demDongDaCo[$kv.Key] = [math]::Max($cu, $kv.Value)
  }
  return @{ added = $added; skipped = $skipped }
}

$lan1 = Invoke-MockImport $mockExcel
$lan2 = Invoke-MockImport $mockExcel
Assert-Equal $lan1.added 3 "Import lan 1 them du 3 dong"
Assert-Equal $lan2.added 0 "Import lan 2 khong nhan doi dong nao (0 dong moi)"
Assert-Equal $lan2.skipped 3 "Import lan 2 bo qua dung 3 dong trung"
Assert-Equal $duLieuTongHop.Count 3 "Tong so dong sau 2 lan import la 3"

Write-Host "`n=== TEST 2: DOI CHIEU SO LIEU BUOC 3 (MISA) VA BAO CAO TONG HOP NGAY 02/10/2026 ===" -ForegroundColor Cyan
$lt0210 = Invoke-RestMethod -Uri "$url/luu_tru?ngay_giao=in.(02/10/2026,2026-10-02,2/10/2026)&select=*" -Headers $h
$soXe0210 = @($lt0210 | Group-Object ma_dot).Count
$soHD0210 = $lt0210.Count
$tongXuat0210 = [math]::Round(($lt0210 | Measure-Object -Property thanh_tien -Sum).Sum)
$tongTM0210 = [math]::Round(($lt0210 | Measure-Object -Property tien_mat -Sum).Sum)
$tongCK0210 = [math]::Round(($lt0210 | Measure-Object -Property chuyen_khoan -Sum).Sum)
$tongTV0210 = [math]::Round(($lt0210 | Measure-Object -Property tra_ve -Sum).Sum)
$tongNo0210 = [math]::Round(($lt0210 | Measure-Object -Property no_phat_sinh -Sum).Sum)

Assert-Equal $soXe0210 10 "Ngay 02/10/2026 co du 10 chuyen xe"
Assert-Equal $soHD0210 302 "Ngay 02/10/2026 co du 302 hoa don"
Assert-Equal $tongXuat0210 298810942 "Tong xuat kho 02/10/2026 khop 298.810.942 d"
Assert-Equal $tongTM0210 196213242 "Tien mat theo HD 02/10/2026 khop 196.213.242 d (+ 5.976.000 d thu no = 202.189.242 d)"
Assert-Equal $tongCK0210 42483500 "Chuyen khoan theo HD 02/10/2026 khop 42.483.500 d (+ 5.271.000 d thu no = 47.754.500 d)"
Assert-Equal $tongTV0210 2250000 "Hang tra ve (TK 5212) 02/10/2026 khop 2.250.000 d"
Assert-Equal $tongNo0210 57864200 "Tong no phat sinh (TK 1311) 02/10/2026 khop 57.864.200 d"
Assert-Equal ($tongTM0210 + $tongCK0210 + $tongTV0210 + $tongNo0210) $tongXuat0210 "Can doi ke toan: TM + CK + TraVe + No == TongXuatKho"

Write-Host "`n=== TEST 3: KIEM TRA XE DEN CHIEU NGAY 03/10/2026 KHONG BI FALLBACK HH_TONGHOP & KHONG NHAN DOI ===" -ForegroundColor Cyan
$ltDen = Invoke-RestMethod -Uri "$url/luu_tru?ma_dot=eq.DOT_ENCHIU_20261003_5637&select=*" -Headers $h
$ctDen = Invoke-RestMethod -Uri "$url/chi_tiet_hoa_don?ma_dot=eq.DOT_ENCHIU_20261003_5637&select=*" -Headers $h
$sumLTDen = [math]::Round(($ltDen | Measure-Object -Property thanh_tien -Sum).Sum)
$sumCTDen = [math]::Round(($ctDen | Measure-Object -Property thanh_tien -Sum).Sum)
$coHHTongHop = @($ctDen | Where-Object { $_.ma_hang -eq "HH_TONGHOP" }).Count

Assert-Equal $ltDen.Count 9 "Xe DEN CHIEU 03/10 co 9 hoa don"
Assert-Equal $ctDen.Count 12 "Xe DEN CHIEU 03/10 co dung 12 dong chi tiet mat hang (khong bi nhan doi 24 hay 72 dong)"
Assert-Equal $coHHTongHop 0 "Xe DEN CHIEU 03/10 co 0 dong HH_TONGHOP"
Assert-Equal $sumCTDen $sumLTDen "Tong tien chi tiet mat hang xe DEN CHIEU 03/10 khop tuyet doi luu_tru (10.291.000 d)"
Write-Host "`n🎉 TAT CA KIEM THU PASSED 100%!" -ForegroundColor Green
