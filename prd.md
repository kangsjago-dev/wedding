# SPESIFIKASI KEBUTUHAN PRODUK (PRD) & MASTER CONTEXT: SATUALBUM (DISPOCAM)
================================================================================
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STATUS DOKUMEN: LIVING SPECIFICATION & ARCHITECTURAL BLUEPRINT
REVISI: v1.4.9 (Live Sync Resilient, Upload Limit Persistence, Bonus & Reset Quota Camera Gate, and Crew Quota Bypass)
================================================================================

<!-- ======================================================================= -->
<!-- ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL SISTEM)          -->
<!-- ======================================================================= -->

## 1. NAMA PROJEK & PROBLEM STATEMENT
- **Nama Projek:** SatuAlbum • Digital Event Platform (Dispocam)
- **Problem Statement:**
  Pada penyelenggaraan acara pernikahan, tunangan, atau corporate event, dokumentasi sering kali terpusat hanya pada fotografer resmi. Foto-foto spontan yang diambil oleh para tamu undangan sering kali tercecer di smartphone masing-masing, sulit dikumpulkan, dan tidak dapat dinikmati bersama secara langsung saat acara berlangsung. Selain itu, manajemen kuota unggah, privasi folder Google Drive, dan interaksi tamu (seperti voting foto terbaik dan ucapan buku tamu digital) membutuhkan platform interaktif terpadu yang ringan, modern, dan mudah diakses tanpa harus menginstal aplikasi dari App Store / Play Store.
- **Solusi SatuAlbum:**
  Web App berbasis Google Apps Script (GAS) dan Google Sheets + Drive yang menyediakan:
  1. Live Camera Booth WebRTC (FHD 1920x1080) dengan pilihan custom bingkai (frame) berlogo Wedding Organizer (WO).
  2. Galeri Foto Publik dengan fitur Direct Voting real-time.
  3. Leaderboard Pemenang Foto Terfavorit berdasarkan kategori lomba foto.
  4. Buku Tamu Digital & Konfirmasi Kehadiran (RSVP).
  5. Panel Admin terintegrasi untuk kontrol kuota device, perutean Google Drive per-event, moderasi foto, dan personalisasi branding WO.

---

## 2. PERAN PENGGUNA (USER ROLES & PERMISSIONS)
1. **Tamu Undangan (Guest / Public):**
   - Mengambil foto via kamera live atau unggah dari galeri HP dengan bingkai khusus event.
   - Melihat galeri foto acara dan mengunduh foto full-resolution.
   - Memberikan vote foto terbaik (dibatasi 1x per perangkat per kategori).
   - Mengisi buku tamu dan ucapan selamat.
2. **Operator (Crew Booth Kamera):**
   - Mengoperasikan booth foto di lokasi acara.
   - Menikmati akses kamera cepat tanpa batas kuota privat.
3. **Admin Event (Event Manager WO):**
   - Mengelola acara tertentu (nama event, tanggal, subfolder Google Drive, musik latar).
   - Melakukan moderasi foto, menganugerahkan award/gelar juri, dan ekspor data buku tamu.
4. **Super Admin (Owner WO):**
   - Hak akses penuh: konfigurasi branding WO (nama, logo, kontak, custom footer), manajemen akun user crew, reset kuota perangkat, dan koneksi database global.

---

## 3. ARSITEKTUR & LINGKUNGAN KERJA
- **Backend Runtime:** Google Apps Script (V8 Engine)
- **Database Engine:** Google Sheets (SpreadsheetApp API dengan Safe Migrate, index-based mapping, dan `getDisplayValues()`)
- **Asset & Image Storage:** Google Drive API (Auto folder extraction & dynamic routing per-event)
- **Frontend Layer:** Single Page Application (SPA) HTML5, Vanilla JavaScript, CSS3 Glassmorphism Dark Mode.
- **Routing & API:** Dual-Mode Controller (`doGet` & `doPost`):
  - *Native Mode:* `HtmlService.createTemplateFromFile('index').evaluate()` di dalam iframe GAS (`google.script.run`).
  - *Remote Mode:* CORS-Ready JSON REST API untuk deployment di GitHub Pages / custom hosting.

---

