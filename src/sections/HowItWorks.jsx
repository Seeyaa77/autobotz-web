import { useState, useEffect } from 'react'
import ScrollReveal3D from '../components/ScrollReveal3D'
import {
  Bot,
  Database,
  CreditCard,
  CheckCircle2,
  Send,
  Lock,
  ShieldCheck,
  Check,
  Terminal,
  Sparkles
} from 'lucide-react'

const STEPS = [
  {
    num: '01',
    badge: 'CHECKOUT & PEMBAYARAN',
    title: 'Pilih Paket & Verifikasi Order',
    desc: 'Pilih paket Sewa Cloud (Starter/Pro/Enterprise) atau Beli Full Source Code. Gesek/bayar via Kartu ATM, QRIS, atau Transfer Bank dan sistem langsung mengaktifkan kuota toko Anda.',
    deliverables: [
      'Harga dikunci server-side anti-manipulasi',
      'Dukung Midtrans Snap, QRIS & Transfer Bank',
      'Aktivasi lisensi & kuota bot otomatis'
    ],
    icon: CreditCard
  },
  {
    num: '02',
    badge: 'INTEGRASI TELEGRAM API',
    title: 'Hubungkan Token @BotFather',
    desc: 'Buat bot di @BotFather Telegram, salin HTTP API Token-nya ke Dashboard. Server mengetes koneksi via getMe lalu menyegel token dengan enkripsi AES-256-GCM.',
    deliverables: [
      'Validasi instan endpoint Telegram getMe',
      'Pemasangan webhook HTTPS TLS 1.3 otomatis',
      'Token dienkripsi AES-256-GCM di database'
    ],
    icon: Bot
  },
  {
    num: '03',
    badge: 'MANAJEMEN BRANKAS STOK',
    title: 'Input Kategori & Stok Kredensial',
    desc: 'Tambahkan kategori produk (Netflix, Canva, Spotify, Game) beserta stok email & password. Setiap baris akun dikunci di brankas terenkripsi dan siap dijual.',
    deliverables: [
      'Enkripsi kredensial per item (IV & Auth Tag unik)',
      'Penguncian stok atomik anti double-sell',
      'Pemantauan sisa unit stok real-time'
    ],
    icon: Database
  },
  {
    num: '04',
    badge: 'AUTO-FULFILLMENT 24/7',
    title: 'Bot Siap Melayani Buyer 24/7',
    desc: 'Begitu pembeli melunasi tagihan di chat Telegram, webhook memicu dekripsi 1 unit stok dan mengirimkannya langsung ke ruang obrolan pembeli dalam < 3 detik.',
    deliverables: [
      'Pengiriman akun otomatis < 3.0 detik nonstop',
      'Stok otomatis berubah menjadi status SOLD',
      'Laporan omset bersih tercatat di Dashboard'
    ],
    icon: CheckCircle2
  }
]

/**
 * Step 01 Visual: Smooth 3-Phase 3D ATM Card Swipe & EDC Terminal Reader
 * Phase 0: Insert/Position Card -> Phase 1: Smooth 3D Swipe through Reader Slot -> Phase 2: EMV Chip Verified & Paid Receipt
 */
