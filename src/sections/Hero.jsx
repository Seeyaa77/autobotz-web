import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Badge from '../components/Badge'
import TelegramSimulator from '../components/TelegramSimulator'
import IndustrialRobots3D from '../components/IndustrialRobots3D'
import {
  ArrowRight,
  CheckCircle2,
  Terminal,
  Zap,
  Lock,
  CreditCard,
  Database,
  Code2,
  RefreshCw,
  ArrowDownRight
} from 'lucide-react'

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

function AnimatedMetric({ mode, active }) {
  const [val, setVal] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true
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
  }, [active, mode])

  if (mode === 'seconds') {
    return (
      <span className="inline-block tabular-nums">
        &lt; {val.toFixed(1)} dtk
      </span>
    )
  }

  return (
    <span className="inline-block tabular-nums">
      {Math.round(val)}% Open
    </span>
  )
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function Hero() {
  const navigate = useNavigate()
  const secRef = useRef(null)
  const svgRef = useRef(null)
  const wordRef = useRef(null)
  const edgeGRef = useRef(null)
  const textRef = useRef(null)
  const edgeRef = useRef(null)
  const dimRef = useRef(null)
  const introRef = useRef(null)
  const revealRef = useRef(null)
  const spotlightRef = useRef(null)
  const ctaBtnRef = useRef(null)
  const progressRef = useRef(0)
  const scrambleIntervalRef = useRef(null)

  const [flightEnabled, setFlightEnabled] = useState(true)
  const [metricsActive, setMetricsActive] = useState(false)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [cipherState, setCipherState] = useState({
    iv: '9f8a2bc4e17d',
    tag: '4c7e1a8b09f2',
    cipher: 'd8a4f019c3e77b21a904'
  })
  const [isScrambling, setIsScrambling] = useState(false)

  const triggerCipherScramble = () => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current)
    }
    setIsScrambling(true)
    setSampleIndex((prev) => (prev + 1) % SAMPLE_PLAINTEXTS.length)
    let ticks = 0
    scrambleIntervalRef.current = setInterval(() => {
      ticks += 1
      setCipherState({
        iv: randomHex(12),
        tag: randomHex(12),
        cipher: randomHex(20)
      })
      if (ticks >= 8) {
        clearInterval(scrambleIntervalRef.current)
        scrambleIntervalRef.current = null
        setIsScrambling(false)
      }
    }, 65)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      triggerCipherScramble()
    }, 4200)
    return () => {
      clearInterval(timer)
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReduced) {
      setFlightEnabled(false)
      setMetricsActive(true)
      return
    }

    const sec = secRef.current
    const svg = svgRef.current
    const word = wordRef.current
    const edgeG = edgeGRef.current
    const text = textRef.current
    const edge = edgeRef.current
    const dim = dimRef.current
    if (!sec || !svg || !word || !edgeG || !text || !edge || !dim) return

    const allRects = sec.querySelectorAll('.fh-all')
    const origin = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 }
    let shown = 0
    let raf = 0
    let capCache = 0
    let lastFrameTs = performance.now()

    const getCapRatio = () => {
      if (capCache) return capCache
      try {
        const cs = getComputedStyle(text)
        const ctx = document.createElement('canvas').getContext('2d')
        if (ctx) {
          ctx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`
          const m = ctx.measureText('A')
          if (m.actualBoundingBoxAscent > 30) {
            capCache = m.actualBoundingBoxAscent / 100
          }
        }
      } catch {
        // fallback below
      }
      return capCache || 0.72
    }

    const layout = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      allRects.forEach((rect) => {
        rect.setAttribute('width', String(w))
        rect.setAttribute('height', String(h))
      })

      let size = Math.min(w * 0.19, h * 0.34)
      const place = (sz) => {
        ;[text, edge].forEach((t) => {
          t.setAttribute('x', String(w / 2))
          t.setAttribute('y', String(h * 0.42 + sz * 0.35))
          t.setAttribute('font-size', String(sz))
        })
      }
      place(size)

      try {
        const len = edge.getComputedTextLength()
        if (len > w * 0.88) {
          size = (size * (w * 0.88)) / len
          place(size)
        }
      } catch {
        // retry next layout
      }

      try {
        const hdr = document.querySelector('header')
        const top = Math.min(110, Math.max(56, hdr ? hdr.offsetHeight : 72)) + 12
        const cap = getCapRatio() * size
        const gap = Math.max(24, Math.min(64, size * 0.24))
        const claimEstimate = 160
        const room = h - top - 16
        const group = cap + gap + claimEstimate
        const base = top + Math.max(0, (room - group) * 0.44) + cap
        ;[text, edge].forEach((t) => t.setAttribute('y', String(base)))
        sec.style.setProperty('--it', `${Math.round(base + gap)}px`)

        const bBox = edge.getExtentOfChar(4)
        origin.x = bBox.x + bBox.width * 0.24
        origin.y = base - cap * 0.42
      } catch {
        origin.x = w * 0.5
        origin.y = h * 0.42
      }
    }

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const frame = (now = performance.now()) => {
      raf = 0
      const dt = Math.min(Math.max((now - lastFrameTs) / 1000, 0.004), 0.05)
      lastFrameTs = now
      const vh = window.innerHeight
      const vw = window.innerWidth
      const r = sec.getBoundingClientRect()
      const span = Math.max(1, sec.offsetHeight - vh)
      const target = clamp01(-r.top / span)

      const lerpK = 1 - Math.pow(1 - 0.16, Math.max(dt * 60, 0.5))
      shown += (target - shown) * lerpK
      if (Math.abs(target - shown) < 0.0004) {
        shown = target
      } else {
        queue()
      }

      const p = shown
      progressRef.current = p

      // Beat 1 (p: 0.00 -> 0.30): Zoom through "Autobotz" while cloud curtains split Left & Right
      const z = clamp01(p / 0.3)
      const s = 1 + Math.pow(z, 3) * 60
      const pan = easeInOutCubic(z)
      const cx = origin.x + (vw / 2 - origin.x) * pan
      const cy = origin.y + (vh / 2 - origin.y) * pan
      const tf = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-origin.x).toFixed(2)} ${(-origin.y).toFixed(2)})`

      word.setAttribute('transform', tf)
      edgeG.setAttribute('transform', tf)

      const mix = 1 - easeInOutCubic(clamp01((z - 0.5) / 0.44))
      dim.style.opacity = mix.toFixed(3)
      edge.style.opacity = (mix * (1 - z * 0.8)).toFixed(3)

      // Cloud curtains split Left & Right cleanly (p: 0.05 -> 0.34)
      const cloudPart = easeInOutCubic(clamp01((p - 0.05) / 0.29))

      // Friendly "Say Hi" bubble visible while robot stands centered & waves (p: 0.18 -> 0.39)
      const hiIn = easeInOutCubic(clamp01((p - 0.18) / 0.08))
      const hiOut = easeInOutCubic(clamp01((p - 0.34) / 0.07))
      const hiOpacity = Math.max(0, hiIn * (1 - hiOut))

      // Beat 2 (p: 0.42 -> 0.68): Hero UI ("Otomatiskan Toko...") enters; robot sits on "Sewa Bot Cloud" button
      const h = easeInOutCubic(clamp01((p - 0.42) / 0.12))
      const so = easeInOutCubic(clamp01((p - 0.46) / 0.12))

      // Beat 3 (p: 0.68 -> 0.84 -> 1.00): Hero exits smoothly while Arsitektur & Keamanan UI + Cloud Mist rises
      const hx = easeInOutCubic(clamp01((p - 0.68) / 0.12))
      const sp = easeInOutCubic(clamp01((p - 0.74) / 0.14))
      const sit = easeInOutCubic(clamp01((p - 0.38) / 0.16)) * (1 - hx)

      const io = clamp01(1 - p * 6.8)
      const co = Math.max(0, h * (1 - hx * 1.25))
      const cyHero = (1 - h) * 44 - hx * 0.2 * vh
      const csHero = 0.95 + h * 0.05 - hx * 0.09
      const cbHero = hx * 9
      const stripOp = Math.max(0, so * (1 - hx * 1.35))
      const stripY = (1 - so) * 24 + hx * 32

      sec.style.setProperty('--p', p.toFixed(4))
      sec.style.setProperty('--z', z.toFixed(4))
      sec.style.setProperty('--cc', cloudPart.toFixed(4))
      sec.style.setProperty('--hi', hiOpacity.toFixed(3))
      sec.style.setProperty('--io', io.toFixed(3))
      sec.style.setProperty('--iy', `${(-p * 26 * vh / 100).toFixed(1)}px`)
      sec.style.setProperty('--h', h.toFixed(3))
      sec.style.setProperty('--co', co.toFixed(3))
      sec.style.setProperty('--cy', `${cyHero.toFixed(1)}px`)
      sec.style.setProperty('--cs', csHero.toFixed(4))
      sec.style.setProperty('--cb', `${cbHero.toFixed(1)}px`)
      sec.style.setProperty('--so', stripOp.toFixed(3))
      sec.style.setProperty('--sy', `${stripY.toFixed(1)}px`)
      sec.style.setProperty('--sp', sp.toFixed(3))
      sec.style.setProperty('--sit', sit.toFixed(3))
      sec.style.setProperty('--spy', `${((1 - sp) * 56).toFixed(1)}px`)
      sec.style.setProperty('--sps', (0.9 + sp * 0.1).toFixed(4))

      if (introRef.current) {
        introRef.current.style.pointerEvents = io > 0.08 ? 'auto' : 'none'
      }
      if (revealRef.current) {
        revealRef.current.style.pointerEvents = co > 0.45 ? 'auto' : 'none'
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.pointerEvents = sp > 0.45 ? 'auto' : 'none'
      }
      if (h > 0.35) {
        setMetricsActive(true)
      }
    }

    layout()
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        capCache = 0
        layout()
        queue()
      })
    }

    const onResize = () => {
      layout()
      queue()
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', queue, { passive: true })
    frame()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', queue)
    }
  }, [])

  const scrollToHeroReveal = () => {
    const sec = secRef.current
    if (!sec) return
    const targetY = sec.offsetTop + (sec.offsetHeight - window.innerHeight) * 0.58
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  return (
    <section
      ref={secRef}
      aria-labelledby="hero-title"
      className={`fh ${flightEnabled ? 'on' : ''} -mt-[76px] border-b border-white/[0.08]`}
    >
      {/* Anchor target for Header/Footer #features links -> scrolls directly to Beat 3 (p ~ 0.93) */}
      {flightEnabled && (
        <div
          id="features"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 w-px h-px"
          style={{ top: '288svh' }}
        />
      )}

      <div className="fh-stage">
        {/* Sunrise Sky + Photographic CC0 Cumulus Layers */}
        <div className="fh-scene" aria-hidden="true">
          <div className="fh-sunrise-orb" />
          <img
            className="fh-sky-cloud fh-cloud-far"
            src="/img/sky/cloud-far.webp"
            width="2000"
            height="440"
            alt=""
            decoding="async"
          />
          <img
            className="fh-sky-cloud fh-cloud-mid"
            src="/img/sky/cloud-mid.webp"
            width="2400"
            height="680"
            alt=""
            decoding="async"
          />
          <div className="fh-spotlight-clouds">
            <img
              className="fh-spot-cloud fh-spot-cloud-a"
              src="/img/sky/cloud-mid.webp"
              width="2400"
              height="680"
              alt=""
              decoding="async"
            />
            <img
              className="fh-spot-cloud fh-spot-cloud-b"
              src="/img/sky/cloud-front.webp"
              width="1800"
              height="760"
              alt=""
              decoding="async"
            />
          </div>
        </div>

        {/* Dedicated 3D Companion Robot Layer */}
        <div className="absolute inset-0 z-[4] pointer-events-none">
          <IndustrialRobots3D progressRef={progressRef} ctaBtnRef={ctaBtnRef} />
        </div>

        {/* Foreground Cloud Curtains Splitting Left & Right (z-[5]) */}
        {flightEnabled && (
          <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="fh-cloud-veil fh-cloud-veil-l">
              <img
                src="/img/sky/cloud-bank.webp"
                width="1600"
                height="760"
                alt=""
                decoding="async"
              />
            </div>
            <div className="fh-cloud-veil fh-cloud-veil-r">
              <img
                src="/img/sky/cloud-bank.webp"
                width="1600"
                height="760"
                alt=""
                decoding="async"
              />
            </div>
            <img
              className="fh-sky-cloud fh-cloud-near"
              src="/img/sky/cloud-front.webp"
              width="1800"
              height="760"
              alt=""
              decoding="async"
            />
          </div>
        )}

        {/* Floating Glass Greeting Bubble When Robot Waves ("Say Hi!") */}
        {flightEnabled && (
          <div className="fh-hi-pill pointer-events-none" aria-hidden="true">
            <span className="px-4 py-2 rounded-full bg-[#121621]/65 backdrop-blur-xl border border-white/20 text-[#FFF9FA] font-heading font-semibold text-sm shadow-[0_12px_36px_rgba(0,0,0,0.45)] inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
              <span>Halo! Bot Autobotz siap jaga toko 24/7 👋</span>
            </span>
          </div>
        )}

        {/* SVG Knockout Wordmark Mask: Zooms through "Autobotz" on scroll */}
        {flightEnabled && (
          <svg ref={svgRef} className="fh-mask" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="fh-sheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFF0F3" stopOpacity="0.28" />
                <stop offset="0.45" stopColor="#FF9E4F" stopOpacity="0.16" />
                <stop offset="1" stopColor="#FD1843" stopOpacity="0" />
              </linearGradient>
              <mask id="fh-cut" maskUnits="userSpaceOnUse">
                <rect className="fh-all" fill="#fff" />
                <g ref={wordRef} id="fh-word">
                  <text ref={textRef} id="fh-text" textAnchor="middle" fill="#000">
                    Autobotz
                  </text>
                </g>
              </mask>
            </defs>
            <rect ref={dimRef} className="fh-all" id="fh-dim" mask="url(#fh-cut)" />
            <g ref={edgeGRef} id="fh-edge-g">
              <text ref={edgeRef} id="fh-edge" textAnchor="middle">
                Autobotz
              </text>
            </g>
          </svg>
        )}

        {/* Layer 1: Initial Wordmark Tagline + CTAs + Animated Scroll Hint */}
        {flightEnabled && (
          <div ref={introRef} className="fh-intro">
            <p className="fh-tag text-[#FFF9FA]">
              Otomatiskan Toko Akun Digital via Bot Telegram 24/7.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/payment?plan=pro')}
                className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white border border-white/25 font-heading font-bold text-sm inline-flex items-center gap-2 shadow-[0_8px_28px_rgba(253,24,67,0.45)] transition-transform active:scale-95 cursor-pointer"
              >
                <span>Sewa Bot Cloud (99K)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollToHeroReveal}
                className="px-5 py-2.5 rounded-xl bg-[#111217]/65 hover:bg-[#1C1F2B] text-[#FFF9FA] border border-white/25 backdrop-blur-md font-heading font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-brand-mint" />
                <span>Coba Simulator Bot</span>
              </button>
            </div>
            <p className="fh-hint">Scroll</p>
          </div>
        )}

        {/* Layer 2 (Beat 2): Hero Content + Telegram Simulator */}
        <div
          ref={revealRef}
          className={
            flightEnabled
              ? 'fh-reveal'
              : 'relative z-10 py-12 md:py-16 flex flex-col justify-between min-h-[82vh]'
          }
        >
          <div className="container-brutalist w-full pt-20 pb-4 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div className="lg:col-span-7 space-y-4 text-left fh-hero-copy">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge variant="pink">ENGINE v2.4 READY</Badge>
                  <span className="font-mono text-[11px] font-bold text-brand-mint px-2.5 py-1 rounded-md bg-brand-mint/10 border border-brand-mint/35 backdrop-blur-md">
                    FULFILLMENT &lt; 3 DETIK
                  </span>
                </div>

                <h1
                  id="hero-title"
                  className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FFF9FA] leading-[1.06] tracking-tight drop-shadow-[0_2px_28px_rgba(17,18,23,0.85)]"
                >
                  Otomatiskan Toko Akun Digital via{' '}
                  <span className="bg-gradient-to-r from-[#FF9E4F] via-[#FD1843] to-[#FF6B86] bg-clip-text text-transparent">
                    Bot Telegram
                  </span>{' '}
                  24/7 Tanpa Admin Manual.
                </h1>

                <p className="text-sm sm:text-base text-[#E2DFEC] font-sans max-w-xl leading-relaxed">
                  Sewa bot cloud siap pakai atau miliki 100% source code Node.js tanpa enkripsi. Pembeli pilih produk di Telegram, bayar QRIS/Bank, dan kredensial langsung terkirim otomatis.
                </p>

                <div className="flex flex-wrap gap-3 pt-20 sm:pt-24">
                  <div ref={ctaBtnRef} className="relative inline-block fh-seat-btn-wrap">
                    <span aria-hidden="true" className="fh-seat-shadow" />
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate('/payment?plan=pro')}
                      className="group sm:!pl-14 border-t border-t-white/40 shadow-[0_5px_0_rgba(148,12,40,0.92),0_14px_30px_rgba(253,24,67,0.45)]"
                    >
                      <span>Sewa Bot Cloud (Mulai 99K)</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/payment?plan=script')}
                    className="px-5 py-2.5 rounded-xl bg-[#111217]/65 hover:bg-[#1C1F2B] text-[#FFF9FA] border border-white/25 backdrop-blur-md font-heading font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-[#FF9E4F]" />
                    <span>Beli Source Code (300K)</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-mono font-semibold text-[#E5E1EC]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint shrink-0" />
                    0% Potongan Komisi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint shrink-0" />
                    Enkripsi AES-256-GCM
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint shrink-0" />
                    Aktif dalam 5 Menit
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <TelegramSimulator compact={true} />
              </div>
            </div>

            <ul className="fh-strip-glass mt-6 grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-white/15 bg-[#0B0E17]/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
              <li className="px-4 py-3">
                <p className="font-mono text-[10px] text-[#CBD3E1] uppercase">Waktu Kirim</p>
                <p className="font-mono font-bold text-lg sm:text-xl text-brand-mint mt-0.5">
                  <AnimatedMetric mode="seconds" active={metricsActive} />
                </p>
                <p className="text-[11px] text-[#A8B0C2]">Sejak callback lunas</p>
              </li>
              <li className="px-4 py-3">
                <p className="font-mono text-[10px] text-[#CBD3E1] uppercase">Enkripsi Vault</p>
                <p className="font-mono font-bold text-lg sm:text-xl text-[#FFF9FA] mt-0.5">
                  AES-256
                </p>
                <p className="text-[11px] text-[#A8B0C2]">Token &amp; stok GCM</p>
              </li>
              <li className="px-4 py-3">
                <p className="font-mono text-[10px] text-[#CBD3E1] uppercase">Pembayaran</p>
                <p className="font-mono font-bold text-lg sm:text-xl text-brand-pink mt-0.5">
                  QRIS &amp; Bank
                </p>
                <p className="text-[11px] text-[#A8B0C2]">Midtrans + Mutasi</p>
              </li>
              <li className="px-4 py-3">
                <p className="font-mono text-[10px] text-[#CBD3E1] uppercase">Kepemilikan</p>
                <p className="font-mono font-bold text-lg sm:text-xl text-brand-amber mt-0.5">
                  <AnimatedMetric mode="percent" active={metricsActive} />
                </p>
                <p className="text-[11px] text-[#A8B0C2]">Cloud atau Source Code</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Layer 3 (Beat 3): Real ARSITEKTUR & KEAMANAN Bento UI over Drifting Volumetric Cloud Mist */}
        <div
          ref={spotlightRef}
          id={!flightEnabled ? 'features' : undefined}
          className={
            flightEnabled
              ? 'fh-spotlight'
              : 'relative z-10 py-14 border-t border-white/[0.08]'
          }
        >
          <div
            className={
              flightEnabled
                ? 'container-brutalist w-full pt-20 pb-4 max-h-[calc(100svh-12px)] overflow-y-auto lg:overflow-visible'
                : 'container-brutalist w-full'
            }
          >
            {/* Compact Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2.5 mb-3.5 text-left">
              <div className="space-y-1 max-w-2xl">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF9E4F]">
                  ARSITEKTUR &amp; KEAMANAN
                </p>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-[30px] text-[#F4F6FA] leading-[1.12]">
                  Dirancang untuk Volume Transaksi Tinggi Tanpa Kebocoran Stok Akun.
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end shrink-0">
                <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#090C12]/80 border border-white/[0.12] text-[#34D399]">
                  LATENSI &lt; 3000ms
                </span>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#F4F6FA] hover:text-[#FF9E4F] transition-colors"
                >
                  <span>Lihat simulasi langsung di bawah</span>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 12-Column Glassmorphism Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch text-left">
              {/* Left 7 cols: Module 01 + Bottom Row (03, 04, 05) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                {/* 01 / ATOMIC STOCK LOCK & AUTO-DELIVERY */}
                <div className="rounded-2xl bg-[#0C101B]/85 backdrop-blur-xl border border-white/[0.15] shadow-[0_18px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] p-4 sm:p-5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold uppercase text-[#F4F6FA] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#FF9E4F]" />
                      <span>01 / ATOMIC STOCK LOCK &amp; AUTO-DELIVERY</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#A8B0C2]">Anti Double-Sell Lock</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-[#F4F6FA] leading-snug">
                    Pengiriman Akun Otomatis Begitu Pembayaran Terkonfirmasi
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#CBD3E1] font-sans leading-relaxed">
                    Saat dua pembeli memesan produk terakhir di detik yang sama, database mengunci baris stok secara atomik sehingga tidak pernah terjadi <em>double-sell</em> (satu akun terkirim ke dua orang).
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#090C12]/80 border border-white/[0.1] grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#121621]/70 border border-white/[0.08] space-y-0.5">
                      <span className="text-brand-pink font-bold text-[10px]">STEP 1 · ORDER</span>
                      <p className="font-sans font-semibold text-[#F4F6FA] text-xs">Buyer klik katalog di Bot Telegram</p>
                      <p className="text-[10px] text-[#A8B0C2]">Stok dikunci sementara</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#121621]/70 border border-white/[0.08] space-y-0.5">
                      <span className="text-[#38BDF8] font-bold text-[10px]">STEP 2 · VERIFIKASI</span>
                      <p className="font-sans font-semibold text-[#F4F6FA] text-xs">Webhook Midtrans SHA-512 / Bukti</p>
                      <p className="text-[10px] text-[#A8B0C2]">Validasi nominal server-side</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#121621]/70 border border-white/[0.08] space-y-0.5">
                      <span className="text-brand-mint font-bold text-[10px]">STEP 3 · RELEASE</span>
                      <p className="font-sans font-semibold text-[#F4F6FA] text-xs">Dekripsi &amp; Kirim ke Chat Buyer</p>
                      <p className="text-[10px] text-[#A8B0C2]">Stok otomatis ditandai sold</p>
                    </div>
                  </div>
                </div>

                {/* Bottom 3-Card Row: 03, 04, 05 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div className="rounded-2xl bg-[#0C101B]/85 backdrop-blur-xl border border-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-3.5 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-semibold uppercase text-[#38BDF8] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span>03 / MULTI-PAYMENT</span>
                      </span>
                      <h3 className="text-sm font-bold font-heading text-[#F4F6FA]">
                        QRIS &amp; Transfer Bank
                      </h3>
                    </div>
                    <p className="text-xs text-[#CBD3E1] font-sans leading-relaxed">
                      Midtrans Snap instan atau verifikasi bukti manual dengan validasi <em>magic bytes</em> (&le;5MB).
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#0C101B]/85 backdrop-blur-xl border border-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-3.5 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-semibold uppercase text-brand-pink flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 shrink-0" />
                        <span>04 / MANAJEMEN STOK</span>
                      </span>
                      <h3 className="text-sm font-bold font-heading text-[#F4F6FA]">
                        Multi-Kategori &amp; Audit
                      </h3>
                    </div>
                    <p className="text-xs text-[#CBD3E1] font-sans leading-relaxed">
                      Kelola stok Netflix, Spotify, Canva, Game &amp; pantau omset serta status bayar real-time.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#0C101B]/85 backdrop-blur-xl border border-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-3.5 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-semibold uppercase text-[#FF9E4F] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 shrink-0" />
                        <span>05 / CLOUD / SELF-HOST</span>
                      </span>
                      <h3 className="text-sm font-bold font-heading text-[#F4F6FA]">
                        Cloud atau Full Script
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#CBD3E1] font-sans leading-relaxed">
                        Sewa Cloud praktis atau beli source code Node.js utuh.
                      </p>
                      <a
                        href="#pricing"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#FF9E4F] hover:text-white transition-colors"
                      >
                        <span>Bandingkan Paket &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Module 02 / CRYPTO VAULT Live Scrambler */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#0C101B]/85 backdrop-blur-xl border border-white/[0.16] shadow-[0_18px_50px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.15)] p-4 sm:p-5 h-full flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold uppercase text-brand-mint flex items-center gap-1.5">
                        <Lock
                          className={`w-3.5 h-3.5 text-brand-mint transition-transform duration-300 ${
                            isScrambling ? 'rotate-12 scale-110' : ''
                          }`}
                        />
                        <span>02 / CRYPTO VAULT</span>
                      </span>
                      <button
                        type="button"
                        onClick={triggerCipherScramble}
                        className="px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.14] font-mono text-[10px] text-brand-mint inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Simulasikan rotasi IV & Auth Tag baru"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isScrambling ? 'animate-spin' : ''}`} />
                        <span>Rotasi IV</span>
                      </button>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-heading text-[#F4F6FA] leading-snug">
                      Enkripsi Kredensial &amp; Token Bot AES-256-GCM
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#CBD3E1] font-sans leading-relaxed">
                      Token Bot dari @BotFather maupun password akun stok dienkripsi dengan <em>IV</em> &amp; <em>Auth Tag</em> unik sebelum menyentuh database.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#090C12]/88 border border-white/[0.1] font-mono text-[11px] text-gray-300 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/[0.08] pb-1">
                      <span>INPUT PLAINTEXT:</span>
                      <span className="text-[#FF9E4F] font-bold">
                        {isScrambling ? 'ENCRYPTING...' : 'LOCKED'}
                      </span>
                    </div>
                    <div className="truncate text-gray-200 text-[11px]">
                      {SAMPLE_PLAINTEXTS[sampleIndex]}
                    </div>
                    <div className="text-brand-mint font-bold pt-0.5">// Format Penyimpanan DB:</div>
                    <div className="p-2.5 rounded-lg bg-[#0E1621] border border-brand-mint/35 font-mono text-[11px] break-all leading-snug">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