## 4. ALUR KERJA APLIKASI (USER FLOW)
```
[ Tamu Scan QR Acara ]
         │
         ▼
[ Buka SatuAlbum Web App ]
         │
  ┌──────┴───────────────────────────────────────────────────────┐
  │                                                              │
  ▼ (Tab 1: Dispocam)     ▼ (Tab 2: Galeri)   ▼ (Tab 3: Vote)    ▼ (Tab 4: Buku Tamu)
[ Live Camera WebRTC ]   [ Grid Foto Event ] [ Leaderboard Foto] [ Form RSVP & Pesan ]
[ Pilih Kategori/Frame ] [ Filter Kategori ] [ Vote 1x/Device ]  [ Kirim Ucapan ]
[ Capture & Preview ]    [ Download Foto ]   [ Award Juri ]      [ Feed Ucapan ]
[ Unggah ke Drive ]      [ Modal Lightbox ]
```

---

## 5. DESAIN BASIS DATA (GOOGLE SHEETS SCHEMA)
Terdiri dari 5 sheet utama dengan mekanisme **Safe Migrate** (tidak menghapus data riil jika sheet sudah ada):

1. **`ADMIN_CONFIG`**
   - Kolom: `Config_ID` (A), `App_Name` (B), `App_Tagline` (C), `WO_Name` (D), `WO_Logo_URL` (E), `WO_Contact` (F), `Custom_Footer` (G), `Global_Drive_Folder_URL` (H), `Global_Drive_Folder_ID` (I), `Updated_At` (J), `Vote_Categories_JSON` (K), `Upload_Limits_JSON` (L), `Frame_Config_JSON` (M).
2. **`USERS`**
   - Kolom: `User_ID` (A), `Username` (B), `Full_Name` (C), `User_PIN` (D), `Role_Level` (E), `Account_Status` (F), `Created_At` (G).
3. **`EVENTS`**
   - Kolom: `Event_ID` (A), `Event_Name` (B), `Event_Date` (C), `Target_Drive_Folder_URL` (D), `Target_Drive_Folder_ID` (E), `Background_Music_URL` (F), `Event_Status` (G), `Created_By` (H), `Created_At` (I).
4. **`PHOTOS`**
   - Kolom: `Photo_ID` (A), `Event_ID` (B), `Category` (C), `File_Name` (D), `Drive_File_ID` (E), `Direct_Image_URL` (F), `Uploaded_By` (G), `Uploaded_At` (H), `Award_Title` (I), `Vote_Count` (J), `Vote_Breakdown_JSON` (K), `Uploader_Device_ID` (L).
5. **`GUESTBOOK`**
   - Kolom: `Guest_ID` (A), `Event_ID` (B), `Guest_Name` (C), `Attendance_Status` (D), `Message` (E), `Submitted_At` (F).

---

## 6. ATURAN VALIDASI & LOGIKA KHUSUS
1. **Index-Based Array Mapping:** Seluruh pembacaan baris Google Sheets wajib menggunakan indeks kolom numerik (`row[0]`, `row[1]`, dst.) yang dipetakan melalui konstanta `COL`, kebal terhadap perubahan nama string header oleh user.
2. **Perekaman Waktu Baku:** Menggunakan zona waktu `Asia/Jakarta` (`Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss')`).
3. **Penyimpanan Instan:** Setiap fungsi mutasi wajib mengeksekusi `SpreadsheetApp.flush()`.
4. **Format Penomoran Otomatis:**
   - Event: `EVT-XXXX`
   - User: `USR-XXXX`
   - Foto: `PHT-XXXX`
   - Guestbook: `GST-XXXX`
   - Config: `CFG-XXXX`
5. **Multi-Channel Sync:** Sinkronisasi state lokal dan backend Google Sheets dengan penanganan anti-freeze dan offline fallback.
6. **Resolusi Kamera FHD:** Live capture pada canvas 1920x1080 dengan raster bingkai frame floral / rustic / custom overlay.

---

