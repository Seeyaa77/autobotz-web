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


---

## 4. Motion v3 — "4 Langkah Teknis" + Detail Telegram (2026-11-21, MENGGANTIKAN §2B)

### A. Diagnosis kenapa terasa "frame to frame" (kode saat ini)
1. `HowItWorks.jsx` memakai **satu `setInterval` 1450ms** → `phase` 0/1/2 melompat; keempat kartu berganti **serentak** (seperti slideshow).
2. Label status (`{phase === 0 && '...'}`) **berganti instan** tanpa crossfade → mata membaca "kedipan".
3. Progress bar memakai `width` 15%→65%→100% (layout property, melompat per fase), bukan gerak linier kontinu.
4. `transition: all` + `perspective()` di tiap elemen → transisi warna/border/shadow ikut bergerak, terasa berat.
5. Tidak ada jeda "hold" & tidak ada reset halus: fase 2 → 0 langsung snap balik.
6. Kode masih `lg:grid-cols-4` + `tilt={true} maxTilt={4}` (belum sesuai spec §2A: 2x2, `tilt={false}`).

### B. Aturan motion baru (wajib)
- **Hapus `useState(phase)` + `setInterval`.** Setiap panggung punya **timeline CSS `@keyframes` sendiri** (loop kontinu, browser yang interpolasi 60fps).
- **Stagger antar kartu:** `animation-delay: calc(var(--i) * 600ms)` → kartu tidak pernah berganti bersamaan.
- **Hanya animasikan `transform` dan `opacity`** (plus `filter: blur` untuk spoiler). Dilarang `transition: all`, `width`, `top/left`.
- **Satu perspektif per panggung:** `.stage-3d { perspective: 900px; }` di container; elemen anak cukup `translate3d/rotateX/rotateY` (tanpa `perspective()` di transform).
- **Teks status = tumpukan crossfade**, bukan swap: 3 `<span>` absolute di slot yang sama, masing-masing keyframe `opacity 0→1→0` + `translateY(6px→0→-6px)` 280ms.
- **Progress = `scaleX` linier** dengan `transform-origin: left`, durasi = durasi fase (bukan loncat).
- **Struktur loop setiap timeline:** `masuk (ease-out) → aksi (linear/ease-in-out) → hasil (spring overshoot) → HOLD ≥1.2s → fade-out 400ms → ulang`. Tidak ada snap balik.
- **Pause saat di luar layar:** `IntersectionObserver` (threshold 0.25) set `data-play="on|off"` → `[data-play="off"] * { animation-play-state: paused; }`.
- **`prefers-reduced-motion`:** semua animasi `none`, tampilkan frame akhir (hasil) secara statis.
- **Kartu step:** `tilt={false}`, grid `grid-cols-1 md:grid-cols-2 gap-6`, panggung `h-52` (dari `h-44`) agar Langkah 04 muat 3–4 bubble.

**Token easing (tambahkan ke `index.css` `:root`):**
```css
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);     /* masuk */
--ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);     /* perpindahan */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);  /* stempel/hasil, overshoot kecil */
--ease-tg:       cubic-bezier(0.2, 0.8, 0.2, 1);     /* bubble Telegram */
```

### C. Caption tahapan di bawah setiap panggung (kejelasan penyampaian)
Baris 3 segmen tepat di bawah panggung, sinkron dengan timeline yang sama:
`[● Bayar] ── [○ Validasi] ── [○ Aktif]`
- Container: `mt-2 grid grid-cols-3 gap-1.5 font-mono text-[10px]`
- Segmen: `relative h-6 rounded-md bg-brand-dark/5 overflow-hidden flex items-center justify-center text-brand-muted`
- Fill aktif: `absolute inset-0 bg-brand-mint/25 origin-left` dengan keyframe `scaleX 0→1` pada rentang waktu fasenya; teks segmen aktif `text-brand-dark font-bold`.
- Label per langkah: 01 `Gesek kartu · Baca chip · Order aktif` · 02 `Tempel token · getMe 200 · Tersegel` · 03 `Input stok · Enkripsi · Siap jual` · 04 `Bayar QRIS · Kunci stok · Terkirim`.
- **Hapus pill `SIMULASI ALUR 3D AKTIF (FASE x/3)`** di header section (tidak lagi ada jam global; pill ini dekoratif).

### D. Timeline per langkah

**01 — Gesek Kartu (loop 6.0s)**
| % | Kejadian | Easing |
|---|---|---|
| 0–15 | Kartu masuk dari kiri `translate3d(-120%,8px,0) rotateY(-22deg)` → `(-40%,0,20px) rotateY(-8deg)` | ease-out-soft |
| 15–38 | **Gesekan**: `translateX(-40%→45%)` kecepatan konstan, `rotateZ(-1deg→1deg)`; LED reader amber berkedip 2×; progress `scaleX 0→1` | linear |
| 38–55 | Kartu melambat & sedikit naik (`translateZ 28px`), label "Membaca chip EMV…" + spinner 12px | ease-inout |
| 55–68 | LED hijau, stempel `✓ ORDER LUNAS` `scale(0.6)→1.08→1`, `opacity 0→1` | ease-spring |
| 68–90 | HOLD | — |
| 90–100 | Semua `opacity→0`, kartu `translateX→120%` | ease-inout |
- Kartu: hapus gradien merah `from-[#FD1843]` → `bg-[#1E293B] border border-white/15`, garis aksen 2px `#3897F0`, chip `bg-brand-amber`, bayangan `0 10px 24px rgba(0,0,0,.45)` (bukan brutalist hitam, agar terasa fisik saat 3D).
- Shine: pseudo `::after` gradien putih 12% sweep `translateX(-100%→200%)` saat 15–38%.

