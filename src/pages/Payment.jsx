import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getCurrentUser } from '../lib/supabase'
import {
  fetchPlans,
  createOrder,
  fetchOrderById,
  fetchMyOrders,
  uploadOrderProof,
  formatIdr,
  formatDateId,
  ALLOWED_PROOF_MIMES,
  MAX_PROOF_SIZE_BYTES
} from '../api/client'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { 
  Bot, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  CreditCard, 
  Copy, 
  Check, 
  Upload, 
  CheckCircle2, 
  ExternalLink,
  AlertCircle,
  RefreshCw,
  LogIn,
  FileCheck2
} from 'lucide-react'

export default function Payment() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const planParam = searchParams.get('plan') || 'pro'
  const orderIdParam = searchParams.get('order') || ''

  const [user, setUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)

  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedPlanSlug, setSelectedPlanSlug] = useState(planParam)
  const [paymentMethod, setPaymentMethod] = useState('qris') // 'qris' | 'bank' | 'midtrans'

  const [activeOrder, setActiveOrder] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [instructions, setInstructions] = useState({ bank_accounts: [], qris_image_url: null })
  const [myOrders, setMyOrders] = useState([])

  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  // Proof upload states (All 6 states per recipes.md)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    let mounted = true
    async function init() {
      setPlansLoading(true)
      const [planRes, currentUser] = await Promise.all([
        fetchPlans(),
        getCurrentUser().catch(() => null)
      ])
      if (!mounted) return
      setPlans(planRes.plans || [])
      setPlansLoading(false)
      setUser(currentUser)
      setAuthChecking(false)

      if (currentUser) {
        fetchMyOrders()
          .then((res) => {
            if (mounted && Array.isArray(res?.orders)) {
              setMyOrders(res.orders)
            }
          })
          .catch(() => {})

        if (orderIdParam) {
          fetchOrderById(orderIdParam)
            .then((res) => {
              if (mounted && res?.order) {
                setActiveOrder(res.order)
                if (res.order.plan_slug) setSelectedPlanSlug(res.order.plan_slug)
                if (res.order.payment_method) setPaymentMethod(res.order.payment_method)
              }
            })
            .catch((err) => {
              if (mounted) setOrderError(err.message || 'Gagal memuat detail pesanan.')
            })
        }
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [orderIdParam])

  const currentPlan =
    plans.find((p) => p.slug === selectedPlanSlug) ||
    plans.find((p) => p.slug === 'pro') ||
    plans[0]

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(String(text))
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 1800)
  }

  const handleCreateOrder = async () => {
    setOrderError('')
    setUploadError('')
    setUploadSuccess('')

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/payment?plan=${selectedPlanSlug}`)}`)
      return
    }

    setCreatingOrder(true)
    try {
      const res = await createOrder(selectedPlanSlug, paymentMethod)
      if (res?.order) {
        setActiveOrder(res.order)
        setPaymentInfo(res.payment || null)
        setInstructions(res.instructions || { bank_accounts: [], qris_image_url: null })
        setSearchParams({ plan: selectedPlanSlug, order: res.order.id })
        // Refresh user order list
        fetchMyOrders()
          .then((r) => {
            if (Array.isArray(r?.orders)) setMyOrders(r.orders)
          })
          .catch(() => {})
      }
    } catch (err) {
      setOrderError(err.message || 'Gagal membuat pesanan di server.')
    } finally {
      setCreatingOrder(false)
    }
  }

  const validateAndSelectFile = (file) => {
    setUploadError('')
    setUploadSuccess('')
    if (!file) return

    const mime = file.type === 'image/jpg' ? 'image/jpeg' : file.type
    if (!ALLOWED_PROOF_MIMES.has(mime)) {
      setUploadError('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.')
      setSelectedFile(null)
      return
    }
    if (file.size > MAX_PROOF_SIZE_BYTES) {
      setUploadError('Ukuran file melebihi batas maksimal 5MB.')
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
  }

  const handleUploadProof = async (e) => {
    e.preventDefault()
    if (!activeOrder?.id) {
      setUploadError('Buat pesanan terlebih dahulu sebelum mengunggah bukti transfer.')
      return
    }
    if (!selectedFile) {
      setUploadError('Pilih file gambar bukti transfer (JPG/PNG/WEBP, maks 5MB).')
      return
    }

    setUploadingProof(true)
    setUploadProgress(10)
    setUploadError('')
    setUploadSuccess('')

    try {
      const res = await uploadOrderProof(activeOrder.id, selectedFile, (pct) => {
        setUploadProgress(pct)
      })
      if (res?.order) {
        setActiveOrder(res.order)
      }
      setUploadSuccess('Bukti pembayaran berhasil diunggah dan sedang menunggu verifikasi admin.')
      setSelectedFile(null)
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah bukti pembayaran.')
    } finally {
      setUploadingProof(false)
    }
  }

  const handleRefreshOrder = async () => {
    if (!activeOrder?.id) return
    setOrderError('')
    try {
      const res = await fetchOrderById(activeOrder.id)
      if (res?.order) setActiveOrder(res.order)
    } catch (err) {
      setOrderError(err.message || 'Gagal memperbarui status pesanan.')
    }
  }

  const statusBadgeVariant = (status) => {
    if (status === 'paid') return 'mint'
    if (status === 'pending_verification') return 'warning'
    if (status === 'failed') return 'pink'
    return 'default'
  }

  return (
    <div className="min-h-screen bg-brand-chill-white py-8 px-4">
      <div className="container-brutalist space-y-8">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b-2 border-brand-dark pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-heading font-bold text-xs sm:text-sm text-brand-dark hover:text-brand-pink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Paket</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="font-mono text-xs font-bold text-brand-dark hover:text-brand-pink">
              Dashboard Merchant
            </Link>
            <div className="w-8 h-8 rounded-lg bg-brand-pink border-2 border-brand-dark flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Page Heading */}
        <div className="space-y-1 text-left">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
            CHECKOUT &amp; VERIFIKASI PEMBAYARAN
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-dark">
            Selesaikan Pemesanan Layanan Autobotz
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-sans">
            Harga diambil langsung dari tabel paket server. Pilih metode bayar, buat pesanan resmi, lalu unggah resi pembayaran Anda.
          </p>
        </div>

        {/* Auth Notice Banner if Not Logged In */}
        {!authChecking && !user && (
          <div className="p-5 rounded-2xl bg-brand-surface-tint border-2 border-brand-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-heading font-bold text-sm text-brand-dark">
                Autentikasi Merchant Diperlukan untuk Membuat Order
              </p>
              <p className="text-xs text-brand-muted font-sans">
                Setiap pesanan dikaitkan dengan akun Supabase Anda agar lisensi script dan bot cloud langsung aktif setelah pembayaran.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/payment?plan=${selectedPlanSlug}`)}`)}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk / Daftar Sekarang</span>
            </Button>
          </div>
        )}

        {/* Main 2-Column Split Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Step 1 Plan & Method + Step 2 Payment Instructions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: Select Plan & Payment Method */}
            <div className="bg-white border-2 border-brand-dark rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                <h2 className="font-heading font-bold text-base sm:text-lg text-brand-dark">
                  1. Pilih Paket &amp; Metode Pembayaran
                </h2>
                <span className="font-mono text-xs font-bold text-brand-muted">SERVER-VERIFIED</span>
              </div>

              {/* Plan Selector Grid */}
              {plansLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100 border-2 border-gray-300 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((p) => {
                    const selected = p.slug === selectedPlanSlug
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setSelectedPlanSlug(p.slug)}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-brand-dark bg-brand-surface-tint shadow-[3px_3px_0px_0px_#FD1843]'
                            : 'border-brand-dark/30 bg-white hover:border-brand-dark'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-xs sm:text-sm text-brand-dark">
                            {p.name}
                          </span>
                          <span className="font-mono text-[10px] uppercase font-bold text-brand-pink">
                            {p.billing_cycle === 'one_time' ? 'LIFETIME' : '/BLN'}
                          </span>
                        </div>
                        <p className="font-mono font-extrabold text-base text-brand-dark mt-1">
                          {formatIdr(p.price_idr)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block font-mono text-xs font-bold uppercase text-brand-dark">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'qris', label: 'QRIS Manual / Instan', icon: QrCode },
                    { id: 'bank', label: 'Transfer Bank', icon: Building2 },
                    { id: 'midtrans', label: 'Midtrans Snap', icon: CreditCard }
                  ].map((m) => {
                    const Icon = m.icon
                    const active = paymentMethod === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl border-2 font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          active
                            ? 'border-brand-dark bg-brand-pink text-white shadow-brutalist-sm'
                            : 'border-brand-dark bg-white text-brand-dark hover:bg-brand-surface-tint'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{m.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {orderError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  loading={creatingOrder}
                  onClick={handleCreateOrder}
                  className="w-full justify-center"
                >
                  <span>
                    {creatingOrder
                      ? 'Membuat Order di Server...'
                      : activeOrder
                        ? 'Buat Order Baru dengan Pilihan Ini'
                        : `Buat Order Resmi (${currentPlan ? formatIdr(currentPlan.price_idr) : ''})`}
                  </span>
                </Button>
              </div>
            </div>

            {/* STEP 2: Server Instructions (Shown once order exists or previewed) */}
            <div className="bg-white border-2 border-brand-dark rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                <h2 className="font-heading font-bold text-base sm:text-lg text-brand-dark">
                  2. Instruksi Pembayaran Resmi
                </h2>
                <Badge variant="dark">{paymentMethod.toUpperCase()}</Badge>
              </div>

              {/* Midtrans Redirect / Snap Token */}
              {paymentInfo?.redirect_url && (
                <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark space-y-3">
                  <p className="font-heading font-bold text-sm text-brand-dark">
                    Link Pembayaran Midtrans Snap Siap
                  </p>
                  <a
                    href={paymentInfo.redirect_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
                  >
                    <span>Buka Halaman Pembayaran Midtrans</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Bank Accounts from Server Env */}
              {paymentMethod === 'bank' && (
                <div className="space-y-3">
                  {Array.isArray(instructions?.bank_accounts) && instructions.bank_accounts.length > 0 ? (
                    instructions.bank_accounts.map((acc, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5 font-mono">
                          <span className="text-xs font-bold text-brand-pink uppercase">{acc.bank}</span>
                          <p className="text-base font-extrabold text-brand-dark">{acc.number}</p>
                          <p className="text-xs text-brand-muted">a.n. {acc.holder}</p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(acc.number, `bank-${idx}`)}
                        >
                          {copiedField === `bank-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedField === `bank-${idx}` ? 'Disalin' : 'Salin'}</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark text-xs font-mono text-brand-dark space-y-1">
                      <p className="font-bold">Rekening Bank Manual Belum Dikonfigurasi di Env Server</p>
                      <p className="text-brand-muted">
                        Admin perlu mengisi variabel <code>MANUAL_BANK_ACCOUNTS_JSON</code> atau <code>MANUAL_BANK_BCA_ACCOUNT</code> di <code>.env.backend</code>. Setelah membuat order, Anda tetap dapat mengunggah bukti transfer di panel kanan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* QRIS Image from Server Env */}
              {paymentMethod === 'qris' && (
                <div className="space-y-3">
                  {instructions?.qris_image_url ? (
                    <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark flex flex-col items-center gap-3">
                      <img
                        src={instructions.qris_image_url}
                        alt="Kode QRIS Resmi Autobotz"
                        className="w-56 h-56 object-contain border-2 border-brand-dark rounded-xl bg-white p-2"
                      />
                      <p className="text-xs font-mono text-brand-dark">
                        Scan QRIS di atas sesuai nominal tagihan pesanan Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark text-xs font-mono text-brand-dark space-y-1">
                      <p className="font-bold">Gambar QRIS Manual Belum Dikonfigurasi di Env Server</p>
                      <p className="text-brand-muted">
                        Admin dapat menyetel <code>MANUAL_QRIS_IMAGE_URL</code> pada <code>.env.backend</code>. Silakan buat order lalu unggah bukti bayar di panel kanan untuk verifikasi admin.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'midtrans' && !paymentInfo?.redirect_url && (
                <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark text-xs font-mono text-brand-dark">
                  Klik tombol <strong>Buat Order Resmi</strong> di atas untuk meminta token pembayaran Snap dari server. Jika kunci <code>MIDTRANS_SERVER_KEY</code> belum aktif, silakan gunakan metode QRIS atau Transfer Bank.
                </div>
              )}
            </div>

          </div>

          {/* Right Column (5 cols): Active Order Summary & Proof Dropzone (All 6 states) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Summary & Upload Proof Card */}
            <div className="bg-white border-2 border-brand-dark rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/15 pb-3">
                <h2 className="font-heading font-bold text-base sm:text-lg text-brand-dark">
                  3. Ringkasan Order &amp; Bukti Bayar
                </h2>
                {activeOrder && (
                  <button
                    type="button"
                    onClick={handleRefreshOrder}
                    className="p-1.5 rounded-lg border-2 border-brand-dark hover:bg-brand-surface-tint text-xs font-mono inline-flex items-center gap-1"
                    title="Segarkan status order"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeOrder ? (
                <div className="p-4 rounded-xl bg-brand-surface-tint border-2 border-brand-dark space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted">ORDER ID:</span>
                    <span className="font-bold text-brand-dark">{activeOrder.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted">PAKET:</span>
                    <span className="font-bold text-brand-dark">{activeOrder.plan_name || activeOrder.plan_slug}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted">TOTAL TAGIHAN:</span>
                    <span className="font-extrabold text-sm text-brand-pink">
                      {formatIdr(activeOrder.amount_idr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted">STATUS:</span>
                    <Badge variant={statusBadgeVariant(activeOrder.payment_status)}>
                      {activeOrder.payment_status}
                    </Badge>
                  </div>
                  {activeOrder.notes && (
                    <div className="pt-2 border-t border-brand-dark/15 text-brand-pink">
                      Catatan: {activeOrder.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-xl border-2 border-dashed border-brand-dark bg-brand-surface-tint/30 text-center space-y-1">
                  <p className="font-heading font-bold text-sm text-brand-dark">
                    Belum Ada Order Aktif yang Dipilih
                  </p>
                  <p className="text-xs text-brand-muted font-sans">
                    Tekan tombol <strong>Buat Order Resmi</strong> di kolom kiri atau pilih salah satu pesanan Anda di bawah untuk mengunggah bukti transfer.
                  </p>
                </div>
              )}

              {/* Proof Upload Form - Implements all 6 states from recipes.md */}
              <form onSubmit={handleUploadProof} className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={!activeOrder || uploadingProof || activeOrder?.payment_status === 'paid'}
                  onChange={(e) => validateAndSelectFile(e.target.files?.[0])}
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!activeOrder || uploadingProof || activeOrder?.payment_status === 'paid') return
                    fileInputRef.current?.click()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (!activeOrder || uploadingProof || activeOrder?.payment_status === 'paid') return
                      fileInputRef.current?.click()
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (activeOrder && !uploadingProof) setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (!activeOrder || uploadingProof) return
                    validateAndSelectFile(e.dataTransfer.files?.[0])
                  }}
                  className={`w-full p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                    !activeOrder || activeOrder?.payment_status === 'paid'
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : uploadingProof
                        ? 'border-brand-dark bg-white cursor-wait'
                        : uploadError
                          ? 'border-brand-pink bg-red-50 text-brand-pink cursor-pointer'
                          : isDragging
                            ? 'border-brand-pink bg-brand-surface-tint border-solid shadow-brutalist-pink cursor-pointer'
                            : 'border-dashed border-brand-dark bg-brand-surface-tint/40 hover:bg-brand-surface-tint/70 cursor-pointer'
                  }`}
                >
                  {uploadingProof ? (
                    <div className="w-full space-y-2">
                      <p className="font-mono text-xs font-bold text-brand-dark">
                        MENGUNGGAH &amp; VALIDASI MAGIC BYTES ({uploadProgress}%)
                      </p>
                      <div className="w-full h-3 bg-gray-200 rounded-full border border-brand-dark overflow-hidden">
                        <div
                          className="h-full bg-brand-pink transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <>
                      <FileCheck2 className="w-7 h-7 text-brand-mint" />
                      <p className="font-mono text-xs font-bold text-brand-dark break-all">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                      <span className="text-[11px] text-brand-muted font-sans">
                        Klik untuk mengganti file gambar
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-brand-dark" />
                      <p className="font-heading font-bold text-xs sm:text-sm text-brand-dark">
                        Klik atau seret struk transfer ke sini
                      </p>
                      <p className="font-mono text-[11px] text-brand-muted">
                        Format wajib: JPG, PNG, atau WEBP (Maks. 5MB)
                      </p>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 rounded-xl bg-green-50 border-2 border-brand-mint text-brand-dark text-xs font-mono font-bold flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  loading={uploadingProof}
                  disabled={!activeOrder || !selectedFile || activeOrder?.payment_status === 'paid'}
                  className="w-full justify-center"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {activeOrder?.payment_status === 'paid'
                      ? 'Pesanan Sudah Lunas (Paid)'
                      : uploadingProof
                        ? 'Mengunggah Bukti...'
                        : 'Kirim Bukti Pembayaran'}
                  </span>
                </Button>
              </form>

              <div className="pt-3 border-t-2 border-brand-dark/10 flex items-center gap-2 text-[11px] font-mono text-brand-muted">
                <ShieldCheck className="w-4 h-4 text-brand-mint shrink-0" />
                <span>File disimpan di bucket privat Supabase dengan signed URL 10 menit.</span>
              </div>
            </div>

            {/* Existing User Orders List */}
            {user && myOrders.length > 0 && (
              <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-sm text-brand-dark uppercase">
                  Riwayat Pesanan Paket Anda
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {myOrders.map((ord) => {
                    const isCurrent = activeOrder?.id === ord.id
                    return (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setActiveOrder(ord)
                          setSearchParams({ plan: ord.plan_slug || selectedPlanSlug, order: ord.id })
                        }}
                        className={`w-full p-3 rounded-xl border-2 text-left text-xs font-mono transition-colors flex items-center justify-between ${
                          isCurrent
                            ? 'border-brand-dark bg-brand-surface-tint'
                            : 'border-brand-dark/20 bg-white hover:border-brand-dark'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-brand-dark">{ord.plan_name || ord.plan_slug}</p>
                          <p className="text-[11px] text-brand-muted">
                            {formatIdr(ord.amount_idr)} • {formatDateId(ord.created_at)}
                          </p>
                        </div>
                        <Badge variant={statusBadgeVariant(ord.payment_status)}>
                          {ord.payment_status}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
