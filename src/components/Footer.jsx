import { Link } from 'react-router-dom'
import { Bot, Terminal, Send, Code2, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#07090D] text-[#F4F6FA] border-t border-white/[0.08] pt-14 pb-10">
      <div className="container-brutalist">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/[0.08]">
          {/* Col 1: Brand & System Status (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#FD1843]/90 rounded-xl border border-white/20 shadow-[0_4px_16px_rgba(253,24,67,0.35)] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-brand text-2xl font-bold text-white">Autobotz</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed font-sans max-w-sm">
              Infrastruktur penyewaan bot Telegram cloud & distribusi source code unencrypted untuk pengiriman stok akun digital otomatis 24/7.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-[#34D399] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-mint" aria-hidden="true" />
              <span>ALL SYSTEMS OPERATIONAL (99.9% SLA)</span>
            </div>
          </div>

          {/* Col 2: Navigasi Produk (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-mono text-xs font-bold text-brand-pink uppercase tracking-wider">
              Layanan Utama
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 font-sans">
              <li><a href="/#features" className="hover:text-white transition-colors">Arsitektur Auto-Delivery</a></li>
              <li><a href="/#demo" className="hover:text-white transition-colors">Simulator Bot Telegram</a></li>
              <li><Link to="/payment?plan=pro" className="hover:text-white transition-colors">Sewa Dedicated Cloud Bot</Link></li>
              <li><Link to="/payment?plan=script" className="hover:text-white transition-colors">Beli Full Source Code (300K)</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Portal Merchant</Link></li>
            </ul>
          </div>

          {/* Col 3: Spesifikasi Teknis & Akses (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-mono text-xs font-bold text-brand-mint uppercase tracking-wider">
              Standar Keamanan & Stack
            </h3>
            <div className="p-4 rounded-xl bg-[#121621]/60 backdrop-blur-md border border-white/[0.09] space-y-2 text-xs font-mono text-gray-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-mint shrink-0" />
                <span>Enkripsi Stok & Token: AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-pink shrink-0" />
                <span>Engine: Node.js + Telegraf + Supabase RLS</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-amber shrink-0" />
                <span>Gateway: QRIS, Transfer Bank & Midtrans SHA-512</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#FD1843]/90 text-white font-mono text-xs font-bold border border-white/20 hover:bg-[#FF2E56] transition-colors inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Channel</span>
              </a>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-transparent text-white font-mono text-xs font-bold border border-white/[0.14] bg-white/[0.04] hover:bg-white/[0.1] transition-colors"
              >
                Login Merchant
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-mono">
          <p>© 2026 Autobotz Commerce Infrastructure. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <a href="/#faq" className="hover:text-white transition-colors">Kebijakan Garansi</a>
            <a href="/#pricing" className="hover:text-white transition-colors">Lisensi Source Code</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
