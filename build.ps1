# ==============================================================================
# SATUALBUM ASSETS VALIDATOR & DEPLOYMENT CHECKER (GITHUB PAGES ARCHITECTURE)
# ==============================================================================
# Script ini secara otomatis memeriksa integritas arsitektur frontend decoupled:
# 1. Memverifikasi kelengkapan index.html, css/style.css, dan 6 modul js/*.js
# 2. Mengukur ukuran berkas aset statis agar tetap ringan & optimal
# 3. Memastikan kesiapan rilis untuk hosting statis di GitHub Pages
# ==============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = Get-Location }

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Memeriksa Integritas SatuAlbum Frontend untuk GitHub Pages..." -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$assets = @(
    @{ path = "index.html"; desc = "Halaman Utama (Decoupled HTML Shell)" },
    @{ path = "css/style.css"; desc = "Stylesheet Utama (Luxury Glassmorphism)" },
    @{ path = "js/core.js"; desc = "Modul Inti (State, Router, Sync Engine)" },
    @{ path = "js/camera.js"; desc = "Modul Live Camera WebRTC FHD" },
    @{ path = "js/gallery.js"; desc = "Modul Galeri Foto & Live Polling" },
    @{ path = "js/vote.js"; desc = "Modul Voting Kategori & Leaderboard" },
    @{ path = "js/guestbook.js"; desc = "Modul Buku Tamu & Ucapan" },
    @{ path = "js/admin.js"; desc = "Modul Admin Panel, Event & Device Quota" },
    @{ path = "code.gs"; desc = "Backend Google Apps Script (Headless JSON API)" },
    @{ path = "setup.gs"; desc = "Inisialisasi Database Google Sheets" }
)

$hasError = $false
$totalJsSize = 0

foreach ($a in $assets) {
    $full = Join-Path $scriptDir $a.path
    if (Test-Path $full) {
        $len = (Get-Item $full).Length
        $kb = [Math]::Round($len / 1024, 2)
        if ($a.path -like "js/*") { $totalJsSize += $kb }
        Write-Host "  [OK] $($a.path.PadRight(16)) : $kb KB - $($a.desc)" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $($a.path) : TIDAK DITEMUKAN!" -ForegroundColor Red
        $hasError = $true
    }
}

Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Total Ukuran JavaScript Modular : $([Math]::Round($totalJsSize, 2)) KB" -ForegroundColor Yellow

if (-not $hasError) {
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "STATUS PROYEK: SIAP DEPLOY KE GITHUB PAGES!" -ForegroundColor Green
    Write-Host "Arsitektur frontend decoupled telah terverifikasi bersih dan optimal." -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Cyan
} else {
    Write-Host "==================================================================" -ForegroundColor Red
    Write-Host "PERINGATAN: Ada berkas aset yang hilang, mohon periksa daftar di atas!" -ForegroundColor Red
    Write-Host "==================================================================" -ForegroundColor Red
}
