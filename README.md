# SatuAlbum • Digital Event Platform (Dispocam)
Platform Live Camera WebRTC, Galeri Foto Interaktif, Voting Nominasi, & Buku Tamu Digital berbasis **GitHub Pages (Frontend)** dan **Google Apps Script + Sheets + Drive (Backend Serverless)**.

---

## 📌 1. PETA PENYIMPANAN BERKAS (APPS SCRIPT VS GITHUB)

Aplikasi SatuAlbum menggunakan arsitektur **Hybrid Serverless**:
- **GitHub Pages** menyajikan tampilan antarmuka (Frontend UI) yang sangat cepat, ringan, dan gratis diakses publik tanpa kuota batasan view.
- **Google Apps Script & Google Sheets** bertindak sebagai REST API Backend gratis untuk penyimpanan foto (Google Drive) dan database transaksi (Google Sheets).

### A. File yang Disimpan di GOOGLE APPS SCRIPT (`script.google.com`)
Hanya berkas backend yang perlu dimasukkan ke dalam Google Apps Script Editor:
| Nama Berkas | Tipe | Fungsi Utama |
| :--- | :--- | :--- |
| **`code.gs`** | Script (`.gs`) | Router API (`doGet` & `doPost`), upload foto & bingkai ke Google Drive, CRUD Google Sheets |
| **`setup.gs`** | Script (`.gs`) | Skema tabel database Google Sheets, inisialisasi & *Safe Migration* |

> 💡 **Catatan:** Anda **TIDAK PERLU** lagi memasukkan berkas HTML yang panjang ke Google Apps Script karena frontend sudah di-hosting dengan rapi dan cepat di **GitHub Pages**! (Kecuali jika Anda juga ingin memiliki cadangan Web App internal langsung di Apps Script, Anda bisa menggunakan `gas_index.html` dan modul `*.html`).

---

### B. File yang Disimpan di GITHUB REPOSITORY
Seluruh berkas frontend dan source code modular disimpan di repository GitHub Anda:
| Nama Berkas | Fungsi Utama |
| :--- | :--- |
| **`index.html`** | **Berkas utama GitHub Pages.** Sudah terkompilasi mandiri (self-contained) berisi seluruh CSS, Modal, dan Script sehingga langsung terbuka cepat di browser HP/PC. |
| **`gas_index.html`** | Berkas template modular Google Apps Script (menggunakan `include()`). |
| **`build.bat` / `build.ps1`** | Script 1-klik untuk mengompilasi modul source code menjadi `index.html` setiap kali Anda melakukan perubahan kode. |
| **`css.html`** | Stylesheet tema Dark Glassmorphism, animasi kamera, dan responsivitas mobile. |
| **`modals.html`** | Komponen modal dialog (Event, User, Barcode QR, Award, Lightbox). |
| **`js_core.html`** | Core engine state management, API client fetch, cache lokal, dan query parameter routing. |
| **`js_camera.html`** | Kamera WebRTC FHD, filter live, hitung mundur, dan canvas frame rendering. |
| **`js_gallery.html`** | Galeri publik per-event, filter kategori momen, dan pengunduhan foto resolusi tinggi. |
| **`js_vote.html`** | Sistem voting 1 perangkat 1 suara per kategori dan live leaderboard klasemen. |
| **`js_guestbook.html`**| Buku tamu digital dan konfirmasi kehadiran RSVP. |
| **`js_admin.html`** | 5 Tab Panel Admin (Event & Drive, Bingkai, Kuota, Moderasi, Branding WO). |

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

