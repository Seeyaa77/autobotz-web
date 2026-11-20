# Project Recipes — Autobotz Design System Ruler

Sumber kebenaran mutlak untuk token desain visual, tipografi, aturan stabilitas klik UI Telegram, desain tombol ikon perbesar di ujung kanan, serta spesifikasi animasi 3D yang mulus & detail pada 4 Langkah Teknis bagi implementasi Frontend (Sugeng).

---

## 1. Aturan Kritis UI Telegram (`TelegramSimulator.jsx`, `Hero.jsx`, `BotDemo.jsx`)

### A. Larangan Hover Tilt pada Kontainer UI Telegram (Usability First)
- Pada `Hero.jsx` dan `BotDemo.jsx`, komponen `<ScrollReveal3D>` yang membungkus `<TelegramSimulator />` **WAJIB menggunakan `tilt={false}`**.
- Pada modal perbesar di `TelegramSimulator.jsx`, **HAPUS handler `onMouseMove` / `modalTilt`**. Jendela Telegram harus **100% diam dan stabil saat kursor bergerak di atasnya** sehingga semua tombol inline keyboard dan input chat sangat mudah diklik.

### B. Tombol Ikon Perbesar di Ujung Kanan Header Telegram
- Letakkan tombol ikon perbesar (`Maximize2` saat normal, `Minimize2` saat diperbesar) di **paling ujung kanan** grup ikon header Telegram (setelah tombol `Reset` dan ikon telepon/pencarian).
- **Kelas Tailwind Tombol Ikon Perbesar:**
  - **Default:** `w-8 h-8 rounded-lg bg-[#232E3C] text-[#9AA9B8] border border-white/10 inline-flex items-center justify-center transition-all duration-200 cursor-pointer` (tanpa warna merah, tanpa teks panjang).
  - **Hover (Mencolok saat di-hover):** `hover:bg-[#3897F0] hover:text-white hover:border-white hover:scale-110 hover:shadow-[0_0_14px_rgba(56,151,240,0.75)]`
  - **Active:** `active:scale-95`
  - **Tooltip:** `title={inModal ? "Kecilkan tampilan (ESC)" : "Perbesar tampilan chat"}`

### C. Modal Perbesar 3D yang Simpel & Bersih (Tanpa Warna Merah Berlebihan)
- **Backdrop:** `fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 stage-3d`
- **Kontainer Jendela Telegram di Tengah:**
  - **HAPUS** bar header ekstra (`✦ MODE SIMULASI TELEGRAM 3D...`) di luar jendela Telegram.
  - **HAPUS** bayangan merah `shadow-[10px_10px_0px_0px_#FD1843]`.
  - Gunakan bingkai bersih aplikasi Telegram: `w-full max-w-2xl mx-auto bg-[#17212B] border-2 border-[#2B3948] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden tg-modal-3d-enter`.
  - Animasi masuk ke tengah layar tetap halus menggunakan perspektif 3D (`tgModal3DCenter` selama `420ms cubic-bezier(0.22, 1, 0.36, 1)`), lalu berhenti stabil di `rotateX(0deg) rotateY(0deg)` agar nyaman dioperasikan.

---

## 2. Spesifikasi Baru: "Toko Bot Telegram Aktif dalam 4 Langkah Teknis" (`HowItWorks.jsx`)

Untuk menjawab masukan user agar **lebih bagus, smooth, dan penyampaiannya jelas serta detail**:

### A. Struktur Layout & Hierarki Informasi
- **Grid 2 Kolom (2x2 Bento Cards):** `grid grid-cols-1 md:grid-cols-2 gap-6` (lebih lega dibanding 4 kolom sempit, dan **`tilt={false}`** agar kartu tidak goyang saat dibaca).
- **Anatomi Setiap Kartu Langkah:**
  1. **Header Langkah:** Badge nomor langkah (`LANGKAH 01`, `02`, `03`, `04`), estimasi waktu (`⏱️ ~1 Menit`, `⏱️ ~30 Detik`, `⏱️ ~2 Menit`, `⚡ Aktif 24/7`), dan ikon langkah.
  2. **Panggung Visual Animasi 3D Smooth (`h-40 rounded-xl bg-[#0E1621] border-2 border-brand-dark p-4 relative overflow-hidden stage-3d`)**: Menggunakan transisi *smooth ease-in-out* (`4s–5s` per siklus) dengan indikator tahapan yang jelas.
  3. **Judul & Deskripsi Utama:** Penjelasan ringkas namun komprehensif.
  4. **Detail 3 Poin Teknis (Input → Proses → Output):** Kotak ringkasan `bg-brand-surface-tint/60 border border-brand-dark/20 rounded-xl p-3 space-y-1.5 text-xs` yang memuat 3 poin konkret per langkah sehingga alur kerjanya sangat jelas bagi calon penyewa/pembeli script.

### B. Desain & Animasi 3D Smooth untuk Keempat Langkah

