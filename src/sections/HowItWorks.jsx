import { useEffect, useRef, useState } from 'react'
import ScrollReveal3D from '../components/ScrollReveal3D'
import {
  Bot,
  Database,
  CreditCard,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Check,
  CheckCheck,
  ArrowLeft,
  MoreVertical
} from 'lucide-react'

const STEPS = [
  {
    num: '01',
    badge: 'PEMBAYARAN',
    eta: '~1 Mnt',
    title: 'Pilih Paket & Verifikasi Order',
    desc: 'Pilih Sewa Cloud atau Beli Script. Bayar via QRIS, Midtrans, atau Transfer Bank dari HP dan kuota toko langsung aktif.',
    captions: ['Notifikasi', 'Bayar', 'Sukses'],
    deliverables: [
      'Harga dikunci server-side',
      'QRIS, Midtrans & Bank',
      'Aktivasi kuota otomatis'
    ],
    icon: CreditCard
  },
  {
    num: '02',
    badge: 'TELEGRAM API',
    eta: '~30 Dtk',
    title: 'Hubungkan Token @BotFather',
    desc: 'Tempel HTTP API Token dari @BotFather ke Dashboard. Server tes via getMe lalu menyegelnya dengan AES-256-GCM.',
    captions: ['Token', 'getMe', 'Segel'],
    deliverables: [
      'Validasi instan getMe',
      'Webhook HTTPS otomatis',
      'Enkripsi AES-256-GCM'
    ],
    icon: Bot
  },
  {
    num: '03',
    badge: 'BRANKAS STOK',
    eta: '~2 Mnt',
    title: 'Input Kategori & Stok Akun',
    desc: 'Tambahkan kategori produk dan stok email/password. Tiap baris akun dikunci di brankas terenkripsi siap jual.',
    captions: ['Input', 'Enkripsi', 'Ready'],
    deliverables: [
      'IV & Auth Tag per item',
      'Atomic lock anti double-sell',
      'Pantau stok real-time'
    ],
    icon: Database
  },
  {
    num: '04',
    badge: 'AUTO 24/7',
    eta: '24/7',
    title: 'Bot Siap Melayani Buyer 24/7',
    desc: 'Begitu buyer bayar QRIS di chat Telegram, webhook mendekripsi 1 unit stok dan mengirimnya otomatis dalam < 3 detik.',
    captions: ['QRIS', 'Kunci', 'Kirim'],
    deliverables: [
      'Kirim otomatis < 3,0 dtk',
      'Stok otomatis jadi SOLD',
      'Omset tercatat real-time'
    ],
    icon: CheckCircle2
  }
]