**02 — Token Handshake (loop 6.5s)** — 3 node horizontal: `@BotFather` → `🔒 AES-256-GCM` → `getMe 200`
| % | Kejadian |
|---|---|
| 0–12 | Kapsul token muncul di node 1 (`scale 0.9→1`), teks `7192837492:AAF9xL0…` diketik (steps(18)) |
| 12–35 | Kapsul bergerak ke node 2 sepanjang garis putus-putus (`translateX`, ease-inout); garis di belakangnya terisi biru (`scaleX`) |
| 35–52 | Di node 2: teks **di-scramble** (reuse scrambler `Features.jsx`, 60ms/tick, 10 tick) → `enc:v1:9f8a…`; perisai `rotateY(0→180deg)` |
| 52–70 | Kapsul ke node 3, node 3 pulse hijau sekali (`box-shadow` via pseudo opacity), badge `200 OK` spring |
| 70–92 | HOLD, footer `✓ Webhook terpasang` fade-in |
| 92–100 | fade-out |

**03 — Brankas Stok (loop 6.0s)**
- Garis scanner `h-[2px] bg-brand-mint shadow-[0_0_10px_#10B981]` sweep `translateY(0→100%)` 0–60%, linear.
- Tiap baris "terkunci" saat scanner lewat: delay baris = `i × 0.9s`; baris `translateZ(0→16px)` lalu kembali, ikon `Lock` pop (`scale 0→1.15→1`, ease-spring), border beralih ke `brand-mint` via **overlay opacity** (bukan transisi border).
- Counter header `181 UNIT` naik halus dari 0 (count-up 900ms, hanya sekali per loop).
- 60–90% HOLD, 90–100% reset fade.

**04 — Bot Siap Melayani Buyer 24/7 → Mini Telegram ASLI (loop 9.0s)**
Panggung diganti total menjadi **jendela chat Telegram mini** (font **sans**, bukan mono):
```
┌──────────────────────────────────────────┐
│ ←  (A) Autobotz Store ✓        ⋮         │  header #17212B, h-10
│        bot  →  "mengetik…"               │  status #64B5EF / #7F91A4
├──────────────────────────────────────────┤
│ ░░░ wallpaper #0E1621 + pola doodle ░░░ │
│                 ┌──────────────────┐     │
│                 │ /beli netflix    │◢    │  outgoing #2B5278 + tail
│                 │      14:02 ✓✓    │     │
│                 └──────────────────┘     │
│ ◣┌──────────────────────────┐            │
│  │ 🧾 Invoice #INV-8821     │            │  incoming #182533 + tail
│  │ Netflix 4K · Rp 35.000   │            │
│  │ [QR]  Bayar sebelum 14:17│            │
│  │                 14:02    │            │
│  └──────────────────────────┘            │
│  [ ✅ Saya sudah bayar ]                  │  inline button TERPISAH di bawah bubble
│      ( Pembayaran diterima · 14:02 )     │  service pill tengah
│ ◣┌──────────────────────────┐            │
│  │ 🔓 Akun kamu:            │            │
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒ (spoiler) │            │  blur→jelas
│  │ ⏱ terkirim 1,4 dtk  14:02│            │
│  └──────────────────────────┘            │
└──────────────────────────────────────────┘
```
| Waktu | Kejadian | Motion |
|---|---|---|
| 0.0s | Bubble buyer `/beli netflix` masuk, jam `14:02 ✓` | `tgBubbleIn` dari kanan |
| 0.6s | ✓ → ✓✓ biru `#64B5EF` (dibaca bot) | crossfade 200ms |
| 0.9s | Header status `bot` → `mengetik` + 3 titik animasi | crossfade |
| 1.8s | Bubble invoice QRIS + inline button | `tgBubbleIn` dari kiri, button masuk +80ms |
| 3.2s | Button "ditekan": ripple `rgba(255,255,255,.18)` radial scale 0→2.5, 450ms | — |
| 3.7s | Service pill `Pembayaran QRIS diterima · 14:02` (`bg-black/30 rounded-full text-[11px]`) | fade+scale 0.95→1 |
| 4.3s | Bubble kredensial masuk; isi **spoiler** `filter: blur(5px)` + shimmer | `tgBubbleIn` |
| 5.3s | Spoiler terbuka `blur(5px)→0` 500ms, label `⏱ terkirim 1,4 dtk` | ease-out-soft |
| 5.3–8.4s | HOLD | — |
| 8.4–9.0s | Semua bubble `opacity→0, translateY(-8px)` | ease-inout |
- **Auto-scroll halus:** kolom pesan `flex flex-col justify-end`; setiap bubble dibungkus `grid` dengan `grid-template-rows: 0fr → 1fr` (300ms ease-tg) sehingga bubble lama terdorong ke atas secara halus, bukan melompat.
- Hapus header mono `AUTO-DELIVERY ENGINE` & border neon `border-brand-mint` pada bubble bot.