function Step01AtmSwipeStage({ phase }) {
  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border-2 border-brand-dark p-3.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      {/* Top EDC Terminal Reader Bar */}
      <div className="relative z-20 bg-[#182232] border-2 border-gray-700 rounded-xl px-3 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              phase === 2
                ? 'bg-brand-mint shadow-[0_0_8px_#10B981]'
                : phase === 1
                  ? 'bg-brand-amber animate-ping'
                  : 'bg-gray-500'
            }`}
          />
          <span className="font-mono text-[10px] font-bold tracking-wider text-gray-200">
            {phase === 0 && '1. TEMPEL / GESEK KARTU ATM'}
            {phase === 1 && '2. MEMBACA CHIP & PIN...'}
            {phase === 2 && '3. PEMBAYARAN DISETUJUI'}
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-brand-mint">
          Rp 299.000
        </span>
      </div>

      {/* Physical Card Reader Groove Track */}
      <div className="w-full h-1.5 bg-black/90 border-y border-gray-700/80 my-0.5 relative overflow-hidden">
        <div
          className="h-full bg-brand-mint transition-all duration-700 ease-out"
          style={{ width: phase === 0 ? '15%' : phase === 1 ? '65%' : '100%' }}
        />
      </div>

      {/* 3D Perspective ATM / Debit Card Moving Smoothly Across the Slot */}
      <div className="relative h-24 flex items-center justify-center">
        <div
          style={{
            transform:
              phase === 0
                ? 'perspective(750px) translate3d(-34px, 4px, 0px) rotateY(-18deg) rotateX(10deg) rotateZ(-2deg)'
                : phase === 1
                  ? 'perspective(750px) translate3d(0px, -6px, 24px) rotateY(0deg) rotateX(4deg) rotateZ(0deg)'
                  : 'perspective(750px) translate3d(28px, 0px, 12px) rotateY(14deg) rotateX(6deg) rotateZ(1deg)',
            transition: 'transform 680ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className="w-48 h-24 rounded-xl bg-gradient-to-br from-[#FD1843] to-[#B80B2C] border-2 border-white shadow-[4px_6px_0px_0px_#000000] p-2.5 flex flex-col justify-between text-white"
        >
          {/* Top Magnetic Stripe & Bank Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Detailed Gold EMV Chip */}
              <div className="w-6 h-4 rounded-sm bg-brand-amber border border-brand-dark grid grid-cols-2 gap-[1px] p-[2px]">
                <span className="bg-yellow-300/60 rounded-[1px]" />
                <span className="bg-yellow-300/60 rounded-[1px]" />
                <span className="bg-yellow-300/60 rounded-[1px]" />
                <span className="bg-yellow-300/60 rounded-[1px]" />
              </div>
              <span className="font-mono text-[8px] text-white/80">CHIP EMV</span>
            </div>
            <span className="font-heading font-extrabold text-[10px] tracking-wider">
              AUTOBOTZ ATM
            </span>
          </div>

          {/* Card Number & Holder */}
          <div className="space-y-0.5">
            <p className="font-mono text-[11px] font-bold tracking-widest text-white">
              4532 •••• •••• 8821
            </p>
            <div className="flex items-center justify-between text-[8px] font-mono text-white/85">
              <span>MERCHANT PRO</span>
              <span>VALID 11/29</span>
            </div>
          </div>
        </div>

        {/* Floating 3D Paid Approval Stamp on Phase 2 */}
        <div
          style={{
            opacity: phase === 2 ? 1 : 0,
            transform:
              phase === 2
                ? 'perspective(600px) translate3d(0, 0, 36px) scale(1)'
                : 'perspective(600px) translate3d(0, 10px, 0px) scale(0.85)',
            transition: 'all 420ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className="absolute right-2 bottom-1 z-30 px-2.5 py-1 rounded-lg bg-brand-mint text-brand-dark border-2 border-brand-dark font-mono text-[10px] font-extrabold shadow-brutalist-sm flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>ORDER LUNAS</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Step 02 Visual: Smooth 3-Phase 3D @BotFather Token Handshake & AES-256-GCM Seal
 */
function Step02TokenStage({ phase }) {
  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border-2 border-brand-dark p-3.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-300 border-b border-gray-800 pb-2">
        <span className="text-[#64B5EF] font-bold">@BotFather API</span>
        <span className="px-1.5 py-0.5 rounded bg-[#182533] text-brand-mint font-bold">
          {phase === 0 && '1. TEMPEL TOKEN'}
          {phase === 1 && '2. VERIFIKASI getMe'}
          {phase === 2 && '3. TERSEGEL AES-256'}
        </span>
      </div>

      {/* 3D Token Capsule Transforming into Encrypted Vault Block */}
      <div className="my-auto flex flex-col items-center justify-center gap-2">
        <div
          style={{
            transform:
              phase === 0
                ? 'perspective(700px) rotateX(10deg) rotateY(-10deg) translateZ(0px)'
                : phase === 1
                  ? 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(18px)'
                  : 'perspective(700px) rotateX(-6deg) rotateY(10deg) translateZ(12px)',
            transition: 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className={`w-full rounded-xl border-2 p-2.5 font-mono text-[10px] transition-colors duration-500 ${
            phase === 2
              ? 'bg-[#122922] border-brand-mint text-brand-mint'
              : 'bg-[#182533] border-[#3897F0] text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase text-gray-400">
              {phase === 2 ? 'VAULT CIPHERTEXT:' : 'HTTP API TOKEN:'}
            </span>
            <Lock className={`w-3.5 h-3.5 ${phase === 2 ? 'text-brand-mint' : 'text-brand-amber'}`} />
          </div>
          <p className="truncate font-bold">
            {phase === 0 && '7192837492:AAF9xL0_q91ka0923uJks...'}
            {phase === 1 && 'GET api.telegram.org/bot.../getMe -> 200'}
            {phase === 2 && 'enc:v1:9f8a2bc4:4c7e1a8b:d8a4f019c3e'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-gray-400">Bot: @TokoDigital_bot</span>
        <span className="text-brand-mint font-bold">✓ Webhook Ready</span>
      </div>
    </div>
  )
}

