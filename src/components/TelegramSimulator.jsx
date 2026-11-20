import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Bot,
  Send,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Copy,
  Check,
  RotateCcw,
  Slash,
  Maximize2,
  Minimize2
} from 'lucide-react'

const CATALOG_PRODUCTS = [
  {
    id: 'netflix',
    buttonText: '🎬 Netflix 4K Private (Rp 35.000)',
    title: 'Netflix 4K Ultra HD Private (30 Hari)',
    price: 'Rp 35.000',
    stock: 38,
    sku: 'NF-4K-30D',
    credential: 'nf.ultra4k.992@autobotz.id | Pass#Netflix26! | Pin: 4409'
  },
  {
    id: 'canva',
    buttonText: '🎨 Canva Pro Lifetime (Rp 15.000)',
    title: 'Canva Pro Education / Team Invite',
    price: 'Rp 15.000',
    stock: 124,
    sku: 'CNV-PRO-LIFE',
    credential: 'canva.pro.vip@autobotz.id | Invite: https://canva.com/brand/join?token=ABZ2026'
  },
  {
    id: 'telegram',
    buttonText: '✈️ Telegram Old 2021 (Rp 45.000)',
    title: 'Akun Telegram Tua 2021 (Aged + 2FA)',
    price: 'Rp 45.000',
    stock: 19,
    sku: 'TG-OLD-2021',
    credential: '+62 819-4401-9920 | 2FA Cloud Pass: AutoBotz#2026 | TData Ready'
  }
]

const COMMAND_LIST = [
  { cmd: '/start', desc: 'Buka menu utama & katalog toko' },
  { cmd: '/katalog', desc: 'Pilih dan beli akun digital instan' },
  { cmd: '/stok', desc: 'Cek jumlah stok real-time di database' },
  { cmd: '/garansi', desc: 'Klaim garansi & hubungi CS 24/7' }
]

const INITIAL_CHAT = [
  {
    id: 'msg-init-1',
    sender: 'bot',
    time: '04:55',
    replyTo: '/start',
    text: '👋 Selamat datang di Official Autobotz Store!\n\nSistem pengiriman akun otomatis aktif 24 jam. Pilih produk atau menu di bawah untuk mulai bertransaksi:',
    inlineKeyboard: [
      [{ label: '🛒 Beli Akun Digital', action: 'OPEN_CATALOG' }],
      [
        { label: '📦 Cek Stok Live', action: 'CHECK_STOCK' },
        { label: '🛡️ Klaim Garansi', action: 'SUPPORT_INFO' }
      ]
    ]
  }
]