### E. Detail Telegram untuk `TelegramSimulator.jsx` (agar mirip aplikasi aslinya)
| Elemen | Sekarang | Ganti menjadi (Tailwind) |
|---|---|---|
| Sudut bubble | `rounded-bl-sm` / `rounded-br-sm` | `rounded-[14px]` + **SVG tail** 8×13px di sudut bawah (hanya bubble terakhir dalam grup); fill sama dengan bubble |
| Jam & centang | tidak di dalam bubble | inline kanan-bawah: `float-right ml-2 mt-1 text-[11px] leading-none` · incoming `text-[#6D7F8F]` · outgoing `text-[#7DA8D3]` + `CheckCheck w-3.5 h-3.5 text-[#64B5EF]` |
| Status header | `bot • 24.850 pengguna bulanan` + dot online hijau + chip `BOT` | `text-[13px] text-[#7F91A4]` "bot"; saat mengetik `text-[#64B5EF]` "mengetik" + 3 titik. **Hapus dot online** (akun bot tidak punya status online) & **hapus chip `BOT`** |
| Avatar | ikon Bot di bulatan biru | inisial "A" di `bg-gradient-to-b from-[#72D5FD] to-[#2A9EF1]` (gaya avatar default Telegram) |
| Reply header | label "Permintaan Buyer" | nama pengirim asli: `Kamu` + teks perintah; `border-l-[3px] border-[#64B5EF] bg-[#64B5EF]/10 rounded-[4px]` |
| Bubble masuk | `tg-bubble-enter` | `tgBubbleIn` 260ms ease-tg: `translateY(10px) scale(.92)` → `0 / 1`, `transform-origin` = sudut tail (bottom-left untuk bot, bottom-right untuk user) |
| Inline keyboard | `bg-[#202B36]/95 border` | `bg-[#182533]/80 hover:bg-[#22303F] rounded-lg text-[13px] font-medium text-white` tanpa border, gap `1` (4px), **ripple** saat klik; saat menunggu callback: ikon jam kecil `Clock w-3 h-3` di pojok kanan-atas tombol |
| Toast callback | pill mono biru | `bg-black/70 text-white text-[13px] rounded-lg px-3 py-2` tengah atas, fade 200ms, hilang 1.6s (gaya `answerCallbackQuery`) |
| Tombol Menu | ikon `Slash` + "Menu" | ikon `Menu` (≡) + "Menu", `bg-[#3897F0] rounded-full h-8 px-3 text-[13px]` |
| Kirim / Mic | selalu tombol Send | input kosong → ikon `Mic` `text-[#7F91A4]`; ada teks → `Send` biru. Swap: `scale(.6) rotate(-30deg) opacity 0 → 1/0/1`, 180ms |
| Kredensial | kotak hijau "AES-256-GCM DECRYPTED" | blok `code` monospace `bg-black/25 rounded-md px-2 py-1.5` + **spoiler** (blur 5px, klik untuk buka, 400ms) + tombol `Salin` |
| Scroll | `scrollTop =` (snap) | `el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })` |
| Pill tanggal | `bg-[#182533]/90 border` | `bg-black/30 text-white/90 text-[12px] font-medium rounded-full px-2.5 py-0.5` tanpa border |
| Wallpaper | `tg-wallpaper` | tambahkan pola doodle SVG inline opacity 0.06 di atas `#0E1621` |

**Keyframes baru (`index.css`):**
```css
@keyframes tgBubbleIn {
  from { opacity: 0; transform: translateY(10px) scale(.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.tg-in-bot  { transform-origin: bottom left;  animation: tgBubbleIn 260ms var(--ease-tg) both; }
.tg-in-user { transform-origin: bottom right; animation: tgBubbleIn 260ms var(--ease-tg) both; }
@keyframes tgRipple { from { transform: scale(0); opacity: .35; } to { transform: scale(2.5); opacity: 0; } }
@keyframes tgSpoilerReveal { from { filter: blur(5px); } to { filter: blur(0); } }
@keyframes tgFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) {
  .tg-in-bot, .tg-in-user, [class*="hiw-"] { animation: none !important; }
}
```

### F. 6 State komponen (panggung step & bubble mini)
| State | Panggung Step | Inline button (Telegram) |
|---|---|---|
| Default | loop berjalan saat ≥25% terlihat | `bg-[#182533]/80` |
| Hover/Focus | panggung **tidak** bergerak; `focus-visible:ring-2 ring-[#64B5EF]` | `bg-[#22303F]` |
| Active | — | ripple + `scale(.98)` |
| Disabled | `[data-play=off]` → paused di frame terakhir | `opacity-50 cursor-not-allowed` saat bot mengetik |
| Loading/Skeleton | sebelum masuk layar: frame 0 statis | ikon `Clock` pojok kanan-atas |
| Empty | reduced-motion: frame hasil statis | — |
| Error | — | toast `bg-black/70` "Gagal, coba lagi" |

### G. Kriteria lulus (Second Check Rina)
- [ ] Tidak ada `setInterval`/`phase` global di `HowItWorks.jsx`; 4 kartu tidak pernah berganti bersamaan.
- [ ] Rekam 60fps: tidak ada lompatan posisi/teks; semua perpindahan teks crossfade.
- [ ] Langkah 04 terbaca sebagai Telegram tanpa label: header bot, tail bubble, jam + ✓✓ di dalam bubble, inline button terpisah, service pill, spoiler.
- [ ] Kartu & jendela Telegram diam saat di-hover.
- [ ] `prefers-reduced-motion` menampilkan frame hasil.


---

## 5. Hero Scroll-Zoom Palette Overhaul & Walking Robots Background (2026-11-21)

