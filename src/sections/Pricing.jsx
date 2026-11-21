import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPlans, formatIdr } from '../api/client'
import Button from '../components/Button'
import Badge from '../components/Badge'
import ScrollReveal3D from '../components/ScrollReveal3D'
import { Check, Terminal, ArrowRight, RefreshCw } from 'lucide-react'

export default function Pricing() {
  const [billingTab, setBillingTab] = useState('rental') // 'rental' | 'script'
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadPlans = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchPlans()
      setPlans(res.plans || [])
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar paket.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const rentalPlans = plans.filter((p) => p.slug !== 'script' && p.billing_cycle !== 'one_time')
  const scriptPlan = plans.find((p) => p.slug === 'script' || p.billing_cycle === 'one_time')

  return (
    <section id="pricing" className="py-16 md:py-24 bg-transparent border-b border-white/[0.08] stage-3d">
      <div className="container-brutalist space-y-12">
        
        {/* Top Row: Left-Aligned Title + Mode Switcher */}
        <ScrollReveal3D direction="up" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
              SKEMA HARGA TRANSPARAN
            </p>
            <h2 className="heading-section">
              Pilih Sewa Cloud Terkelola atau Beli Full Source Code.
            </h2>
            <p className="text-base text-[#A8B0C2] font-sans">
              Seluruh harga diverifikasi di sisi server tanpa biaya tersembunyi. Bebas upgrade kapasitas kapan saja.
            </p>
          </div>

          {/* Mode Toggle Control */}
          <div className="inline-flex p-1.5 rounded-xl bg-[#090C12]/75 backdrop-blur-sm border border-white/[0.1] self-start">
            <button
              type="button"
              onClick={() => setBillingTab('rental')}
              className={`px-4 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                billingTab === 'rental'
                  ? 'bg-brand-pink text-white border border-white/[0.1] shadow-md'
                  : 'text-[#F4F6FA] hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              Sewa Cloud (Bulanan)
            </button>
            <button
              type="button"
              onClick={() => setBillingTab('script')}
              className={`px-4 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                billingTab === 'script'
                  ? 'bg-[#090B10]/90 text-[#F4F6FA] border border-white/[0.1] shadow-[0_0_32px_rgba(253,24,67,0.16)]'
                  : 'text-[#F4F6FA] hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              Source Code (Sekali Bayar)
            </button>
          </div>
        </ScrollReveal3D>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl border-2 border-white/[0.1] bg-[#121621]/65 backdrop-blur-md space-y-4 animate-pulse">
                <div className="h-5 w-28 bg-white/[0.1] rounded" />
                <div className="h-9 w-40 bg-white/[0.1] rounded" />
                <div className="h-4 w-full bg-white/[0.06] rounded" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 w-5/6 bg-white/[0.06] rounded" />
                  <div className="h-4 w-4/6 bg-white/[0.06] rounded" />
                  <div className="h-4 w-5/6 bg-white/[0.06] rounded" />
                </div>
                <div className="h-11 w-full bg-white/[0.1] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl border-2 border-brand-pink bg-[#FD1843]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs font-bold text-brand-pink">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadPlans}>
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Paket</span>
            </Button>
          </div>
        )}

        {/* TAB 1: RENTAL PLANS */}
        {!loading && billingTab === 'rental' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {rentalPlans.map((plan, idx) => {
              const isPro = Boolean(plan.is_popular || plan.slug === 'pro')
              const features = Array.isArray(plan.features) ? plan.features : []
              return (
                <ScrollReveal3D
                  key={plan.slug}
                  direction="up"
                  delay={idx * 90}
                  tilt={true}
                  maxTilt={5}
                  className={`rounded-2xl border border-white/[0.1] p-6 sm:p-7 flex flex-col justify-between transition-all ${
                    isPro
                      ? 'bg-[#121621]/65 backdrop-blur-md shadow-[0_0_32px_rgba(253,24,67,0.16)]'
                      : 'bg-[#121621]/65 backdrop-blur-md shadow-none'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-extrabold text-xl text-[#F4F6FA]">
                        {plan.name}
                      </h3>
                      {isPro ? (
                        <Badge variant="pink">POPULER</Badge>
                      ) : (
                        <span className="font-mono text-xs font-bold uppercase text-[#A8B0C2]">
                          {plan.slug}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#A8B0C2] font-sans min-h-[40px]">
                      {plan.description}
                    </p>

                    <div className="pt-2 pb-4 border-b border-white/[0.08] flex items-baseline gap-1.5">
                      <span className="font-mono font-extrabold text-3xl sm:text-4xl text-[#F4F6FA]">
                        {formatIdr(plan.price_idr)}
                      </span>
                      <span className="font-mono text-xs text-[#A8B0C2] font-bold">
                        /bulan
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#F4F6FA]">
                      {features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/[0.08]">
                    <Button
                      variant={isPro ? 'primary' : 'secondary'}
                      className="w-full justify-center"
                      onClick={() => navigate(`/payment?plan=${encodeURIComponent(plan.slug)}`)}
                    >
                      <span>Pilih {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </ScrollReveal3D>
              )
            })}
          </div>
        )}

        {/* TAB 2: FULL SOURCE CODE (SCRIPT ONLY) */}
        {!loading && billingTab === 'script' && scriptPlan && (
          <ScrollReveal3D
            direction="up"
            tilt={true}
            maxTilt={4}
            className="bg-[#090B10]/90 text-[#F4F6FA] border border-white/[0.1] rounded-2xl p-6 sm:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2">
                  <Badge variant="mint">LISENSI LIFETIME</Badge>
                  <span className="font-mono text-xs text-gray-300">100% Unencrypted Source Code</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  {scriptPlan.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                  {scriptPlan.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(Array.isArray(scriptPlan.features) ? scriptPlan.features : []).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-200">
                      <Check className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#121621]/65 backdrop-blur-md text-[#F4F6FA] border border-white/[0.1] rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <p className="font-mono text-xs font-bold uppercase text-[#A8B0C2]">HARGA SEKALI BAYAR</p>
                    <p className="font-mono font-extrabold text-3xl text-[#F4F6FA] mt-1">
                      {formatIdr(scriptPlan.price_idr)}
                    </p>
                  </div>
                  <Terminal className="w-8 h-8 text-brand-pink" />
                </div>

                <div className="space-y-2 text-xs font-mono text-[#A8B0C2]">
                  <p>✓ Akses unduh paket .ZIP di tab Lisensi Dashboard</p>
                  <p>✓ Kunci lisensi HMAC terverifikasi otomatis</p>
                  <p>✓ Bebas deploy di VPS pribadi tanpa batas waktu</p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => navigate('/payment?plan=script')}
                >
                  <span>Beli Full Source Code</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </ScrollReveal3D>
        )}

      </div>
    </section>
  )
}