export default function TelegramSimulator({
  compact = false,
  onServerTrace = null
}) {
  const [messages, setMessages] = useState(INITIAL_CHAT)
  const [isTyping, setIsTyping] = useState(false)
  const [callbackToast, setCallbackToast] = useState('')
  const [inputText, setInputText] = useState('')
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [isExpanded3D, setIsExpanded3D] = useState(false)

  const scrollContainerRef = useRef(null)
  const expandedScrollRef = useRef(null)

  const emitTrace = (traceLine) => {
    if (typeof onServerTrace === 'function') {
      onServerTrace(traceLine)
    }
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
    if (expandedScrollRef.current) {
      expandedScrollRef.current.scrollTop = expandedScrollRef.current.scrollHeight
    }
  }, [messages, isTyping, isExpanded3D])

  useEffect(() => {
    if (!isExpanded3D) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsExpanded3D(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isExpanded3D])

  const nowTime = () =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const triggerBotResponse = (userDisplay, callbackAction, payloadData = null) => {
    const timeStr = nowTime()

    if (callbackAction) {
      setCallbackToast(`Memproses ${userDisplay}...`)
      setTimeout(() => setCallbackToast(''), 1100)
    }

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      time: timeStr,
      text: userDisplay
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      let botMsg = null

      if (callbackAction === 'OPEN_CATALOG' || userDisplay === '/katalog') {
        emitTrace('SELECT id, title, price_idr, status FROM accounts WHERE status = "available"')
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: userDisplay,
          text: '📂 KATALOG AKUN DIGITAL TERSEDIA\n\nPilih produk di bawah untuk membuat invoice QRIS & mengunci stok selama 15 menit:',
          inlineKeyboard: [
            ...CATALOG_PRODUCTS.map((p) => [
              { label: p.buttonText, action: 'SELECT_PRODUCT', product: p }
            ]),
            [{ label: '⬅️ Kembali ke Menu Utama', action: 'MAIN_MENU' }]
          ]
        }
      } else if (callbackAction === 'SELECT_PRODUCT' && payloadData) {
        const prod = payloadData
        emitTrace(`POST /api/orders { sku: "${prod.sku}", amount_idr: "${prod.price}", stock_lock: "RESERVED" }`)
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: prod.buttonText,
          isInvoice: true,
          invoice: {
            id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
            title: prod.title,
            sku: prod.sku,
            price: prod.price,
            stock: prod.stock
          },
          text: `🧾 INVOICE PEMBAYARAN OTOMATIS\n\n• Produk: ${prod.title}\n• Status Stok: 1 Unit Dikunci (15 Menit)\n• Total Tagihan: ${prod.price}\n\nScan QRIS di atas atau tekan tombol simulasi webhook di bawah:`,
          inlineKeyboard: [
            [
              {
                label: `⚡ Simulasikan Bayar QRIS Lunas (${prod.price})`,
                action: 'PAY_SUCCESS',
                product: prod
              }
            ],
            [
              { label: '🔄 Ganti Produk', action: 'OPEN_CATALOG' },
              { label: '⬅️ Menu Utama', action: 'MAIN_MENU' }
            ]
          ]
        }
      } else if (callbackAction === 'PAY_SUCCESS' && payloadData) {
        const prod = payloadData
        emitTrace(`POST /api/payment/webhook [SHA-512 VALID] -> DECRYPT AES-256-GCM (${prod.sku})`)
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: `Webhook Midtrans SHA-512 • ${prod.sku}`,
          text: `✅ PEMBAYARAN LUNAS TERVERIFIKASI (1.4 Detik)\n\nTerima kasih! Sistem telah mendekripsi 1 unit stok ${prod.title} khusus untuk Anda:`,
          credential: prod.credential,
          sku: prod.sku,
          inlineKeyboard: [
            [
              { label: '🛒 Beli Akun Lainnya', action: 'OPEN_CATALOG' },
              { label: '📦 Cek Sisa Stok', action: 'CHECK_STOCK' }
            ]
          ]
        }
      } else if (callbackAction === 'CHECK_STOCK' || userDisplay === '/stok') {
        emitTrace('SELECT category_id, COUNT(*) FROM accounts WHERE status = "available" GROUP BY category_id')
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: userDisplay,
          text: '📊 LIVE STOK BRANKAS AUTOBOTZ:\n\n• 🎬 Netflix 4K Ultra HD: 38 Unit (Ready)\n• 🎨 Canva Pro Lifetime: 124 Unit (Ready)\n• 🎵 Spotify Individual: 52 Unit (Ready)\n• ✈️ Telegram Old 2021: 19 Unit (Ready)\n\nSemua kredensial dienkripsi AES-256-GCM & siap dikirim otomatis.',
          inlineKeyboard: [
            [{ label: '🛒 Pilih & Beli Sekarang', action: 'OPEN_CATALOG' }],
            [{ label: '⬅️ Menu Utama', action: 'MAIN_MENU' }]
          ]
        }
      } else if (callbackAction === 'SUPPORT_INFO' || userDisplay === '/garansi') {
        emitTrace('GET /bot/warranty-policy -> 200 OK')
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: userDisplay,
          text: '🛡️ PROSEDUR GARANSI & BANTUAN 24/7:\n\n1. Garansi penggantian akun baru 30 hari penuh.\n2. Cukup kirimkan Nomor Invoice (#INV-xxxx) ke @AutobotzSupport.\n3. Bot akan otomatis memvalidasi status garansi Anda.',
          inlineKeyboard: [
            [
              { label: '🛒 Buka Katalog Produk', action: 'OPEN_CATALOG' },
              { label: '⬅️ Menu Utama', action: 'MAIN_MENU' }
            ]
          ]
        }
      } else {
        emitTrace('GET /bot/start -> 200 OK')
        botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: nowTime(),
          replyTo: userDisplay,
          text: '👋 Menu Utama Autobotz Official Store.\nSilakan pilih layanan otomatis di bawah ini:',
          inlineKeyboard: [
            [{ label: '🛒 Beli Akun Digital', action: 'OPEN_CATALOG' }],
            [
              { label: '📦 Cek Stok Live', action: 'CHECK_STOCK' },
              { label: '🛡️ Klaim Garansi', action: 'SUPPORT_INFO' }
            ]
          ]
        }
      }

      setMessages((prev) => [...prev, botMsg])
    }, 340)
  }

  const handleSendText = (e) => {
    e.preventDefault()
    const raw = inputText.trim()
    if (!raw || isTyping) return
    setInputText('')
    setShowCommandMenu(false)

    const lower = raw.toLowerCase()
    if (lower.includes('katalog') || lower.includes('beli')) {
      triggerBotResponse(raw, 'OPEN_CATALOG')
    } else if (lower.includes('stok')) {
      triggerBotResponse(raw, 'CHECK_STOCK')
    } else if (lower.includes('garansi') || lower.includes('cs')) {
      triggerBotResponse(raw, 'SUPPORT_INFO')
    } else {
      triggerBotResponse(raw, 'MAIN_MENU')
    }
  }

  const handleReset = () => {
    setMessages(INITIAL_CHAT)
    setIsTyping(false)
    setShowCommandMenu(false)
    emitTrace('SESSION RESET -> /start 200 OK')
  }

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const renderTelegramWindow = (inModal = false) => (
    <div
      className={`bg-[#17212B] text-white border-2 border-brand-dark rounded-2xl overflow-hidden flex flex-col ${
        inModal
          ? 'w-full max-w-2xl mx-auto shadow-[8px_8px_0px_0px_#111217]'
          : 'shadow-brutalist'
      }`}
    >
      {/* 1. Authentic Telegram App Top Header Bar (Clean & Stable, No Red Blocks) */}
      <div className="px-3.5 py-2.5 bg-[#17212B] border-b border-[#0E1621] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={inModal ? () => setIsExpanded3D(false) : handleReset}
            title={inModal ? 'Tutup tampilan perbesar' : 'Reset simulasi chat'}
            className="p-1.5 rounded-full hover:bg-[#232E3C] text-[#7F91A4] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Telegram Bot Avatar with Online Dot */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#3897F0] border border-white/20 flex items-center justify-center text-white font-heading font-bold text-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#31B545] border-2 border-[#17212B]" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-xs sm:text-sm text-white">
                Autobotz Store Bot
              </span>
              <svg className="w-4 h-4 text-[#3897F0] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.8 4.5L18.5 4.1L19.6 7.6L22.8 9.5L21.4 13L22.8 16.5L19.6 18.4L18.5 21.9L14.8 21.5L12 24L9.2 21.5L5.5 21.9L4.4 18.4L1.2 16.5L2.6 13L1.2 9.5L4.4 7.6L5.5 4.1L9.2 4.5L12 2ZM10.4 16.2L17.2 9.4L15.8 8L10.4 13.4L8.2 11.2L6.8 12.6L10.4 16.2Z" />
              </svg>
              <span className="px-1.5 py-0.5 rounded bg-[#232E3C] text-[#64B5EF] font-mono text-[9px] font-bold uppercase">
                BOT
              </span>
            </div>
            <p className="text-[11px] text-[#64B5EF] font-sans">
              {isTyping ? 'sedang mengetik...' : 'bot • 24.850 pengguna bulanan'}
            </p>
          </div>
        </div>

        {/* Far-Right Clean Controls: Reset + Prominent Hover Enlarge Icon */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-lg text-[#7F91A4] hover:text-white hover:bg-[#232E3C] transition-colors cursor-pointer"
            title="Reset percakapan (/start)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Clean Far-Right Enlarge Icon Button (Quiet at rest, stands out sharply on hover) */}
          <button
            type="button"
            onClick={() => setIsExpanded3D(!inModal)}
            aria-label={inModal ? 'Kecilkan layar Telegram' : 'Perbesar layar Telegram'}
            title={inModal ? 'Kecilkan layar (ESC)' : 'Perbesar layar Telegram'}
            className="p-2 rounded-lg bg-[#232E3C] text-[#8FA2B7] border border-white/10 hover:bg-[#3897F0] hover:text-white hover:border-white hover:scale-110 hover:shadow-[0_0_0_2px_#111217] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            {inModal ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Authentic Telegram Chat Wallpaper Stream */}
      <div
        ref={inModal ? expandedScrollRef : scrollContainerRef}
        className={`tg-wallpaper relative p-3.5 sm:p-4 space-y-3 overflow-y-auto flex flex-col ${
          inModal ? 'h-[66vh] max-h-[560px]' : compact ? 'h-[360px]' : 'h-[430px]'
        }`}
      >
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
          <span className="px-3 py-0.5 rounded-full bg-[#182533]/90 border border-white/10 text-[11px] font-sans text-gray-300">
            Hari Ini
          </span>
        </div>

        {callbackToast && (
          <div className="sticky top-7 z-20 flex justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-lg bg-black/85 border border-[#64B5EF]/40 text-[11px] font-mono text-[#64B5EF] shadow-lg">
              ⚡ {callbackToast}
            </span>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`tg-bubble-enter flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] font-sans shadow-sm ${
                  isUser
                    ? 'bg-[#2B5278] text-white rounded-br-sm'
                    : 'bg-[#182533] text-[#F5F5F5] rounded-bl-sm border border-[#243447]'
                }`}
              >
                {!isUser && msg.replyTo && (
                  <div className="mb-2 pl-2.5 py-1 border-l-2 border-[#64B5EF] bg-[#202F3F] rounded-r text-[11px] leading-tight">
                    <p className="font-bold text-[#64B5EF]">Permintaan Buyer</p>
                    <p className="text-gray-300 truncate">{msg.replyTo}</p>
                  </div>
                )}

                {msg.isInvoice && msg.invoice && (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-[#0E1621] border border-[#2B5278] flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#3897F0] text-white font-mono text-[9px] font-bold">
                        QRIS DINAMIS • {msg.invoice.id}
                      </span>
                      <p className="font-mono font-bold text-xs text-white pt-0.5">
                        {msg.invoice.price}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        SKU: {msg.invoice.sku}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-full h-full fill-[#111217]">
                        <rect x="2" y="2" width="10" height="10" />
                        <rect x="4" y="4" width="6" height="6" fill="#fff" />
                        <rect x="5" y="5" width="4" height="4" />
                        <rect x="24" y="2" width="10" height="10" />
                        <rect x="26" y="4" width="6" height="6" fill="#fff" />
                        <rect x="27" y="5" width="4" height="4" />
                        <rect x="2" y="24" width="10" height="10" />
                        <rect x="4" y="26" width="6" height="6" fill="#fff" />
                        <rect x="5" y="27" width="4" height="4" />
                        <rect x="15" y="4" width="4" height="4" />
                        <rect x="15" y="14" width="6" height="6" fill="#3897F0" />
                        <rect x="4" y="15" width="6" height="4" />
                        <rect x="24" y="15" width="8" height="4" />
                        <rect x="15" y="24" width="5" height="8" />
                        <rect x="24" y="24" width="8" height="8" />
                      </svg>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                {msg.credential && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#0E1621] border border-[#31B545]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#31B545]">
                      <span>🔓 AES-256-GCM DECRYPTED</span>
                      <span>{msg.sku}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-800">
                      <code className="font-mono text-[11px] text-white font-bold break-all">
                        {msg.credential}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.credential, msg.id)}
                        className="px-2.5 py-1 rounded bg-[#3897F0] hover:bg-[#2D84D6] text-white font-mono text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#7F91A4] font-mono select-none">
                  <span>{msg.time}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#64B5EF]" />}
                </div>
              </div>

              {/* Authentic Telegram Inline Keyboard Matrix */}
              {!isUser && Array.isArray(msg.inlineKeyboard) && (
                <div className="w-full max-w-[88%] sm:max-w-[82%] mt-1 space-y-1">
                  {msg.inlineKeyboard.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className={`grid gap-1 ${
                        row.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          type="button"
                          disabled={isTyping}
                          onClick={() =>
                            triggerBotResponse(btn.label, btn.action, btn.product || null)
                          }
                          className="py-2 px-2.5 rounded-lg bg-[#202B36]/95 hover:bg-[#2B3948] active:scale-[0.99] text-white font-sans font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer disabled:opacity-50"
                        >
                          <span className="truncate">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {isTyping && (
          <div className="tg-bubble-enter flex items-start">
            <div className="bg-[#182533] border border-[#243447] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64B5EF] tg-dot-1" />
              <span className="w-2 h-2 rounded-full bg-[#64B5EF] tg-dot-2" />
              <span className="w-2 h-2 rounded-full bg-[#64B5EF] tg-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Slash Command Popover Drawer */}
      {showCommandMenu && (
        <div className="bg-[#17212B] border-t border-[#243447] px-3 py-2 space-y-1">
          <p className="font-mono text-[10px] text-[#7F91A4] uppercase px-2">
            Daftar Perintah Bot Telegram
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {COMMAND_LIST.map((item) => (
              <button
                key={item.cmd}
                type="button"
                onClick={() => {
                  setShowCommandMenu(false)
                  if (item.cmd === '/katalog') triggerBotResponse(item.cmd, 'OPEN_CATALOG')
                  else if (item.cmd === '/stok') triggerBotResponse(item.cmd, 'CHECK_STOCK')
                  else if (item.cmd === '/garansi') triggerBotResponse(item.cmd, 'SUPPORT_INFO')
                  else triggerBotResponse(item.cmd, 'MAIN_MENU')
                }}
                className="px-2.5 py-1.5 rounded-lg hover:bg-[#232E3C] text-left flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-mono font-bold text-[#64B5EF]">{item.cmd}</span>
                <span className="text-[11px] text-gray-400 truncate ml-2">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Bottom Input Composer Bar */}
      <form
        onSubmit={handleSendText}
        className="px-3 py-2.5 bg-[#17212B] border-t border-[#0E1621] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowCommandMenu(!showCommandMenu)}
          className={`px-2.5 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
            showCommandMenu
              ? 'bg-[#2B5278] text-white'
              : 'bg-[#3897F0] hover:bg-[#2D84D6] text-white'
          }`}
          title="Buka menu perintah bot"
        >
          <Slash className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>

        <Paperclip className="w-4 h-4 text-[#7F91A4] shrink-0 hidden sm:block" />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik /katalog, /stok, atau klik tombol di atas..."
          className="flex-1 bg-[#0E1621] text-white placeholder:text-[#6C7883] text-xs rounded-full px-3.5 py-2 border border-[#243447] focus:outline-none focus:border-[#64B5EF]"
        />

        <Smile className="w-4 h-4 text-[#7F91A4] shrink-0 hidden sm:block" />

        <button
          type="submit"
          aria-label="Kirim pesan ke bot"
          className="w-8 h-8 rounded-full bg-[#3897F0] hover:bg-[#2D84D6] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )

  return (
    <>
      {renderTelegramWindow(false)}

      {/* Clean Minimal 3D Center Expanded Modal (No red header bar, no hover wobble) */}
      {isExpanded3D &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setIsExpanded3D(false)}
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 sm:p-6 stage-3d"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl tg-modal-3d-enter"
            >
              {renderTelegramWindow(true)}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
