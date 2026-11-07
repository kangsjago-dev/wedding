# SPESIFIKASI KEBUTUHAN PRODUK (PRD) & MASTER CONTEXT: SATUALBUM (DISPOCAM)
================================================================================
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STATUS DOKUMEN: LIVING SPECIFICATION & ARCHITECTURAL BLUEPRINT
REVISI: v1.3 (Production-Ready Release & Performance Optimization)
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
- Sheet `USERS`: 9 Kolom (A - I):
  - A: User_ID
  - B: Username
  - C: Password_PIN
  - D: Full_Name
  - E: Role_Level (Super Admin / Admin Event / Operator)
  - F: Account_Status (Active / Inactive)
  - G: Created_At
  - H: Active_Session_Token (UUID token sesi tunggal aktif)
  - I: Last_Login_At (Timestamp login terakhir)
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

