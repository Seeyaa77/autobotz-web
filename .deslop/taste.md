# User Taste & Anti-Slop Directives — Autobotz Web

## Screen Roles (5 Layar Utama)

### 1. Landing Page (`/`)
> *This screen exists to explain Autobotz's core value proposition (automated Telegram bot rental & open-source script purchase) with verified live proof, smooth scroll motion, and an authentic, rock-steady Telegram UI simulation that guides sellers directly to choosing a plan. It is not the screen for managing bots or editing account inventory.*

### 2. Auth Login & Register (`/login`, `/register`)
> *This screen exists to authenticate merchants quickly and securely via Supabase JWT with clear feedback on credentials. It is not the screen for marketing pitch or complex multi-step onboarding.*

### 3. Payment Checkout (`/payment`)
> *This screen exists to process payment for a selected plan (Starter, Pro, Enterprise, or Script) via server-generated order, provide exact payment instructions (QRIS image, manual bank accounts, or Midtrans Snap), and accept payment proof uploads (JPG/PNG/WEBP <= 5MB) with immediate status feedback. It is not the screen for exploring features or configuring bot tokens.*

### 4. Merchant Dashboard (`/dashboard`)
> *This screen exists to give active merchants operational control over their Telegram bots (start/stop/token setup), real-time revenue analytics, account inventory stock, transaction audit logs, and script license download. It is not the screen for public checkout or platform-wide admin approvals.*

### 5. Admin Order Verification (`/admin`)
> *This screen exists to allow authorized administrators (`profiles.role = 'admin'`) to review pending payment proofs via 10-minute temporary signed URLs and immediately approve or reject orders with structured reasons. It is not the screen for managing merchant bot instances or public browsing.*

---

## Choices (Keputusan & Permintaan Eksplisit User)

1. **UI Telegram Stabil Tanpa Gerak/Goyang Saat Di-Hover (2026-11-21):**
   - **Wajib `tilt={false}` pada seluruh kontainer `TelegramSimulator`** (baik di `Hero.jsx`, `BotDemo.jsx`, maupun di dalam modal Perbesar).
   - Jendela UI Telegram **tidak boleh bergerak/miring saat kursor di-hover** agar pengguna dapat mengklik tombol inline keyboard, menu perintah, dan input chat dengan sangat mudah dan presisi (Fitts's Law).
2. **Tombol Perbesar Minimalis Berupa Ikon di Ujung Kanan Header Telegram & Modal Sederhana Tanpa Warna Merah Berlebihan (2026-11-21):**
   - **Tombol Perbesar di Header Telegram:** Hanya menggunakan **ikon saja (`Maximize2` / `Minimize2`) yang diletakkan paling ujung kanan** pada header aplikasi Telegram.
     - *Default:* Menyatu rapi dengan header gelap Telegram (`bg-[#232E3C] text-[#9AA9B8] border border-white/10`).
     - *Hover (Mencolok saat di-hover):* Menyala tegas dengan aksen biru terang Telegram / putih (`hover:bg-[#3897F0] hover:text-white hover:border-white hover:scale-110 hover:shadow-[0_0_14px_rgba(56,151,240,0.75)]`).
   - **Tampilan Modal Perbesar (`isExpanded3D`):** Dipersimpel, **tanpa banner tambahan di atasnya** dan **tanpa bayangan/blok merah (`#FD1843`) yang mencolok**. Cukup menampilkan jendela aplikasi Telegram yang meluncur halus ke tengah layar (`tgModal3DCenter`) di atas backdrop gelap transparan (`bg-black/80 backdrop-blur-xs`).
3. **Penyempurnaan Visual, Kelancaran (*Smoothness*), & Detail Penjelasan pada "Toko Bot Telegram Aktif dalam 4 Langkah Teknis" (`HowItWorks.jsx`) (2026-11-21):**
   - Gunakan layout **Grid 2x2 yang lega (`grid-cols-1 md:grid-cols-2 gap-6`)** dengan `tilt={false}` agar kartu stabil saat dibaca.
   - Setiap langkah wajib menampilkan **panggung animasi 3D yang mulus (*smooth easing*) & terstruktur** serta **3 rincian informasi konkret (Input Merchant → Proses Otomatis Sistem → Hasil Akhir + Estimasi Waktu)**:
     - **Langkah 01 (`Pilih Paket & Verifikasi Order`)**: Animasi **3D Gesek Kartu ATM/Debit** yang mulus melewati slot terminal reader pembayaran dengan tahapan status sinkron (`1. Gesek Kartu / Scan QRIS` → `2. Validasi Mutasi & Nominal` → `3. Lisensi & Slot Bot Aktif`).
     - **Langkah 02 (`Hubungkan Token @BotFather`)**: Animasi **Alur 3-Node Handshake 3D** yang memperlihatkan aliran token dari `@BotFather` → `Enkripsi AES-256-GCM (IV + Auth Tag)` → `Webhook Telegram getMe 200 OK`.
     - **Langkah 03 (`Input Kategori & Stok Kredensial`)**: Animasi **3D Brankas Katalog Multi-Kategori** yang menampilkan baris stok nyata (`Netflix 4K`, `Canva Pro`, `Spotify`) terkunci satu per satu ke dalam database terenkripsi beserta total unit siap jual.
     - **Langkah 04 (`Bot Siap Melayani Buyer 24/7`)**: Animasi **Timeline Pengiriman Otomatis 3 Tahap (`< 1.8 Detik`)** dari *Buyer Bayar QRIS* → *Kunci Stok Atomik* → *Kredensial Terkirim ke Chat Telegram*.
4. **Selektif Animasi Angka pada Trust Metrics Strip (`Hero.jsx`):**
   - Hanya `< 3.0 dtk` dan `100% Open` yang dianimasikan hitung naik (*count-up*). `AES-256` dan `QRIS & Bank` tetap statis.
5. **Animasi Live Cipher Scrambler di `02 / CRYPTO VAULT` (`Features.jsx`) & CLI Terminal di `LOG EKSEKUSI SERVER` (`BotDemo.jsx`):**
   - Tetap dipertahankan dengan transisi halus dan informatif.

---

## Rejections / Vetoes (Hal yang Ditolak)

1. **Efek Goyang / 3D Tilt Saat Hover pada Jendela Chat Telegram (2026-11-21):**
   - **Ditolak keras oleh user** karena membuat tombol di dalam UI Telegram bergeser dan sulit diklik.
2. **UI Modal Perbesar yang Merah Mencolok & Berlebihan (2026-11-21):**
   - **Ditolak oleh user.** Hapus bayangan merah besar (`shadow-[10px_10px_0px_0px_#FD1843]`), hapus tombol merah `"Perbesar 3D"` bertulisan panjang di tengah header, dan hapus bar judul tambahan di atas modal.
3. **Animasi 4 Langkah Teknis yang Sempit, Patah-Patah, dan Kurang Informatif (2026-11-21):**
   - **Ditolak oleh user.** Harus diperluas menjadi kartu 2x2 yang detail, animasi 3D mengalir mulus (*smooth*), dan penjelasan teknisnya lengkap.
4. **Badge `"SLA 99.9% ONLINE"` di `Header.jsx` & 12 Sinyal AI-Slop:** Tetap dilarang.
