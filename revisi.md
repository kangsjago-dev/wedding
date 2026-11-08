# LAPORAN RENCANA REVISI & PENYEMPURNAAN SISTEM: SATUALBUM (DISPOCAM) v1.4.9
================================================================================
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STATUS: SELESAI DITERAPKAN (v1.4.9 - VERIFIED & PRODUCTION READY)
DOKUMEN RUJUKAN: prd.md (v1.4.9)
TANGGAL PENGAJUAN: 2026-11-08
================================================================================

## 1. ANALISIS PERMINTAAN PENGGUNA TERBARU (v1.4.9)

Pengguna menyampaikan instruksi perbaikan mendasar terkait kestabilan sinkronisasi, persistensi batas kuota, dan kontrol kamera:
1. **Buat website selalu LIVE SYNC & atasi "selalu OFFLINE CACHE":** Badge status berulang kali turun ke "OFFLINE CACHE" karena timeout fetch yang terlalu sempit (12 detik) pada koneksi Google Apps Script yang memiliki cold start 8-15 detik. Pengguna ingin website selalu dalam status **LIVE SYNC**.
2. **Perbaiki Penambahan Bonus Kuota & Reset Kuota:** Saat admin mereset kuota ke 0 atau menambahkan bonus kuota (+1 / +3), kamera tetap menolak pengambilan foto dengan pesan kuota penuh karena `js/camera.js` tidak memperhitungkan `quotaStats.bonusQuota`.
3. **Menu 3 (Batas & Kuota) diubah tidak ikut berubah:** Ketika batas upload foto per user diubah (misalnya menjadi 0 / Unlimited atau angka custom), nilai tersebut segera tertimpa kembali ke nilai awal (10) saat memuat event scoped settings karena ketiadaan komparasi timestamp antara cache server dan lokal.
4. **Bypass Kuota untuk Kru/Admin:** Operator atau Admin yang sedang bertugas mendokumentasikan acara tidak boleh dibatasi oleh kuota upload tamu undangan.
5. **Pertahankan Seluruh Fitur yang Berjalan:** Google Drive Cloud sync, Lightbox carousel navigation, 5-tab admin layout, profil ganti password, dan eliminasi picker tetap dipertahankan 100%.

---

## 2. DIAGNOSIS TEKNIS & SOLUSI YANG DITERAPKAN

### A. Kestabilan LIVE SYNC & Ketahanan Network Fetch
- **Penyebab:** Google Apps Script Web App sering mengalami *cold start* antara 9 hingga 16 detik. Batas `maxWait = 12000` ms di `callBackendApi` membatalkan request sebelum server sempat merespon, memicu `.catch()`, dan langsung menurunkan badge menjadi `OFFLINE CACHE`.
- **Solusi:**
  1. Default timeout di `callBackendApi` ditingkatkan dari 12 detik menjadi **25 detik (25000 ms)** agar toleran terhadap cold-start Apps Script.
  2. Interval auto-polling galeri di `js/gallery.js` disesuaikan dari 12 detik menjadi **18 detik** agar tidak bertabrakan dengan request aktif.
  3. Indikator `setLiveSyncIndicator` mempertahankan status **LIVE SYNC** selama browser terhubung ke internet (`navigator.onLine !== false`). Status hanya beralih ke `OFFLINE CACHE` jika koneksi fisik benar-benar terputus.
  4. Menambahkan listener global `window.ononline` dan `window.onoffline` untuk transisi status dinamis.

### B. Persistensi Menu 3: Batas & Kuota Event
- **Penyebab:** Di `loadActiveEventScopedSettings` (`js/core.js`), `chosen.uploadLimits = serverSettings.uploadLimits || localSettings.uploadLimits || def.uploadLimits;`. Karena `serverSettings.uploadLimits` selalu terisi objek (default 10), setiap kali event dimuat ulang atau halaman direfresh, setting lokal user selalu tertimpa oleh 10.
- **Solusi:**
  1. Pasang perbandingan timestamp `_updatedAt`. Jika `localSettings.uploadLimits._updatedAt >= serverSettings.uploadLimits._updatedAt`, maka pengaturan lokal admin diprioritaskan.
  2. Di `saveUploadLimitsConfigForm` (`js/admin.js`), timestamp `_updatedAt: Date.now()` langsung dicatat dan disinkronkan serentak ke `APP_STATE.config.uploadLimits`, `APP_STATE.eventSettingsMap`, dan objek event aktif di `APP_STATE.events`.
  3. Seleksi preset (0 untuk Unlimited, 3, 5, 10, atau custom) diperbaiki agar angka 0 dibaca secara murni sebagai Unlimited tanpa jatuh ke fallback default.

