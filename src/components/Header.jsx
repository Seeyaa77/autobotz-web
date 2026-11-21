import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, getProfile } from '../lib/supabase'
import Button from './Button'
import { Bot, Menu, X, LayoutDashboard, LogIn, ShieldCheck, ArrowUpRight } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let mounted = true
    getCurrentUser()
      .then(async (u) => {
        if (!mounted || !u) return
        setUser(u)
        const { data: profile } = await getProfile(u.id)
        if (mounted && profile?.role === 'admin') {
          setIsAdmin(true)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
      <div
        className={`max-w-6xl mx-auto pointer-events-auto rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'bg-[#10131E]/72 backdrop-blur-2xl border-white/[0.16] shadow-[0_14px_44px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)]'
            : 'bg-[#10131E]/42 backdrop-blur-xl border-white/[0.12] shadow-[0_8px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.14)]'
        }`}
      >
        <nav className="flex items-center justify-between px-4 sm:px-5 py-2.5" aria-label="Navigasi utama">
          {/* Modern Glass Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FD1843] via-[#F25C3B] to-[#FF9E4F] border border-white/25 shadow-[0_4px_18px_rgba(253,24,67,0.4)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-brand text-xl tracking-tight text-[#F4F6FA] font-bold leading-none">
                Autobotz
              </span>
              <span className="font-mono text-[9.5px] text-[#A8B0C2] tracking-[0.18em] uppercase mt-0.5">
                Telegram Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <div className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.07]">
            <a
              href="/#features"
              className="px-3 py-1.5 rounded-lg font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Arsitektur
            </a>
            <a
              href="/#demo"
              className="px-3 py-1.5 rounded-lg font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Simulator
            </a>
            <a
              href="/#pricing"
              className="px-3 py-1.5 rounded-lg font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Harga
            </a>
            <a
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-lg font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Alur Setup
            </a>
            <a
              href="/#faq"
              className="px-3 py-1.5 rounded-lg font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              FAQ
            </a>
          </div>

          {/* Auth / Portal Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
                    <ShieldCheck className="w-4 h-4 text-brand-pink" />
                    <span>Admin</span>
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl font-heading font-medium text-sm text-[#CBD3E1] hover:text-white hover:bg-white/[0.08] transition-all inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
                <Button variant="primary" size="sm" onClick={() => navigate('/payment?plan=pro')}>
                  <span>Mulai Sewa</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Buka menu navigasi"
            className="md:hidden p-2 rounded-xl border border-white/[0.14] bg-white/[0.06] text-[#F4F6FA] hover:bg-white/[0.14] transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Glass Drawer */}
        {isOpen && (
          <div className="md:hidden px-4 pb-4 pt-3 border-t border-white/[0.08] space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-heading font-medium">
              <a href="/#features" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#F4F6FA]">
                Arsitektur
              </a>
              <a href="/#demo" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#F4F6FA]">
                Simulator
              </a>
              <a href="/#pricing" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#F4F6FA]">
                Harga
              </a>
              <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#F4F6FA]">
                Alur Setup
              </a>
              <a href="/#faq" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#F4F6FA] col-span-2">
                Pertanyaan Umum (FAQ)
              </a>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="secondary" size="sm" onClick={() => { setIsOpen(false); navigate('/admin') }} className="w-full">
                      <ShieldCheck className="w-4 h-4 text-brand-pink" />
                      <span>Panel Admin</span>
                    </Button>
                  )}
                  <Button variant="primary" size="sm" onClick={() => { setIsOpen(false); navigate('/dashboard') }} className="w-full">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Buka Dashboard</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => { setIsOpen(false); navigate('/login') }} className="w-full">
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Akun Merchant</span>
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => { setIsOpen(false); navigate('/payment?plan=pro') }} className="w-full">
                    <span>Sewa Bot Cloud Sekarang</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
