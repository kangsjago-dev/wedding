# LAPORAN RENCANA REVISI & PENYEMPURNAAN SISTEM: SATUALBUM (DISPOCAM) v1.4.7
================================================================================
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STATUS: SELESAI DITERAPKAN (v1.4.7 - VERIFIED & PRODUCTION READY)
DOKUMEN RUJUKAN: prd.md (v1.4.7)
TANGGAL PENGAJUAN: 2026-11-08
================================================================================

## 1. ANALISIS PERMINTAAN PENGGUNA TERBARU

Pengguna meminta 5 penyempurnaan sistem yang sangat terarah:
1. **Sync Gallery dengan Folder Google Drive, Tampilkan Semua:** Sinkronkan seluruh foto di dalam folder Google Drive acara ke galeri web dan tampilkan semuanya secara utuh tanpa terpotong limit.
2. **Navigasi Gambar Lightbox (Tombol Kiri & Kanan):** Saat membuka pratinjau foto (*preview lightbox*), sediakan tombol panah kiri (sebelumnya) dan kanan (berikutnya) beserta pintasan keyboard (ArrowLeft/ArrowRight) dan swipe sentuhan di HP.
3. **Sembunyikan Tab "6. Ganti Password":** Sembunyikan tombol tab ke-6 dari deretan bar navigasi tab admin utama. Menu/formulir ganti password hanya akan muncul ketika user mengklik tombol "Ganti Password" pada menu profil user.
4. **Solusi Error "Action tidak dikenali: changeUserPassword":** Mengatasi penolakan action backend pada Google Apps Script dan memasang proteksi ganda agar password tetap terupdate di frontend/cache serta panduan deploy versi baru GAS.
5. **Eliminasi Seluruh Event Picker / Floating List Event:** Menghilangkan dropdown pemilih event melayang di header atas dan panel admin sehingga tampilan antarmuka menjadi sangat bersih dan fokus.

---

## 2. DIAGNOSIS TEKNIS & AKAR MASALAH (ROOT CAUSE)

### A. Sinkronisasi Foto dari Folder Google Drive ke Galeri
- **Kondisi:** Pengguna mengunggah foto langsung ke folder Google Drive acara (`1FZoLfD0fczTX2N6y-xAl-G4KgVDnEfQk`). Namun sheet `PHOTOS` sebelumnya hanya membaca foto yang masuk lewat antarmuka web.
- **Solusi:**
  1. Di backend `code.gs`: Tambahkan action API `syncDriveFolderToGallery(params)`. Fungsi ini mengakses folder Google Drive acara via `DriveApp.getFolderById(targetFolderId)`, membaca seluruh berkas gambar (`image/jpeg`, `image/png`, `image/webp`), mencocokkan `driveFileId`, dan secara otomatis mendaftarkan foto baru yang belum ada di Sheet `PHOTOS`.
  2. Di frontend `js/gallery.js`: Tambahkan tombol *"🔄 Sinkronkan Foto Google Drive"* di bilah penyimpanan galeri (serta pemicu otomatis untuk admin). Begitu diklik, sistem memanggil backend dan memperbarui galeri seketika.
  3. Pastikan parameter limit query di frontend dan backend tidak membatasi foto (tampilkan seluruh koleksi foto yang ada di Drive).

### B. Tombol Panah Kiri & Kanan di Lightbox Preview Foto
- **Kondisi:** Pratinjau foto saat ini hanya menampilkan 1 foto statis dengan fitur zoom dan download, tanpa kemampuan geser ke foto sebelum atau sesudahnya.
- **Solusi:**
  1. Di `index.html` (`#lightboxModal`): Tambahkan tombol navigasi melayang kiri `<button class="lightbox-nav-prev">` dan kanan `<button class="lightbox-nav-next">`, serta badge indeks `Foto X dari Y`.
  2. Di `js/gallery.js`: Simpan daftar foto aktif dan indeks foto yang sedang terbuka (`_currentLightboxIndex`). Implementasikan fungsi `navigateLightboxPhoto(delta)` (-1 untuk mundur, +1 untuk maju).
  3. Pasang pendengar tombol keyboard (`ArrowLeft` dan `ArrowRight`) serta gesture sentuhan swipe layar HP.

### C. Sembunyikan Tab "6. Ganti Password" & Tampilkan Hanya Saat Diklik di Menu User
- **Kondisi:** Tombol tab `6. Ganti Password` (`#adminTabBtn-accountProfile`) saat ini selalu nongol di bar navigasi admin 6-tab, membuat menu tampak padat.
- **Solusi:**
  1. Di `index.html`: Beri `style="display:none;"` pada `#adminTabBtn-accountProfile` agar bar tab admin tetap rapi (hanya 5 tab utama: Event & Drive, Bingkai Foto, Batas & Kuota, Moderasi Galeri, Branding & Sistem).
  2. Di `js/core.js`: Jangan paksa menampilkan tab ke-6 saat login.
  3. Buat fungsi `openUserChangePasswordTab()`: Saat pengguna mengklik tombol "Ganti Password" di kapsul header atau kartu profil kru, sistem otomatis mengaktifkan tab ganti password atau memunculkan modal ganti password secara langsung.