Menggantikan palet langit senja FluxCode (`#0a0f2c` / `#1d2554` / `#F6C991`) pada `Hero.jsx` dan `index.css` dengan identitas warna asli **Autobotz Neo-Brutalist** serta menambahkan latar belakang **robot berjalan** yang halus dan tidak mengganggu keterbacaan.

### A. Palet Warna Baru (100% Berbeda dari FluxCode)

| Elemen | Lama (FluxCode — HAPUS) | Baru (Autobotz Brand-Native) | Alasan & Kontras |
|---|---|---|---|
| **Outer Veil (`#fh-dim`, `.fh`)** | `#0e0e10` | `#111217` (`brand-dark`) | Ink hitam khas Autobotz; memberi kontras tajam terhadap latar terang di dalam lubang huruf `"Autobotz"`. |
| **Scene Background (`.fh-scene`)** | Navy/indigo `#0a0f2c → #1d2554` + bintang + glow peach `#F6C991` | **Light Workshop Canvas:** `linear-gradient(180deg, #FFF9FA 0%, #FFF0F3 58%, #ECFDF5 100%)` + pola dot/grid teknis tipis (`radial-gradient(rgba(17,18,23,0.08) 1px, transparent 1px)`, ukuran `24px 24px`) | Terang, segar, menyatu mulus dengan `Header.jsx` dan section di bawahnya (`brand-chill-white`). Hapus `.fh-stars` & `.fh-glow` peach. |
| **Wordmark Edge (`#fh-edge`)** | Sheen putih pudar | Stroke tipis `#FD1843` (`stroke-opacity: 0.55`, `stroke-width: 1.5`) + sheen subtle putih | Mempertegas siluet `"Autobotz"` dengan aksen crimson brand. |
| **Intro Layer (di atas veil `#111217`)** | Teks `#F2F0EA`, tombol gelap blur | Tagline `text-[#FFF9FA]`, CTA Utama `bg-brand-pink hover:bg-brand-pink-hover text-white border-2 border-white/20`, CTA Sekunder `bg-white/10 hover:bg-white/20 text-[#FFF9FA] border border-white/25`, Hint `Scroll` + garis `bg-brand-pink` | Kontras tinggi (>15:1) di atas veil gelap `#111217`. |
| **Revealed Hero Copy (di atas `.fh-scene` terang)** | Teks putih `#F2F0EA`, aksen peach `#F6C991`, body `#D4D1E0` | H1 `text-brand-dark` (`#111217`), highlight **`text-brand-pink` (`#FD1843`)** pada `"Bot Telegram"`, body `text-brand-muted` (`#5A5E6D`), badge `bg-white border-2 border-brand-dark text-brand-dark`, CTA Sekunder `btn-secondary` | Kontras WCAG AAA (>14:1) dan 100% konsisten dengan Neo-Brutalist Autobotz. `TelegramSimulator` gelap (`#17212B`) tampil sangat menonjol di atas latar terang. |
| **Trust Metrics Strip (`.fh-strip-glass`)** | Dark frosted glass `bg-[#0A0C18]/60 border-white/15` | **Crisp Brutalist Strip:** `bg-white/90 backdrop-blur-sm border-2 border-brand-dark rounded-2xl shadow-brutalist divide-brand-dark/15` · Label `text-brand-muted` · Nilai: `text-brand-mint` (`< 3.0 dtk`), `text-brand-dark` (`AES-256`), `text-brand-blue` (`QRIS & Bank`), `text-brand-pink` (`100% Open`) | Menghilangkan sisa estetika dark-glass FluxCode; seragam dengan kartu section lain. |

### B. Latar Belakang Animasi Robot Berjalan (`WalkingBotsBackdrop` di dalam `.fh-scene`)

Diletakkan di dalam `.fh-scene` (`position: absolute; inset: 0; pointer-events: none; overflow: hidden;`) sehingga robot sudah terlihat bergerak melalui lubang huruf `"Autobotz"` saat `scroll = 0%`, lalu terlihat utuh berjalan di latar belakang Hero setelah zoom selesai.

- **Gaya Visual (Anti AI-Slop):**
  - **Flat Geometric Neo-Brutalist SVG Bots** (stroke `#111217` 2px, fill putih `#FFFFFF` & warna aksen brand `#FD1843` / `#10B981` / `#3897F0` pada visor, antena LED, atau paket kecil). **Bukan** ilustrasi 3D clay atau siluet generik buram.
- **Struktur 3 Jalur Kedalaman (Parallax Lanes) + Garis Lantai Teknis:**
  - Setiap jalur memiliki garis lantai putus-putus tipis (`border-b border-dashed border-brand-dark/12`) agar robot tampak **menapak dan berjalan**, bukan melayang.
  - **Jalur Belakang (Top/Mid ~38% dari bawah):** Skala `0.72`, `opacity: 0.14`, berjalan Kanan → Kiri (`28s linear infinite`, `scaleX(-1)`).
  - **Jalur Tengah (~20% dari bawah):** Skala `0.88`, `opacity: 0.18`, berjalan Kiri → Kanan (`22s linear infinite`).
  - **Jalur Depan (~6% dari bawah, tepat di bawah area konten):** Skala `1.0`, `opacity: 0.22`, berjalan Kiri → Kanan (`17s linear infinite`).
- **3 Variasi Karakter Robot (Inline SVG ringan, tinggi ~44–56px):**
  1. **Delivery Bot (`#FD1843` accent):** Kepala kotak membulat, visor mata berkedip pelan, membawa ikon paket kecil (simbol kirim akun otomatis).
  2. **Telegram Bot (`#3897F0` accent):** Antena sinyal melingkar, ikon pesawat kertas kecil di dada.
  3. **Vault Bot (`#10B981` accent):** Chassis sedikit lebih lebar dengan ikon gembok kecil (simbol AES-256).