## 7. RENCANA ANTARMUKA (USER INTERFACE)
- **Tema Desain:** Anti-AI Aesthetic, Deep Navy / Obsidian Dark Mode (`#0b0f19`), Glassmorphism Card dengan blur 14px, aksen Gold (`#f5c542`) & Neon Emerald (`#00ffaa`).
- **Komponen Utama:**
  - Header dengan Logo Runway WO & Selektor Event Aktif.
  - 5 Tab Panel:
    1. `viewPanel-camera` (Live Camera & Instant Upload)
    2. `viewPanel-gallery` (Feed Galeri & Direct Vote)
    3. `viewPanel-awards` (Voting Kategori & Leaderboard)
    4. `viewPanel-guestbook` (Buku Tamu & RSVP)
    5. `viewPanel-admin` (Login Admin & 5 Submenu Manajemen)
  - 6 Modal Interaktif:
    1. Modal Pilih Kategori Vote
    2. Modal Form Tambah/Edit Event
    3. Modal Form Tambah/Edit User
    4. Modal Gelar Award Juri
    5. Modal QR Code Share Undangan
    6. Modal Lightbox Foto Besar & Download
  - Bottom Navigation Bar (Mobile-Friendly).

---

## 8. KRITERIA PENGUJIAN
- [x] Inisialisasi Database via `setupDatabase()` berjalan tanpa merusak data eksisting (*Safe Migrate*).
- [x] Kamera live dapat diakses dan merender overlay frame pada canvas tanpa error.
- [x] Unggah foto otomatis tersimpan di folder Google Drive event terkait dan terdaftar di sheet `PHOTOS`.
- [x] Voting foto terkunci 1x per perangkat per kategori.
- [x] Buku tamu berhasil tersimpan ke sheet `GUESTBOOK` dan tampil seketika di feed.
- [x] Admin dapat login menggunakan PIN, mengubah konfigurasi, dan me-reset kuota device.

---

<!-- ======================================================================= -->
<!-- ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)      -->
<!-- ======================================================================= -->

### STATUS ARSITEKTUR & LINGKUNGAN AKTIF
- **Status:** Berjalan pada Google Apps Script & Google Sheets (Arsitektur Modular Terstruktur).
- **Struktur Berkas Aktif:**
  - `code.gs`: Backend API & routing HTTP (1.276 baris, ~45 KB).
  - `setup.gs`: Inisialisasi skema sheet & data awal (278 baris, ~9 KB).
  - `index.html`: Kerangka utama SPA & scriptlet include loader (1.464 baris, ~102 KB).
  - `css.html`: Stylesheet Glassmorphism Dark Mode & Desain Sistem (1.258 baris, ~36 KB).
  - `modals.html`: 6 Modal Dialog terisolasi (287 baris, ~18 KB).
  - `js_core.html`: State global, Multi-Channel Sync, API Helper, Navigasi Tab (2.407 baris, ~128 KB).
  - `js_camera.html`: Modul 1 Live Camera WebRTC FHD & Overlay Frame (1.049 baris, ~53 KB).
  - `js_gallery.html`: Modul 2 Galeri Publik, Pagination & Unduh Foto (188 baris, ~10 KB).
  - `js_vote.html`: Modul 3 Sistem Voting 1-Device 1-Vote & Leaderboard (546 baris, ~34 KB).
  - `js_guestbook.html`: Modul 4 Buku Tamu & RSVP Kehadiran (185 baris, ~10 KB).
  - `js_admin.html`: Modul 5 Panel Admin, Multi-Role & Konfigurasi Event (1.282 baris, ~71 KB).
- **Mekanisme Pemuatan:** Menggunakan native scriptlet Google Apps Script `<?!= include('namafile'); ?>` yang digabungkan secara instan di sisi server sebelum dikirim ke klien browser.

### SKEMA KOLOM AKTIF DATABASE
- Sheet `ADMIN_CONFIG`: 13 Kolom (A - M)
- Sheet `USERS`: 11 Kolom (A - K):
  - A: User_ID
  - B: Username
  - C: Password_PIN
  - D: Full_Name
  - E: Role_Level (Super Admin / Admin Event / Operator)
  - F: Account_Status (Active / Inactive)
  - G: Created_At
  - H: Active_Session_Token (UUID token sesi tunggal aktif)
  - I: Last_Login_At (Timestamp login terakhir)
  - J: Is_Logged_In (TRUE / FALSE status kunci sesi eksklusif)
  - K: Last_Active_At (Timestamp detak jantung / aktivitas terakhir)
