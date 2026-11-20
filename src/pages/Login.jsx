import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, getProfile } from '../lib/supabase'
import Button from '../components/Button'
import Input from '../components/Input'
import { Bot, LogIn, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registeredNotice, setRegisteredNotice] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectPath = searchParams.get('redirect') || ''

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setRegisteredNotice(true)
    }
  }, [searchParams])

  const validate = () => {
    const errs = {}
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Masukkan alamat email yang valid.'
    }
    if (!password || password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter.'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      const { data, error: authError } = await signIn(email.trim(), password)
      if (authError) {
        setError(authError.message || 'Kredensial tidak valid. Periksa kembali email dan kata sandi Anda.')
        return
      }

      if (data?.user) {
        if (redirectPath && redirectPath.startsWith('/')) {
          navigate(redirectPath)
          return
        }
        const { data: profile } = await getProfile(data.user.id)
        if (profile?.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal menghubungi layanan autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-chill-white flex flex-col justify-between py-10 px-4">
      <div className="container-brutalist w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-heading font-bold text-xs sm:text-sm text-brand-dark hover:text-brand-pink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-8 space-y-6">
        {/* Focused Auth Header */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-pink rounded-xl border-2 border-brand-dark flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-brand text-3xl font-bold text-brand-dark">Autobotz</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-dark pt-2">
            Masuk Portal Merchant
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-sans">
            Autentikasi sesi JWT Supabase untuk mengelola bot, stok akun, dan transaksi.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white border-2 border-brand-dark rounded-2xl p-6 sm:p-8 space-y-5">
          {registeredNotice && (
            <div className="p-3.5 bg-green-50 border-2 border-brand-mint rounded-xl text-brand-dark text-xs font-mono font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
              <span>Registrasi berhasil. Silakan cek email verifikasi (jika diaktifkan) atau langsung masuk.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-brand-pink rounded-xl text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Alamat Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="merchant@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
              }}
              error={fieldErrors.email}
              disabled={loading}
              required
            />

            <Input
              label="Kata Sandi"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
              }}
              error={fieldErrors.password}
              disabled={loading}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full justify-center"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t-2 border-brand-dark/10 flex items-center justify-between text-xs font-sans text-brand-muted">
            <span>Belum memiliki akun toko?</span>
            <Link
              to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
              className="font-heading font-bold text-brand-pink hover:underline"
            >
              Daftar Akun Baru â†’
            </Link>
          </div>
        </div>
      </div>

      <div className="container-brutalist text-center text-xs font-mono text-brand-muted">
        <span>Dilindungi oleh Supabase Row-Level Security (RLS) &amp; JWT Bearer Auth</span>
      </div>
    </div>
  )
}