1. **Langkah 01: `Pilih Paket & Verifikasi Order` (Smooth 3D ATM / Debit Card Swipe & Payment Verification)**
   - **Visual 3D:**
     - **Mesin Slot Reader Terminal** di sisi atas/tengah dengan indikator LED & layar status (`MENUNGGU PEMBAYARAN` → `MEMBACA CHIP EMV...` → `✓ ORDER #ORD-8821 AKTIF`).
     - **Kartu ATM / Debit 3D Premium** (warna Dark Slate/Navy `#1E293B` dengan aksen garis `#3897F0` & `#10B981`, chip emas EMV `bg-brand-amber`, ikon gelombang *contactless*, nomor `4532 •••• 8821`, nama `AUTOBOTZ MERCHANT`) yang meluncur menggesek secara **sangat mulus** (`cubic-bezier(0.45, 0.05, 0.55, 0.95)`, durasi `4.2s`) melewati slot reader dalam perspektif 3D (`perspective(800px) rotateX(16deg)`), diikuti gelombang konfirmasi hijau `LUNAS • Rp 299.000`.
   - **3 Detail Penyampaian:**
     - **Pilihan Paket:** Sewa Cloud (Starter 99K / Pro 299K / Enterprise 999K) atau Beli Full Script (300K sekali bayar).
     - **Metode Bayar:** Mendukung kartu/QRIS otomatis via Midtrans Snap maupun transfer bank dengan validasi bukti gambar.
     - **Output Instan:** Kuota hosting bot atau lisensi unduhan source code langsung terbuka di akun Anda.

2. **Langkah 02: `Hubungkan Token @BotFather` (Smooth 3D Token Pipeline & AES-256-GCM Handshake)**
   - **Visual 3D:**
     - Diagram 3-Node 3D (`@BotFather` → `AES-256-GCM Vault` → `Webhook Aktif`) yang dihubungkan jalur pipa bercahaya.
     - Kapsul token (`719283:AAF9x...`) bergerak mulus melintasi jalur 3D: saat melewati node tengah, teks token berubah menjadi blok terenkripsi (`enc:v1:9f8a...`) dengan rotasi perisai 3D yang lembut, lalu menyalakan indikator hijau `getMe: 200 OK (@TokoAnda_bot)` di node kanan.
   - **3 Detail Penyampaian:**
     - **Input Mudah:** Buat bot gratis di `@BotFather` Telegram, lalu salin & tempel API Token ke form Dashboard.
     - **Verifikasi & Enkripsi:** Backend memanggil API `getMe` Telegram secara otomatis lalu mengenkripsi token dengan `AES-256-GCM`.
     - **Output Instan:** Webhook otomatis terdaftar tanpa perlu setting VPS, domain, atau SSL manual.

3. **Langkah 03: `Input Kategori & Stok Kredensial` (Smooth 3D Isometric Inventory Vault & Live Stock Lock)**
   - **Visual 3D:**
     - Tampilan kartu tabel stok 3D miring isometrik halus (`perspective(800px) rotateX(10deg)`) yang menampilkan 3 baris produk nyata (`Netflix 4K Private • 38 Stok`, `Canva Pro Lifetime • 124 Stok`, `Telegram Old 2021 • 19 Stok`) dengan animasi scanner baris (*smooth highlight sweep*) yang mengunci setiap kredensial (`IV + Auth Tag Sealed`) dan counter total stok aktif.
   - **3 Detail Penyampaian:**
     - **Multi-Kategori:** Buat kategori produk bebas (akun streaming, aplikasi desain, voucher game, akun sosmed).
     - **Input Massal & Aman:** Masukkan detail `email | password | pin` — langsung dienkripsi sebelum masuk ke tabel PostgreSQL.
     - **Output Instan:** Katalog dan jumlah stok langsung tampil real-time pada tombol menu bot Telegram Anda.

4. **Langkah 04: `Bot Siap Melayani Buyer 24/7` (Smooth 3D Auto-Fulfillment Dispatch `< 1.8 Detik`)**
   - **Visual 3D:**
     - Panggung 3-Tahap pengiriman otomatis dengan *smooth progress beam*:
       1. Node `Buyer Bayar QRIS`
       2. Node `Atomic Stock Lock` (mencegah *double-sell*)
       3. Balon Chat Telegram 3D yang muncul halus menampilkan `🔓 Akun Terkirim (1.4 dtk)` beserta tanda centang ganda biru.
   - **3 Detail Penyampaian:**
     - **Belanja Mandiri 24/7:** Pembeli memilih produk dari inline keyboard bot dan menerima tagihan QRIS kapan saja.
     - **Anti Double-Sell:** Sistem mengunci 1 unit stok saat invoice terbit dan mendekripsinya begitu callback pembayaran valid.
     - **Output Instan:** Kredensial akun dikirim ke chat pembeli dalam `< 3 detik` dan omset tercatat di Dashboard Anda.

---

## 3. Interactive Component States (Spesifikasi 6 State Lengkap)

| Komponen | Default | Hover / Focus | Active | Disabled | Loading / Skeleton | Empty / Error |
|---|---|---|---|---|---|---|
| **Telegram Simulator Window** | **100% Stabil (`tilt={false}`)**; tidak bergeser saat kursor masuk ke area chat | Tombol inline menyala `hover:bg-[#2B3948]`; ikon perbesar di ujung kanan menyala `hover:bg-[#3897F0] hover:text-white hover:scale-110` | Klik ikon ujung kanan membuka modal tengah layar yang bersih (tanpa frame merah) | Tombol inline nonaktif selama bot mengetik (`disabled:opacity-50`) | Header `"sedang mengetik..."` + 3 titik biru berdenyut | Klik `Reset` atau `ESC` menutup modal / mereset chat |
| **4 Langkah Teknis (`HowItWorks.jsx`)** | Grid 2x2 stabil (`tilt={false}`) dengan panggung animasi 3D *smooth* & 3 poin detail per langkah | Border kartu menebal/highlight halus tanpa membuat kartu bergoyang miring | Klik pada panggung visual 3D menyorot tahapan aktif | `prefers-reduced-motion` menonaktifkan loop gerak | Skeleton box `h-40 bg-gray-200 animate-pulse` | N/A |