/**
 * Step 03 Visual: Smooth 3-Phase 3D Account Inventory Stack & Atomic Stock Lock
 */
function Step03InventoryStage({ phase }) {
  const items = [
    { sku: 'NETFLIX-4K', price: 'Rp 35.000', stock: '38 Unit' },
    { sku: 'CANVA-PRO', price: 'Rp 15.000', stock: '124 Unit' },
    { sku: 'TG-OLD-21', price: 'Rp 45.000', stock: '19 Unit' }
  ]

  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border-2 border-brand-dark p-3.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      <div className="flex items-center justify-between text-[10px] font-mono border-b border-gray-800 pb-1.5">
        <span className="text-gray-300 font-bold">BRANKAS STOK AKUN</span>
        <span className="text-brand-amber font-bold">181 UNIT READY</span>
      </div>

      {/* 3D Layered Inventory Cards */}
      <div className="space-y-1.5 my-auto">
        {items.map((item, i) => {
          const isHighlighted = phase === i
          return (
            <div
              key={item.sku}
              style={{
                transform: isHighlighted
                  ? 'perspective(650px) translate3d(4px, 0px, 20px) scale(1.02)'
                  : 'perspective(650px) translate3d(0px, 0px, 0px) scale(0.98)',
                transition: 'all 520ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] flex items-center justify-between ${
                isHighlighted
                  ? 'bg-[#182533] border-brand-mint text-white shadow-[2px_2px_0px_0px_#10B981]'
                  : 'bg-[#141D29] border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHighlighted ? 'bg-brand-mint' : 'bg-gray-600'
                  }`}
                />
                <span className="font-bold">{item.sku}</span>
              </div>
              <span className="text-brand-pink font-bold">{item.price}</span>
              <span className="text-brand-mint">{item.stock}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span>Status: Atomic Lock Active</span>
        <span className="text-brand-mint font-bold">Anti Double-Sell</span>
      </div>
    </div>
  )
}

/**
 * Step 04 Visual: Smooth 3-Phase 3D Instant Account Delivery to Buyer Chat (< 3.0s)
 */
function Step04DeliveryStage({ phase }) {
  return (
    <div className="h-44 rounded-xl bg-[#0E1621] border-2 border-brand-dark p-3.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      <div className="flex items-center justify-between text-[10px] font-mono border-b border-gray-800 pb-1.5">
        <span className="text-[#64B5EF] font-bold">AUTO-DELIVERY ENGINE</span>
        <span className="px-1.5 py-0.5 rounded bg-brand-mint text-brand-dark font-extrabold">
          1.4 DETIK
        </span>
      </div>

      {/* 3D Animated Telegram Chat Fulfillment Flow */}
      <div className="my-auto space-y-2">
        {/* Buyer Webhook Paid Trigger */}
        <div
          style={{
            opacity: phase >= 0 ? 1 : 0.4,
            transform:
              phase === 0
                ? 'perspective(650px) translate3d(0, 0, 14px)'
                : 'perspective(650px) translate3d(0, 0, 0px)',
            transition: 'all 500ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className="self-end ml-auto max-w-[85%] px-2.5 py-1.5 rounded-xl rounded-br-sm bg-[#2B5278] text-white font-mono text-[10px] flex items-center justify-between gap-2"
        >
          <span>⚡ QRIS Rp 35.000 Lunas</span>
          <span className="text-[#64B5EF]">✓✓</span>
        </div>

        {/* Bot Instant Credential Bubble */}
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0.35,
            transform:
              phase >= 1
                ? 'perspective(650px) translate3d(0, 0, 22px) scale(1)'
                : 'perspective(650px) translate3d(-12px, 6px, -10px) scale(0.95)',
            transition: 'all 550ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className="max-w-[92%] p-2 rounded-xl rounded-bl-sm bg-[#182533] border border-brand-mint text-white font-mono text-[10px] space-y-1"
        >
          <div className="flex items-center justify-between text-[9px] text-brand-mint font-bold">
            <span>✓ AKUN TERKIRIM OTOMATIS</span>
            <span>SOLD</span>
          </div>
          <p className="truncate text-gray-200 font-bold">
            nf.ultra4k@autobotz.id | Pass#2026!
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span>Jam Kerja: 24 Jam Nonstop</span>
        <span className="text-brand-mint font-bold">0% Admin Manual</span>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  // Synchronized 3-phase storytelling clock (0 -> 1 -> 2 every 1.4s)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3)
    }, 1450)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-brand-surface-tint border-b-2 border-brand-dark stage-3d">
      <div className="container-brutalist space-y-12">
        
        {/* Detailed Editorial Section Header */}
        <ScrollReveal3D direction="up" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5 text-left">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
              ALUR IMPLEMENTASI END-TO-END
            </p>
            <h2 className="heading-section">
              Toko Bot Telegram Aktif dalam 4 Langkah Teknis.
            </h2>
            <p className="text-sm sm:text-base text-brand-muted font-sans leading-relaxed">
              Setiap tahapan dirancang otomatis dari verifikasi pembayaran, penguncian token bot dengan AES-256-GCM, hingga pengiriman stok akun ke pembeli dalam hitungan detik.
            </p>
          </div>

          {/* Live Phase Indicator Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-brand-dark font-mono text-xs font-bold text-brand-dark self-start lg:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-mint animate-pulse" />
            <span>SIMULASI ALUR 3D AKTIF (FASE {phase + 1}/3)</span>
          </div>
        </ScrollReveal3D>

        {/* 4 Steps Grid (2x2 on tablet/medium, 4 cols on wide desktop with clear deliverables) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <ScrollReveal3D
                key={step.num}
                direction="up"
                delay={idx * 85}
                tilt={true}
                maxTilt={4}
                className="bg-white border-2 border-brand-dark rounded-2xl p-5 flex flex-col justify-between space-y-5 hover:shadow-brutalist transition-shadow"
              >
                <div className="space-y-4">
                  {/* Step Number + Category Badge */}
                  <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-brand-pink text-white border-2 border-brand-dark font-mono font-extrabold text-sm flex items-center justify-center">
                        {step.num}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase text-brand-muted">
                        {step.badge}
                      </span>
                    </div>
                    <Icon className="w-4 h-4 text-brand-dark shrink-0" />
                  </div>

                  {/* Smooth 3-Phase 3D Interactive Stage */}
                  {idx === 0 && <Step01AtmSwipeStage phase={phase} />}
                  {idx === 1 && <Step02TokenStage phase={phase} />}
                  {idx === 2 && <Step03InventoryStage phase={phase} />}
                  {idx === 3 && <Step04DeliveryStage phase={phase} />}

                  {/* Title & Detailed Explanation */}
                  <div className="space-y-2 pt-1">
                    <h3 className="font-heading font-extrabold text-lg text-brand-dark leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Concrete Technical Checklist per Step */}
                <div className="pt-3.5 border-t-2 border-brand-dark/10 space-y-1.5">
                  <p className="font-mono text-[10px] font-bold uppercase text-brand-dark">
                    Output Langkah {step.num}:
                  </p>
                  <ul className="space-y-1.5 text-xs font-sans text-brand-dark">
                    {step.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-mint shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal3D>
            )
          })}
        </div>

      </div>
    </section>
  )
}
