import { useState, useEffect } from 'react'
import ScrollReveal3D from '../components/ScrollReveal3D'
import TelegramSimulator from '../components/TelegramSimulator'
import { Terminal, ShieldCheck, Activity, Play } from 'lucide-react'

const AUTO_CLI_BOOT_SEQUENCE = [
  'autobotz-cli --watch --node="jkt-cloud-01" --encryption="aes-256-gcm"',
  '[OK] Worker connected to Telegram Webhook API (TLS 1.3)',
  '[OK] Listening on POST /api/payment/webhook (SHA-512 timingSafeEqual)',
  '[READY] Klik tombol di UI Telegram atau ikon perbesar di kanan atas chat...'
]

export default function BotDemo() {
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
    <section id="demo" className="py-16 md:py-24 bg-brand-surface-tint border-b-2 border-brand-dark stage-3d">
      <div className="container-brutalist space-y-10">
        
        {/* Left-aligned Header */}
        <ScrollReveal3D direction="up" className="space-y-2 max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
            SIMULATOR UI TELEGRAM ASLI + LIVE CLI STREAM
          </p>
          <h2 className="heading-section">
            Rasakan Pengalaman Pembeli Berbelanja di Bot Telegram Anda.
          </h2>
          <p className="text-base text-brand-muted font-sans">
            Klik ikon <strong>Perbesar</strong> di pojok kanan atas aplikasi Telegram untuk tampilan 3D di tengah layar, atau langsung klik tombol inline keyboard tanpa goyangan saat di-hover.
          </p>
        </ScrollReveal3D>

        {/* Full-Width Split Terminal Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel (5 cols): Interactive CLI Terminal Execution Log */}
          <ScrollReveal3D
            direction="left"
            delay={60}
            tilt={false}
            className="lg:col-span-5 bg-white border-2 border-brand-dark rounded-2xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-brand-dark pb-3">
                <span className="font-mono text-xs font-bold uppercase text-brand-dark flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-pink" />
                  <span>LOG EKSEKUSI SERVER (CLI)</span>
                </span>
                <button
                  type="button"
                  onClick={triggerManualCliPing}
                  className="px-2.5 py-1 rounded-md bg-brand-dark text-brand-mint font-mono text-[10px] font-bold inline-flex items-center gap-1 hover:bg-black cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Test Ping CLI</span>
                </button>
              </div>

              {/* CLI Window with Typewriter Command Line & Blinking Cursor */}
              <div className="rounded-xl bg-[#0B0F17] text-white border-2 border-brand-dark overflow-hidden font-mono text-xs">
                <div className="px-3 py-2 bg-[#161D2A] border-b border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-pink inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-amber inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-mint inline-block" />
                    <span className="ml-1 text-gray-300 font-bold">root@autobotz-node:~</span>
                  </div>
                  <span className="text-brand-mint inline-flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>TTY1</span>
                  </span>
                </div>

                <div className="p-3.5 space-y-2 min-h-[190px] max-h-[220px] overflow-y-auto">
                  <div className="text-brand-amber text-[11px] break-all border-b border-gray-800/80 pb-2">
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
                <h3 className="font-heading font-bold text-base text-brand-dark">
                  Alur Eksekusi Real-Time:
                </h3>
                <ol className="space-y-2 text-xs sm:text-sm text-brand-muted font-sans">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-brand-pink">01.</span>
                    <span><strong>Inline Keyboard &amp; Menu:</strong> Setiap klik tombol di Telegram langsung memicu query di terminal CLI atas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-brand-pink">02.</span>
                    <span><strong>Ikon Perbesar di Pojok Kanan:</strong> Arahkan kursor ke ikon <code>[↗]</code> di kanan atas header Telegram untuk memperbesar simulasi ke tengah layar.</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-surface-tint border-2 border-brand-dark flex items-center gap-3 text-xs font-mono text-brand-dark">
              <ShieldCheck className="w-5 h-5 text-brand-mint shrink-0" />
              <span>Seluruh riwayat chat &amp; nomor resi tercatat otomatis di tab Transaksi Dashboard.</span>
            </div>
          </ScrollReveal3D>

          {/* Right Panel (7 cols): Stable on hover (tilt={false}) so clicking buttons is effortless */}
          <ScrollReveal3D
            direction="right"
            delay={120}
            tilt={false}
            className="lg:col-span-7"
          >
            <TelegramSimulator compact={false} onServerTrace={handleServerTrace} />
          </ScrollReveal3D>

        </div>

      </div>
    </section>
  )
}