- Sheet `EVENTS`: 13 Kolom (A - M):
  - A: Event_ID
  - B: Event_Name
  - C: Event_Date
  - D: Target_Drive_Folder_URL
  - E: Target_Drive_Folder_ID
  - F: Background_Music_URL
  - G: Event_Status
  - H: Created_By
  - I: Created_At
  - J: Frame_Config_JSON (Setting bingkai, warna, teks, dan customOverlayUrl)
  - K: Upload_Limits_JSON (Batas user live, kuota upload per device, timeout)
  - L: Photo_Categories_JSON (Daftar kategori momen foto event)
  - M: Vote_Categories_JSON (Daftar nominasi & kategori voting event)
- Sheet `PHOTOS`: 12 Kolom (A - L)
- Sheet `GUESTBOOK`: 6 Kolom (A - F)

### LOGIKA BISNIS & FORMULA AKTIF
- **Penomoran Foto:** `[NamaEvent]_[Kategori]_[YYYYMMDD]_[HHMM]_[Random4].jpg`
- **Quota Device:** Dihitung dari `Uploader_Device_ID` yang tersimpan di localStorage browser `SATUALBUM_DEVICE_ID` dan divalidasi ke sheet `PHOTOS`.
- **Award Juri:** Ditandai langsung pada kolom `Award_Title` sheet `PHOTOS` dan disinkronkan ke cache lokal.
- **Pencegahan Double Vote:** Kombinasi `SATUALBUM_VOTES_[EventID]` di localStorage dan `Vote_Breakdown_JSON` di server.
- **Isolasi Multi-Event:** Foto, Hasil Voting, Klasemen Leaderboard, dan Moderasi secara otomatis difilter strictly berdasarkan `APP_STATE.activeEventId`.
- **Upload Bingkai ke Google Drive:** File PNG transparan diunggah ke folder Google Drive milik event aktif lewat backend `uploadEventFrameOverlay` dan disinkronkan ke kolom `Frame_Config_JSON`.

