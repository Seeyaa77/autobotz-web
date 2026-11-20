# Project Profile — Autobotz Web

## Product Language
- **Bahasa Produk:** Bahasa Indonesia (id-ID) untuk antarmuka publik, portal pembayaran, panduan seller, bot Telegram copy, dan dashboard operasional merchant/admin.
- Istilah teknis universal tetap dipertahankan secara wajar (e.g., *API*, *QRIS*, *Webhook*, *Token*, *Source Code*, *Cloud Hosting*, *JWT*, *SLA*).

## Output Target
- **Tech Stack:** React 18 (Vite SPA) + Tailwind CSS v3 + CSS 3D Transforms & IntersectionObserver Scroll Motion + Lucide Icons + Supabase JS Client + Custom Fetch Client (`/api` proxy).
- Lokasi kode: `src/` (`src/components/`, `src/pages/`, `src/sections/`, `src/lib/`, `src/api/`).

## Fonts Stance
- **Brand Wordmark:** `Matcha Style` (`font-brand`) untuk logo Autobotz.
- **Heading / Titles:** `Space Grotesk` (`font-heading`, bold 700 / extrabold 800, `tracking-tight`).
- **Body / Interface:** `Plus Jakarta Sans` (`font-sans`, regular 400 / medium 500 / semibold 600).
- **Code / Monospace / Numbers / Badges:** `JetBrains Mono` (`font-mono`, uppercase tracking-wider untuk SKU, order ID, saldo IDR, token bot, status).

## Icons Stance
- **Library:** `lucide-react` (stroke width 2px, konsisten, ukuran grid 16px, 20px, 24px) ditambah SVG autentik khusus elemen UI Telegram (ekor balon pesan, centang ganda, pola wallpaper, QRIS mini).
- **Veto Keras Ikon:** Dilarang keras memakai `<Sparkles />`, magic wand, atau simbol "bintang ajaib" generik AI sebagai dekorasi tombol, judul, atau fitur bisnis biasa.
- **Container Ikon:** Dilarang membungkus setiap ikon dalam kotak seragam bergradien/berwarna (`w-12 h-12 rounded-xl bg-pink-100`). Ikon harus terintegrasi alami dengan teks atau bertindak sebagai penanda visual fungsional.

## Illustration & Motion Stance
- **Pendekatan Visual:** Zero AI-slop generative art. Tidak menggunakan ilustrasi 3D clay generik, robot kartun tanpa konteks, atau bola blur dekoratif (`blur-3xl`).
- **3D Scroll & Interactive Motion (User Directive):**
  - Menggunakan **3D Perspective Scroll Reveal** (`perspective: 1200px`, `rotateX`, `translate3d`, `scale`) saat pengguna menggulir halaman (*scroll*).
  - Menggunakan **Interactive 3D Tilt & Multi-Layer Parallax (`preserve-3d`, `translateZ`)** pada mockup aplikasi Telegram di Hero, terminal simulasi di BotDemo, dan kartu bento/pricing saat berinteraksi.
  - Tetap menghormati `prefers-reduced-motion: reduce` untuk aksesibilitas.
- **Simulasi UI Telegram Autentik (User Directive):**
  - Komponen preview di `Hero.jsx` dan `BotDemo.jsx` wajib merepresentasikan **antarmuka aplikasi Telegram asli** (Telegram Night Theme `#0E1621` / `#17212B`, header profil bot dengan status *online* / *sedang mengetik...*, bar pesan tersemat, balon pesan dengan ekor SVG `#182533` & `#2B5278`, centang baca ganda biru `#64B5EF`, **Inline Keyboard terpisah di bawah balon pesan** sesuai standar Bot API Telegram, indikator mengetik 3 titik, serta bar input bawah dengan tombol menu perintah `[/]`).

## Starting Vetoes
1. Dilarang menggunakan `<Sparkles />` pada header, tombol, pricing, atau section judul.
2. Dilarang menggunakan bola blur dekoratif (`bg-brand-pink/20 blur-3xl` dsb.) di latar belakang.
3. Dilarang menggunakan badge miring (`-rotate-1` / `-rotate-2`) yang hanya mengulang teks judul section.
4. Dilarang menggunakan layout cermin (pola repetitif seragam: badge tengah + H2 tengah + grid 3 kolom identik di setiap section).
5. Dilarang membungkus seluruh ikon ke dalam kotak warna-warni seragam (*tinted squares*).
6. Dilarang menggunakan `backdrop-blur` pada header utama di atas latar belakang solid flat.
7. Dilarang membuat preview bot yang terlihat seperti kotak kartu biasa atau menaruh tombol inline keyboard di dalam kotak teks pesan; wajib mengikuti anatomi UI Telegram asli.
