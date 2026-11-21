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


### Tambahan 2026-11-21 (Motion v3 — masukan user "animasi frame to frame, Langkah 04 tidak seperti Telegram")
**Choices**
- Animasi 4 Langkah harus **mengalir kontinu** (timeline CSS per kartu, stagger 600ms, hold + fade reset), bukan pergantian state.
- Langkah 04 wajib berupa **jendela chat Telegram mini yang otentik** (header bot, bubble ber-tail, jam + ✓✓ di dalam bubble, inline button terpisah, service pill "Pembayaran diterima", spoiler kredensial).
- Simulator Telegram utama ditambah detail asli: tail bubble, status "bot"/"mengetik", avatar inisial gradien, ripple tombol inline, toast callback gaya Telegram, swap Mic↔Send, spoiler, smooth scroll.

**Vetoes**
- ❌ Jam global `setInterval` yang membuat semua panggung melompat serentak.
- ❌ Teks status yang berganti instan tanpa crossfade; progress bar berbasis `width` yang meloncat.
- ❌ Font mono & border neon di dalam bubble chat Telegram; header "AUTO-DELIVERY ENGINE".
- ❌ Dot online hijau & chip "BOT" pada header bot Telegram (tidak ada di Telegram asli).
- ❌ Pill "SIMULASI ALUR 3D AKTIF (FASE x/3)" — dekoratif.


### Tambahan 2026-11-21 (Hero Palette Brand-Native & Walking Robots Background)
**Choices**
- **Palet Hero 100% Brand Autobotz (Bukan FluxCode):** Outer veil `#111217` (`brand-dark`) membuka ke latar terang Neo-Brutalist (`#FFF9FA → #FFF0F3 → #ECFDF5` + grid titik tipis), teks `#111217`, aksen `#FD1843` (`brand-pink`) & `#10B981` (`brand-mint`), strip metrik putih solid `border-2 border-brand-dark`.
- **Latar Robot Berjalan:** 3 jalur kedalaman berisi robot SVG geometris Neo-Brutalist ringan yang berjalan kontinu dengan ayunan kaki & *body bob* halus di dalam `.fh-scene` (`opacity 0.14–0.22`, `pointer-events: none`, pause di luar layar, statis saat `prefers-reduced-motion`).

**Vetoes**
- ❌ Menyalin warna langit senja FluxCode (navy/indigo `#0a0f2c`/`#1d2554`, glow peach `#F6C991`, bintang `.fh-stars`, atau dark frosted glass strip).
- ❌ Robot 3D clay generik AI atau robot ber-opacity terlalu pekat yang menabrak keterbacaan teks Hero.


### Tambahan 2026-11-21 (Pivot Desain ke Dark Industrial Glassmorphism & 3D Industrial Robots)
**Choices**
- **Pivot Estetika Penuh ke Dark Industrial Glassmorphism:** Menggantikan Neo-Brutalism (kartu putih + border hitam tebal + shadow kotak solid) di seluruh website menjadi permukaan kaca gelap semi-transparan (`bg-[#121621]/55–70`, `backdrop-blur-md/xl`, border specular tipis `border-white/[0.09–0.14]`, latar `#090B10`) dengan aksen resmi Autobotz (`#FD1843`, `#10B981`, `#3897F0`).
- **Robot Latar 3D Industrial:** Menggunakan robot 3D metalik terartikulasi (Three.js prosedural dengan pencahayaan PBR gunmetal/titanium & rim light crimson/biru) yang berjalan di latar belakang Hero, menggantikan 2D SVG flat.

**Vetoes**
- ❌ Mempertahankan sisa kartu putih Neo-Brutalist (`bg-white border-2 border-brand-dark shadow-brutalist`) yang bentrok dengan Hero gelap/glassmorphism.
- ❌ Robot 2D gepeng atau robot kartun 3D clay imut — wajib bernuansa **3D industrial robotics**.
- ❌ Glassmorphism buram ber-kontras rendah atau bola neon ungu generik AI.


### Tambahan 2026-11-21 (Beat 3 = Arsitektur & Keamanan, Pose Duduk Realistis, Kabut Awan Volumetrik)
**Choices**
- **Beat 3 Spotlight = `ARSITEKTUR & KEAMANAN`:** Mengganti panel filler `AUTOBOTZ LIVE INFRASTRUCTURE` dengan 4 modul inti Arsitektur & Keamanan (tanpa duplikasi section di bawah Hero).
- **Kontak Duduk Fisik Realistis:** Pinggul robot menempel tepat di `rect.top` tombol `Sewa Bot Cloud`, paha mendatar di atas tombol, kaki menggantung ke depan, tangan menumpu tepi tombol, plus *contact shadow* di permukaan tombol.
- **Kabut Awan Volumetrik Nyata:** Kombinasi 3D WebGL mist sprites (`z = -4.5..+1.8`) + cumulus CSS bertekstur + hamparan kabut bawah permanen agar latar robot tidak pernah polos setelah tirai depan membelah.

**Vetoes**
- ❌ Panel filler `AUTOBOTZ LIVE INFRASTRUCTURE` yang informasinya kurang penting.
- ❌ Robot terlihat melayang di dekat tombol tanpa *contact shadow* atau pose menumpu yang jelas.
- ❌ Background polos tanpa kabut setelah tirai awan depan memudar.


### Tambahan 2026-11-21 (Upgrade Kualitas Awan Setara FluxCode — Anti Awan AI/Blobby)
**Choices**
- **Awan Detail Berlapis Tanpa Blur Murahan:** Menggunakan 3 lapis awan transparan beresolusi tinggi (`cloud-far` `2000×360`, `cloud-mid` `2400×560`, `cloud-front` `1500×820` dicerminkan kiri–kanan) dengan tepi berserat tajam (*wispy cumulus*, `filter: none`, *directional sunrise lighting* puncak terang & dasar bayangan gelap), atau GLSL 6-octave fBM shader.

**Vetoes**
- ❌ Sprite awan lingkaran radial berulang (`256×256` cotton-ball) yang terlihat artifisial/seperti hasil generate AI.
- ❌ Kurva awan SVG gelombang dengan CSS `filter: blur(6px–8px)` yang tampak seperti kartun/plastik.
