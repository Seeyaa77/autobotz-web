import { useState, useEffect, useRef } from 'react'
import useFluxScrollParallax from '../hooks/useFluxScrollParallax'
import { Zap, CreditCard, Code2, Lock, Database, RefreshCw, ArrowDownRight } from 'lucide-react'

const SAMPLE_PLAINTEXTS = [
  '7192837492:AAF9xL0_q91ka0923uJks',
  'netflix.4k@store.id | Pass#2026!',
  'canva.vip@store.id | TeamInvite99'
]

const HEX_CHARS = '0123456789abcdef'

function randomHex(len) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
  }
  return out
}

export default function Features() {
  const sectionRef = useRef(null)
  useFluxScrollParallax(sectionRef)

  const [sampleIndex, setSampleIndex] = useState(0)
  const [cipherState, setCipherState] = useState({
    iv: '9f8a2bc4e17d',
    tag: '4c7e1a8b09f2',
    cipher: 'd8a4f019c3e77b21a904'
  })
  const [isScrambling, setIsScrambling] = useState(false)

  const triggerCipherScramble = () => {
    setIsScrambling(true)
    setSampleIndex((prev) => (prev + 1) % SAMPLE_PLAINTEXTS.length)
    let ticks = 0
    const interval = setInterval(() => {
      ticks += 1
      setCipherState({
        iv: randomHex(12),
        tag: randomHex(12),
        cipher: randomHex(20)
      })
      if (ticks >= 8) {
        clearInterval(interval)
        setIsScrambling(false)
      }
    }, 65)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      triggerCipherScramble()
    }, 4200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-transparent border-b border-white/[0.08] overflow-x-clip"
    >
      {/* FluxCode-Style Rotating Depth Glyph Watermark */}
      <span
        aria-hidden="true"
        data-flux-glyph="-0.18"
        className="pointer-events-none select-none absolute -left-24 top-16 w-[460px] h-[460px] opacity-[0.045] will-change-transform"
      >
        <svg viewBox="0 0 240 240" fill="none" strokeWidth="10" className="w-full h-full">
          <path d="M88 184H184V88H88V120H120" stroke="#F4F6FA" />
          <path d="M120 120H152V152H56V56H152" stroke="#FF9E4F" />
        </svg>
      </span>

      <div className="container-brutalist relative z-10">
        {/* FluxCode-Style Sticky Left Intro + Counter-Drifting Right Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Editorial Column (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4 text-left">
            <div data-flux-drift="-0.05" data-flux-max="28" className="space-y-4 will-change-transform">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#FF9E4F]">
                ARSITEKTUR &amp; KEAMANAN
              </p>
              <h2 className="heading-section text-3xl sm:text-4xl leading-[1.08]">
                Dirancang untuk Volume Transaksi Tinggi Tanpa Kebocoran Stok Akun.
              </h2>
              <p className="text-sm sm:text-base text-[#A8B0C2] font-sans leading-relaxed">
                Berbeda dari script bot gratisan yang menyimpan password akun dalam teks biasa, Autobotz memisahkan layer autentikasi JWT, brankas enkripsi AES-256-GCM, dan antrean penguncian stok atomik.
              </p>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-[#F4F6FA] hover:text-[#FF9E4F] transition-colors pt-1"
              >
                <span>Lihat simulasi langsung di bawah</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Scrolling Modules Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Flagship Module 01: Atomic Stock Lock (FluxCode flagship drift -0.05) */}
            <div
              data-flux-drift="-0.045"
              data-flux-max="32"
              className="glass-elevated p-6 sm:p-8 space-y-6 will-change-transform"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold uppercase text-[#F4F6FA] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF9E4F]" />
                    <span>01 / ATOMIC STOCK LOCK &amp; AUTO-DELIVERY</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#090C12]/75 border border-white/[0.1] text-[#34D399]">
                    LATENSI &lt; 3000ms
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#F4F6FA]">
                  Pengiriman Akun Otomatis Begitu Pembayaran Terkonfirmasi
                </h3>
                <p className="text-sm sm:text-base text-[#A8B0C2] font-sans leading-relaxed">
                  Saat dua pembeli memesan produk terakhir di detik yang sama, database mengunci baris stok secara atomik sehingga tidak pernah terjadi <em>double-sell</em> (satu akun terkirim ke dua orang).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090C12]/75 backdrop-blur-sm border border-white/[0.1] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#121621]/65 border border-white/[0.08] space-y-1">
                  <span className="text-brand-pink font-bold">STEP 1 · ORDER</span>
                  <p className="font-sans font-semibold text-[#F4F6FA]">Buyer klik katalog di Bot Telegram</p>
                  <p className="text-[11px] text-[#A8B0C2]">Stok dikunci sementara</p>
                </div>
                <div className="p-3 rounded-lg bg-[#121621]/65 border border-white/[0.08] space-y-1">
                  <span className="text-[#38BDF8] font-bold">STEP 2 · VERIFIKASI</span>
                  <p className="font-sans font-semibold text-[#F4F6FA]">Webhook Midtrans SHA-512 / Bukti</p>
                  <p className="text-[11px] text-[#A8B0C2]">Validasi nominal server-side</p>
                </div>
                <div className="p-3 rounded-lg bg-[#121621]/65 border border-white/[0.08] space-y-1">
                  <span className="text-brand-mint font-bold">STEP 3 · RELEASE</span>
                  <p className="font-sans font-semibold text-[#F4F6FA]">Dekripsi &amp; Kirim ke Chat Buyer</p>
                  <p className="text-[11px] text-[#A8B0C2]">Stok otomatis ditandai sold</p>
                </div>
              </div>
            </div>

            {/* Opposing-Speed 2-Column FluxCode Feature List (odd: -0.04, even: +0.04) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Odd Column Card: 02 / CRYPTO VAULT */}
              <div
                data-flux-drift="-0.04"
                data-flux-max="30"
                className="glass-card p-6 flex flex-col justify-between space-y-4 will-change-transform md:row-span-2"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold uppercase text-brand-mint flex items-center gap-2">
                      <Lock className={`w-4 h-4 text-brand-mint transition-transform duration-300 ${isScrambling ? 'rotate-12 scale-110' : ''}`} />
                      <span>02 / CRYPTO VAULT</span>
                    </span>
                    <button
                      type="button"
                      onClick={triggerCipherScramble}
                      className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] font-mono text-[10px] text-brand-mint inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Simulasikan rotasi IV & Auth Tag baru"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isScrambling ? 'animate-spin' : ''}`} />
                      <span>Rotasi IV</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-[#F4F6FA]">
                    Enkripsi Kredensial &amp; Token Bot AES-256-GCM
                  </h3>
                  <p className="text-sm text-[#A8B0C2] font-sans leading-relaxed">
                    Token Bot dari @BotFather maupun password akun stok dienkripsi dengan <em>IV</em> &amp; <em>Auth Tag</em> unik sebelum menyentuh database.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090C12]/85 border border-white/[0.1] font-mono text-[11px] text-gray-300 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/[0.08] pb-1">
                    <span>INPUT PLAINTEXT:</span>
                    <span className="text-[#FF9E4F] font-bold">
                      {isScrambling ? 'ENCRYPTING...' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="truncate text-gray-300 text-[11px]">
                    {SAMPLE_PLAINTEXTS[sampleIndex]}
                  </div>
                  <div className="text-brand-mint font-bold pt-1">// Format Penyimpanan DB:</div>
                  <div className="p-2 rounded bg-[#0E1621] border border-brand-mint/35 font-mono text-[11px] break-all leading-snug">
                    <span className="text-gray-400">enc:v1:</span>
                    <span className="text-[#FF9E4F]">{cipherState.iv}</span>
                    <span className="text-[#8B95A9]">:</span>
                    <span className="text-brand-pink">{cipherState.tag}</span>
                    <span className="text-[#8B95A9]">:</span>
                    <span className="text-brand-mint">{cipherState.cipher}</span>
                  </div>
                  <div className="text-[#FF6B86] text-[11px] font-semibold">
                    ✓ Tidak pernah dikembalikan ke API publik
                  </div>
                </div>
              </div>

              {/* Even Column Card: 03 / MULTI-PAYMENT */}
              <div
                data-flux-drift="0.04"
                data-flux-max="30"
                className="glass-card-interactive p-6 space-y-2.5 will-change-transform"
              >
                <span className="font-mono text-xs font-semibold uppercase text-[#38BDF8] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>03 / MULTI-PAYMENT</span>
                </span>
                <h3 className="text-lg font-bold font-heading text-[#F4F6FA]">
                  QRIS Otomatis &amp; Verifikasi Transfer Bank
                </h3>
                <p className="text-sm text-[#A8B0C2] font-sans leading-relaxed">
                  Dukung Midtrans Snap instan atau verifikasi transfer bank/QRIS manual dengan validasi <em>magic bytes</em> bukti gambar (JPG/PNG/WEBP ≤5MB).
                </p>
              </div>

              {/* Even Column Card: 04 / MANAJEMEN STOK */}
              <div
                data-flux-drift="0.04"
                data-flux-max="30"
                className="glass-card-interactive p-6 space-y-2.5 will-change-transform"
              >
                <span className="font-mono text-xs font-semibold uppercase text-brand-pink flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>04 / MANAJEMEN STOK</span>
                </span>
                <h3 className="text-lg font-bold font-heading text-[#F4F6FA]">
                  Katalog Multi-Kategori &amp; Audit Transaksi
                </h3>
                <p className="text-sm text-[#A8B0C2] font-sans leading-relaxed">
                  Kelola stok Netflix, Spotify, Canva, Game, atau akun sosmed per kategori. Pantau omset kotor, biaya bersih, dan status pembayaran real-time.
                </p>
              </div>

              {/* Full-Width Bottom Module: 05 / CLOUD ATAU SELF-HOST */}
              <div
                data-flux-drift="-0.03"
                data-flux-max="24"
                className="md:col-span-2 glass-card-interactive p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 will-change-transform"
              >
                <div className="space-y-1.5 max-w-xl">
                  <span className="font-mono text-xs font-semibold uppercase text-[#FF9E4F] flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>05 / CLOUD ATAU SELF-HOST</span>
                  </span>
                  <h3 className="text-lg font-bold font-heading text-[#F4F6FA]">
                    Sewa Cloud Praktis atau Beli Full Script Unencrypted
                  </h3>
                  <p className="text-sm text-[#A8B0C2] font-sans leading-relaxed">
                    Tidak ingin urus VPS? Pilih Cloud Hosting bulanan. Punya tim developer sendiri? Beli Script Only sekali bayar dengan akses source code utuh.
                  </p>
                </div>
                <a
                  href="#pricing"
                  className="btn-secondary text-xs px-4 py-2.5 shrink-0"
                >
                  Bandingkan Paket
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