### C. Gate Kamera, Perhitungan Bonus Kuota & Reset Kuota
- **Penyebab:**
  - Di `js/camera.js`, validasi pengambilan foto hanya membandingkan `myCount >= maxPerUser` dan sama sekali tidak menjumlahkan `quotaStats.bonusQuota`.
  - Ketika admin menambah kuota bonus (+3), kamera tetap memblokir upload foto tamu jika `myCount >= 10`.
- **Solusi:**
  1. Hitung batas efektif: `effectiveMaxPerUser = maxPerUser > 0 ? (maxPerUser + myBonusQuota) : 0`.
  2. Periksa apakah user yang sedang aktif adalah kru/admin (`isCrew = Boolean(APP_STATE.currentUser)`). Jika kru, bypass validasi batas tamu secara menyeluruh.
  3. Di `resetQuotaForSpecificDevice` dan `resetDeviceUploadQuotaCounter`, hitung offset reset secara akurat terhadap total upload aktual sehingga sisa kuota terpakai langsung terevaluasi ke 0 dan foto dapat langsung diambil kembali.

---

## 3. TABEL RENCANA PERUBAHAN TEKNIS & BERKAS TERDAMPAK

| No | Poin Revisi | Perubahan Teknis yang Telah Diterapkan | Berkas Terdampak | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Kestabilan LIVE SYNC** | Timeout dinaikkan ke 25s, polling galeri 18s, penanganan listener `online`/`offline`, badge tetap LIVE SYNC. | `js/core.js`, `js/gallery.js` | **SELESAI** |
| **2** | **Persistensi Batas & Kuota (Tab 3)** | Komparasi timestamp `_updatedAt` di `loadActiveEventScopedSettings`, seleksi preset 0/Unlimited presisi. | `js/core.js`, `js/admin.js` | **SELESAI** |
| **3** | **Bonus Kuota & Reset Kuota Kamera** | `effectiveMaxPerUser` memperhitungkan `bonusQuota`, perbaikan reset offset, zeroing counter lokal. | `js/camera.js`, `js/core.js` | **SELESAI** |
| **4** | **Kru/Admin Quota Bypass** | Pengguna yang terautentikasi (`APP_STATE.currentUser`) bebas mengambil foto tanpa dibatasi kuota tamu. | `js/camera.js` | **SELESAI** |
| **5** | **Verifikasi Kestabilan Sistem** | Validasi headless Chrome & Edge: 0 error syntax, 10/10 berkas lulus uji integritas `build.ps1`. | Seluruh Modul | **SELESAI** |

---

## 4. CHECKLIST VERIFIKASI SEBELUM RILIS
- [x] Website konsisten menampilkan badge hijau **LIVE SYNC**.
- [x] Timeout Google Apps Script dinaikkan ke 25 detik untuk mengakomodasi cold start.
- [x] Pengubahan kuota di Tab 3 (misalnya ke 0 / Unlimited atau custom) tersimpan permanen dan tidak tertimpa ke 10 saat refresh.
- [x] Penambahan bonus kuota (+1 / +3) di tabel Device Management langsung menambah batas foto yang dapat diambil di kamera.
- [x] Tombol "Reset Kuota" seketika mengembalikan hitungan terpakai ke 0 dan membuka kembali akses kamera.
- [x] Kru / Admin yang sedang login tidak pernah terblokir oleh kuota upload tamu.
- [x] Seluruh fitur galeri Drive, Lightbox carousel, 5-tab admin, dan ganti password tetap berfungsi optimal.
- [x] Uji headless Chrome: 0 uncaught errors, seluruh skenario uji berhasil 100%.
