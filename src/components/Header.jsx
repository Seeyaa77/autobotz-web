import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, getProfile } from '../lib/supabase'
import Button from './Button'
import { Bot, Menu, X, LayoutDashboard, LogIn, ShieldCheck, ArrowUpRight } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

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
    <header className="sticky top-0 z-50 bg-brand-chill-white border-b-2 border-brand-dark">
      <div className="container-brutalist">
        <nav className="flex items-center justify-between py-3.5" aria-label="Navigasi utama">
          {/* Brand Logo (Removed redundant SLA 99.9% ONLINE pill per user feedback) */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-10 h-10 bg-brand-pink rounded-xl border-2 border-brand-dark flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-brand text-2xl text-brand-dark font-bold leading-none">Autobotz</span>
                <span className="font-mono text-[10px] text-brand-muted tracking-widest uppercase">Telegram Commerce</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#features" className="font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors">
              Arsitektur
            </a>
            <a href="/#demo" className="font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors">
              Terminal Simulasi
            </a>
            <a href="/#pricing" className="font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors">
              Paket &amp; Harga
            </a>
            <a href="/#how-it-works" className="font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors">
              Alur Setup
            </a>
            <a href="/#faq" className="font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors">
              FAQ
            </a>
          </div>

          {/* Auth / Portal Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/admin')}
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-pink" />
                    <span>Panel Admin</span>
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 font-heading font-bold text-sm text-brand-dark hover:text-brand-pink transition-colors inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/payment?plan=pro')}
                >
                  <span>Mulai Sewa Bot</span>
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
            className="md:hidden p-2 rounded-xl border-2 border-brand-dark bg-white text-brand-dark hover:bg-brand-surface-tint"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="md:hidden py-4 border-t-2 border-brand-dark space-y-3 bg-brand-chill-white">
            <div className="grid grid-cols-2 gap-2 text-sm font-heading font-bold">
              <a href="/#features" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border-2 border-brand-dark bg-white">
                Arsitektur
              </a>
              <a href="/#demo" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border-2 border-brand-dark bg-white">
                Terminal Simulasi
              </a>
              <a href="/#pricing" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border-2 border-brand-dark bg-white">
                Paket &amp; Harga
              </a>
              <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border-2 border-brand-dark bg-white">
                Alur Setup
              </a>
              <a href="/#faq" onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl border-2 border-brand-dark bg-white col-span-2">
                Pertanyaan Umum (FAQ)
              </a>
            </div>

            <div className="pt-2 border-t-2 border-brand-dark/15 flex flex-col gap-2">
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