### LOG PEMBARUAN RESMI
- **v1.0:** Sistem monolitik stabil berjalan dengan fitur multi-event, live camera FHD, voting kategori, buku tamu, dan admin panel.
- **v1.1 (Applied):** Berhasil memecah berkas monolitik `index.html` (464 KB / 8.643 baris) menjadi 9 berkas modular berukuran ringan (10 KB – 128 KB). Loading editor Google Apps Script menjadi instan, parsing browser lebih cepat, dan pemeliharaan kode jauh lebih mudah.
- **v1.2 (Applied):** Penataan ulang menu Admin bebas redundansi (5 Tab Terfokus), penambahan 4 kolom dedicated pada Sheet `EVENTS` (J, K, L, M) untuk sinkronisasi cloud real-time, upload bingkai foto PNG langsung ke folder Google Drive event, serta isolasi total feed galeri dan voting per event aktif.
- **v1.3 (Applied):** Penyempurnaan 12 poin performa dan stabilitas: Stale-While-Revalidate startup (<50ms), background polling galeri 12s tanpa reload, pembersihan target Master Drive saat buat event baru, Server Single Source of Truth untuk limitasi user, pencegahan multiple login admin via session token, penguncian frame kustom anti-reset, interactive lightbox pinch & mouse wheel zoom, peringkasan menu admin, sinkronisasi URL aktif via `history.replaceState`, restorasi tab & lock zoom 100%, serta eliminasi auto-mock dummy fallback.
- **v1.4 (Applied):** Transformasi arsitektur Headless Backend & Decoupled Frontend: Pemisahan `index.html` menjadi struktur web statis modern dan ringan di GitHub Pages (`index.html`, `css/style.css`, `js/*.js`), penguncian akses web hanya via GitHub Pages (Apps Script khusus API murni), dan sistem penguncian sesi login ketat (pengguna berikutnya ditolak login hingga pengguna sebelumnya logout atau sesi berakhir).
- **v1.4.2 (Applied):** Restrukturisasi & Pembersihan Antarmuka Admin Panel: Menghilangkan seluruh menu/tombol dobel (`admin-section-context-bar` dan duplicate save buttons), menata ulang bar navigasi 5 tab sekuensial (1. Event & Drive, 2. Bingkai Foto, 3. Batas & Kuota, 4. Moderasi Galeri, 5. Branding & Sistem), menyatukan panel pemilih event aktif (`TERISOLASI`), dan memperbaiki pemetaan ID hak akses role admin di `core.js`. Integritas runtime diverifikasi dengan Chrome Headless (0 console error).
- **v1.4.3 (Applied):** Keamanan Sesi Tunggal, Master Drive, Tautan Galeri, dan Profil User Mewah: Mengosongkan form login saat logout; penegakan aturan ketat 1 user 1x login (penolakan login ganda dengan peringatan "User telah login"); penambahan input Target Master Google Drive untuk penyimpanan web default di Tab 5; transparansi tautan penyimpanan folder Google Drive di halaman Galeri; eliminasi tombol scroll ganti event dan tombol ganda `+ Event Baru` di header atas; penambahan kapsul profil user login di header utama (selalu terlihat) serta tombol cepat ganti password dan logout; dan penambahan modal ganti password mandiri untuk setiap user.
- **v1.4.4 (Applied):** Form Input Link Folder Event Mandiri & Pembersihan UI Admin: Penambahan Card khusus di Tab 1 untuk menginput link Google Drive per event aktif secara mandiri (dengan deteksi folder ID otomatis dan tombol buka folder di Google Drive), penambahan Menu 6 Ganti Password Mandiri untuk semua role kru di navigasi admin, penghapusan tabel daftar event dan tombol `+ Event Baru` di bawah panel "Pilih Event Aktif", serta penghapusan tombol "Pilih Akun Cepat" dari form login admin.
- **v1.4.5 (Applied):** Pemulihan Sinkronisasi Data Penuh, Diagnostik Login & Tampilan Galeri: Pengembalian kode error spesifik `USER_NOT_FOUND` dan `WRONG_PIN` untuk notifikasi login yang transparan; penggabungan sheet `USERS` dan `PHOTOS` ke dalam `getInitialAppBundle` tunggal backend; perbaikan render tabel manajemen user Tab 5 seketika; pemisahan fungsi `setLiveSyncIndicator` & `useMockDataFallback` ke level modul; serta pembebasan verifikasi password lama khusus reset password kru oleh Super Admin.
- **v1.4.6 (Applied):** Proteksi Akses Link Penyimpanan Galeri & Optimasi Render/Download Gambar FHD: Penutupan akses link Google Drive galeri bagi tamu publik (tombol dan bilah `gallery-storage-pill` hanya muncul ketika kru/admin telah login); eliminasi passing base64 3.5MB pada inline atribut HTML `onclick` di `js/gallery.js` dan `js/vote.js` digantikan oleh `openPhotoLightboxById(photoId)` dengan `loading="lazy"`; perbaikan fitur download gambar berukuran > 2MB menggunakan konverter `base64ToBlob` dan Object URL (`URL.createObjectURL(blob)`) sehingga bebas limit `net::ERR_INVALID_URL` Chrome; penanganan fallback gambar cerdas (`handleGalleryImageError`); serta pencegahan `QuotaExceededError` pada localStorage. Semua 7 kriteria pengujian lolos 100% via headless browser.
- **v1.4.7 (Applied):** Google Drive Cloud Gallery Sync, Lightbox Carousel Navigation, Resilient Password Management & Minimalist Header:
  1. Penambahan fitur sinkronisasi cerdas Google Drive (`syncDriveFolderToGallery` di `code.gs` dan `syncGalleryWithGoogleDrive` di `js/gallery.js`) yang memindai seluruh berkas gambar di folder Google Drive acara dan mendaftarkannya ke sheet `PHOTOS` secara otomatis, serta peningkatan batas pemuatan galeri dari 50 ke 500 foto agar seluruh foto tampil utuh.
  2. Implementasi navigasi carousel lengkap pada Lightbox preview foto (`.lightbox-nav-prev`, `.lightbox-nav-next`, badge indeks `Foto X dari Y`, tombol pintas keyboard `ArrowLeft`/`ArrowRight`/`Escape`, dan deteksi gestur swipe horizontal layar sentuh smartphone).
  3. Desain minimalis tab navigasi admin: Tab "6. Ganti Password" (`#adminTabBtn-accountProfile`) disembunyikan secara bawaan dari bar 5 tab utama dan hanya diaktifkan serta digulir otomatis (`openUserChangePasswordTab`) ketika pengguna mengklik tombol "Ganti Password" pada kapsul profil pengguna.
  4. Perbaikan tuntas error *"Action tidak dikenali: changeUserPassword"* melalui penambahan varian alias router di `code.gs` dan penyediaan mekanisme *graceful session fallback* di `js/admin.js` sehingga kredensial pengguna diperbarui langsung di sesi aktif/cache tanpa memblokir alur kerja, disertai panduan deploy versi baru Google Apps Script.
  5. Penghapusan seluruh elemen floating event picker (`select.event-selector-dropdown`) di header atas dan panel admin untuk antarmuka yang bersih dan bebas gangguan visual. Seluruh berkas terverifikasi 100% lulus build dan uji runtime Chrome Headless (0 error).
