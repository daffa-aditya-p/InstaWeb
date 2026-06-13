# InstaWeb Go Backend

Backend ini adalah hasil migrasi Go untuk API Python/Flask lama. Seluruh route tetap mempertahankan prefix `/api` agar frontend tetap tersambung tanpa perubahan.

## Status Migrasi (Terkoneksi ke Supabase)
* **Database & Migrations**: Skema database PostgreSQL telah berhasil diterapkan langsung ke proyek Supabase Anda (`ltewpmohitpzsndzeocq`).
* **Seeding**: Data default (32 template modular, fields, demo page, dan user akun default) sudah berhasil digenerate ke database Supabase Anda.
* **Konfigurasi Env**: File `.env` lokal sudah dikonfigurasi penuh dengan koneksi pooler (`aws-1`) dan `service_role` key yang Anda berikan.

## Akun Demo Default (Bisa digunakan untuk login):
* **Super Admin**: `super@instaweb.io` | Password: `password`
* **Admin**: `admin@instaweb.io` | Password: `password`
* **Demo User**: `demo@instaweb.io` | Password: `password`

---

## Cara Menjalankan Lokal

1. Masuk ke direktori backend:
   ```bash
   cd backend_golang
   ```
2. Jalankan server:
   ```bash
   go run ./cmd/api
   ```
   Server akan berjalan di `http://localhost:5000` dengan seluruh API di `/api/*` (misal `/api/health`).

---

## Deploy ke Google Cloud Run

### 1. Build Docker Image
Jalankan Google Cloud Build untuk mengunggah dan mem-build image kontainer di Artifact Registry:
```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/instaweb-api:latest
```
*(Ganti `REGION`, `PROJECT_ID`, dan `REPOSITORY` sesuai dengan proyek Google Cloud Anda).*

### 2. Konfigurasi Secrets
Sebelum mendeploy, pastikan Anda telah membuat secrets berikut di Google Cloud Secret Manager untuk keamanan:
* `instaweb-database-url`: `postgresql://postgres.ltewpmohitpzsndzeocq:daffajago123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require`
* `instaweb-jwt-secret`: Kunci rahasia JWT pilihan Anda.
* `instaweb-supabase-url`: `https://ltewpmohitpzsndzeocq.supabase.co`
* `instaweb-supabase-service-role-key`: Token `service_role` Supabase Anda.
* `instaweb-midtrans-server-key`: Token Server Key Midtrans Anda.

### 3. Deploy Service ke Cloud Run
Gunakan file `cloudrun.service.yaml` untuk melakukan deploy secara otomatis:
```bash
gcloud run services replace cloudrun.service.yaml --region REGION
```
*(Ganti `REGION` dengan region Cloud Run pilihan Anda, misalnya `asia-southeast2` untuk Jakarta).*

