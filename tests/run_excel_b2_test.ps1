$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$url = 'file:///G:/My%20Drive/thaimyhuong/tests/test_xuat_excel_bang_tinh_tien_b2.test.html'
$outFile = 'G:\My Drive\thaimyhuong\tests\out_excel_b2.html'

Start-Process -FilePath $edge -ArgumentList '--headless=new', '--dump-dom', $url -RedirectStandardOutput $outFile -Wait

if (Test-Path $outFile) {
    $content = Get-Content $outFile -Raw
    if ($content -match 'TẤT CẢ TEST ĐÃ VƯỢT QUA') {
        Write-Output "SUCCESS: ALL TESTS PASSED!"
    } else {
        Write-Output "FAILURE: Some tests failed!"
    }
    
    $regex = [regex]'(<span class="badge-(pass|fail)">.*?</span>\s*<span>.*?</span>)'
    $matches = $regex.Matches($content)
    foreach ($m in $matches) {
        Write-Output ($m.Value -replace '<[^>]+>', ' ')
    }
} else {
    Write-Output "ERROR: Could not generate test results"
}