- **Siklus Gerak Berjalan (60fps, GPU-only `transform`):**
  - **Perpindahan horizontal:** `@keyframes botWalkRight` (`translate3d(-10vw, 0, 0) → translate3d(110vw, 0, 0)`), `@keyframes botWalkLeft` (`translate3d(110vw, 0, 0) → translate3d(-10vw, 0, 0)`).
  - **Distribusi instan (`t = 0`):** Wajib beri **negative `animation-delay`** (`-3s`, `-9s`, `-15s`, `-21s`) pada 5–6 unit robot agar langsung tersebar di layar sejak detik pertama (tidak kosong menunggu masuk dari tepi).
  - **Artikulasi kaki & bobbing tubuh:**
    - Kaki kiri: `transform-origin: top center; animation: botLegSwing 520ms ease-in-out infinite alternate` (`rotate(-20deg) ↔ rotate(20deg)`).
    - Kaki kanan: animasi sama dengan `animation-delay: -260ms` (berlawanan fase).
    - Tubuh: `@keyframes botBodyBob` (`translateY(0) → translateY(-2.5px) → translateY(0)`, `520ms ease-in-out infinite`).
    - Lengan/antena: ayunan mikro `rotate(-8deg ↔ 8deg)` sinkron dengan langkah.

### C. 6 State Komponen (`WalkingBotsBackdrop` & Hero CTAs)

| State | `WalkingBotsBackdrop` | Hero CTA Buttons (Intro & Revealed) |
|---|---|---|
| **Default** | Robot berjalan kontinu di 3 jalur (`opacity` 0.14–0.22), `pointer-events: none` | `btn-primary` (`#FD1843`) & `btn-secondary` (`#FFFFFF` border `#111217`) |
| **Hover / Focus** | Tidak bereaksi terhadap kursor (tetap tenang di latar) | Shadow naik ke `shadow-brutalist-hover`, `-translate-x-0.5 -translate-y-0.5`, `focus-visible:ring-2 ring-brand-dark` |
| **Active** | — | `shadow-none translate-x-1 translate-y-1` |
| **Disabled / Off-screen** | `[data-play="off"] * { animation-play-state: paused; }` via `IntersectionObserver` saat Hero di luar viewport | `disabled:opacity-50 disabled:cursor-not-allowed` |
| **Loading / First Paint** | Negative `animation-delay` memastikan robot langsung tampil di posisi tersebar tanpa jeda kosong | Render langsung tanpa skeleton |
| **Empty / Reduced Motion** | `@media (prefers-reduced-motion: reduce)`: semua animasi jalan/kaki `none`, robot tetap terparkir rapi secara statis di posisi lintasan (`left: 15%`, `48%`, `78%`) | Transisi instan, scroll-zoom dilewati (`flightEnabled = false`) |

### D. Kriteria Lulus (Second Check Rina)
- [ ] Nol warna sisa FluxCode (`#0a0f2c`, `#1d2554`, `#F6C991`, `#D4D1E0`, `#A7A3B8`, `.fh-stars`, `.fh-glow`) di `Hero.jsx` dan `index.css`.
- [ ] Latar `.fh-scene` terang (`#FFF9FA → #FFF0F3 → #ECFDF5`) sehingga kontras teks Hero (`#111217`) dan `TelegramSimulator` gelap sangat tajam.
- [ ] Robot berjalan terlihat mengintip dari dalam lubang huruf `"Autobotz"` di `scroll = 0%` dan berjalan mulus dengan kaki berayun di latar belakang saat Hero terbuka.
- [ ] Tidak ada *horizontal overflow* akibat pergerakan robot (`overflow: hidden` pada `.fh-scene`).
- [ ] Teks Hero tetap 100% terbaca tanpa gangguan visual dari robot (`opacity <= 0.22`).


---

## 6. Design System Pivot: Dark Industrial Glassmorphism & 3D Industrial Walking Robots (2026-11-21 — MENGGANTIKAN Neo-Brutalism)

Keputusan eksplisit user: meninggalkan gaya **Neo-Brutalism** (kartu putih solid, `border-2 border-brand-dark`, `shadow-brutalist` kotak hitam pekat) dan beralih penuh ke **Dark Industrial Glassmorphism** di seluruh website, dipadukan dengan **Robot 3D Industrial berjalan** di latar belakang Hero.

### A. Global Ground & 3-Tier Glass Surface Tokens (`index.css` & `tailwind.config.js`)

