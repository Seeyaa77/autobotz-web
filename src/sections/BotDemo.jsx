import { useState, useEffect, useRef } from 'react'
import useFluxScrollParallax from '../hooks/useFluxScrollParallax'
import TelegramSimulator from '../components/TelegramSimulator'
import { Terminal, ShieldCheck, Activity, Play } from 'lucide-react'

const AUTO_CLI_BOOT_SEQUENCE = [
  'autobotz-cli --watch --node="jkt-cloud-01" --encryption="aes-256-gcm"',
  '[OK] Worker connected to Telegram Webhook API (TLS 1.3)',
  '[OK] Listening on POST /api/payment/webhook (SHA-512 timingSafeEqual)',
  '[READY] Klik tombol di UI Telegram atau ikon perbesar di kanan atas chat...'
]

export default function BotDemo() {
  const sectionRef = useRef(null)
  useFluxScrollParallax(sectionRef)

  const [traceLogs, setTraceLogs] = useState([AUTO_CLI_BOOT_SEQUENCE[0]])
  const [typedLine, setTypedLine] = useState('')
  const [fullActiveCommand, setFullActiveCommand] = useState(
    'SELECT id, title, price_idr FROM accounts WHERE status = "available";'
  )

  useEffect(() => {
    let idx = 1
    const timer = setInterval(() => {
      if (idx < AUTO_CLI_BOOT_SEQUENCE.length) {
        const nextLine = AUTO_CLI_BOOT_SEQUENCE[idx]
        idx += 1
        setTraceLogs((prev) => [nextLine, ...prev])
      } else {
        clearInterval(timer)
      }
    }, 650)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setTypedLine('')
    let charIndex = 0
    const interval = setInterval(() => {
      charIndex += 2
      setTypedLine(fullActiveCommand.slice(0, charIndex))
      if (charIndex >= fullActiveCommand.length) {
        clearInterval(interval)
      }
    }, 24)
    return () => clearInterval(interval)
  }, [fullActiveCommand])

  const handleServerTrace = (newTrace) => {
    const ts = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setFullActiveCommand(newTrace)
    setTraceLogs((prev) => [`[${ts}] ${newTrace}`, ...prev.slice(0, 6)])
  }

  const triggerManualCliPing = () => {
    handleServerTrace(
      `PING /health -> 200 OK (latency=${(Math.random() * 4 + 1.1).toFixed(1)}ms, vault="AES-256-GCM")`
    )
  }

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-[#0D1017]/80 border-b border-white/[0.08] overflow-x-clip"
    >
      {/* FluxCode-Style Rotating Depth Glyph Watermark (right side) */}
      <span
        aria-hidden="true"
        data-flux-glyph="0.2"
        className="pointer-events-none select-none absolute -right-24 top-12 w-[440px] h-[440px] opacity-[0.045] will-change-transform"
      >
        <svg viewBox="0 0 240 240" fill="none" strokeWidth="10" className="w-full h-full">
          <path d="M88 184H184V88H88V120H120" stroke="#F4F6FA" />
          <path d="M120 120H152V152H56V56H152" stroke="#FD1843" />
        </svg>
      </span>

      <div className="container-brutalist relative z-10 space-y-10">
        {/* FluxCode-Style Drifting Section Header */}
        <div
          data-flux-drift="-0.06"
          data-flux-max="32"
          className="space-y-2.5 max-w-2xl will-change-transform"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#FF9E4F]">
            SIMULATOR UI TELEGRAM ASLI + LIVE CLI STREAM
          </p>
          <h2 className="heading-section">
            Rasakan Pengalaman Pembeli Berbelanja di Bot Telegram Anda.
          </h2>
          <p className="text-base text-[#A8B0C2] font-sans">
            Klik ikon <strong>Perbesar</strong> di pojok kanan atas aplikasi Telegram untuk tampilan 3D di tengah layar, atau langsung klik tombol inline keyboard tanpa goyangan saat di-hover.
          </p>
        </div>

        {/* Full-Width Split Showcase with FluxCode Viewer 3D Perspective Settle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Panel (5 cols): Drifting CLI Terminal Execution Log */}
          <div
            data-flux-drift="-0.04"
            data-flux-max="28"
            className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-5 will-change-transform"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="font-mono text-xs font-semibold uppercase text-[#F4F6FA] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#FF9E4F]" />
                  <span>LOG EKSEKUSI SERVER (CLI)</span>
                </span>
                <button
                  type="button"
                  onClick={triggerManualCliPing}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-brand-mint font-mono text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Test Ping CLI</span>
                </button>
              </div>

              {/* CLI Window with Typewriter Command Line & Blinking Cursor */}
              <div className="rounded-xl bg-[#090C12]/90 text-white border border-white/[0.1] overflow-hidden font-mono text-xs shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]">
                <div className="px-3 py-2 bg-[#141A26] border-b border-white/[0.08] flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-pink inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-amber inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-mint inline-block" />
                    <span className="ml-1 text-gray-300 font-semibold">root@autobotz-node:~</span>
                  </div>
                  <span className="text-brand-mint inline-flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>TTY1</span>
                  </span>
                </div>

                <div className="p-3.5 space-y-2 min-h-[190px] max-h-[220px] overflow-y-auto">
                  <div className="text-[#FF9E4F] text-[11px] break-all border-b border-white/[0.08] pb-2">
                    <span className="text-brand-pink font-bold">autobotz$ </span>
                    <span className="text-white">{typedLine}</span>
                    <span className="cli-cursor" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {traceLogs.map((line, idx) => (
                      <p
                        key={idx}
                        className={`break-all leading-relaxed ${
                          idx === 0
                            ? 'text-brand-mint font-bold text-[11px]'
                            : 'text-gray-400 text-[10.5px]'
                        }`}
                      >
                        {idx === 0 ? '➜ ' : '  '}
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <h3 className="font-heading font-bold text-base text-[#F4F6FA]">
                  Alur Eksekusi Real-Time:
                </h3>
                <ol className="space-y-2 text-xs sm:text-sm text-[#A8B0C2] font-sans">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-[#FF9E4F]">01.</span>
                    <span><strong>Inline Keyboard &amp; Menu:</strong> Setiap klik tombol di Telegram langsung memicu query di terminal CLI atas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-[#FF9E4F]">02.</span>
                    <span><strong>Ikon Perbesar di Pojok Kanan:</strong> Arahkan kursor ke ikon <code>[↗]</code> di kanan atas header Telegram untuk memperbesar simulasi ke tengah layar.</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090C12]/75 backdrop-blur-sm border border-white/[0.1] flex items-center gap-3 text-xs font-mono text-[#F4F6FA]">
              <ShieldCheck className="w-5 h-5 text-brand-mint shrink-0" />
              <span>Seluruh riwayat chat &amp; nomor resi tercatat otomatis di tab Transaksi Dashboard.</span>
            </div>
          </div>

          {/* Right Panel (7 cols): FluxCode Viewer 3D Perspective Settle (leans back -> settles flat at center, zero hover wobble) */}
          <div
            data-flux-viewer
            className="lg:col-span-7 will-change-transform"
          >
            <TelegramSimulator compact={false} onServerTrace={handleServerTrace} />
          </div>
        </div>
      </div>
    </section>
  )
}