function StageCaptionBar({ captions, prefix }) {
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1 font-mono text-[9px]">
      {captions.map((label, i) => (
        <div
          key={label}
          className="relative h-5 rounded bg-white/[0.06] overflow-hidden flex items-center justify-center text-[#CBD3E1] font-semibold"
        >
          <span
            className={`absolute inset-0 bg-brand-mint/25 ${prefix}-cap-${i + 1}`}
            aria-hidden="true"
          />
          <span className="relative z-10 truncate px-1">{label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Step 01: Continuous 6.0s CSS Timeline — Hand Holding Smartphone with Payment Notification -> Success
 */
function Step01PhonePaymentStage() {
  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border border-white/[0.1] pt-2.5 px-2.5 pb-0 relative overflow-hidden flex items-end justify-center stage-3d select-none">
      {/* Ambient Success Glow Behind Phone */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(16,185,129,0.22),transparent_65%)] hiw1-success-glow"
      />

      {/* Hand + Smartphone Assembly */}
      <div className="relative w-[170px] h-[156px] flex items-end justify-center hiw1-phone">
        {/* Back Palm & Wrist Silhouette + Left Gripping Fingers (SVG) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 170 156"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d="M42 156 L46 118 C46 105 56 96 70 96 L112 96 C126 96 134 106 134 122 L134 156 Z"
            fill="#D99B72"
          />
          <path
            d="M46 156 L50 124 C51 114 60 108 72 108 L108 108 C119 108 126 115 126 126 L126 156 Z"
            fill="#C8875E"
            opacity="0.45"
          />
          <rect x="21" y="62" width="16" height="14" rx="7" fill="#E5AC84" stroke="#B5764E" strokeWidth="1" />
          <rect x="19" y="79" width="18" height="14" rx="7" fill="#E5AC84" stroke="#B5764E" strokeWidth="1" />
          <rect x="22" y="96" width="15" height="13" rx="6.5" fill="#DBA077" stroke="#B5764E" strokeWidth="1" />
        </svg>

        {/* Smartphone Device Frame */}
        <div className="relative z-10 w-[108px] h-[148px] rounded-t-[18px] bg-[#16202C] border-x-2 border-t-2 border-[#334155] shadow-[0_10px_24px_rgba(0,0,0,0.65)] p-1.5 flex flex-col overflow-hidden">
          {/* Top Speaker Notch + Status Bar */}
          <div className="flex items-center justify-between px-1 mb-1 text-[7px] font-mono text-gray-400">
            <span>14:02</span>
            <span className="w-8 h-2 rounded-full bg-[#090D14]" />
            <span className="text-brand-mint">5G</span>
          </div>

          {/* Phone Screen Area */}
          <div className="relative flex-1 rounded-t-xl bg-[#0B121B] overflow-hidden p-1.5 flex flex-col justify-between">
            {/* 1. Push Notification Banner Sliding Down */}
            <div className="relative z-20 rounded-lg bg-[#1E293B] border border-[#3897F0]/50 px-1.5 py-1 shadow-md hiw1-notif">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#64B5EF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3897F0]" />
                  AUTOBOTZ PAY
                </span>
                <span className="text-[6.5px] text-gray-400">baru saja</span>
              </div>
              <p className="text-[7.5px] font-semibold text-white truncate mt-0.5">
                Tagihan Rp 299.000
              </p>
            </div>

            {/* 2. Checkout / Tap-to-Pay Screen */}
            <div className="absolute inset-x-1.5 bottom-2 top-11 flex flex-col justify-between hiw1-pay-screen">
              <div className="rounded-lg bg-[#141E2B] border border-white/10 p-1.5 text-center space-y-0.5">
                <span className="text-[6.5px] font-mono text-gray-400 uppercase">
                  QRIS · PRO PLAN
                </span>
                <p className="font-mono text-[10px] font-extrabold text-white">
                  Rp 299.000
                </p>
              </div>

              {/* Pay Button with Ripple + Linear Processing Bar */}
              <div className="space-y-1">
                <div className="relative overflow-hidden rounded-md bg-[#3897F0] py-1 text-center font-sans text-[8px] font-bold text-white shadow hiw1-btn-tap">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -ml-4 -mt-4 w-8 h-8 rounded-full bg-white/40 hiw1-tap-ripple"
                  />
                  <span className="relative z-10">Bayar Sekarang</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="w-full h-full bg-brand-mint hiw1-pay-progress" />
                </div>
              </div>
            </div>

            {/* 3. Payment Success Screen */}
            <div className="absolute inset-1.5 flex flex-col items-center justify-center text-center gap-1 hiw1-success-screen">
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute w-9 h-9 rounded-full border-2 border-brand-mint hiw1-success-ring"
                />
                <div className="w-8 h-8 rounded-full bg-brand-mint text-[#090B10] flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.55)] hiw1-check-pop">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
              <p className="text-[8.5px] font-extrabold text-white leading-tight mt-0.5">
                Pembayaran Sukses!
              </p>
              <p className="font-mono text-[8.5px] font-bold text-brand-mint leading-none">
                Rp 299.000
              </p>
              <span className="mt-0.5 px-1.5 py-0.5 rounded-full bg-brand-mint/15 border border-brand-mint/40 font-mono text-[6.5px] font-bold text-brand-mint">
                ✓ ORDER AKTIF
              </span>
            </div>
          </div>
        </div>

        {/* Animated Right Thumb Tapping the Pay Button */}
        <svg
          aria-hidden="true"
          viewBox="0 0 60 60"
          className="absolute right-[10px] bottom-[22px] z-20 w-[52px] h-[52px] pointer-events-none hiw1-thumb"
        >
          <path
            d="M46 54 C35 46 22 36 16 26 C12 19 16 12 24 14 C31 16 40 24 52 34 Z"
            fill="#E5AC84"
            stroke="#B5764E"
            strokeWidth="1.2"
          />
          <ellipse cx="21" cy="19" rx="4" ry="2.5" transform="rotate(-32 21 19)" fill="#F4C9AA" opacity="0.75" />
        </svg>
      </div>
    </div>
  )
}

/**
 * Step 02: Continuous 6.5s CSS Timeline — Compact 3-Node Horizontal Token Handshake
 */
function Step02TokenStage() {
  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border border-white/[0.1] p-2.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between text-[8.5px] font-mono text-gray-300 border-b border-white/10 pb-1.5 gap-1">
        <span className="text-[#64B5EF] font-bold truncate">@BotFather API</span>
        <span className="px-1.5 py-0.5 rounded bg-brand-mint/20 text-brand-mint font-bold shrink-0 hiw2-badge-200">
          200 OK
        </span>
      </div>

      {/* 3-Node Horizontal Pipeline */}
      <div className="relative flex items-center justify-between my-auto gap-1">
        <div className="absolute left-[18%] right-[52%] top-1/2 -translate-y-1/2 h-[2px] border-t border-dashed border-gray-600/80" />
        <div className="absolute left-[52%] right-[18%] top-1/2 -translate-y-1/2 h-[2px] border-t border-dashed border-gray-600/80" />

        <div className="absolute left-[18%] right-[52%] top-1/2 -translate-y-1/2 h-[2px] bg-[#3897F0] hiw2-line-1" />
        <div className="absolute left-[52%] right-[18%] top-1/2 -translate-y-1/2 h-[2px] bg-brand-mint hiw2-line-2" />

        {/* Node 1: @BotFather */}
        <div className="relative z-10 w-[58px] py-1.5 px-1 rounded-lg bg-[#182533] border border-[#3897F0]/50 flex flex-col items-center gap-0.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#72D5FD] to-[#2A9EF1] flex items-center justify-center text-white font-sans font-bold text-[10px]">
            B
          </div>
          <span className="font-mono text-[7.5px] font-bold text-gray-200">@Bot</span>
        </div>

        {/* Node 2: AES-256-GCM Shield */}
        <div className="relative z-10 w-[62px] py-1.5 px-1 rounded-lg bg-[#16202C] border border-brand-amber/60 flex flex-col items-center gap-0.5">
          <div className="w-5 h-5 rounded bg-brand-amber/15 border border-brand-amber/40 flex items-center justify-center text-brand-amber hiw2-shield">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[7.5px] font-bold text-brand-amber">AES-GCM</span>
        </div>

        {/* Node 3: getMe 200 */}
        <div className="relative z-10 w-[58px] py-1.5 px-1 rounded-lg bg-[#122922] border border-brand-mint/60 flex flex-col items-center gap-0.5">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-lg border border-brand-mint hiw2-pulse pointer-events-none"
          />
          <div className="w-5 h-5 rounded-full bg-brand-mint/20 flex items-center justify-center text-brand-mint">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[7.5px] font-bold text-brand-mint">getMe</span>
        </div>
      </div>

      {/* Gliding Token Capsule */}
      <div className="relative h-6 flex items-center justify-center">
        <div className="w-36 h-6 rounded-md bg-[#182533] border border-white/15 px-2 flex items-center justify-center font-mono text-[8.5px] shadow-md hiw2-capsule">
          <div className="relative w-full h-3.5 overflow-hidden text-center">
            <span className="absolute inset-0 truncate text-[#64B5EF] font-bold hiw2-raw-text">
              719283:AAF9xL0…
            </span>
            <span className="absolute inset-0 truncate text-brand-amber font-bold hiw2-mid-text">
              #a9$F2!c8:GCM…
            </span>
            <span className="absolute inset-0 truncate text-brand-mint font-bold hiw2-enc-text">
              enc:v1:9f8a2bc4
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[8.5px] font-mono border-t border-white/10 pt-1">
        <span className="text-gray-400 truncate">@Toko_bot</span>
        <span className="text-brand-mint font-bold shrink-0 hiw2-footer-ok">✓ Webhook OK</span>
      </div>
    </div>
  )
}

/**
 * Step 03: Continuous 6.0s CSS Timeline — Compact 3D Isometric Stock Vault + Scanner
 */
function Step03InventoryStage() {
  const items = [
    { sku: 'NETFLIX-4K', price: '35K', stock: '38u' },
    { sku: 'CANVA-PRO', price: '15K', stock: '124u' },
    { sku: 'TG-OLD-21', price: '45K', stock: '19u' }
  ]

  return (
    <div className="h-44 rounded-xl bg-[#0D131C] border border-white/[0.1] p-2.5 relative overflow-hidden flex flex-col justify-between stage-3d select-none">
      <div className="flex items-center justify-between text-[8.5px] font-mono border-b border-white/10 pb-1">
        <span className="text-gray-300 font-bold">BRANKAS STOK</span>
        <span className="text-brand-amber font-bold">181 READY</span>
      </div>

      <div
        className="relative my-auto space-y-1.5 py-0.5"
        style={{ transform: 'rotateX(7deg)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[2px] bg-brand-mint shadow-[0_0_8px_#10B981] hiw3-scanner"
        />

        {items.map((item, i) => (
          <div
            key={item.sku}
            className={`relative px-2 py-1.5 rounded-md bg-[#141D29] border border-white/10 font-mono text-[9px] flex items-center justify-between gap-1 hiw3-row-${i}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 rounded-md border border-brand-mint bg-brand-mint/10 hiw3-glow-${i}`}
            />

            <div className="relative z-10 flex items-center gap-1.5 min-w-0">
              <span className={`text-brand-mint shrink-0 hiw3-lock-${i}`}>
                <Lock className="w-2.5 h-2.5" />
              </span>
              <span className="font-bold text-white truncate">{item.sku}</span>
            </div>
            <span className="relative z-10 text-brand-pink font-bold shrink-0">{item.price}</span>
            <span className="relative z-10 text-brand-mint font-semibold shrink-0">{item.stock}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[8.5px] font-mono text-gray-400 border-t border-white/10 pt-1">
        <span>IV + Auth Sealed</span>
        <span className="text-brand-mint font-bold">Atomic Lock</span>
      </div>
    </div>
  )
}

/**
 * Step 04: Continuous 9.0s CSS Timeline — Compact Authentic Mini Telegram Night Mode Window
 */
function Step04MiniTelegramStage() {
  return (
    <div className="h-44 rounded-xl bg-[#0E1621] border border-white/[0.1] overflow-hidden flex flex-col select-none font-sans">
      {/* Compact Authentic Telegram Header (h-8, #17212B, NO online dot, NO BOT chip) */}
      <div className="h-8 shrink-0 px-2 bg-[#17212B] border-b border-[#0E1621] flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <ArrowLeft className="w-3 h-3 text-[#7F91A4] shrink-0" />
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#72D5FD] to-[#2A9EF1] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
            A
          </div>
          <div className="leading-none min-w-0">
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-semibold text-white truncate">
                Autobotz Store
              </span>
              <svg className="w-3 h-3 text-[#3897F0] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.8 4.5L18.5 4.1L19.6 7.6L22.8 9.5L21.4 13L22.8 16.5L19.6 18.4L18.5 21.9L14.8 21.5L12 24L9.2 21.5L5.5 21.9L4.4 18.4L1.2 16.5L2.6 13L1.2 9.5L4.4 7.6L5.5 4.1L9.2 4.5L12 2ZM10.4 16.2L17.2 9.4L15.8 8L10.4 13.4L8.2 11.2L6.8 12.6L10.4 16.2Z" />
              </svg>
            </div>
            <div className="relative h-3 w-20 text-[8.5px] mt-0.5">
              <span className="absolute inset-0 text-[#7F91A4] hiw4-status-bot">
                bot
              </span>
              <span className="absolute inset-0 text-[#64B5EF] flex items-center gap-0.5 hiw4-status-typing">
                <span>mengetik</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[#64B5EF] tg-dot-1" />
                <span className="w-0.5 h-0.5 rounded-full bg-[#64B5EF] tg-dot-2" />
                <span className="w-0.5 h-0.5 rounded-full bg-[#64B5EF] tg-dot-3" />
              </span>
            </div>
          </div>
        </div>
        <MoreVertical className="w-3 h-3 text-[#7F91A4] shrink-0" />
      </div>

      {/* Authentic Telegram Chat Stream with Smooth Push-Up */}
      <div className="tg-wallpaper flex-1 px-2 py-1 flex flex-col justify-end overflow-hidden gap-0.5">
        {/* 1. Outgoing Buyer Bubble */}
        <div className="hiw4-msg1-wrap">
          <div className="overflow-hidden flex justify-end pr-1">
            <div className="relative bg-[#2B5278] text-white text-[9.5px] leading-tight px-2 py-0.5 rounded-[10px] hiw4-msg1">
              <span>/beli netflix</span>
              <span className="inline-flex items-center gap-0.5 ml-1.5 text-[8px] text-[#7DA8D3] align-bottom">
                <span>14:02</span>
                <span className="relative inline-block w-2.5 h-2.5">
                  <Check className="w-2.5 h-2.5 absolute inset-0 text-[#7DA8D3] hiw4-tick-single" />
                  <CheckCheck className="w-2.5 h-2.5 absolute inset-0 text-[#64B5EF] hiw4-tick-double" />
                </span>
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 8 13"
                className="w-1.5 h-2.5 absolute -right-[5px] bottom-0 fill-[#2B5278]"
              >
                <path d="M0 0v13h8c-3.5-1.5-6-5.5-8-13z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Incoming Invoice Bubble + Separated Inline Button */}
        <div className="hiw4-msg2-wrap">
          <div className="overflow-hidden flex flex-col items-start pl-1 gap-0.5 hiw4-msg2">
            <div className="relative bg-[#182533] text-[#F5F5F5] text-[9px] leading-tight px-2 py-1 rounded-[10px] max-w-[92%]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-white p-0.5 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-[#111217]">
                    <rect x="2" y="2" width="7" height="7" />
                    <rect x="4" y="4" width="3" height="3" fill="#fff" />
                    <rect x="15" y="2" width="7" height="7" />
                    <rect x="17" y="4" width="3" height="3" fill="#fff" />
                    <rect x="2" y="15" width="7" height="7" />
                    <rect x="4" y="17" width="3" height="3" fill="#fff" />
                    <rect x="11" y="11" width="4" height="4" fill="#3897F0" />
                    <rect x="16" y="15" width="6" height="6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">🧾 #INV-8821</p>
                  <p className="text-[8.5px] text-gray-300 truncate">Netflix 4K · 35K</p>
                </div>
                <span className="self-end text-[7.5px] text-[#6D7F8F] shrink-0">14:02</span>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 8 13"
                className="w-1.5 h-2.5 absolute -left-[5px] bottom-0 fill-[#182533]"
              >
                <path d="M8 0v13H0c3.5-1.5 6-5.5 8-13z" />
              </svg>
            </div>

            <div className="relative overflow-hidden w-[86%] bg-[#182533]/85 text-white text-[8.5px] font-medium py-0.5 px-1.5 rounded-md text-center hiw4-btn-press">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-5 -mt-5 w-10 h-10 rounded-full bg-white/30 hiw4-btn-ripple"
              />
              <span className="relative z-10">✅ Saya sudah bayar</span>
            </div>
          </div>
        </div>

        {/* 3. Centered Telegram Service Pill */}
        <div className="hiw4-pill-wrap">
          <div className="overflow-hidden flex justify-center">
            <span className="px-2 py-0.5 rounded-full bg-black/35 text-white/90 text-[8px] font-medium hiw4-pill">
              Pembayaran diterima · 14:02
            </span>
          </div>
        </div>

        {/* 4. Incoming Credential Bubble with Blur Spoiler Reveal */}
        <div className="hiw4-msg3-wrap">
          <div className="overflow-hidden flex items-start pl-1">
            <div className="relative bg-[#182533] text-[#F5F5F5] text-[9px] leading-tight px-2 py-1 rounded-[10px] max-w-[94%] hiw4-msg3">
              <p className="font-semibold text-white mb-0.5">🔓 Akun kamu:</p>
              <div className="relative overflow-hidden rounded bg-black/30 px-1.5 py-0.5 font-mono text-[8px] text-white">
                <span className="block truncate hiw4-spoiler">
                  nf4k@autobotz.id | Pass#26!
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[#233242]/70 hiw4-spoiler-mask overflow-hidden"
                >
                  <span className="block w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent tg-spoiler-shimmer" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5 text-[7.5px] text-[#6D7F8F]">
                <span className="text-[#64B5EF]">⏱ 1,4 dtk</span>
                <span>14:02</span>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 8 13"
                className="w-1.5 h-2.5 absolute -left-[5px] bottom-0 fill-[#182533]"
              >
                <path d="M8 0v13H0c3.5-1.5 6-5.5 8-13z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, idx }) {
  const Icon = step.icon
  const cardRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const node = cardRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsPlaying(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsPlaying(entry.isIntersecting)
        })
      },
      { threshold: 0.25 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <ScrollReveal3D
      direction="up"
      delay={idx * 65}
      tilt={false}
      className="bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] p-3.5 flex flex-col justify-between space-y-3.5 hover:border-white/[0.18] hover:bg-[#171C2B]/70 transition-shadow duration-200"
    >
      <div
        ref={cardRef}
        data-play={isPlaying ? 'on' : 'off'}
        style={{ '--hiw-delay': `${idx * 600}ms` }}
        className="space-y-3"
      >
        {/* Step Number + Category Badge + ETA */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-brand-pink text-white border border-white/[0.1] font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
              {step.num}
            </span>
            <span className="font-mono text-[9.5px] font-bold uppercase text-[#A8B0C2] truncate">
              {step.badge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] font-mono text-[9px] font-bold text-[#F4F6FA]">
              {step.eta}
            </span>
            <Icon className="w-3.5 h-3.5 text-[#F4F6FA] shrink-0" />
          </div>
        </div>

        {/* Continuous 60fps CSS Timeline Stage + Synchronized Caption Bar */}
        <div>
          {idx === 0 && <Step01PhonePaymentStage />}
          {idx === 1 && <Step02TokenStage />}
          {idx === 2 && <Step03InventoryStage />}
          {idx === 3 && <Step04MiniTelegramStage />}

          <StageCaptionBar captions={step.captions} prefix={`hiw${idx + 1}`} />
        </div>

        {/* Title & Explanation */}
        <div className="space-y-1.5 pt-0.5">
          <h3 className="font-heading font-extrabold text-[15px] text-[#F4F6FA] leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-[#A8B0C2] font-sans leading-relaxed">
            {step.desc}
          </p>
        </div>
      </div>

      {/* Concrete Technical Deliverables */}
      <div className="pt-2.5 border-t border-white/[0.08] space-y-1">
        <p className="font-mono text-[9.5px] font-bold uppercase text-[#F4F6FA]">
          Output {step.num}:
        </p>
        <ul className="space-y-1 text-[11px] font-sans text-[#F4F6FA]">
          {step.deliverables.map((item, dIdx) => (
            <li key={dIdx} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 text-brand-mint shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal3D>
  )
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-14 md:py-20 bg-[#0D1017]/80 border-b border-white/[0.08]"
    >
      <div className="container-brutalist space-y-8">
        {/* Clean Editorial Section Header */}
        <ScrollReveal3D direction="up" tilt={false} className="max-w-2xl space-y-2 text-left">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
            ALUR IMPLEMENTASI END-TO-END
          </p>
          <h2 className="heading-section">
            Toko Bot Telegram Aktif dalam 4 Langkah Teknis.
          </h2>
          <p className="text-sm sm:text-base text-[#A8B0C2] font-sans leading-relaxed">
            Setiap tahapan berjalan otomatis dari verifikasi pembayaran, enkripsi token bot AES-256-GCM, hingga pengiriman stok akun ke pembeli dalam hitungan detik.
          </p>
        </ScrollReveal3D>

        {/* Single Horizontal 4-Column Row on Desktop (sm: 2x2, lg: 4-in-a-row, tilt=false) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {STEPS.map((step, idx) => (
            <StepCard key={step.num} step={step} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
