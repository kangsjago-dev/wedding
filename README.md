# SatuAlbum • Digital Event Platform (Dispocam)
Platform Live Camera WebRTC, Galeri Foto Interaktif, Voting Nominasi, & Buku Tamu Digital berbasis **GitHub Pages (Frontend)** dan **Google Apps Script + Sheets + Drive (Backend Serverless)**.

---

## 📌 1. PETA PENYIMPANAN BERKAS (APPS SCRIPT VS GITHUB)

Aplikasi SatuAlbum menggunakan arsitektur **Hybrid Serverless**:
- **GitHub Pages** menyajikan tampilan antarmuka (Frontend UI) yang sangat cepat, ringan, dan gratis diakses publik tanpa kuota batasan view.
- **Google Apps Script & Google Sheets** bertindak sebagai REST API Backend gratis untuk penyimpanan foto (Google Drive) dan database transaksi (Google Sheets).

### A. File yang Disimpan di GOOGLE APPS SCRIPT (`script.google.com`)
Di dalam Google Apps Script Editor, Anda **HANYA BUTUH 2 BERKAS INI SAJA**:
| Nama Berkas | Tipe | Fungsi Utama |
| :--- | :--- | :--- |
| **`code.gs`** | Script (`.gs`) | REST API murni (`doGet` & `doPost`), upload foto & bingkai ke Google Drive, CRUD Google Sheets, dan penguncian sesi login |
| **`setup.gs`** | Script (`.gs`) | Skema tabel database Google Sheets, inisialisasi & *Safe Migration* (kolom `Is_Logged_In` & `Last_Active_At`) |

> 🔒 **Keamanan & Performa:** Antarmuka web sengaja dialihkan sepenuhnya ke **GitHub Pages**. Jika link Web App Apps Script dibuka langsung dari browser, sistem akan menolak dan mengarahkan ke GitHub Pages. Anda **SAMA SEKALI TIDAK PERLU** membuat file HTML di Google Apps Script!

---

### B. File yang Disimpan di GITHUB REPOSITORY (Hosting Utama)
Seluruh berkas frontend disajikan langsung melalui GitHub Pages dengan pemisahan aset statis yang ringan:
| Nama Berkas / Folder | Fungsi Utama |
| :--- | :--- |
| **`index.html`** | **Berkas utama GitHub Pages.** Hanya berisi kerangka HTML semantik & modal dialog (~116 KB), sangat ringan dan instan dimuat di HP. |
| **`css/style.css`** | Berkas CSS murni Dark Glassmorphism, animasi kamera, dan responsivitas mobile (~35 KB, di-cache permanen oleh browser). |
| **`js/core.js`** | Core engine state management, API client fetch, cache lokal, dan query parameter routing. |
| **`js/camera.js`** | Kamera WebRTC FHD, filter live, hitung mundur, dan canvas frame rendering anti-reset. |
| **`js/gallery.js`** | Galeri publik per-event, filter kategori momen, auto-polling foto baru 12 detik, dan download. |
| **`js/vote.js`** | Sistem voting 1 perangkat 1 suara per kategori dan live leaderboard klasemen. |
| **`js/guestbook.js`**| Buku tamu digital dan konfirmasi kehadiran RSVP. |
| **`js/admin.js`** | 5 Tab Panel Admin (Event & Drive, Bingkai, Kuota, Moderasi, Strict Exclusive Login Lock). |
| **`build.bat` / `build.ps1`** | Script 1-klik untuk memeriksa dan memverifikasi integritas seluruh aset produksi sebelum di-push ke GitHub. |

---

## 🚀 2. PANDUAN AKTIVASI GITHUB PAGES (AGAR LINK BISA TERBUKA)

1. **Upload / Push Proyek ke GitHub:**
   - Buat repository baru di GitHub (misal: `dispocam` atau `satualbum`).
   - Masukkan seluruh file dari folder ini ke dalam repository tersebut.
2. **Aktifkan GitHub Pages:**
   - Di halaman repository GitHub Anda, klik menu **Settings** (tab atas).
   - Di bilah menu kiri, pilih **Pages**.
   - Pada bagian **Build and deployment**:
     - **Source:** Pilih `Deploy from a branch`.
     - **Branch:** Pilih `main` (atau `master`) dan folder `/ (root)`.
     - Klik **Save**.
3. **Selesai!**
   - Tunggu sekitar 30 - 60 detik.
   - GitHub akan memberikan tautan publik aplikasi Anda, contohnya:
     ```
     https://username.github.io/dispocam/
     ```
   - Buka tautan tersebut di browser HP atau Laptop — **halaman akan langsung terbuka dengan tampilan penuh, tanpa error!**

---

## 🔗 3. MENGHUBUNGKAN GITHUB PAGES KE GOOGLE APPS SCRIPT BACKEND

Agar foto yang diambil dan data tamu di GitHub Pages tersimpan langsung ke Google Drive dan Google Sheets Anda:

### Langkah 1: Ambil URL Web App di Google Apps Script
1. Buka project Google Apps Script Anda.
2. Di pojok kanan atas, klik tombol biru **Deploy** > **New deployment** (atau **Manage deployments**).
3. Pilih tipe **Web app**.
4. Konfigurasi wajib:
   - **Execute as:** `Me (email Anda)`
   - **Who has access:** **`Anyone` (Siapa saja)** *(Wajib agar tamu bisa mengirim foto tanpa diminta login Google)*.
5. Klik **Deploy** dan salin **Web app URL** yang muncul, formatnya:
   ```
   https://script.google.com/macros/s/AKfycby_.../exec
   ```

### Langkah 2: Hubungkan ke Aplikasi
Pilih salah satu cara termudah berikut:

- **Cara A (Otomatis lewat URL Link):**
  Cukup buka link GitHub Pages Anda dengan menambahkan parameter `?backend=`:
  ```
  https://username.github.io/dispocam/?backend=URL_WEB_APP_ANDA
  ```
  Sistem akan otomatis menyimpan endpoint tersebut ke perangkat dan menyinkronkan data.

- **Cara B (Lewat Panel Admin):**
  1. Buka link GitHub Pages Anda.
  2. Buka menu **Admin** (masukkan PIN default: `123456`).
  3. Masuk ke **Tab 5: Sistem & Branding WO**.
  4. Gulir ke bagian **Koneksi Endpoint Database**, tempelkan Web App URL Anda di kolom yang tersedia.
  5. Klik tombol **Simpan Endpoint API**.

---

## 📱 4. FITUR DIRECT EVENT LINK & QR CODE
Aplikasi mendukung multi-event dengan folder Google Drive dan bingkai yang berbeda-beda.
- **Tautan Khusus Event Tertentu:**
  ```
  https://username.github.io/dispocam/?event=EVT-0001
  ```
- **Barcode / QR Code Undangan:**
  Admin dapat mengeklik tombol **Barcode Undangan** pada menu aplikasi untuk menampilkan QR Code yang langsung mengarahkan tamu ke acara yang aktif.

---

## 🛠️ 5. CARA UPDATE KODE MODULAR (BUILD PROCESS)
Jika Anda melakukan perubahan pada salah satu file modular (misal mengedit `js_camera.html` atau `css.html`):
1. Cukup klik ganda (double click) file **`build.bat`** di Windows (atau jalankan `powershell -File build.ps1`).
2. Script akan secara otomatis menggabungkan seluruh modul ke dalam berkas **`index.html`**.
3. Lakukan `git commit` dan `git push` ke GitHub — pembaruan akan langsung aktif di GitHub Pages!

