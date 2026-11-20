# Autobotz Web Platform

Platform web manajemen dan distribusi bot Telegram otomasi jual-beli akun digital, mendukung model sewa cloud hosting multi-tier dan lisensi script self-hosted.

---

## Arsitektur Sistem & Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS (desain Neo-Brutalist Tech, zero-blur hard shadow, 6 interactive states), Lucide React, Zustand.
- **Backend**: Node.js 18+, Express 5 REST API, restricted CORS allowlist, tiered in-memory rate limiting, helmet security headers.
- **Database & Storage**: Supabase (PostgreSQL 15), Row-Level Security (RLS) terisolasi penuh, bucket privat untuk verifikasi berkas bukti pembayaran.
- **Keamanan & Kriptografi**:
  - Enkripsi simetris **AES-256-GCM** dengan initialization vector (IV) unik dan authentication tag untuk token bot Telegram serta kredensial stok akun.
  - Verifikasi signature **SHA-512** dengan `timingSafeEqual` pada webhook Midtrans untuk mencegah serangan manipulasi pembayaran.
  - Validasi *magic-byte* biner untuk upload bukti bayar (hanya JPG, PNG, WEBP dengan ukuran maksimum 5MB).
  - Fungsi PostgreSQL `public.is_admin()` bertipe `SECURITY DEFINER` untuk mencegah infinite recursion pada evaluasi policy RLS.
  - Trigger PostgreSQL untuk memblokir eskalasi hak akses mandiri pada kolom `role` dan `tier`.

---

## Struktur Direktori

```text
autobotz-web/
├── backend/
│   ├── middleware/
│   │   └── auth.js            # Verifikasi Supabase JWT, RBAC admin, & rate limiter
│   ├── routes/
│   │   ├── admin.js           # Endpoint kelola & verifikasi order admin
│   │   ├── dashboard.js       # Endpoint bot, kategori, akun, transaksi, lisensi
│   │   ├── orders.js          # Pembuatan order & upload bukti transfer manual
│   │   └── public.js          # Health check, daftar paket (plans), webhook Midtrans
│   ├── services/
│   │   └── orders.js          # Logika transaksional aktivasi sewa & lisensi
│   ├── utils/
│   │   └── crypto.js          # Enkripsi AES-256-GCM & validasi magic bytes gambar
│   ├── config.js              # Loader environment variables & inisialisasi klien
│   └── server.js              # Entrypoint server Express & konfigurasi middleware
├── src/
│   ├── api/
│   │   └── client.js          # Klien API terpusat untuk komunikasi frontend-backend
│   ├── components/            # Komponen UI atomik & molekuler (Button, Card, Input, Modal)
│   ├── pages/                 # Halaman Login, Register, Dashboard, Payment, Admin
│   ├── sections/              # Bagian landing page (Hero, Features, Pricing, HowItWorks, FAQ)
│   ├── lib/
│   │   ├── payment.js         # Abstraksi pembayaran client-side
│   │   └── supabase.js        # Inisialisasi Supabase client (anon key)
│   ├── App.jsx                # Router & proteksi rute halaman
│   ├── index.css              # Styling global & token warna Neo-Brutalist
│   └── main.jsx               # Entrypoint React DOM
├── supabase-schema.sql        # Skema DDL tabel, policy RLS, fungsi admin, dan trigger
├── supabase-storage-setup.sql # Konfigurasi storage bucket privat payment-proofs & RLS
├── .env.example               # Template environment variables
├── package.json               # Dependensi & script eksekusi
├── tailwind.config.js         # Konfigurasi Tailwind CSS
└── vite.config.js             # Konfigurasi Vite & reverse proxy pengembangan
```

---

## Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat Sistem
- **Node.js**: versi 18.x atau lebih baru
- **npm** atau **pnpm**
- Akun dan project aktif di [Supabase](https://supabase.com)
- Akun [Midtrans](https://midtrans.com) (opsional, jika ingin mengaktifkan gateway otomatis)

### 2. Kloning Repository & Instalasi Dependensi
```bash
git clone https://github.com/Seeyaa77/autobotz-web.git
cd autobotz-web
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas contoh untuk frontend dan backend:
```bash
cp .env.example .env
cp .env.example .env.backend
```

Sesuaikan nilai variabel:
- **`.env`** (Frontend):
  - `VITE_SUPABASE_URL`: URL project Supabase Anda.
  - `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key publik.
  - `VITE_BACKEND_URL`: Kosongkan saat development lokal (memanfaatkan proxy bawaan Vite).

- **`.env.backend`** (Backend - Rahasia):
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret Supabase untuk bypass RLS pada mutasi admin/order.
  - `BOT_TOKEN_ENC_KEY`: Kunci heksadesimal 64-karakter (32 byte) untuk enkripsi AES-256. Buat dengan perintah:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - `FRONTEND_URL` & `ALLOWED_ORIGINS`: Origin yang diizinkan CORS (`http://localhost:5173`).
  - `MANUAL_BANK_*` & `MANUAL_QRIS_IMAGE_URL`: Konfigurasi rekening transfer manual.
  - `MIDTRANS_*`: Kredensial server key Midtrans (opsional).

### 4. Setup Database & Storage Supabase
1. Buka **SQL Editor** pada Supabase Dashboard Anda.
2. Jalankan seluruh query di [supabase-schema.sql](supabase-schema.sql).
3. Jalankan seluruh query di [supabase-storage-setup.sql](supabase-storage-setup.sql) untuk mengonfigurasi bucket privat `payment-proofs`.
4. Untuk menetapkan akun sebagai admin, jalankan query berikut setelah mendaftar:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'email-admin-anda@example.com';
   ```

### 5. Menjalankan Server Pengembangan
Jalankan frontend dan backend secara bersamaan:
```bash
npm run start
```
Atau jalankan pada dua terminal terpisah:
- **Terminal 1 (Backend Express)**:
  ```bash
  npm run server
  ```
- **Terminal 2 (Frontend Vite)**:
  ```bash
  npm run dev
  ```

Akses aplikasi pada peramban melalui `http://localhost:5173`. Request ke rute `/api` dan `/health` akan diteruskan otomatis oleh proxy Vite ke backend port `5000`.

### 6. Build Produksi
```bash
npm run build
```
Hasil build bundel statis frontend akan tersedia di folder `dist/`.

---

## Daftar Kontrak API (REST Endpoints)

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/health` | Publik | Health check server & status konfigurasi Supabase/Midtrans |
| `GET` | `/api/plans` | Publik | Daftar paket sewa & lisensi script (harga dinamis) |
| `POST` | `/api/payment/webhook` | Publik | Webhook notifikasi pembayaran dari Midtrans |
| `POST` | `/api/orders` | User (JWT) | Pembuatan order baru (kalkulasi harga otoritatif server) |
| `GET` | `/api/orders/mine` | User (JWT) | Daftar order milik pengguna aktif |
| `GET` | `/api/orders/:id` | User (JWT) | Detail status transaksi dan instruksi pembayaran |
| `POST` | `/api/orders/:id/proof` | User (JWT) | Upload berkas bukti transfer manual (JPG/PNG/WEBP maks 5MB) |
| `GET` | `/api/dashboard` | User (JWT) | Ringkasan metrik dashboard, kuota sewa, dan bot aktif |
| `GET` | `/api/bots` | User (JWT) | Daftar instance bot Telegram pengguna |
| `POST` | `/api/bots` | User (JWT) | Registrasi bot baru (validasi token Telegram & enkripsi token) |
| `POST` | `/api/bots/:id/start` | User (JWT) | Menjalankan instance bot Telegram |
| `POST` | `/api/bots/:id/stop` | User (JWT) | Menghentikan instance bot Telegram |
| `GET` | `/api/categories` | User (JWT) | Daftar kategori produk jualan bot pengguna |
| `GET` | `/api/accounts` | User (JWT) | Daftar inventori akun digital pengguna |
| `POST` | `/api/accounts` | User (JWT) | Tambah stok kredensial akun digital (terenkripsi AES-256) |
| `GET` | `/api/transactions` | User (JWT) | Riwayat transaksi bot dan saldo pengguna |
| `GET` | `/api/license` | User (JWT) | Cek status lisensi dan unduh script (Signed URL 10 menit) |
| `PUT` | `/api/me` | User (JWT) | Perbarui informasi profil pengguna |
| `GET` | `/api/admin/orders` | Admin | Daftar order tertunda yang membutuhkan verifikasi manual |
| `POST` | `/api/admin/orders/:id/approve` | Admin | Setujui order manual & aktifkan masa sewa/lisensi otomatis |
| `POST` | `/api/admin/orders/:id/reject` | Admin | Tolak order dengan alasan penolakan |

---

## Keamanan & Verifikasi

- **Anti-Price Tampering**: Klien tidak dapat menentukan nominal pembayaran secara mandiri. Harga divalidasi otoritatif oleh server berdasarkan tier paket di database.
- **Proteksi Berkas Privat**: Bukti pembayaran disimpan pada bucket privat berproteksi RLS; akses admin menggunakan Signed URL sementara berbatas waktu 10 menit.
- **Isolasi Kredensial**: File `.env` dan `.env.backend` tidak pernah dilacak ke dalam version control dan diabaikan secara ketat oleh `.gitignore`.

---

## Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).