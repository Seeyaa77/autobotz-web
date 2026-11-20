import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Badge from '../components/Badge'
import ScrollReveal3D from '../components/ScrollReveal3D'
import TelegramSimulator from '../components/TelegramSimulator'
import { 
  ArrowRight, 
  CheckCircle2, 
  Terminal
} from 'lucide-react'

function AnimatedMetric({ mode }) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true)
        }
      },
      { threshold: 0.25 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const duration = 1100
    const startTs = performance.now()
    const target = mode === 'seconds' ? 3.0 : 100

    let rafId
    const step = (now) => {
      const progress = Math.min((now - startTs) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(eased * target)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [started, mode])

  if (mode === 'seconds') {
    return (
      <span ref={ref} className="inline-block tabular-nums">
        &lt; {val.toFixed(1)} dtk
      </span>
    )
  }

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {Math.round(val)}% Open
    </span>
  )
}

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="bg-brand-chill-white border-b-2 border-brand-dark stage-3d">
      {/* Main Hero Editorial Split */}
      <div className="container-brutalist py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (7 cols ~ 60%): Value Proposition & Dual CTAs */}
          <ScrollReveal3D direction="left" className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex flex-wrap items-center gap-2">
              <Badge variant="pink">ENGINE v2.4 READY</Badge>
              <span className="font-mono text-xs font-bold text-brand-dark px-2.5 py-1 rounded-md bg-brand-surface-tint border-2 border-brand-dark">
                FULFILLMENT &lt; 3 DETIK
              </span>
            </div>

            <h1 className="heading-hero">
              Otomatiskan Toko Akun Digital via{' '}
              <span className="text-brand-pink underline decoration-brand-dark decoration-4 underline-offset-4">
                Bot Telegram
              </span>{' '}
              24/7 Tanpa Admin Manual.
            </h1>

            <p className="text-base sm:text-lg text-brand-muted font-sans max-w-2xl leading-relaxed">
              Sewa bot cloud siap pakai atau miliki 100% source code Node.js tanpa enkripsi. Pembeli pilih produk di Telegram, bayar via QRIS atau Transfer Bank, dan bot langsung melepas kredensial akun dari stok terenkripsi Anda.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/payment?plan=pro')}
                className="group"
              >
                <span>Sewa Bot Cloud (Mulai 99K)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate('/payment?plan=script')}
              >
                <Terminal className="w-5 h-5 text-brand-dark" />
                <span>Beli Source Code (300K)</span>
              </Button>
            </div>

            {/* Verification Guarantees */}
            <div className="pt-4 border-t-2 border-brand-dark/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono font-bold text-brand-dark">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0" />
                <span>0% Potongan Komisi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0" />
                <span>Enkripsi AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0" />
                <span>Aktif dalam 5 Menit</span>
              </div>
            </div>
          </ScrollReveal3D>

          {/* Right Column (5 cols ~ 40%): Stable on hover (tilt={false}) so buttons are easy to click */}
          <ScrollReveal3D
            direction="right"
            delay={120}
            tilt={false}
            className="lg:col-span-5"
          >
            <TelegramSimulator compact={true} />
          </ScrollReveal3D>

        </div>
      </div>

      {/* High-Contrast Dark Trust Metrics Strip */}
      <div className="bg-brand-dark text-white border-t-2 border-brand-dark">
        <div className="container-brutalist py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="pt-3 md:pt-0 md:px-4 first:pl-0 first:pt-0">
              <p className="font-mono text-xs text-gray-400 uppercase">Waktu Kirim Akun</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-mint mt-0.5">
                <AnimatedMetric mode="seconds" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Sejak callback pembayaran diterima</p>
            </div>
            <div className="pt-3 md:pt-0 md:px-4">
              <p className="font-mono text-xs text-gray-400 uppercase">Enkripsi Database</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-white mt-0.5">AES-256</p>
              <p className="text-xs text-gray-400 mt-0.5">Token bot &amp; stok akun terenkripsi GCM</p>
            </div>
            <div className="pt-3 md:pt-0 md:px-4">
              <p className="font-mono text-xs text-gray-400 uppercase">Metode Pembayaran</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-pink mt-0.5">QRIS &amp; Bank</p>
              <p className="text-xs text-gray-400 mt-0.5">Midtrans Snap + Verifikasi Mutasi Manual</p>
            </div>
            <div className="pt-3 md:pt-0 md:px-4">
              <p className="font-mono text-xs text-gray-400 uppercase">Opsi Kepemilikan</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-amber mt-0.5">
                <AnimatedMetric mode="percent" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Sewa Cloud Bulanan atau Beli Source Code</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
