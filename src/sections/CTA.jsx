import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ScrollReveal3D from '../components/ScrollReveal3D'
import { ArrowRight, Terminal, ShieldCheck } from 'lucide-react'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="py-16 md:py-20 bg-[#090B10]/90 text-[#F4F6FA] stage-3d">
      <div className="container-brutalist">
        <ScrollReveal3D
          direction="up"
          tilt={true}
          maxTilt={4}
          className="bg-[#161B28]/70 backdrop-blur-xl text-[#F4F6FA] border border-white/[0.14] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
        >
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-pink">
              <ShieldCheck className="w-4 h-4" />
              <span>SIAP PRODUKSI HARI INI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#F4F6FA] leading-tight">
              Hentikan Rekap Pesanan Manual. Biarkan Bot Mengirim Akun Otomatis.
            </h2>
            <p className="text-sm sm:text-base text-[#A8B0C2] font-sans">
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
