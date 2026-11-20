import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signUp } from '../lib/supabase'
import Button from '../components/Button'
import Input from '../components/Input'
import { Bot, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectPath = searchParams.get('redirect') || ''

  const validate = () => {
    const errs = {}
    if (!fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi.'
    if (!email.trim() || !email.includes('@')) errs.email = 'Masukkan alamat email yang valid.'
    if (!password || password.length < 6) errs.password = 'Kata sandi minimal 6 karakter.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        business_name: businessName.trim() || null,
        phone: phone.trim() || null
      })

      if (authError) {
        setError(authError.message || 'Gagal mendaftarkan akun. Periksa kembali data Anda.')
        return
      }

      if (data?.session) {
        navigate(redirectPath && redirectPath.startsWith('/') ? redirectPath : '/dashboard')
      } else {
        const loginUrl = redirectPath
          ? `/login?registered=true&redirect=${encodeURIComponent(redirectPath)}`
          : '/login?registered=true'
        navigate(loginUrl)
      }
    } catch (err) {
      setError(err.message || 'Terjadi kendala saat menghubungi server.')
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
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-pink rounded-xl border-2 border-brand-dark flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-brand text-3xl font-bold text-brand-dark">Autobotz</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-dark pt-2">
            Registrasi Akun Merchant
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-sans">
            Buat akun untuk menyewa bot cloud atau membeli lisensi source code.
          </p>
        </div>

        <div className="bg-white border-2 border-brand-dark rounded-2xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-brand-pink rounded-xl text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama pemilik toko"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' })
              }}
              error={fieldErrors.fullName}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nama Toko (Opsional)"
                type="text"
                placeholder="Digital Store ID"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={loading}
              />
              <Input
                label="No. WhatsApp / Telegram"
                type="tel"
                placeholder="0812xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <Input
              label="Alamat Email"
              type="email"
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
              autoComplete="new-password"
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
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Mendaftarkan Akun...' : 'Buat Akun Merchant'}</span>
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t-2 border-brand-dark/10 flex items-center justify-between text-xs font-sans text-brand-muted">
            <span>Sudah punya akun merchant?</span>
            <Link
              to={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
              className="font-heading font-bold text-brand-pink hover:underline"
            >
              Masuk di sini →
            </Link>
          </div>
        </div>
      </div>

      <div className="container-brutalist text-center text-xs font-mono text-brand-muted">
        <span>Data profil dilindungi kebijakan privasi &amp; tidak pernah dibagikan ke pihak ketiga</span>
      </div>
    </div>
  )
}
