# ==============================================================================
# SATUALBUM BUILD SCRIPT (GAS MODULAR -> GITHUB PAGES STANDALONE BUNDLE)
# ==============================================================================
# Script ini secara otomatis menggabungkan seluruh file modular (css.html, modals.html,
# js_core.html, dll) dari gas_index.html menjadi satu berkas index.html mandiri
# yang 100% siap dijalankan di GitHub Pages, Vercel, Netlify, atau lokal browser.
# ==============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = Get-Location }

$sourceTemplate = Join-Path $scriptDir "gas_index.html"
$outputFile = Join-Path $scriptDir "index.html"

if (-not (Test-Path $sourceTemplate)) {
    Write-Error "Berkas sumber gas_index.html tidak ditemukan di $scriptDir"
    exit 1
}

Write-Host "Memulai proses kompilasi untuk GitHub Pages..." -ForegroundColor Cyan

$content = Get-Content $sourceTemplate -Raw -Encoding UTF8
$includePattern = '<\?\!=\s*include\(["'']([^"'']+)["'']\)\s*;?\s*\?>'

$compiled = [regex]::Replace($content, $includePattern, {
    param($match)
    $moduleName = $match.Groups[1].Value.Trim()
    if (-not $moduleName.EndsWith(".html")) {
        $moduleName += ".html"
    }
    $modulePath = Join-Path $scriptDir $moduleName
    if (Test-Path $modulePath) {
        Write-Host "  -> Termasuk modul: $moduleName" -ForegroundColor Green
        return (Get-Content $modulePath -Raw -Encoding UTF8)
    } else {
        Write-Warning "Modul tidak ditemukan: $modulePath"
        return "<!-- Modul $moduleName tidak ditemukan -->"
    }
})

Set-Content -Path $outputFile -Value $compiled -Encoding UTF8
$sizeKb = [Math]::Round((Get-Item $outputFile).Length / 1024, 2)

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "SUKSES! index.html untuk GitHub Pages berhasil dikompilasi!" -ForegroundColor Green
Write-Host "Ukuran Berkas : $sizeKb KB" -ForegroundColor Yellow
Write-Host "Target Deploy : GitHub Pages / Static Hosting" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

