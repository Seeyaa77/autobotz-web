import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Send,
  Mic,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Copy,
  Check,
  RotateCcw,
  Menu,
  Clock,
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
  const [pendingBtnKey, setPendingBtnKey] = useState(null)
  const [ripples, setRipples] = useState({})
  const [revealedSpoilers, setRevealedSpoilers] = useState({})
  const [inputText, setInputText] = useState('')
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [isExpanded3D, setIsExpanded3D] = useState(false)

  const scrollContainerRef = useRef(null)
  const expandedScrollRef = useRef(null)
  const toastTimerRef = useRef(null)

  const emitTrace = (traceLine) => {
    if (typeof onServerTrace === 'function') {
      onServerTrace(traceLine)
    }
  }

  useEffect(() => {
    const scrollSmooth = (el) => {
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
    scrollSmooth(scrollContainerRef.current)
    scrollSmooth(expandedScrollRef.current)
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

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setCallbackToast(msg)
    toastTimerRef.current = setTimeout(() => setCallbackToast(''), 1600)
  }

  const triggerRipple = (btnKey, event) => {
    if (!event?.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => ({ ...prev, [btnKey]: { x, y, id } }))
    setTimeout(() => {
      setRipples((prev) => {
        if (prev[btnKey]?.id !== id) return prev
        const next = { ...prev }
        delete next[btnKey]
        return next
      })
    }, 460)
  }

  const triggerBotResponse = (
    userDisplay,
    callbackAction,
    payloadData = null,
    btnKey = null
  ) => {
    const timeStr = nowTime()

    if (callbackAction) {
      showToast(`Memproses ${userDisplay}…`)
    }
    if (btnKey) {
      setPendingBtnKey(btnKey)
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
      setPendingBtnKey(null)
      const responseTime = nowTime()
      const newMessages = []

      if (callbackAction === 'OPEN_CATALOG' || userDisplay === '/katalog') {
        emitTrace('SELECT id, title, price_idr, status FROM accounts WHERE status = "available"')
        newMessages.push({
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: responseTime,
          replyTo: userDisplay,
          text: '📂 KATALOG AKUN DIGITAL TERSEDIA\n\nPilih produk di bawah untuk membuat invoice QRIS & mengunci stok selama 15 menit:',
          inlineKeyboard: [
            ...CATALOG_PRODUCTS.map((p) => [
              { label: p.buttonText, action: 'SELECT_PRODUCT', product: p }
            ]),
            [{ label: '⬅️ Kembali ke Menu Utama', action: 'MAIN_MENU' }]
          ]
        })
      } else if (callbackAction === 'SELECT_PRODUCT' && payloadData) {
        const prod = payloadData
        emitTrace(`POST /api/orders { sku: "${prod.sku}", amount_idr: "${prod.price}", stock_lock: "RESERVED" }`)
        newMessages.push({
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: responseTime,
          replyTo: prod.buttonText,
          isInvoice: true,
          invoice: {
            id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
            title: prod.title,
            sku: prod.sku,
            price: prod.price,
            stock: prod.stock
          },
          text: `🧾 INVOICE PEMBAYARAN OTOMATIS\n\n• Produk: ${prod.title}\n• Status Stok: 1 Unit Dikunci (15 Menit)\n• Total Tagihan: ${prod.price}\n\nScan QRIS di atas atau tekan tombol konfirmasi di bawah:`,
          inlineKeyboard: [
            [
              {
                label: `✅ Saya sudah bayar (${prod.price})`,
                action: 'PAY_SUCCESS',
                product: prod
              }
            ],
            [
              { label: '🔄 Ganti Produk', action: 'OPEN_CATALOG' },
              { label: '⬅️ Menu Utama', action: 'MAIN_MENU' }
            ]
          ]
        })
      } else if (callbackAction === 'PAY_SUCCESS' && payloadData) {
        const prod = payloadData
        emitTrace(`POST /api/payment/webhook [SHA-512 VALID] -> DECRYPT AES-256-GCM (${prod.sku})`)
        newMessages.push({
          id: 'svc-' + Date.now(),
          sender: 'service',
          text: `Pembayaran QRIS diterima · ${responseTime}`
        })
        newMessages.push({
          id: 'bot-' + (Date.now() + 1),
          sender: 'bot',
          time: responseTime,
          replyTo: prod.title,
          text: `🔓 Pembayaran terverifikasi dalam 1,4 detik.\n\nBerikut detail akun ${prod.title} milik Anda (klik area blur untuk membuka spoiler):`,
          credential: prod.credential,
          sku: prod.sku,
          inlineKeyboard: [
            [
              { label: '🛒 Beli Akun Lainnya', action: 'OPEN_CATALOG' },
              { label: '📦 Cek Sisa Stok', action: 'CHECK_STOCK' }
            ]
          ]
        })
      } else if (callbackAction === 'CHECK_STOCK' || userDisplay === '/stok') {
        emitTrace('SELECT category_id, COUNT(*) FROM accounts WHERE status = "available" GROUP BY category_id')
        newMessages.push({
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: responseTime,
          replyTo: userDisplay,
          text: '📊 LIVE STOK BRANKAS AUTOBOTZ:\n\n• 🎬 Netflix 4K Ultra HD: 38 Unit\n• 🎨 Canva Pro Lifetime: 124 Unit\n• 🎵 Spotify Individual: 52 Unit\n• ✈️ Telegram Old 2021: 19 Unit\n\nSemua kredensial terenkripsi AES-256-GCM & siap dikirim otomatis.',
          inlineKeyboard: [
            [{ label: '🛒 Pilih & Beli Sekarang', action: 'OPEN_CATALOG' }],
            [{ label: '⬅️ Menu Utama', action: 'MAIN_MENU' }]
          ]
        })
      } else if (callbackAction === 'SUPPORT_INFO' || userDisplay === '/garansi') {
        emitTrace('GET /bot/warranty-policy -> 200 OK')
        newMessages.push({
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: responseTime,
          replyTo: userDisplay,
          text: '🛡️ PROSEDUR GARANSI & BANTUAN 24/7:\n\n1. Garansi penggantian akun baru 30 hari penuh.\n2. Kirim Nomor Invoice (#INV-xxxx) ke @AutobotzSupport.\n3. Bot otomatis memvalidasi status garansi Anda.',
          inlineKeyboard: [
            [
              { label: '🛒 Buka Katalog Produk', action: 'OPEN_CATALOG' },
              { label: '⬅️ Menu Utama', action: 'MAIN_MENU' }
            ]
          ]
        })
      } else {
        emitTrace('GET /bot/start -> 200 OK')
        newMessages.push({
          id: 'bot-' + Date.now(),
          sender: 'bot',
          time: responseTime,
          replyTo: userDisplay,
          text: '👋 Menu Utama Autobotz Official Store.\nSilakan pilih layanan otomatis di bawah ini:',
          inlineKeyboard: [
            [{ label: '🛒 Beli Akun Digital', action: 'OPEN_CATALOG' }],
            [
              { label: '📦 Cek Stok Live', action: 'CHECK_STOCK' },
              { label: '🛡️ Klaim Garansi', action: 'SUPPORT_INFO' }
            ]
          ]
        })
      }

      setMessages((prev) => [...prev, ...newMessages])
    }, 420)
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
    setPendingBtnKey(null)
    setShowCommandMenu(false)
    setRevealedSpoilers({})
    emitTrace('SESSION RESET -> /start 200 OK')
  }

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    showToast('Kredensial disalin ke clipboard')
    setTimeout(() => setCopiedId(null), 1800)
  }

  const hasText = inputText.trim().length > 0

  const renderTelegramWindow = (inModal = false) => (
    <div
      className={`bg-[#17212B] text-white border rounded-2xl overflow-hidden flex flex-col ${
        inModal
          ? 'w-full max-w-2xl mx-auto border-white/[0.18] shadow-[0_25px_70px_rgba(0,0,0,0.75)]'
          : 'border-white/[0.14] shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]'
      }`}
    >
      {/* 1. Authentic Telegram App Top Header Bar (No green dot, no BOT chip) */}
      <div className="px-3.5 py-2.5 bg-[#17212B] border-b border-[#0E1621] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={inModal ? () => setIsExpanded3D(false) : handleReset}
            title={inModal ? 'Tutup tampilan perbesar' : 'Reset simulasi chat'}
            className="p-1.5 rounded-full hover:bg-[#232E3C] text-[#7F91A4] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Authentic Telegram Gradient Initial Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#72D5FD] to-[#2A9EF1] flex items-center justify-center text-white font-sans font-bold text-base shrink-0 shadow-sm">
            A
          </div>

          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-semibold text-sm text-white truncate">
                Autobotz Store
              </span>
              <svg className="w-4 h-4 text-[#3897F0] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.8 4.5L18.5 4.1L19.6 7.6L22.8 9.5L21.4 13L22.8 16.5L19.6 18.4L18.5 21.9L14.8 21.5L12 24L9.2 21.5L5.5 21.9L4.4 18.4L1.2 16.5L2.6 13L1.2 9.5L4.4 7.6L5.5 4.1L9.2 4.5L12 2ZM10.4 16.2L17.2 9.4L15.8 8L10.4 13.4L8.2 11.2L6.8 12.6L10.4 16.2Z" />
              </svg>
            </div>
            {isTyping ? (
              <p className="text-[13px] text-[#64B5EF] font-sans flex items-center gap-1 leading-tight">
                <span>mengetik</span>
                <span className="w-1 h-1 rounded-full bg-[#64B5EF] tg-dot-1" />
                <span className="w-1 h-1 rounded-full bg-[#64B5EF] tg-dot-2" />
                <span className="w-1 h-1 rounded-full bg-[#64B5EF] tg-dot-3" />
              </p>
            ) : (
              <p className="text-[13px] text-[#7F91A4] font-sans leading-tight">
                bot
              </p>
            )}
          </div>
        </div>

        {/* Far-Right Clean Controls: Reset + Prominent Hover Enlarge Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-lg text-[#7F91A4] hover:text-white hover:bg-[#232E3C] inline-flex items-center justify-center transition-colors cursor-pointer"
            title="Reset percakapan (/start)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded3D(!inModal)}
            aria-label={inModal ? 'Kecilkan tampilan chat' : 'Perbesar tampilan chat'}
            title={inModal ? 'Kecilkan tampilan (ESC)' : 'Perbesar tampilan chat'}
            className="w-8 h-8 rounded-lg bg-[#232E3C] text-[#9AA9B8] border border-white/10 inline-flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#3897F0] hover:text-white hover:border-white hover:scale-110 hover:shadow-[0_0_14px_rgba(56,151,240,0.75)] active:scale-95"
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
        className={`tg-wallpaper relative p-3.5 sm:p-4 space-y-2.5 overflow-y-auto flex flex-col ${
          inModal ? 'h-[66vh] max-h-[560px]' : compact ? 'h-[360px]' : 'h-[430px]'
        }`}
      >
        {/* Authentic Borderless Date Pill */}
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
          <span className="bg-black/30 text-white/90 text-[12px] font-medium font-sans rounded-full px-2.5 py-0.5">
            Hari Ini
          </span>
        </div>

        {/* Authentic answerCallbackQuery Toast */}
        {callbackToast && (
          <div className="sticky top-7 z-20 flex justify-center pointer-events-none">
            <span className="bg-black/70 text-white text-[13px] font-sans rounded-lg px-3 py-2 shadow-lg tg-toast-enter">
              {callbackToast}
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.sender === 'service') {
            return (
              <div key={msg.id} className="flex justify-center tg-bubble-enter">
                <span className="bg-black/30 text-white/90 text-[11px] font-medium font-sans rounded-full px-3 py-0.5">
                  {msg.text}
                </span>
              </div>
            )
          }

          const isUser = msg.sender === 'user'
          const nextMsg = messages[idx + 1]
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender
          const isSpoilerRevealed = Boolean(revealedSpoilers[msg.id])

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end pr-1.5 tg-in-user' : 'items-start pl-1.5 tg-in-bot'
              }`}
            >
              <div
                className={`relative max-w-[88%] sm:max-w-[82%] rounded-[14px] px-3 py-2 text-[13px] font-sans shadow-sm ${
                  isUser
                    ? 'bg-[#2B5278] text-white'
                    : 'bg-[#182533] text-[#F5F5F5]'
                }`}
              >
                {/* Authentic 8x13 SVG Bubble Tail on last bubble of sender group */}
                {isLastInGroup && !isUser && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 8 13"
                    className="w-2 h-[13px] absolute -left-[6px] bottom-0 fill-[#182533]"
                  >
                    <path d="M8 0v13H0c3.5-1.5 6-5.5 8-13z" />
                  </svg>
                )}
                {isLastInGroup && isUser && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 8 13"
                    className="w-2 h-[13px] absolute -right-[6px] bottom-0 fill-[#2B5278]"
                  >
                    <path d="M0 0v13h8c-3.5-1.5-6-5.5-8-13z" />
                  </svg>
                )}

                {/* Authentic Telegram Reply Header */}
                {!isUser && msg.replyTo && (
                  <div className="mb-1.5 px-2 py-1 border-l-[3px] border-[#64B5EF] bg-[#64B5EF]/10 rounded-[4px] text-[12px] leading-tight">
                    <p className="font-semibold text-[#64B5EF]">Kamu</p>
                    <p className="text-gray-300 truncate">{msg.replyTo}</p>
                  </div>
                )}

                {/* Compact Invoice QRIS Attachment */}
                {msg.isInvoice && msg.invoice && (
                  <div className="mb-2 p-2.5 rounded-xl bg-[#0E1621]/80 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#3897F0]/20 text-[#64B5EF] font-sans text-[10px] font-semibold">
                        QRIS · {msg.invoice.id}
                      </span>
                      <p className="font-sans font-bold text-sm text-white pt-0.5">
                        {msg.invoice.price}
                      </p>
                      <p className="text-[11px] text-[#7F91A4] font-sans truncate">
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

                {/* Message Body + Inline Bottom-Right Timestamp & Checkmarks */}
                <div className="whitespace-pre-wrap leading-relaxed break-words">
                  <span>{msg.text}</span>
                  {!msg.credential && (
                    <span
                      className={`float-right ml-2.5 mt-1.5 inline-flex items-center gap-0.5 text-[11px] leading-none select-none ${
                        isUser ? 'text-[#7DA8D3]' : 'text-[#6D7F8F]'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#64B5EF]" />}
                    </span>
                  )}
                </div>

                {/* Authentic Telegram Spoiler Monospace Credential Block */}
                {msg.credential && (
                  <div className="mt-2 space-y-1.5">
                    <div className="bg-black/25 rounded-md px-2.5 py-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedSpoilers((prev) => ({
                            ...prev,
                            [msg.id]: true
                          }))
                        }
                        title={
                          isSpoilerRevealed
                            ? 'Kredensial terbuka'
                            : 'Klik untuk membuka spoiler kredensial'
                        }
                        className="relative flex-1 text-left overflow-hidden rounded cursor-pointer focus:outline-none"
                      >
                        <code
                          style={{
                            filter: isSpoilerRevealed ? 'blur(0px)' : 'blur(5px)',
                            transition: 'filter 400ms cubic-bezier(0.22, 1, 0.36, 1)'
                          }}
                          className="block font-mono text-[11.5px] text-white break-all select-all"
                        >
                          {msg.credential}
                        </code>
                        {!isSpoilerRevealed && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[#233242]/45 overflow-hidden"
                          >
                            <span className="block w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent tg-spoiler-shimmer" />
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRevealedSpoilers((prev) => ({ ...prev, [msg.id]: true }))
                          handleCopy(msg.credential, msg.id)
                        }}
                        className="px-2 py-1 rounded-md bg-[#3897F0]/20 hover:bg-[#3897F0] text-[#64B5EF] hover:text-white font-sans text-[11px] font-medium inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
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

                    <div className="flex items-center justify-between text-[11px] leading-none text-[#6D7F8F] select-none">
                      <span className="text-[#64B5EF]">
                        {isSpoilerRevealed ? '⏱ terkirim 1,4 dtk' : 'Ketuk blur untuk buka'}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Authentic Telegram Borderless Inline Keyboard Matrix with Ripple & Clock */}
              {!isUser && Array.isArray(msg.inlineKeyboard) && (
                <div className="w-full max-w-[88%] sm:max-w-[82%] mt-1 space-y-1">
                  {msg.inlineKeyboard.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className={`grid gap-1 ${
                        row.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {row.map((btn, bIdx) => {
                        const btnKey = `${msg.id}-${rIdx}-${bIdx}`
                        const isPending = pendingBtnKey === btnKey
                        const ripple = ripples[btnKey]

                        return (
                          <button
                            key={bIdx}
                            type="button"
                            disabled={isTyping}
                            onClick={(e) => {
                              triggerRipple(btnKey, e)
                              triggerBotResponse(
                                btn.label,
                                btn.action,
                                btn.product || null,
                                btnKey
                              )
                            }}
                            className="relative overflow-hidden py-2 px-2.5 rounded-lg bg-[#182533]/80 hover:bg-[#22303F] active:scale-[0.98] text-white font-sans font-medium text-[13px] transition-transform duration-150 flex items-center justify-center gap-1.5 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ripple && (
                              <span
                                aria-hidden="true"
                                style={{ left: ripple.x - 24, top: ripple.y - 24 }}
                                className="pointer-events-none absolute w-12 h-12 rounded-full bg-white/25 tg-ripple-anim"
                              />
                            )}
                            <span className="relative z-10 truncate">{btn.label}</span>
                            {isPending && (
                              <Clock className="w-3 h-3 text-white/75 absolute top-1.5 right-1.5 animate-pulse" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {isTyping && (
          <div className="tg-in-bot flex items-start pl-1.5">
            <div className="relative bg-[#182533] rounded-[14px] px-3.5 py-2.5 flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 8 13"
                className="w-2 h-[13px] absolute -left-[6px] bottom-0 fill-[#182533]"
              >
                <path d="M8 0v13H0c3.5-1.5 6-5.5 8-13z" />
              </svg>
              <span className="w-1.5 h-1.5 rounded-full bg-[#64B5EF] tg-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#64B5EF] tg-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#64B5EF] tg-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Slash Command Popover Drawer */}
      {showCommandMenu && (
        <div className="bg-[#17212B] border-t border-[#243447] px-3 py-2 space-y-1 tg-toast-enter">
          <p className="font-sans text-[11px] font-medium text-[#7F91A4] px-2">
            Perintah Bot
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
                className="px-2.5 py-1.5 rounded-lg hover:bg-[#232E3C] text-left flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <span className="font-mono font-bold text-[#64B5EF]">{item.cmd}</span>
                <span className="text-[11px] text-[#7F91A4] truncate ml-2">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Bottom Input Composer Bar (Authentic Menu Button + Mic <-> Send Swap) */}
      <form
        onSubmit={handleSendText}
        className="px-3 py-2.5 bg-[#17212B] border-t border-[#0E1621] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowCommandMenu(!showCommandMenu)}
          className={`h-8 px-3 rounded-full font-sans text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            showCommandMenu
              ? 'bg-[#2B5278] text-white'
              : 'bg-[#3897F0] hover:bg-[#2D84D6] text-white'
          }`}
          title="Buka menu perintah bot"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>

        <Paperclip className="w-4 h-4 text-[#7F91A4] shrink-0 hidden sm:block" />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Pesan..."
          className="flex-1 bg-transparent text-white placeholder:text-[#6C7883] text-[13px] font-sans px-1.5 py-1.5 focus:outline-none"
        />

        <Smile className="w-4 h-4 text-[#7F91A4] shrink-0 hidden sm:block" />

        {hasText ? (
          <button
            key="send-btn"
            type="submit"
            aria-label="Kirim pesan ke bot"
            className="w-8 h-8 rounded-full bg-[#3897F0] hover:bg-[#2D84D6] text-white flex items-center justify-center shrink-0 active:scale-95 cursor-pointer tg-icon-swap"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            key="mic-btn"
            type="button"
            onClick={() => showToast('Ketik /katalog atau pilih tombol di chat')}
            aria-label="Pesan suara"
            className="w-8 h-8 rounded-full hover:bg-[#232E3C] text-[#7F91A4] hover:text-white flex items-center justify-center shrink-0 cursor-pointer tg-icon-swap"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
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
