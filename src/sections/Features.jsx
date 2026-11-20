import { useState, useEffect } from 'react'
import ScrollReveal3D from '../components/ScrollReveal3D'
import { Zap, CreditCard, Code2, Lock, Database, RefreshCw } from 'lucide-react'

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
  const [sampleIndex, setSampleIndex] = useState(0)
  const [cipherState, setCipherState] = useState({
    iv: '9f8a2bc4e17d',
    tag: '4c7e1a8b09f2',
    cipher: 'd8a4f019c3e77b21a904'
  })
  const [isScrambling, setIsScrambling] = useState(false)

  // Live AES-256-GCM Cipher Scrambling Animation
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
    <section id="features" className="py-16 md:py-24 bg-brand-chill-white border-b-2 border-brand-dark stage-3d">
      <div className="container-brutalist space-y-12">
        
        {/* Left-Aligned Editorial Header */}
        <ScrollReveal3D direction="up" className="max-w-3xl space-y-3 text-left">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
            ARSITEKTUR &amp; KEAMANAN TRANSAKSI
          </p>
          <h2 className="heading-section">
            Dirancang untuk Volume Transaksi Tinggi Tanpa Kebocoran Stok Akun.
          </h2>
          <p className="text-base text-brand-muted font-sans leading-relaxed">
            Berbeda dari script bot gratisan yang menyimpan password akun dalam teks biasa, Autobotz memisahkan layer autentikasi JWT, brankas enkripsi AES-256-GCM, dan antrean penguncian stok atomik.
          </p>
        </ScrollReveal3D>

        {/* Asymmetric Bento Grid (12 Columns) with 3D Scroll Reveal & Tilt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Primary Wide Module (8 cols): 3-Second Auto-Fulfillment Pipeline */}
          <ScrollReveal3D
            direction="left"
            delay={40}
            tilt={true}
            maxTilt={4}
            className="lg:col-span-8 card-static p-6 sm:p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs font-bold uppercase text-brand-dark flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-pink" />
                  <span>01 / ATOMIC STOCK LOCK &amp; AUTO-DELIVERY</span>
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-brand-surface-tint border-2 border-brand-dark">
                  LATENSI &lt; 3000ms
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-brand-dark">
                Pengiriman Akun Otomatis Begitu Pembayaran Terkonfirmasi
              </h3>
              <p className="text-sm sm:text-base text-brand-muted font-sans leading-relaxed">
                Saat dua pembeli memesan produk terakhir di detik yang sama, database mengunci baris stok secara atomik sehingga tidak pernah terjadi <em>double-sell</em> (satu akun terkirim ke dua orang).
              </p>
            </div>

            {/* Pipeline Diagram inside Well */}
            <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-white border-2 border-brand-dark space-y-1">
                <span className="text-brand-pink font-bold">STEP 1 • ORDER</span>
                <p className="font-sans font-semibold text-brand-dark">Buyer klik katalog di Bot Telegram</p>
                <p className="text-[11px] text-brand-muted">Stok dikunci sementara</p>
              </div>
              <div className="p-3 rounded-lg bg-white border-2 border-brand-dark space-y-1">
                <span className="text-brand-blue font-bold">STEP 2 • VERIFIKASI</span>
                <p className="font-sans font-semibold text-brand-dark">Webhook Midtrans SHA-512 / Bukti</p>
                <p className="text-[11px] text-brand-muted">Validasi nominal server-side</p>
              </div>
              <div className="p-3 rounded-lg bg-white border-2 border-brand-dark space-y-1">
                <span className="text-brand-mint font-bold">STEP 3 • RELEASE</span>
                <p className="font-sans font-semibold text-brand-dark">Dekripsi &amp; Kirim ke Chat Buyer</p>
                <p className="text-[11px] text-brand-muted">Stok otomatis ditandai sold</p>
              </div>
            </div>
          </ScrollReveal3D>

          {/* Secondary Tall Module (4 cols): 02 / CRYPTO VAULT with Live AES-256-GCM Cipher Animation */}
          <ScrollReveal3D
            direction="right"
            delay={110}
            tilt={true}
            maxTilt={5}
            className="lg:col-span-4 bg-brand-dark text-white border-2 border-brand-dark rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-brand-mint flex items-center gap-2">
                  <Lock className={`w-4 h-4 text-brand-mint transition-transform duration-300 ${isScrambling ? 'rotate-12 scale-110' : ''}`} />
                  <span>02 / CRYPTO VAULT</span>
                </span>
                <button
                  type="button"
                  onClick={triggerCipherScramble}
                  className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 font-mono text-[10px] text-brand-mint inline-flex items-center gap-1 cursor-pointer"
                  title="Simulasikan rotasi IV & Auth Tag baru"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isScrambling ? 'animate-spin' : ''}`} />
                  <span>Rotasi IV</span>
                </button>
              </div>

              <h3 className="text-xl font-bold font-heading text-white">
                Enkripsi Kredensial &amp; Token Bot AES-256-GCM
              </h3>
              <p className="text-sm text-gray-300 font-sans leading-relaxed">
                Token Bot dari @BotFather maupun password akun stok Anda dienkripsi dengan <em>Initialization Vector (IV)</em> dan <em>Auth Tag</em> unik sebelum menyentuh database.
              </p>
            </div>

            {/* Animated Ciphertext Terminal Box */}
            <div className="p-3.5 rounded-xl bg-black border-2 border-gray-700 font-mono text-[11px] text-gray-300 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
                <span>INPUT PLAINTEXT:</span>
                <span className="text-brand-amber font-bold">
                  {isScrambling ? 'ENCRYPTING...' : 'LOCKED'}
                </span>
              </div>
              <div className="truncate text-gray-300 text-[11px]">
                {SAMPLE_PLAINTEXTS[sampleIndex]}
              </div>

              <div className="text-brand-mint font-bold pt-1">// Format Penyimpanan DB:</div>
              <div className="p-2 rounded bg-[#0E1621] border border-brand-mint/40 font-mono text-[11px] break-all leading-snug">
                <span className="text-gray-400">enc:v1:</span>
                <span className="text-brand-amber">{cipherState.iv}</span>
                <span className="text-gray-500">:</span>
                <span className="text-brand-pink">{cipherState.tag}</span>
                <span className="text-gray-500">:</span>
                <span className="text-brand-mint">{cipherState.cipher}</span>
              </div>
              <div className="text-brand-pink text-[11px] font-bold">
                ✓ Tidak pernah dikembalikan ke API publik
              </div>
            </div>
          </ScrollReveal3D>

          {/* Bottom Row Module 3 (4 cols): Payment Flexibility */}
          <ScrollReveal3D
            direction="up"
            delay={140}
            tilt={true}
            maxTilt={5}
            className="lg:col-span-4 card-static p-6 space-y-3"
          >
            <span className="font-mono text-xs font-bold uppercase text-brand-dark flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-blue" />
              <span>03 / MULTI-PAYMENT</span>
            </span>
            <h3 className="text-lg font-bold font-heading text-brand-dark">
              QRIS Otomatis &amp; Verifikasi Transfer Bank
            </h3>
            <p className="text-sm text-brand-muted font-sans leading-relaxed">
              Dukung pembayaran instan dengan Midtrans Snap atau verifikasi transfer bank/QRIS manual dengan validasi <em>magic bytes</em> bukti gambar (JPG/PNG/WEBP ≤5MB).
            </p>
          </ScrollReveal3D>

          {/* Bottom Row Module 4 (4 cols): Multi-Category Inventory */}
          <ScrollReveal3D
            direction="up"
            delay={210}
            tilt={true}
            maxTilt={5}
            className="lg:col-span-4 card-static p-6 space-y-3"
          >
            <span className="font-mono text-xs font-bold uppercase text-brand-dark flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-pink" />
              <span>04 / MANAJEMEN STOK</span>
            </span>
            <h3 className="text-lg font-bold font-heading text-brand-dark">
              Katalog Multi-Kategori &amp; Audit Transaksi
            </h3>
            <p className="text-sm text-brand-muted font-sans leading-relaxed">
              Kelola stok Netflix, Spotify, Canva, Game, atau akun sosial media per kategori. Pantau omset kotor, biaya bersih, dan status pembayaran secara real-time.
            </p>
          </ScrollReveal3D>

          {/* Bottom Row Module 5 (4 cols): Dual Deployment Mode */}
          <ScrollReveal3D
            direction="up"
            delay={280}
            tilt={true}
            maxTilt={5}
            className="lg:col-span-4 card-static p-6 space-y-3"
          >
            <span className="font-mono text-xs font-bold uppercase text-brand-dark flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-amber" />
              <span>05 / CLOUD ATAU SELF-HOST</span>
            </span>
            <h3 className="text-lg font-bold font-heading text-brand-dark">
              Sewa Cloud Praktis atau Beli Full Script
            </h3>
            <p className="text-sm text-brand-muted font-sans leading-relaxed">
              Tidak ingin urus VPS? Pilih paket Cloud Hosting bulanan. Punya tim developer sendiri? Beli paket Script Only sekali bayar dengan akses kode sumber utuh.
            </p>
          </ScrollReveal3D>

        </div>

      </div>
    </section>
  )
}