| Token / Elemen | Kelas Tailwind / Nilai CSS | Penggunaan |
|---|---|---|
| **Page Ground (`body`)** | `bg-[#090B10] text-[#F4F6FA]` + grid teknis halus `rgba(255,255,255,0.03)` (`32×32px`) | Latar utama seluruh halaman (Landing, Auth, Payment, Dashboard, Admin). |
| **Section Alt Ground** | `bg-[#0D1017]/80 border-y border-white/[0.08]` | Pemisah antar section (gantikan `bg-brand-surface-tint border-b-2 border-brand-dark`). |
| **Glass Tier 1 (Base Card)** | `bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]` | Kartu Features, 4 Langkah Teknis, FAQ, Pricing reguler, Dashboard cards. |
| **Glass Tier 2 (Elevated / Sticky)** | `bg-[#161B28]/70 backdrop-blur-xl border border-white/[0.14] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]` | `Header.jsx` (`rounded-none border-b`), kartu Pricing populer, Modal, CTA panel. |
| **Glass Tier 3 (Recessed Well / Input)** | `bg-[#090C12]/75 backdrop-blur-sm border border-white/[0.1] rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]` | Input form, panggung mini di `HowItWorks`, kotak kode/cipher, tabel container. |
| **Tipografi Kontras (WCAG AA+)** | Heading `text-[#F4F6FA]` · Body `text-[#A8B0C2]` · Meta/Mono `text-[#788296]` | Nol teks gelap (`text-brand-dark`) di atas latar kaca gelap. |
| **Aksen Brand Autobotz** | Crimson `#FD1843` · Mint `#10B981` · Telegram Blue `#3897F0` · Industrial Amber `#F59E0B` | Dilarang warna ungu/indigo AI generik atau peach FluxCode. |

### B. 6 State Interaktif Komponen Glassmorphism (`Button.jsx`, `Input.jsx`, `Card.jsx`, `Badge.jsx`)

| Komponen | Default | Hover / Focus | Active | Disabled | Loading | Error |
|---|---|---|---|---|---|---|
| **Primary Button** | `bg-[#FD1843]/90 text-white border border-white/20 backdrop-blur-md shadow-[0_8px_24px_rgba(253,24,67,0.32),inset_0_1px_0_rgba(255,255,255,0.28)] rounded-xl` | `hover:bg-[#FF2E56] hover:shadow-[0_10px_28px_rgba(253,24,67,0.48)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#FD1843]/70` | `active:scale-[0.98] active:translate-y-0` | `bg-white/10 text-white/35 border-white/10 shadow-none cursor-not-allowed` | Spinner 16px + `opacity-80 pointer-events-none` | — |
| **Secondary Glass Button** | `bg-white/[0.06] text-[#F4F6FA] border border-white/[0.14] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl` | `hover:bg-white/[0.12] hover:border-white/[0.26] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/40` | `active:scale-[0.98]` | `bg-white/[0.03] text-white/30 border-white/[0.06] cursor-not-allowed` | Spinner + teks status | — |
| **Glass Card (Interactive)** | Glass Tier 1 (`bg-[#121621]/55 border-white/[0.09]`) | `hover:bg-[#171C2B]/70 hover:border-white/[0.18] hover:-translate-y-0.5 transition-all duration-200` | — | `opacity-50 pointer-events-none` | `animate-pulse bg-white/[0.06]` | `border-[#FD1843]/50 bg-[#FD1843]/[0.06]` |
| **Glass Input** | Glass Tier 3 (`text-[#F4F6FA] placeholder:text-[#667085]`) | `hover:border-white/20 focus:border-[#FD1843]/75 focus:ring-2 focus:ring-[#FD1843]/25 focus:bg-[#0D111A]/90 focus:outline-none` | — | `bg-white/[0.03] text-white/35 border-white/[0.06] cursor-not-allowed` | — | `border-[#FD1843] ring-1 ring-[#FD1843]/40` + helper `text-[#FF6B86]` |
| **Glass Badge** | `pink`: `bg-[#FD1843]/15 text-[#FF6B86] border border-[#FD1843]/35` · `mint`: `bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/35` · `neutral`: `bg-white/[0.06] text-[#CBD3E1] border border-white/[0.12]` | — | — | `opacity-45` | — | — |

### C. Cakupan Migrasi Glassmorphism (Seluruh Halaman & Komponen)
1. **Header (`Header.jsx`) & Footer (`Footer.jsx`):** Header sticky `bg-[#090B10]/70 backdrop-blur-xl border-b border-white/[0.08]`, wordmark `#F4F6FA` + aksen `#FD1843`, link `text-[#A8B0C2] hover:text-white`. Footer `bg-[#07090D] border-t border-white/[0.08]`.
2. **Hero (`Hero.jsx`):** Pertahankan mekanisme scroll-zoom `.fh.on`, latar Obsidian–Crimson + **3D Industrial Robots**, strip metrik Glass Tier 1 (`bg-[#121621]/60 backdrop-blur-xl border border-white/[0.12]`), dan `TelegramSimulator` dengan bingkai kaca gelap (`border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.65)]`) — isi UI Telegram tetap otentik Night Mode `#0E1621`/`#17212B`.
3. **Landing Sections (`Features.jsx`, `HowItWorks.jsx`, `BotDemo.jsx`, `Pricing.jsx`, `FAQ.jsx`, `CTA.jsx`):**
   - Semua kartu putih brutalist diganti **Glass Tier 1/2**.
   - `HowItWorks.jsx`: Pertahankan grid **1 baris 4 kolom (`lg:grid-cols-4`)**, `tilt={false}`, Step 01 Tangan Memegang HP, Step 04 Mini Telegram, dan 60fps CSS timelines; hanya pembungkus kartu luar & tipografi disesuaikan ke Glass Tier 1.
   - `Pricing.jsx`: Paket populer memakai Glass Tier 2 + specular crimson border `border-[#FD1843]/45 shadow-[0_0_40px_rgba(253,24,67,0.16)]`.
4. **App Pages (`Login.jsx`, `Register.jsx`, `Payment.jsx`, `Dashboard.jsx`, `AdminDashboard.jsx`):** Migrasi background ke `#090B10`, panel form/ringkasan/tabel ke Glass Tier 1/2, input ke Glass Tier 3, dan pastikan seluruh teks/label terbaca jelas (kontras tinggi).