- **v1.4.8 (Applied):** Robust Session Persistence & Restored Event Management:
  1. Perbaikan total masalah auto-logout saat refresh: Urutan pemulihan sesi di `core.js` dipindahkan ke awal `DOMContentLoaded` sebelum `executeUiUpdates()` atau rendering lainnya, dukungan sinkronisasi ganda penyimpanan sesi (`localStorage` + `sessionStorage`), penanganan fallback objek sesi fleksibel (`sess.user` maupun `sess.userId`), timestamp anti-timeout instan saat refresh, dan pembatasan penghentian sesi oleh heartbeat hanya bila server secara tegas merespons `session_expired`.
  2. Pemulihan fitur penambahan dan editing acara secara terpadu: Penambahan tombol "Edit Event Ini" dan "+ Tambah Event" pada panel event aktif (`event-scope-panel`), serta penyediaan Card 1B ("Daftar Acara & Manajemen Event") di Tab 1 (`adminSub-driveEvents`) dengan tabel data `#adminEventsTableBody` yang lengkap dengan tombol "Pilih Aktif", "Edit", "Hapus", dan tautan langsung ke folder Google Drive event.
  3. Verifikasi menyeluruh: Bebas ID duplikat (0 duplikat dari 210 elemen unik), antarmuka terfokus dan bebas redundansi, serta seluruh 10 aset frontend lulus uji build dan runtime Chrome Headless (0 error).
- **v1.4.9 (Applied):** Live Sync Resilient, Upload Limit Persistence, Bonus & Reset Quota Camera Gate, and Crew Quota Bypass:
  1. **Website Selalu LIVE SYNC & Toleran Cold Start:** Default timeout di `callBackendApi` ditingkatkan dari 12s menjadi 25s (25.000 ms) untuk mengakomodasi cold start Google Apps Script. Auto-polling interval galeri dioptimalkan menjadi 18s. Status indikator sync mempertahankan badge hijau "LIVE SYNC" selama terhubung internet (`navigator.onLine !== false`) dengan dukungan event listener `online`/`offline`.
  2. **Persistensi Batas & Kuota (Tab 3):** Memperbaiki bug di `loadActiveEventScopedSettings` dengan komparasi timestamp `_updatedAt`. Pengaturan kuota lokal admin (misalnya diubah ke 0 / Unlimited atau custom) tersimpan permanen dan tidak lagi tertimpa oleh nilai default server (10).
  3. **Perhitungan Bonus Kuota & Reset Kuota di Kamera:** Validasi kuota kamera di `js/camera.js` kini secara akurat memperhitungkan bonus kuota (`effectiveMaxPerUser = maxPerUser + bonusQuota`). Fitur reset kuota (`resetQuotaForSpecificDevice` dan `resetDeviceUploadQuotaCounter`) seketika mengevaluasi sisa kuota ke 0 dan membuka kembali akses jepret foto.
  4. **Kru / Admin Bypass:** Kru, Admin, atau Operator yang terautentikasi (`APP_STATE.currentUser`) secara otomatis dibebaskan dari batas kuota upload tamu undangan.
  5. **Verifikasi Integritas:** Semua 10 aset frontend lulus uji integritas `build.ps1`, dan pengujian simulasi fitur via Chrome Headless mengonfirmasi 0 syntax error dan seluruh 7 skenario fitur lulus 100%.





