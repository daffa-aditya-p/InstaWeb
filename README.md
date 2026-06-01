# 🌟 InstaWeb — Premium Agentic Website Builder & SaaS Platform

InstaWeb adalah platform modern SaaS (Software-as-a-Service) *No-Code/Low-Code Website Builder* yang dirancang untuk membantu pengguna membuat, mendesain, mengelola, dan mempublikasikan situs web satu halaman (single-page website) secara instan, interaktif, dan berkinerja tinggi.

Dengan pendekatan desain premium *Dark Mode-first*, platform ini tidak hanya menawarkan fungsionalitas pembuatan visual secara dinamis, melainkan juga dilengkapi sistem pelacakan statistik pengunjung secara real-time, integrasi gateway pembayaran Midtrans Snap, sistem kolaborasi tim multi-user, dan optimasi SEO terotomatisasi.

---

## 📖 Daftar Isi
1. [Latar Belakang & Motivasi Pembuatan](#-latar-belakang--motivasi-pembuatan)
2. [Fitur Unggulan & Tingkatan Paket (SaaS Tier)](#-fitur-unggulan--tingkatan-paket-saas-tier)
3. [Tumpukan Teknologi (Tech Stack)](#%EF%B8%8F-tumpukan-teknologi-tech-stack)
4. [Arsitektur & Alur Kerja Sistem](#-arsitektur--alur-kerja-sistem)
5. [Panduan Instalasi & Konfigurasi Lokal](#%EF%B8%8F-panduan-instalasi--konfigurasi-lokal)
6. [Peta API Endpoints (API Map)](#%EF%B8%8F-peta-api-endpoints-api-map)
7. [Dokumentasi Pengembangan Lanjutan](#-dokumentasi-pengembangan-lanjutan)

---

## 💡 Latar Belakang & Motivasi Pembuatan

Di era digital saat ini, kehadiran online (online presence) adalah kebutuhan mutlak bagi bisnis, pengembang, maupun kreator konten. Namun, pembuatan situs web seringkali dihadapkan pada dua kendala utama:
1. **Solusi Tradisional yang Rumit**: Membutuhkan pemahaman coding mendalam (HTML, CSS, JS) serta manajemen infrastruktur server yang kompleks.
2. **Platform Builder yang Kaku & Mahal**: Layanan website builder yang ada seringkali menawarkan biaya bulanan tinggi, performa lambat karena *bloated templates*, serta minimnya kontrol atas optimasi SEO secara mandiri.

**InstaWeb** dibuat untuk menjembatani jurang tersebut. Platform ini didesain agar:
* **Instan & Responsif**: Pengguna bisa menyusun 22+ komponen visual berkinerja tinggi dengan editor interaktif yang ramah seluler (*mobile-responsive friendly*).
* **Hemat Biaya & Bernilai Tinggi**: Menyediakan fitur kelas bisnis seperti analitik terperinci, integrasi *iframe*, dan pengkodean HTML kustom tanpa biaya investasi awal yang memberatkan.
* **Mendukung Kerja Tim (Collaboration)**: Mengizinkan tim produksi bekerja bersama secara simultan untuk memvalidasi ide bisnis secara cepat.

---

## 💎 Fitur Unggulan & Tingkatan Paket (SaaS Tier)

InstaWeb menerapkan model bisnis Freemium dengan fitur yang diklasifikasikan secara ketat berdasarkan status langganan pengguna:

### 1. 🛡️ Paket Gratis (Free)
Fokus pada pembuatan situs dasar dengan performa tinggi.
* **Builder Interaktif**: Akses penuh ke editor visual dinamis untuk menyusun dan merombak urutan komponen halaman.
* **Batas Pembuatan**: Dapat membuat hingga 5 halaman situs web aktif.
* **Statistik Dasar**: Mengakses metrik jumlah total pengunjung (*view counts*) secara real-time.
* **Desain Mandiri**: Kustomisasi warna tema dasar dan padding halaman.

### 2. 🌟 Paket Plus (Rp 150.000 / bln atau Rp 1.500.000 / thn)
Ditujukan bagi profesional yang menginginkan kebebasan visual dan interaktivitas tingkat lanjut.
* **Semua Fitur Paket Gratis**
* **Animasi Modern**: Integrasi efek transisi halus berbasis *Framer Motion* untuk meningkatkan *user experience* pengunjung.
* **Section Kode HTML Kustom**: Kemampuan untuk menulis dan mengeksekusi script HTML/CSS/JS buatan sendiri langsung ke dalam halaman menggunakan sandbox terisolasi.
* **Statistik Premium (Detailed Analytics)**: Visualisasi grafik garis grafik SVG interaktif untuk tren kunjungan 30 hari terakhir, pelacakan rujukan pengirim (*referrers*), dan penghitungan pengunjung unik (*unique visitors*).

### 3. 👑 Paket Pro+ (Rp 450.000 / bln atau Rp 4.500.000 / thn)
Paket pamungkas kelas bisnis untuk produktivitas tim tinggi dan integrasi eksternal luas.
* **Semua Fitur Paket Plus**
* **Kolaborasi Multi-User**: Undang hingga 5 pengguna lain per halaman sebagai kontributor (`Editor` atau `Viewer`) untuk bekerja bersama di ruang builder.
* **Sistem Kotak Masuk (Inbox Collaboration)**: Sistem notifikasi undangan kolaborasi yang aman, terintegrasi di sidebar dashboard.
* **Integrasi Iframe & Advanced Embeds**: Sematkan media luar (YouTube, Google Maps, widget eksternal) dengan performa responsif.
* **Pelacakan Pengunjung Mendalam**: Log akses pengunjung yang komprehensif, merekam data string Agen Pengguna (*User Agent*) dan rujukan halaman per kunjungan.
* **Ekspor Kode HTML**: Unduh seluruh kode halaman sebagai file `.html` standalone yang siap di-host di server statis mana pun.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

InstaWeb dibangun menggunakan pendekatan arsitektur modern decoupled (terpisah antara frontend dan backend) demi keamanan dan skalabilitas tinggi.

### 🖥️ Frontend (Client Side)
* **Framework**: React.js 18 (diperkuat dengan Vite sebagai build-tool super cepat).
* **State Management**: Zustand (untuk pengelolaan otentikasi sesi dan sinkronisasi pembayaran).
* **Styling**: Vanilla CSS dikombinasikan dengan utility-first Tailwind CSS untuk flexibilitas visual premium.
* **Animations**: Framer Motion (menyediakan animasi mikro interaktif berkualitas tinggi).
* **Icons**: React Icons (lucide/feather icons).
* **Lazy Loading**: Pemisahan chunk dinamis menggunakan `React.lazy()` dan `Suspense` untuk performa *First Contentful Paint* (FCP) yang optimal.

### ⚙️ Backend (Server Side)
* **Framework**: Python Flask (micro-framework yang handal dan fleksibel).
* **ORM & Database**: Flask-SQLAlchemy dengan database SQLite (mudah dideploy dan sangat stabil untuk relasi data).
* **Otentikasi**: JWT (JSON Web Tokens) melalui `Flask-JWT-Extended` (dengan sistem blocklist token terintegrasi untuk keamanan logout).
* **Payment Integration**: Midtrans Snap API (integrasi popup pembayaran instan kelas industri di Indonesia).

---

## 🗺️ Arsitektur & Alur Kerja Sistem

### 1. Sistem Pembayaran & Verifikasi Langganan (Subscription Pipeline)
Platform ini memecahkan keterbatasan sandbox localhost untuk menerima webhook melalui rute sinkronisasi ganda:
```
User Memilih Paket Langganan 
  ↳ Kirim parameter ke POST /api/subscription/create
  ↳ Backend memanggil Midtrans Snap API dan mengembalikan token Snap
  ↳ Frontend memicu popup window.snap.pay()
  ↳ Setelah user membayar, Frontend memicu verifikasi instan ke POST /api/subscription/verify
  ↳ Backend melakukan query langsung (Direct API call) status transaksi ke server Midtrans
  ↳ Jika transaksi valid/settled, status user di-upgrade ke Plus/Pro+ secara aman!
```

### 2. Keamanan Kolaborasi Halaman (Access Control)
Otoritas halaman dinilai berdasarkan relasi relasional database:
* **Owner (Pemilik)**: Memiliki hak mutlak (mengedit konten, menambah/menghapus bagian, merubah SEO, mengundang kolaborator, menghapus situs).
* **Collaborator (Editor)**: Memiliki hak untuk menyusun komponen halaman, mengubah nilai field teks/gambar, dan mengedit konten builder, namun dilarang menghapus halaman atau mengelola lisensi pengguna lain.
* **Guest/Public**: Hanya memiliki hak baca (*read-only*) untuk menampilkan halaman yang dipublikasikan secara langsung.

---

## ⚙️ Panduan Instalasi & Konfigurasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan ekosistem InstaWeb di komputer Anda.

### 📋 Prasyarat Sistem
* Python 3.9 atau versi di atasnya.
* Node.js v18 atau versi di atasnya.
* npm (Node Package Manager).

---

### 1. Pengaturan Backend (Python Flask)

1. Navigasi masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Buat lingkungan virtual Python (Virtual Environment):
   ```bash
   python -m venv venv
   ```

3. Aktifkan lingkungan virtual:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Instal seluruh dependensi pustaka Python:
   ```bash
   pip install -r requirements.txt
   ```

5. Jalankan migrasi basis data (untuk menambahkan kolom SEO secara otomatis):
   ```bash
   python migrate_seo.py
   ```

6. Jalankan skrip seeder (untuk mengisi template dasar bawaan):
   ```bash
   python -m app.seed
   ```

7. Jalankan server backend Flask secara lokal:
   ```bash
   python run.py
   ```
   *Secara bawaan, server backend akan berjalan di URL `http://127.0.0.1:5000`.*

---

### 2. Pengaturan Frontend (React + Vite)

1. Navigasi masuk ke direktori frontend:
   ```bash
   cd ../frontend
   ```

2. Instal seluruh paket dependensi Node.js:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan Vite secara lokal:
   ```bash
   npm run dev
   ```
   *Secara bawaan, aplikasi frontend dapat diakses di browser pada URL `http://localhost:5173`.*

4. Untuk membuat bundle kompilasi produksi yang teroptimasi:
   ```bash
   npm run build
   ```

---

## 🗺️ Peta API Endpoints (API Map)

Semua rute API terdaftar di bawah prefiks `/api` pada port backend.

### Rute Otentikasi & Profil (`/api/auth`)
| HTTP Method | Endpoint | Kredensial | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/register` | Publik | Mendaftarkan akun baru |
| `POST` | `/auth/login` | Publik | Masuk ke sistem dan dapatkan token JWT |
| `POST` | `/auth/logout` | JWT | Keluar dan masukkan token JWT ke daftar blokir |
| `GET` | `/auth/me` | JWT | Mendapatkan data profil pengguna saat ini |
| `PUT` | `/auth/profile` | JWT | Memperbarui nama/email profil |

### Rute Pengelolaan Halaman (`/api/pages`)
| HTTP Method | Endpoint | Kredensial | Deskripsi |
|---|---|---|---|
| `GET` | `/pages` | JWT | Mendapatkan daftar seluruh halaman (milik sendiri & kolaborasi) |
| `POST` | `/pages` | JWT | Membuat draf halaman baru |
| `GET` | `/pages/<slug>` | JWT | Mendapatkan struktur detail draf halaman & section |
| `PUT` | `/pages/<slug>` | JWT | Memperbarui data meta dasar halaman (pemilik/kolaborator) |
| `DELETE` | `/pages/<slug>` | JWT | Menghapus halaman secara permanen (hanya pemilik) |
| `PUT` | `/pages/<slug>/publish` | JWT | Mempublikasikan atau mengembalikan halaman ke draf |
| `POST` | `/pages/<slug>/duplicate` | JWT | Menduplikasi seluruh halaman beserta section-nya |
| `GET` | `/pages/<slug>/export` | JWT | Ekspor skema data halaman sebagai format HTML |
| `PUT` | `/pages/<slug>/seo` | JWT | Memperbarui pengaturan SEO halaman |

### Rute Statistik Halaman (`/api/analytics`)
| HTTP Method | Endpoint | Kredensial | Deskripsi |
|---|---|---|---|
| `POST` | `/public/track` | Publik | Merekam kunjungan halaman eksternal (anonim) |
| `GET` | `/analytics/overview`| JWT | Mengambil total data kunjungan lintas halaman |
| `GET` | `/analytics/pages/<slug>/summary` | JWT | Statistik dasar halaman (Free Tier) |
| `GET` | `/analytics/pages/<slug>/details` | JWT (Plus) | Grafik tren harian, persentase rujukan |
| `GET` | `/analytics/pages/<slug>/visitors` | JWT (Pro+) | Log Agen Pengguna pengunjung (Pro+) |

---

## 🔒 Lisensi & Kontribusi

* Platform ini dikembangkan untuk kebutuhan operasional komersial instan (*production-ready*).
* Kontribusi kode dapat dilakukan melalui pembuatan Pull Request (PR) setelah berdiskusi di bagian Issue.
* Seluruh hak cipta dilindungi oleh tim pengembang InstaWeb.

---
**💡 InstaWeb — Bangun Situs Profesional Anda Hanya Dalam Hitungan Detik!**