### D. Spesifikasi Latar Belakang Robot 3D Industrial (`IndustrialRobots3D.jsx` di dalam Hero `.fh-scene`)
Menggantikan 2D SVG `WalkingBot` sebelumnya dengan **robot 3D industrial sesungguhnya** menggunakan **Three.js (`three`) procedural WebGL `<canvas>`** (tanpa perlu file `.glb` eksternal):
- **Estetika Industrial Robotics:**
  - **Material PBR Metalik (`MeshStandardMaterial`):** Brushed Gunmetal Chassis (`#2B3240`, `metalness: 0.82`, `roughness: 0.32`), Dark Titanium Hydraulic Joints (`#161A22`, `metalness: 0.90`, `roughness: 0.24`), Accent Armor Plates (`#FD1843` crimson & `#F59E0B` industrial caution strip), Emissive Optical Visor & Shoulder Beacon (`#3897F0` / `#10B981` / `#FD1843`).
  - **Anatomi 3D Terartikulasi (Geometri Prosedural):** Torso berlapis armor + modul power-pack punggung, kepala sensor kotak miring dengan visor optik bercahaya, sendi bahu & lengan hidrolik (sebagian membawa peti kargo digital bercahaya), panggul, paha, sendi lutut, betis, dan telapak kaki mekanis rata.
  - **Siklus Jalan 3D Realistis (60fps):** Rotasi pinggul sinusoidal + tekukan lutut berfase (`Math.max(0, Math.sin(t + phase))`) agar kaki benar-benar mengangkat dan menapak, ayunan lengan berlawanan fase, *torso bob* & sedikit condong ke depan (`~7°`).
  - **Pencahayaan & Lantai Industrial:** Lantai grid metalik gelap dengan kabut kedalaman (`THREE.FogExp2('#090B10', 0.045)`), cahaya 3 titik: *key light* baja dingin dari atas, *rim light* crimson `#FD1843` dari kiri, dan *rim light* biru `#3897F0` dari kanan agar tepi logam memantul tajam.
  - **Komposisi 2 Jalur Patroli:** 4–5 unit robot 3D (2 jalur: depan berjalan Kiri→Kanan, belakang berjalan Kanan→Kiri pada skala/kedalaman Z lebih jauh) sehingga robot terlihat berjalan nyata dari balik huruf `"Autobotz"` saat `scroll = 0%` maupun di belakang kartu kaca Hero saat terbuka.
- **Performa & Aksesibilitas:**
  - `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))`, `pointer-events: none`, `aria-hidden="true"`.
  - Jeda otomatis (`IntersectionObserver`) saat Hero keluar layar; bersihkan geometry/material/renderer saat unmount.
  - `prefers-reduced-motion: reduce`: render 1 frame 3D statis tanpa loop animasi.
  - Fallback aman jika WebGL tidak tersedia (tidak crash, menampilkan grid industrial gelap).

### E. Kriteria Lulus (Second Check Rina)
- [ ] Seluruh halaman & komponen tidak lagi memiliki `shadow-brutalist` solid hitam atau kartu putih keras `bg-white border-2 border-brand-dark`.
- [ ] Efek kaca semi-transparan (`backdrop-blur-*` + `bg-[#121621]/55` + specular `border-white/[0.09..0.14]`) konsisten di Header, Hero, Features, HowItWorks, BotDemo, Pricing, FAQ, CTA, Footer, dan App Pages.
- [ ] Robot 3D industrial berjalan mulus di latar Hero dengan pencahayaan metalik, kaki terartikulasi, dan 0 error WebGL/console.
- [ ] Kontras teks tetap tajam (tidak ada teks gelap di atas latar gelap) dan `TelegramSimulator` tetap stabil (`tilt={false}`) serta otentik.


---

## 7. Revisi Hero Beat 2–3: `ARSITEKTUR & KEAMANAN` + Pose Duduk Realistis + Kabut Awan Volumetrik (2026-11-21)

Menjawab masukan user: mengganti panel filler `AUTOBOTZ LIVE INFRASTRUCTURE` dengan konten bernilai tinggi **`ARSITEKTUR & KEAMANAN`**, memperbaiki kontak fisik robot saat duduk di tombol `Sewa Bot Cloud`, serta menghadirkan kabut awan atmosferik yang nyata agar latar belakang tidak terlihat polos.

### A. Penggantian Beat 3 Spotlight: `AUTOBOTZ LIVE INFRASTRUCTURE` → `ARSITEKTUR & KEAMANAN`
- **Hapus total** panel `AUTOBOTZ LIVE INFRASTRUCTURE` di `Hero.jsx` (`.fh-spotlight`).
- **Isi Beat 3 (`.fh-spotlight`, `p = 0.72 → 1.00`) dengan konten nyata `ARSITEKTUR & KEAMANAN`:**
  - Header ringkas: eyebrow `ARSITEKTUR & KEAMANAN` (`text-brand-pink font-mono text-xs`), judul `Dirancang untuk Volume Transaksi Tinggi Tanpa Kebocoran Stok Akun.` (`font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F6FA]`).
  - **Grid 2×2 Glass Bento (`grid-cols-1 md:grid-cols-2 gap-3.5 max-w-5xl mx-auto`):**
    1. `01 / AUTO-DELIVERY`: Pengiriman akun otomatis `< 3.0 dtk` pasca callback lunas.
    2. `02 / CRYPTO VAULT`: Enkripsi token & kredensial `AES-256-GCM` (pertahankan mini *live cipher scrambler* + tombol rotasi IV).
    3. `03 / WEBHOOK & PAYMENT`: Validasi signature `SHA-512` & kunci harga *server-side* anti manipulasi.
    4. `04 / ANTI DOUBLE-SELL`: Penguncian stok atomik (`LOCKED → SOLD`) untuk transaksi serentak.
  - Permukaan kartu: **Glass Tier 2** (`bg-[#121621]/68 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]`).
