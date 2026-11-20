import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, getProfile, signOut } from '../lib/supabase'
import {
  fetchDashboard,
  fetchTransactions,
  fetchBots,
  createBot,
  startBot,
  stopBot,
  fetchCategories,
  fetchAccounts,
  createAccount,
  deleteAccount,
  fetchLicense,
  fetchMyOrders,
  updateMyProfile,
  formatIdr,
  formatDateId
} from '../api/client'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'
import { 
  Bot, 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Code2, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck,
  AlertCircle,
  Lock,
  ShoppingCart
} from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'bots' | 'inventory' | 'orders' | 'script' | 'settings'
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const navigate = useNavigate()

  // Live API Data States
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_sold: 0,
    active_listings: 0,
    completed_transactions: 0,
    pending_payout: 0
  })
  const [bots, setBots] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [license, setLicense] = useState(null)
  const [myOrders, setMyOrders] = useState([])

  // Loading & Error States per section
  const [loadingData, setLoadingData] = useState(true)
  const [apiError, setApiError] = useState('')

  // Bot creation & toggle state
  const [botTokenInput, setBotTokenInput] = useState('')
  const [botSubmitting, setBotSubmitting] = useState(false)
  const [botError, setBotError] = useState('')
  const [botSuccess, setBotSuccess] = useState('')
  const [togglingBotId, setTogglingBotId] = useState(null)

  // Account creation & delete state
  const [accCategoryId, setAccCategoryId] = useState('')
  const [accTitle, setAccTitle] = useState('')
  const [accPriceIdr, setAccPriceIdr] = useState('')
  const [accCredentials, setAccCredentials] = useState('')
  const [accSubmitting, setAccSubmitting] = useState(false)
  const [accError, setAccError] = useState('')
  const [accSuccess, setAccSuccess] = useState('')
  const [deletingAccId, setDeletingAccId] = useState(null)

  // Profile Settings form state
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [copiedKey, setCopiedKey] = useState(false)

  const loadAllDashboardData = useCallback(async () => {
    setLoadingData(true)
    setApiError('')
    try {
      const [
        dashRes,
        txRes,
        botsRes,
        catRes,
        accRes,
        licRes,
        ordersRes
      ] = await Promise.all([
        fetchDashboard(),
        fetchTransactions(),
        fetchBots(),
        fetchCategories(),
        fetchAccounts(),
        fetchLicense(),
        fetchMyOrders().catch(() => ({ orders: [] }))
      ])

      if (dashRes?.summary) setSummary(dashRes.summary)
      if (Array.isArray(dashRes?.recent_transactions)) {
        setRecentTransactions(dashRes.recent_transactions)
      }
      if (Array.isArray(txRes?.transactions)) {
        setTransactions(txRes.transactions)
      }
      if (Array.isArray(botsRes?.bots)) {
        setBots(botsRes.bots)
      } else if (Array.isArray(dashRes?.bots)) {
        setBots(dashRes.bots)
      }
      if (Array.isArray(catRes?.categories)) {
        setCategories(catRes.categories)
        if (catRes.categories.length > 0 && !accCategoryId) {
          setAccCategoryId(catRes.categories[0].id)
        }
      }
      if (Array.isArray(accRes?.accounts)) {
        setAccounts(accRes.accounts)
      }
      setLicense(licRes?.license || null)
      if (Array.isArray(ordersRes?.orders)) {
        setMyOrders(ordersRes.orders)
      }
    } catch (err) {
      setApiError(err.message || 'Gagal memuat data operasional dari server.')
    } finally {
      setLoadingData(false)
    }
  }, [accCategoryId])

  useEffect(() => {
    let mounted = true
    async function checkSession() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return
        if (!currentUser) {
          setAuthChecking(false)
          navigate('/login?redirect=%2Fdashboard')
          return
        }
        setUser(currentUser)
        const { data: prof } = await getProfile(currentUser.id)
        if (mounted && prof) {
          setProfile(prof)
          setFullName(prof.full_name || '')
          setBusinessName(prof.business_name || '')
          setPhone(prof.phone || '')
        }
        setAuthChecking(false)
        loadAllDashboardData()
      } catch {
        if (mounted) {
          setAuthChecking(false)
          navigate('/login?redirect=%2Fdashboard')
        }
      }
    }
    checkSession()
    return () => {
      mounted = false
    }
  }, [navigate, loadAllDashboardData])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleCreateBot = async (e) => {
    e.preventDefault()
    setBotError('')
    setBotSuccess('')
    if (!botTokenInput.trim()) {
      setBotError('Masukkan token bot dari @BotFather.')
      return
    }
    setBotSubmitting(true)
    try {
      const res = await createBot(botTokenInput.trim())
      if (res?.bot) {
        setBots((prev) => [res.bot, ...prev])
      }
      setBotTokenInput('')
      setBotSuccess('Bot berhasil diverifikasi via Telegram getMe dan disimpan terenkripsi AES-256-GCM.')
    } catch (err) {
      setBotError(err.message || 'Gagal mendaftarkan bot Telegram.')
    } finally {
      setBotSubmitting(false)
    }
  }

  const handleToggleBot = async (bot) => {
    setBotError('')
    setTogglingBotId(bot.id)
    try {
      const isRunning = bot.status === 'active' || bot.status === 'running'
      const res = isRunning ? await stopBot(bot.id) : await startBot(bot.id)
      if (res?.bot) {
        setBots((prev) => prev.map((b) => (b.id === bot.id ? res.bot : b)))
      }
    } catch (err) {
      setBotError(err.message || 'Gagal mengubah status bot.')
    } finally {
      setTogglingBotId(null)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setAccError('')
    setAccSuccess('')
    if (!accCategoryId) {
      setAccError('Pilih kategori akun terlebih dahulu.')
      return
    }
    if (!accTitle.trim() || !accPriceIdr || !accCredentials.trim()) {
      setAccError('Judul produk, harga IDR, dan kredensial akun wajib diisi.')
      return
    }

    setAccSubmitting(true)
    try {
      const res = await createAccount({
        category_id: accCategoryId,
        title: accTitle.trim(),
        price_idr: Number(accPriceIdr),
        credentials: accCredentials.trim()
      })
      if (res?.account) {
        setAccounts((prev) => [res.account, ...prev])
      }
      setAccTitle('')
      setAccPriceIdr('')
      setAccCredentials('')
      setAccSuccess('Stok akun berhasil dienkripsi AES-256-GCM dan ditambahkan ke katalog.')
    } catch (err) {
      setAccError(err.message || 'Gagal menyimpan stok akun.')
    } finally {
      setAccSubmitting(false)
    }
  }

  const handleDeleteAccount = async (accountId) => {
    setAccError('')
    setDeletingAccId(accountId)
    try {
      await deleteAccount(accountId)
      setAccounts((prev) => prev.filter((a) => a.id !== accountId))
    } catch (err) {
      setAccError(err.message || 'Gagal menghapus stok akun.')
    } finally {
      setDeletingAccId(null)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileSaving(true)
    try {
      const res = await updateMyProfile({
        full_name: fullName.trim(),
        business_name: businessName.trim(),
        phone: phone.trim()
      })
      if (res?.profile) {
        setProfile(res.profile)
      }
      setProfileSuccess('Profil toko berhasil diperbarui.')
    } catch (err) {
      setProfileError(err.message || 'Gagal memperbarui profil.')
    } finally {
      setProfileSaving(false)
    }
  }

  const copyLicense = (keyText) => {
    navigator.clipboard?.writeText(keyText)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 1800)
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-brand-chill-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border-2 border-brand-dark rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-chill-white flex flex-col">
      
      {/* Top Navbar (Clean solid surface, zero backdrop-blur) */}
      <header className="bg-brand-chill-white border-b-2 border-brand-dark sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-pink border-2 border-brand-dark flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-brand font-bold text-2xl text-brand-dark">Autobotz</span>
            </Link>
            <Badge variant="dark" className="hidden sm:inline-flex">
              MERCHANT CONSOLE
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
                <ShieldCheck className="w-4 h-4 text-brand-pink" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Button>
            )}
            <span className="font-mono text-xs font-bold text-brand-dark hidden md:inline">
              {user?.email}
            </span>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Console Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs + Refresh Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-brand-dark">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'bots', label: 'Bot Telegram', icon: Bot },
              { id: 'inventory', label: 'Stok Akun', icon: Package },
              { id: 'orders', label: 'Riwayat Transaksi', icon: Receipt },
              { id: 'script', label: 'Lisensi Script', icon: Code2 },
              { id: 'settings', label: 'Pengaturan', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm border-2 flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-brand-dark bg-brand-pink text-white shadow-brutalist-sm'
                      : 'border-transparent text-brand-dark hover:border-brand-dark hover:bg-brand-surface-tint'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loadingData}
            onClick={loadAllDashboardData}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </Button>
        </div>

        {/* Global API Error State Banner (Per recipes.md Section 4.E) */}
        {apiError && (
          <div className="bg-red-50 border-2 border-brand-pink text-brand-dark p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brand-pink">Koneksi API Backend Melaporkan Kendala</p>
                <p className="text-brand-muted mt-0.5">{apiError}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={loadAllDashboardData}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </Button>
          </div>
        )}

        {/* TAB 1: OVERVIEW (RINGKASAN) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tufte High Data-Ink Ratio Metric Cards (Static cards = shadow-none) */}
            {loadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="p-5 bg-white border-2 border-gray-300 rounded-2xl space-y-3 animate-pulse">
                    <div className="h-3.5 w-28 bg-gray-200 rounded" />
                    <div className="h-8 w-36 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="card-static p-5 space-y-1.5">
                  <span className="font-mono text-xs text-brand-muted uppercase font-bold">
                    Total Pendapatan Bersih
                  </span>
                  <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-dark">
                    {formatIdr(summary.total_revenue)}
                  </p>
                  <p className="text-xs text-brand-muted font-sans">
                    Saldo siap cair: <strong className="font-mono text-brand-dark">{formatIdr(summary.pending_payout)}</strong>
                  </p>
                </div>

                <div className="card-static p-5 space-y-1.5">
                  <span className="font-mono text-xs text-brand-muted uppercase font-bold">
                    Total Akun Terjual
                  </span>
                  <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-pink">
                    {Number(summary.total_sold || 0)} Unit
                  </p>
                  <p className="text-xs text-brand-muted font-sans">
                    Transaksi sukses: <strong className="font-mono">{Number(summary.completed_transactions || 0)}</strong>
                  </p>
                </div>

                <div className="card-static p-5 space-y-1.5">
                  <span className="font-mono text-xs text-brand-muted uppercase font-bold">
                    Stok Akun Tersedia
                  </span>
                  <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-dark">
                    {Number(summary.active_listings || accounts.filter((a) => a.status === 'available').length)} Unit
                  </p>
                  <p className="text-xs text-brand-muted font-sans">
                    Terenkripsi AES-256-GCM
                  </p>
                </div>

                <div className="card-static p-5 space-y-1.5">
                  <span className="font-mono text-xs text-brand-muted uppercase font-bold">
                    Instance Bot Aktif
                  </span>
                  <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-mint">
                    {bots.filter((b) => b.status === 'active' || b.status === 'running').length} / {bots.length} Bot
                  </p>
                  <p className="text-xs text-brand-muted font-sans">
                    Paket: <strong className="font-mono uppercase">{profile?.tier || 'Starter'}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Split Row: Subscription Orders & Recent Bot Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left (5 cols): Active Subscription / Package Orders */}
              <div className="lg:col-span-5 card-static p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                  <h3 className="font-heading font-bold text-base text-brand-dark">
                    Status Paket &amp; Pesanan Layanan
                  </h3>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/payment?plan=pro')}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Order Paket</span>
                  </Button>
                </div>

                {loadingData ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="py-8 px-4 text-center border-2 border-dashed border-brand-dark rounded-xl bg-brand-surface-tint/30 space-y-3">
                    <p className="font-heading font-bold text-sm text-brand-dark">
                      Belum Ada Paket Sewa Cloud atau Script Aktif
                    </p>
                    <p className="text-xs text-brand-muted font-sans">
                      Pilih paket Sewa Bot Cloud untuk menghubungkan token @BotFather atau paket Script untuk mengunduh source code.
                    </p>
                    <Button variant="primary" size="sm" onClick={() => navigate('/payment?plan=pro')}>
                      <span>Pilih Paket Layanan</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {myOrders.slice(0, 4).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-brand-surface-tint border-2 border-brand-dark flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div>
                          <p className="font-bold text-brand-dark">{ord.plan_name || ord.plan_slug}</p>
                          <p className="text-[11px] text-brand-muted">
                            {formatIdr(ord.amount_idr)} â€¢ {formatDateId(ord.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ord.payment_status === 'paid'
                              ? 'mint'
                              : ord.payment_status === 'pending_verification'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {ord.payment_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right (7 cols): Recent Automated Bot Transactions */}
              <div className="lg:col-span-7 card-static p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                  <h3 className="font-heading font-bold text-base text-brand-dark">
                    5 Transaksi Bot Terakhir
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="font-mono text-xs font-bold text-brand-pink hover:underline"
                  >
                    Lihat Semua â†’
                  </button>
                </div>

                {loadingData ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-12 bg-gray-100 border-b border-gray-200 animate-pulse rounded" />
                    ))}
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="py-10 px-4 text-center border-2 border-dashed border-brand-dark rounded-xl bg-white space-y-2">
                    <p className="font-heading font-bold text-sm text-brand-dark">
                      Belum Ada Transaksi Penjualan Akun
                    </p>
                    <p className="text-xs text-brand-muted font-sans">
                      Tambahkan stok akun digital dan aktifkan bot Telegram Anda untuk mulai menerima pesanan otomatis.
                    </p>
                    <div className="pt-2">
                      <Button variant="secondary" size="sm" onClick={() => setActiveTab('inventory')}>
                        <Plus className="w-4 h-4" />
                        <span>Tambah Stok Akun</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b-2 border-brand-dark text-brand-dark font-mono uppercase">
                          <th className="py-2.5 pr-3">ID</th>
                          <th className="py-2.5 px-3">Buyer</th>
                          <th className="py-2.5 px-3">Produk</th>
                          <th className="py-2.5 px-3">Nominal</th>
                          <th className="py-2.5 pl-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="border-b-2 border-brand-dark/15 bg-white hover:bg-brand-surface-tint/40 transition-colors"
                          >
                            <td className="py-3 pr-3 font-mono font-bold text-brand-dark">
                              {String(tx.id).slice(0, 8)}
                            </td>
                            <td className="py-3 px-3 font-mono text-brand-dark">
                              {tx.buyer_username || 'Buyer'}
                            </td>
                            <td className="py-3 px-3 font-semibold text-brand-dark">
                              {tx.account_title || 'Akun Digital'}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-brand-pink">
                              {formatIdr(tx.net_amount_idr ?? tx.gross_amount_idr)}
                            </td>
                            <td className="py-3 pl-3">
                              <Badge variant={tx.payment_status === 'paid' || tx.payment_status === 'completed' ? 'mint' : 'warning'}>
                                {tx.payment_status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: BOT TELEGRAM MANAGEMENT */}
        {activeTab === 'bots' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark">
                Manajemen Instance Bot Telegram
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-sans">
                Token bot diverifikasi langsung ke server Telegram (<code>getMe</code>) dan disimpan terenkripsi AES-256-GCM. Membutuhkan paket sewa Cloud aktif berstatus Paid.
              </p>
            </div>

            {/* Connect New Bot Form */}
            <div className="card-static p-6 space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-dark">
                Hubungkan Token Bot Baru (@BotFather)
              </h3>

              {botError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{botError}</span>
                </div>
              )}

              {botSuccess && (
                <div className="p-3.5 rounded-xl bg-green-50 border-2 border-brand-mint text-brand-dark text-xs font-mono font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <span>{botSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateBot} className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 w-full">
                  <Input
                    type="password"
                    placeholder="7192837492:AAF9xL0_q91ka0923uJks..."
                    value={botTokenInput}
                    onChange={(e) => setBotTokenInput(e.target.value)}
                    disabled={botSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={botSubmitting}
                  className="w-full sm:w-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{botSubmitting ? 'Memvalidasi getMe...' : 'Verifikasi & Simpan Bot'}</span>
                </Button>
              </form>
            </div>

            {/* Bot Instances List */}
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="h-44 rounded-2xl border-2 border-gray-300 bg-white p-6 animate-pulse" />
                ))}
              </div>
            ) : bots.length === 0 ? (
              <div className="py-12 px-6 text-center border-2 border-dashed border-brand-dark rounded-2xl bg-white space-y-3">
                <Bot className="w-8 h-8 text-brand-dark mx-auto" />
                <p className="font-heading font-bold text-base text-brand-dark">
                  Belum Ada Bot Telegram yang Terhubung
                </p>
                <p className="text-xs text-brand-muted max-w-md mx-auto">
                  Buat bot baru melalui @BotFather di Telegram, salin HTTP API Token-nya, lalu tempel pada kolom di atas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bots.map((bot) => {
                  const isRunning = bot.status === 'active' || bot.status === 'running'
                  const isBusy = togglingBotId === bot.id
                  return (
                    <div key={bot.id} className="card-static p-6 space-y-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-heading font-bold text-lg text-brand-dark">
                            {bot.bot_name || 'Telegram Store Bot'}
                          </h3>
                          <p className="font-mono text-xs font-bold text-brand-pink">
                            @{String(bot.bot_username || 'bot').replace(/^@/, '')}
                          </p>
                        </div>
                        <Badge variant={isRunning ? 'mint' : 'default'}>
                          {isRunning ? 'RUNNING' : 'STOPPED'}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-brand-surface-tint border-2 border-brand-dark font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-brand-muted">TOKEN VAULT:</span>
                          <span className="text-brand-dark font-bold inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-brand-mint" />
                            AES-256-GCM
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-brand-muted">HEARTBEAT:</span>
                          <span className="text-brand-dark">{formatDateId(bot.last_heartbeat || bot.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t-2 border-brand-dark/10">
                        <span className="font-mono text-[11px] text-brand-muted">
                          ID: {String(bot.id).slice(0, 8)}
                        </span>
                        <Button
                          type="button"
                          variant={isRunning ? 'secondary' : 'primary'}
                          size="sm"
                          loading={isBusy}
                          onClick={() => handleToggleBot(bot)}
                        >
                          {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isRunning ? 'Hentikan Bot' : 'Jalankan Bot'}</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY / STOK AKUN */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark">
                Brankas Stok Akun Digital
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-sans">
                Kredensial akun (email, password, kode OTP/2FA) langsung dienkripsi AES-256-GCM di server dan hanya didekripsi saat dikirim ke pembeli yang sudah lunas.
              </p>
            </div>

            {/* Add Account Form */}
            <div className="card-static p-6 space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-dark">
                + Tambah Unit Stok Akun Baru
              </h3>

              {accError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{accError}</span>
                </div>
              )}

              {accSuccess && (
                <div className="p-3.5 rounded-xl bg-green-50 border-2 border-brand-mint text-brand-dark text-xs font-mono font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <span>{accSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={accCategoryId}
                    onChange={(e) => setAccCategoryId(e.target.value)}
                    disabled={accSubmitting}
                    className="input-brutalist"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <Input
                    label="Judul Produk Akun"
                    placeholder="Netflix 4K 1 Bulan"
                    value={accTitle}
                    onChange={(e) => setAccTitle(e.target.value)}
                    disabled={accSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Harga (IDR)"
                    type="number"
                    placeholder="35000"
                    value={accPriceIdr}
                    onChange={(e) => setAccPriceIdr(e.target.value)}
                    disabled={accSubmitting}
                  />
                </div>

                <div className="md:col-span-4">
                  <Input
                    label="Kredensial (Dienkripsi AES-256)"
                    type="text"
                    placeholder="email@domain.com | Password123"
                    value={accCredentials}
                    onChange={(e) => setAccCredentials(e.target.value)}
                    disabled={accSubmitting}
                  />
                </div>

                <div className="md:col-span-12 flex justify-end pt-1">
                  <Button type="submit" variant="primary" loading={accSubmitting}>
                    <Plus className="w-4 h-4" />
                    <span>{accSubmitting ? 'Mengenkripsi & Menyimpan...' : 'Simpan ke Brankas Stok'}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Accounts Table */}
            <div className="card-static overflow-hidden">
              {loadingData ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-12 bg-gray-100 border-b border-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-2">
                  <Package className="w-8 h-8 text-brand-dark mx-auto" />
                  <p className="font-heading font-bold text-base text-brand-dark">
                    Brankas Stok Akun Masih Kosong
                  </p>
                  <p className="text-xs text-brand-muted">
                    Gunakan formulir di atas untuk menambahkan unit akun pertama Anda.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-brand-surface-tint border-b-2 border-brand-dark text-brand-dark font-mono uppercase">
                        <th className="p-4">Judul Akun</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Harga IDR</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Ditambahkan</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((item) => {
                        const isSold = item.status === 'sold'
                        return (
                          <tr
                            key={item.id}
                            className={`border-b-2 border-brand-dark/15 transition-colors ${
                              isSold
                                ? 'opacity-50 bg-gray-50 text-gray-400'
                                : 'bg-white hover:bg-brand-surface-tint/40'
                            }`}
                          >
                            <td className="p-4 font-heading font-bold text-brand-dark">{item.title}</td>
                            <td className="p-4 font-mono">{item.category_name || 'Umum'}</td>
                            <td className="p-4 font-mono font-bold text-brand-pink">
                              {formatIdr(item.price_idr)}
                            </td>
                            <td className="p-4">
                              <Badge variant={item.status === 'available' ? 'mint' : 'default'}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="p-4 font-mono text-brand-muted">
                              {formatDateId(item.created_at)}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={isSold}
                                loading={deletingAccId === item.id}
                                onClick={() => handleDeleteAccount(item.id)}
                                title={isSold ? 'Akun yang sudah terjual tidak dapat dihapus' : 'Hapus stok'}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-brand-pink" />
                                <span>Hapus</span>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RIWAYAT TRANSAKSI */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark">
                Log Audit Transaksi Penjualan
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-sans">
                Catatan seluruh pembelian akun yang diproses melalui bot Telegram toko Anda.
              </p>
            </div>

            <div className="card-static overflow-hidden">
              {loadingData ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-12 bg-gray-100 border-b border-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-2">
                  <Receipt className="w-8 h-8 text-brand-dark mx-auto" />
                  <p className="font-heading font-bold text-base text-brand-dark">
                    Belum Ada Riwayat Transaksi
                  </p>
                  <p className="text-xs text-brand-muted">
                    Transaksi pembeli di bot Telegram akan langsung muncul di tabel ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-brand-surface-tint border-b-2 border-brand-dark text-brand-dark font-mono uppercase">
                        <th className="p-4">ID Transaksi</th>
                        <th className="p-4">Username Buyer</th>
                        <th className="p-4">Produk Akun</th>
                        <th className="p-4">Nominal Kotor</th>
                        <th className="p-4">Nominal Bersih</th>
                        <th className="p-4">Gateway</th>
                        <th className="p-4">Waktu</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b-2 border-brand-dark/15 bg-white hover:bg-brand-surface-tint/40 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-brand-dark">
                            {String(tx.id).slice(0, 10)}
                          </td>
                          <td className="p-4 font-mono text-brand-dark">
                            {tx.buyer_username || 'â€”'}
                          </td>
                          <td className="p-4 font-semibold text-brand-dark">
                            {tx.account_title || 'â€”'}
                          </td>
                          <td className="p-4 font-mono text-brand-muted">
                            {formatIdr(tx.gross_amount_idr)}
                          </td>
                          <td className="p-4 font-mono font-bold text-brand-pink">
                            {formatIdr(tx.net_amount_idr)}
                          </td>
                          <td className="p-4 font-mono uppercase">
                            {tx.payment_gateway || 'qris'}
                          </td>
                          <td className="p-4 font-mono text-brand-muted">
                            {formatDateId(tx.created_at)}
                          </td>
                          <td className="p-4">
                            <Badge variant={tx.payment_status === 'paid' || tx.payment_status === 'completed' ? 'mint' : 'warning'}>
                              {tx.payment_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SCRIPT & LISENSI */}
        {activeTab === 'script' && (
          <div className="max-w-3xl space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark">
                Lisensi &amp; Unduhan Source Code
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-sans">
                Tersedia secara otomatis bagi akun yang memiliki pesanan paket <code>script</code> berstatus Paid (Lunas).
              </p>
            </div>

            {loadingData ? (
              <div className="h-56 rounded-2xl border-2 border-gray-300 bg-white p-6 animate-pulse" />
            ) : !license ? (
              <div className="card-static p-8 text-center space-y-4">
                <Code2 className="w-10 h-10 text-brand-pink mx-auto" />
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-heading font-bold text-lg text-brand-dark">
                    Lisensi Full Source Code Belum Aktif
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted font-sans">
                    Anda belum memiliki pesanan paket <strong>Full Source Code (Script Only - Rp 300.000)</strong> yang berstatus lunas.
                  </p>
                </div>
                <Button variant="primary" onClick={() => navigate('/payment?plan=script')}>
                  <span>Beli Paket Full Source Code (300K)</span>
                </Button>
              </div>
            ) : (
              <div className="card-static p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b-2 border-brand-dark/15">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-brand-dark">
                      Autobotz Engine Unencrypted Source
                    </h3>
                    <p className="font-mono text-xs text-brand-muted">
                      Versi {license.version || '1.0.0'} â€¢ Node.js + Express + Telegraf + SQL
                    </p>
                  </div>
                  <Badge variant="mint">LISENSI AKTIF</Badge>
                </div>

                <div className="p-4 bg-brand-surface-tint border-2 border-brand-dark rounded-xl space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-brand-dark">
                    HMAC License Key Resmi Anda:
                  </span>
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border-2 border-brand-dark">
                    <code className="font-mono text-xs font-bold text-brand-pink break-all">
                      {license.key}
                    </code>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => copyLicense(license.key)}
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Disalin' : 'Salin'}</span>
                    </Button>
                  </div>
                </div>

                {license.download_url ? (
                  <a
                    href={license.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary w-full justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Unduh Paket Source Code (.ZIP)</span>
                  </a>
                ) : (
                  <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark text-xs font-mono text-brand-dark">
                    Kunci lisensi Anda sudah aktif. URL unduhan bucket (<code>SCRIPT_DOWNLOAD_URL</code> / <code>SCRIPT_DOWNLOAD_BUCKET</code>) sedang disiapkan oleh administrator server.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PENGATURAN PROFIL TOKO (PUT /api/me) */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark">
                Pengaturan Profil Merchant
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-sans">
                Perbarui identitas pemilik dan nama toko Anda melalui endpoint <code>PUT /api/me</code>.
              </p>
            </div>

            <div className="card-static p-6 sm:p-8 space-y-5">
              {profileError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-green-50 border-2 border-brand-mint text-brand-dark text-xs font-mono font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input
                  label="Email Akun (Read-Only)"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />

                <Input
                  label="Nama Lengkap Pemilik"
                  type="text"
                  placeholder="Nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={profileSaving}
                />

                <Input
                  label="Nama Toko / Brand"
                  type="text"
                  placeholder="Autobotz Official Store"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={profileSaving}
                />

                <Input
                  label="Nomor Telepon / WhatsApp"
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={profileSaving}
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" loading={profileSaving}>
                    <span>{profileSaving ? 'Menyimpan Perubahan...' : 'Simpan Profil Toko'}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

