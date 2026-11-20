import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ScrollReveal3D from '../components/ScrollReveal3D'
import { ArrowRight, Terminal, ShieldCheck } from 'lucide-react'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="py-16 md:py-20 bg-brand-dark text-white stage-3d">
      <div className="container-brutalist">
        <ScrollReveal3D
          direction="up"
          tilt={true}
          maxTilt={4}
          className="bg-brand-surface-tint text-brand-dark border-2 border-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
        >
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-pink">
              <ShieldCheck className="w-4 h-4" />
              <span>SIAP PRODUKSI HARI INI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-brand-dark leading-tight">
              Hentikan Rekap Pesanan Manual. Biarkan Bot Mengirim Akun Otomatis.
            </h2>
            <p className="text-sm sm:text-base text-brand-muted font-sans">
              Pilih paket Cloud Hosting untuk langsung berjalan dalam 5 menit, atau unduh Full Source Code untuk infrastruktur internal Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/payment?plan=pro')}
            >
              <span>Sewa Bot Cloud</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/payment?plan=script')}
            >
              <Terminal className="w-5 h-5" />
              <span>Beli Source Code</span>
            </Button>
          </div>
        </ScrollReveal3D>
      </div>
    </section>
  )
}
