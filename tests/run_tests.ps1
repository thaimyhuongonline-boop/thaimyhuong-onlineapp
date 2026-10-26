$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$url = 'file:///G:/My%20Drive/thaimyhuong/tests/test_multi_select_nv_cong_no.html'
$outFile = 'G:\My Drive\thaimyhuong\tests\test_results.html'

Start-Process -FilePath $edge -ArgumentList '--headless=new', '--dump-dom', $url -RedirectStandardOutput $outFile -Wait

if (Test-Path $outFile) {
    $content = Get-Content $outFile -Raw
    if ($content -match 'TẤT CẢ TEST ĐÃ VƯỢT QUA') {
        Write-Output "SUCCESS: ALL TESTS PASSED!"
    } else {
        Write-Output "FAILURE: Some tests failed!"
    }
    
    # In ra cac the ket qua
    $regex = [regex]'(<span class="badge-(pass|fail)">.*?</span>\s*<span>.*?</span>)'
    $matches = $regex.Matches($content)
    foreach ($m in $matches) {
        Write-Output ($m.Value -replace '<[^>]+>', ' ')
    }
} else {
    Write-Output "ERROR: Could not generate test results"
}
