import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, getProfile, signOut } from '../lib/supabase'
import {
  fetchAdminOrders,
  approveAdminOrder,
  rejectAdminOrder,
  formatIdr,
  formatDateId
} from '../api/client'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'
import { 
  Bot, 
  ShieldCheck, 
  Check, 
  X, 
  RefreshCw, 
  LogOut, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Eye
} from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  const [statusFilter, setStatusFilter] = useState('pending_verification')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  // Modal states for proof preview & structured rejection
  const [previewOrder, setPreviewOrder] = useState(null)
  const [rejectTargetOrder, setRejectTargetOrder] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processingOrderId, setProcessingOrderId] = useState(null)

  const navigate = useNavigate()

  const loadOrders = useCallback(async (filterVal = statusFilter) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminOrders(filterVal)
      setOrders(Array.isArray(res?.orders) ? res.orders : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar pesanan dari server admin.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    let mounted = true
    async function verifyAdmin() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return
        if (!currentUser) {
          setAuthChecking(false)
          navigate('/login?redirect=%2Fadmin')
          return
        }
        setUser(currentUser)
        const { data: profile } = await getProfile(currentUser.id)
        if (!mounted) return
        if (profile?.role !== 'admin') {
          setIsAdmin(false)
          setAuthChecking(false)
          return
        }
        setIsAdmin(true)
        setAuthChecking(false)
        loadOrders('pending_verification')
      } catch {
        if (mounted) {
          setAuthChecking(false)
          navigate('/login?redirect=%2Fadmin')
        }
      }
    }
    verifyAdmin()
    return () => {
      mounted = false
    }
  }, [navigate, loadOrders])

  const handleApprove = async (orderId) => {
    setError('')
    setActionNotice('')
    setProcessingOrderId(orderId)
    try {
      await approveAdminOrder(orderId)
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setActionNotice(`Order ${orderId} berhasil disetujui. Paket layanan user telah diaktifkan.`)
    } catch (err) {
      setError(err.message || 'Gagal menyetujui pesanan.')
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleConfirmReject = async (e) => {
    e.preventDefault()
    if (!rejectTargetOrder) return
    if (!rejectReason.trim()) {
      setError('Alasan penolakan wajib diisi agar tercatat di notes order.')
      return
    }
    setError('')
    setActionNotice('')
    setProcessingOrderId(rejectTargetOrder.id)
    try {
      await rejectAdminOrder(rejectTargetOrder.id, rejectReason.trim())
      setOrders((prev) => prev.filter((o) => o.id !== rejectTargetOrder.id))
      setActionNotice(`Order ${rejectTargetOrder.id} ditolak dengan catatan: "${rejectReason.trim()}"`)
      setRejectTargetOrder(null)
      setRejectReason('')
    } catch (err) {
      setError(err.message || 'Gagal menolak pesanan.')
    } finally {
      setProcessingOrderId(null)
    }
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-white/[0.1] rounded" />
          <div className="h-4 w-full bg-white/[0.06] rounded" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] p-8 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-brand-pink mx-auto" />
          <h1 className="font-heading font-extrabold text-2xl text-[#F4F6FA]">
            Akses Ditolak (403 Admin Only)
          </h1>
          <p className="text-xs sm:text-sm text-[#A8B0C2] font-sans">
            Akun Anda (<code>{user?.email}</code>) tidak memiliki role <code>admin</code> pada tabel <code>profiles</code>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
              <span>Ke Dashboard Merchant</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { signOut(); navigate('/login') }}>
              <span>Ganti Akun</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      
      {/* Admin Top Bar */}
      <header className="bg-[#090B10]/90 text-[#F4F6FA] border-b border-white/[0.08] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-pink border-2 border-white flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-brand font-bold text-2xl text-white">Autobotz</span>
            </Link>
            <Badge variant="pink">ADMIN VERIFICATION DESK</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="font-mono text-xs text-gray-300 hover:text-white">
              Portal Merchant â†’
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
              KONTROL PEMBAYARAN &amp; AKTIVASI PAKET
            </p>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F4F6FA]">
              Verifikasi Bukti Transfer Manual
            </h1>
            <p className="text-xs sm:text-sm text-[#A8B0C2] mt-1">
              Tautan bukti transfer menggunakan Signed URL privat yang berlaku selama 10 menit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['pending_verification', 'paid', 'failed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st)
                  loadOrders(st)
                }}
                className={`px-3 py-2 rounded-xl border-2 font-mono text-xs font-bold uppercase cursor-pointer ${
                  statusFilter === st
                    ? 'border-white/[0.12] bg-brand-pink text-white shadow-md'
                    : 'border-white/[0.12] bg-[#121621]/65 backdrop-blur-md text-[#F4F6FA] hover:bg-white/[0.05]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={() => loadOrders(statusFilter)}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#FD1843]/10 border-2 border-brand-pink text-brand-pink text-xs font-mono font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadOrders(statusFilter)}>
              <span>Coba Lagi</span>
            </Button>
          </div>
        )}

        {actionNotice && (
          <div className="p-4 rounded-xl bg-[#10B981]/10 border-2 border-brand-mint text-[#F4F6FA] text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Orders Table */}
        <div className="card-static overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-white/[0.06] border-b border-white/[0.08] animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="font-heading font-bold text-base text-[#F4F6FA]">
                Tidak Ada Pesanan dengan Status "{statusFilter}"
              </p>
              <p className="text-xs text-[#A8B0C2]">
                Seluruh antrean verifikasi pada kategori ini sudah bersih.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-[#0D1017]/80 border-b border-white/[0.08] text-[#F4F6FA] font-mono uppercase">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Email Merchant</th>
                    <th className="p-4">Paket</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Bukti Transfer (10m URL)</th>
                    <th className="p-4">Waktu</th>
                    <th className="p-4 text-right">Keputusan</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const proofLink = ord.proof_url || ord.payment_proof_url
                    const isBusy = processingOrderId === ord.id
                    return (
                      <tr
                        key={ord.id}
                        className="border-b border-white/[0.08] bg-[#121621]/65 backdrop-blur-md hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-[#F4F6FA]">
                          {String(ord.id).slice(0, 10)}
                        </td>
                        <td className="p-4 font-medium text-[#F4F6FA]">
                          {ord.user_email || 'â€”'}
                        </td>
                        <td className="p-4 font-heading font-bold text-[#F4F6FA]">
                          {ord.plan_name || ord.plan_slug}
                        </td>
                        <td className="p-4 font-mono font-bold text-brand-pink">
                          {formatIdr(ord.amount_idr)}
                        </td>
                        <td className="p-4 font-mono uppercase">
                          {ord.payment_method}
                        </td>
                        <td className="p-4">
                          {proofLink ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewOrder(ord)}
                                className="px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.05] font-mono text-[11px] font-bold inline-flex items-center gap-1 hover:bg-brand-pink hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                              <a
                                href={proofLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-blue hover:underline font-mono text-[11px] inline-flex items-center gap-0.5"
                              >
                                <span>Buka</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="font-mono text-[#A8B0C2]">Belum diunggah</span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[#A8B0C2]">
                          {formatDateId(ord.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              loading={isBusy}
                              disabled={ord.payment_status === 'paid'}
                              onClick={() => handleApprove(ord.id)}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => {
                                setRejectTargetOrder(ord)
                                setRejectReason('')
                              }}
                            >
                              <X className="w-3.5 h-3.5 text-brand-pink" />
                              <span>Tolak</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Proof Image Modal Preview */}
        {previewOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#F4F6FA]">
                    Bukti Transfer #{String(previewOrder.id).slice(0, 8)}
                  </h3>
                  <p className="font-mono text-xs text-[#A8B0C2]">
                    {previewOrder.user_email} â€¢ {formatIdr(previewOrder.amount_idr)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOrder(null)}
                  className="p-1.5 rounded-lg border border-white/[0.1] hover:bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#090C12]/75 backdrop-blur-sm border border-white/[0.1] rounded-xl p-3 flex items-center justify-center max-h-96 overflow-auto">
                <img
                  src={previewOrder.proof_url || previewOrder.payment_proof_url}
                  alt="Bukti pembayaran"
                  className="max-h-80 object-contain rounded"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" size="sm" onClick={() => setPreviewOrder(null)}>
                  <span>Tutup</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const id = previewOrder.id
                    setPreviewOrder(null)
                    handleApprove(id)
                  }}
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui Pesanan Ini</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectTargetOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <form
              onSubmit={handleConfirmReject}
              className="bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-heading font-bold text-base text-[#F4F6FA]">
                  Tolak Pesanan #{String(rejectTargetOrder.id).slice(0, 8)}
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectTargetOrder(null)}
                  className="p-1.5 rounded-lg border border-white/[0.1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Input
                label="Alasan Penolakan (Dikirim ke Catatan Order User)"
                placeholder="Nominal transfer tidak sesuai / bukti gambar buram"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setRejectTargetOrder(null)}>
                  <span>Batal</span>
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={processingOrderId === rejectTargetOrder.id}
                >
                  <span>Konfirmasi Tolak</span>
                </Button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  )
}

