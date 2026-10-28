# ==============================================================================
# chay_bu_cong_no_ngay_26.ps1
# SCRIPT QUET VA VA SO LIEU DONG BO CONG NO NGAY 26/10/2026
# CONG TY TNHH THAI MY HUONG
# ==============================================================================

$ErrorActionPreference = "Stop"

$SUPABASE_URL = "https://oedidnctnteeegkdcwaa.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGlkbmN0bnRlZWVna2Rjd2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzE3MTYsImV4cCI6MjEwNDkwNzcxNn0.3ZO5ZO9_VJ7vsr9qC586kXl4XAbDCjQcamP66FkDkTE"

$headers = @{
    "apikey" = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
    "Content-Type" = "application/json"
}

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " [QUET DU LIEU BUOC 2 & CONG NO NGAY 26/10/2026 - THAI MY HUONG]" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Truy van tat ca hoa don tren Supabase luu_tru (phan trang de lay het toan bo)
Write-Host "`n1. Dang truy van bang luu_tru tren Supabase..." -ForegroundColor White

$pageSize = 1000
$offset = 0
$allRows = @()

while ($true) {
    $pageUrl = $SUPABASE_URL + "/rest/v1/luu_tru?select=*&offset=" + $offset + "&limit=" + $pageSize
    $page = Invoke-RestMethod -Uri $pageUrl -Headers $headers -Method Get
    if ($null -eq $page -or $page.Count -eq 0) { break }
    $allRows += $page
    if ($page.Count -lt $pageSize) { break }
    $offset += $pageSize
}

Write-Host " -> Tong so ban ghi trong luu_tru: $($allRows.Count)" -ForegroundColor Green

# 2. Loc hoa don ngay 26/10/2026
$allInvoices26 = $allRows | Where-Object { 
    $_.ngay_giao -eq "26/10/2026" -or $_.ngay_giao -eq "2026-10-26" -or ($_.tao_luc -and $_.tao_luc.StartsWith("2026-10-26"))
}

$tongHD = $allInvoices26.Count
Write-Host " -> Tim thay $tongHD hoa don thuoc ngay 26/10/2026 trong luu_tru" -ForegroundColor Green

# 3. Phan loai theo no phat sinh
$coNo = @($allInvoices26 | Where-Object { [double]($_.no_phat_sinh) -gt 0 })
$daThuDu = @($allInvoices26 | Where-Object { [double]($_.no_phat_sinh) -le 0 })

Write-Host " -> So hoa don co no phat sinh (no_phat_sinh > 0): $($coNo.Count)" -ForegroundColor Yellow
Write-Host " -> So hoa don da thu du/khong no: $($daThuDu.Count)" -ForegroundColor Green

# 4. Tinh tong so tien
$tongTienHang = ($allInvoices26 | Measure-Object -Property thanh_tien -Sum).Sum
$tongTienMat = ($allInvoices26 | Measure-Object -Property tien_mat -Sum).Sum
$tongChuyenKhoan = ($allInvoices26 | Measure-Object -Property chuyen_khoan -Sum).Sum
$tongNoPhatSinh = ($allInvoices26 | Measure-Object -Property no_phat_sinh -Sum).Sum

Write-Host "`n2. Tong hop doanh so & thu tien ngay 26/10/2026:" -ForegroundColor White
Write-Host ("   - Tong tien hang:      {0:N0} d" -f $tongTienHang) -ForegroundColor Cyan
Write-Host ("   - Tien mat thu duoc:   {0:N0} d" -f $tongTienMat) -ForegroundColor Cyan
Write-Host ("   - Chuyen khoan:        {0:N0} d" -f $tongChuyenKhoan) -ForegroundColor Cyan
Write-Host ("   - No phat sinh:        {0:N0} d" -f $tongNoPhatSinh) -ForegroundColor Magenta

# 5. Kiem tra danh sach cac hoa don muc tieu do User yeu cau
$danhSachMucTieu = @("HD289084", "HD289094", "HD289103", "HD289117", "HD291137", "HD291138", "HD291144", "HD291146")
Write-Host "`n3. Kiem tra chi tiet day hoa don trong diem ngay 26:" -ForegroundColor White

foreach ($m in $danhSachMucTieu) {
    $found = $coNo | Where-Object { $_.ma_hd -eq $m }
    if ($found) {
        $noStr = '{0:N0}' -f [double]$found.no_phat_sinh
        $ttStr = '{0:N0}' -f [double]$found.thanh_tien
        Write-Host "   [OK] $m : $noStr d (Tien HD: $ttStr d | Khach: $($found.ten_kh) | Xe: $($found.xe))" -ForegroundColor Green
    } else {
        Write-Host "   [CHUA THAY NO] $m" -ForegroundColor Red
    }
}

# 6. Xuat file JSON backup
$outputDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $outputDir "cong_no_ngay_26_backup.json"
$coNo | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8
Write-Host "`n4. Da luu danh sach $($coNo.Count) hoa don no ngay 26 vao: $jsonPath" -ForegroundColor Green

Write-Host "`n==> QUET & DOI SOAT HOAN TAT. Du lieu tren Supabase da san sang dong bo sang So Cong No!" -ForegroundColor Yellow