- **Hapus Duplikasi Section:** Di `App.jsx`, jangan render `<Features />` terpisah di bawah Hero saat *scroll-flight* aktif (tautan navigasi `Arsitektur` menggulir halus ke Beat 3 `p ≈ 0.88` pada Hero; `<Features />` hanya dirender sebagai fallback statis bila `prefers-reduced-motion: reduce`).

### B. Pose Duduk Robot yang Realistis & Menapak Fisik di Tombol `Sewa Bot Cloud`
Agar jelas *apa yang diduduki* dan robot tidak tampak melayang:
1. **Anchor Kontak Presisi (`rect.top`):** Proyeksikan titik bawah `pelvisShell` tepat menempel pada bibir atas tombol `Sewa Bot Cloud` (`y = rect.top`, offset vertikal `0px`), pada posisi horizontal `rect.left + 28px` (aman di tepi kiri atas tanpa menutupi label tombol).
2. **Kinematika Duduk Natural (3D):**
   - **Paha (`hip.rotation.x`):** `-1.35 rad` (`~-77°`) mendatar di atas permukaan atas tombol.
   - **Lutut (`knee.rotation.x`):** `+1.42 rad` (`~+81°`) sehingga betis dan sepatu **menggantung melewati bibir depan tombol** dengan ayunan kaki bergantian yang santai (`±0.10 rad`, fase berlawanan).
   - **Tangan Menumpu (`shoulder` & `elbow`):** Kedua tangan bertumpu di tepi atas tombol di kiri-kanan pinggul (`shoulder.rotation.z = ±0.26`, `shoulder.rotation.x = 0.22`) sehingga terlihat menopang bobot tubuh.
   - **Torso:** Sedikit bersandar santai (`-0.08 rad`) dengan kepala menoleh ringan ke kanan arah headline/pembeli.
3. **Contact Shadow (Ambient Occlusion) di Tepi Atas Tombol:**
   - Tambahkan elemen bayangan kontak di dalam tombol `Sewa Bot Cloud` (`position: relative`): `<span className="pointer-events-none absolute -top-1 left-3 w-11 h-2 rounded-full bg-black/65 blur-[3px] transition-opacity duration-300" style={{ opacity: 'var(--co, 0)' }} />` agar ada bayangan menapak nyata tepat di bawah pinggul robot.

### C. Lapisan Kabut Awan Volumetrik (Anti Background Polos)
Memperbaiki latar belakang yang polos karena tirai awan lama memudar ke `opacity: 0`:
1. **3D WebGL Volumetric Mist Sprites (`IndustrialRobots3D.jsx`):**
   - Buat tekstur awan prosedural via offscreen `<canvas>` (gugusan 6–8 *soft radial puffs* bertumpuk agar tampak berserat seperti awan sungguhan, bukan 1 lingkaran polos).
   - Tempatkan **14–16 `THREE.Sprite` kabut** pada kedalaman berlapis (`z = -4.5` belakang robot, `z = -0.5` sekitar kaki, dan `z = +1.8` depan robot) yang melayang pelan secara horizontal.
   - Palet kabut: puncak terkena cahaya fajar (`#FFD6AD`), badan kabut hangat (`#E38354`), dasar bayangan (`#2A1A30`).
   - Saat `p = 0%`, kabut depan rapat menyelimuti robot; saat scroll, kabut depan membelah ke kiri/kanan, sementara **kabut belakang & kabut kaki tetap hidup (`opacity 0.38–0.55`)** sehingga latar di belakang robot selalu berdimensi dan berkabut.
2. **Tirai Awan Cumulus Bertekstur (`.fh-cloud-veil-l/r` di `index.css`):**
   - Ganti `<ellipse>` tunggal dengan gugusan awan cumulus berlapis (multi-circle SVG + blur lembut `6–10px`) yang menyibak ke `-62vw` dan `+62vw`.
3. **Hamparan Kabut Bawah Permanen (`.fh-mist-floor`):**
   - Pertahankan lapisan kabut lembut di 35% bagian bawah viewport (`opacity: 0.55` di Beat 1–2, naik ke `0.78` di Beat 3 di belakang kartu kaca `ARSITEKTUR & KEAMANAN`).

### D. Kriteria Lulus (Second Check Rina)
- [ ] `AUTOBOTZ LIVE INFRASTRUCTURE` hilang total; digantikan `ARSITEKTUR & KEAMANAN` (4 modul lengkap) di Beat 3 tanpa duplikasi section di bawahnya.
- [ ] Robot duduk menempel persis di bibir atas tombol `Sewa Bot Cloud` dengan kaki menggantung ke depan, tangan menumpu, dan *contact shadow* terlihat jelas.
- [ ] Kabut awan terlihat nyata di belakang & sekitar robot (tidak polos) pada semua beat (`0%`, `Say Hi`, `Hero`, dan `Arsitektur & Keamanan`), dengan `0` error konsol/WebGL.