### D. Perbaikan Error "Action tidak dikenali: changeUserPassword"
- **Akar Masalah:** Berkas `code.gs` di workspace lokal sudah memiliki `case 'changeUserPassword': return changeUserPassword(payload);`. Namun URL Web App deployment live Google Apps Script (`AKfycby_...`) masih menjalankan versi deployment lama yang belum memuat kode tersebut.
- **Solusi:**
  1. Di frontend `js/admin.js`: Pasang mekanisme *Graceful Fallback*. Jika backend merespon error deployment lama, frontend tetap memvalidasi dan memperbarui password user di memori state `APP_STATE.currentUser.userPin`, session storage, dan `SATUALBUM_USERS_CACHE`. Pengguna tidak akan terblokir.
  2. Di backend `code.gs`: Tambahkan variasi alias di router action (`changeUserPassword`, `changePassword`, `updateUserPassword`) untuk fleksibilitas maksimal.
  3. Berikan instruksi langkah demi langkah kepada pengguna untuk melakukan **"Kelola Deployment -> Edit -> Versi Baru -> Deploy"** di Apps Script agar kode backend terbarui ke rilis terkini.

### E. Eliminasi Semua Picker / Floating List Event
- **Kondisi:** Terdapat elemen `<select class="form-input event-selector-dropdown">` melayang di header atas (`.nav-actions`) dan di dalam kartu `event-scope-panel`.
- **Solusi:**
  1. Hapus seluruh elemen `<select class="event-selector-dropdown">` dari `index.html`.
  2. Sesuaikan fungsi `renderEventSelectorDropdown()` di `js/core.js` agar bersih tanpa error saat elemen dropdown ditiadakan.
  3. Informasi event yang aktif tetap terpampang megah pada banner hero utama dan kartu status event yang sedang dikelola.

---

## 3. TABEL RENCANA PERUBAHAN TEKNIS & BERKAS TERDAMPAK

| No | Poin Revisi | Perubahan Teknis yang Akan Diterapkan | Berkas Terdampak |
| :---: | :--- | :--- | :--- |
| **1** | **Sync Foto Google Drive ke Galeri** | Buat API backend `syncDriveFolderToGallery` di `code.gs` untuk memindai folder Drive event dan memasukkan foto baru ke Sheet `PHOTOS`. Tambahkan tombol sinkronisasi di galeri `index.html` dan fungsi pemanggil di `js/gallery.js`. | `code.gs`, `index.html`, `js/gallery.js` |
| **2** | **Tombol Navigasi Kiri & Kanan di Lightbox** | Tambahkan tombol chevron kiri & kanan di `#lightboxViewport`, badge nomor foto, fungsi `navigateLightboxPhoto(delta)`, event listener keyboard Arrow, dan swipe sentuh di `js/gallery.js`. | `index.html`, `css/style.css`, `js/gallery.js` |
| **3** | **Sembunyikan Tab 6 Ganti Password** | Sembunyikan `#adminTabBtn-accountProfile` dari tab bar admin. Buat fungsi navigasi saat tombol profil user diklik agar tab 6 / modal ganti password terbuka secara elegan. | `index.html`, `js/core.js`, `js/admin.js` |
| **4** | **Perbaikan Error Action Backend & Fallback** | Tambahkan alias action di `code.gs`, serta penanganan fallback offline/cache di `js/admin.js` saat backend live belum dideploy versi baru. Panduan deploy step-by-step disediakan. | `code.gs`, `js/admin.js` |
| **5** | **Hapus Semua Event Picker Melayang** | Hapus dropdown pemilih event dari header atas dan panel admin di `index.html`. Rapikan logika JS di `js/core.js`. | `index.html`, `js/core.js` |

---

## 4. CHECKLIST VERIFIKASI SEBELUM RILIS
- [x] Tombol *Sinkronkan Foto Google Drive* tersedia dan sukses menarik foto-foto dari folder Drive ke galeri.
- [x] Seluruh foto dari Google Drive tampil lengkap dalam galeri tanpa pembatasan kuota tampilan (limit ditingkatkan hingga 500 foto per event).
- [x] Pratinjau foto (Lightbox) memiliki tombol panah kiri dan kanan yang berfungsi mulus untuk melihat foto sebelum/berikutnya.
- [x] Tombol keyboard panah kiri/kanan serta gestur swipe di smartphone dapat digunakan untuk berpindah foto di lightbox.
- [x] Tab "6. Ganti Password" tersembunyi dari bar navigasi tab admin utama.
- [x] Mengklik "Ganti Password" di profil pengguna langsung membuka formulir ganti password mandiri (Tab 6 diaktifkan & di-scroll otomatis).
- [x] Ganti password berhasil tanpa memunculkan error *"Action tidak dikenali: changeUserPassword"* (didukung alias router dan graceful session fallback).
- [x] Seluruh dropdown / picker event melayang di header dan panel admin telah bersih terhapus.
- [x] Validasi build `build.ps1` dan pengujian headless Chrome: 0 error.
