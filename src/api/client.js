import { supabase, getAccessToken } from '../lib/supabase'

const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '')

// Vite dev proxies '/api' -> http://localhost:5000; prod uses VITE_BACKEND_URL + '/api'
export const API_BASE = rawBackendUrl
  ? rawBackendUrl.endsWith('/api')
    ? rawBackendUrl
    : `${rawBackendUrl}/api`
  : '/api'

export const ALLOWED_PROOF_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export const FALLBACK_PLANS = [
  {
    slug: 'starter',
    name: 'Starter Cloud',
    tier: 'rental',
    description: 'Sewa bot cloud hosting terkelola hingga 100 transaksi akun otomatis per hari.',
    price_idr: 99000,
    billing_cycle: 'monthly',
    features: [
      'Kapasitas hingga 100 transaksi akun / hari',
      'Cloud Node Hosting Aktif 24/7',
      'Integrasi Pembayaran QRIS & Transfer Bank',
      'Manajemen stok hingga 5 kategori produk',
      'Laporan transaksi real-time di dashboard',
      'Dukungan teknis via grup komunitas'
    ],
    is_popular: false
  },
  {
    slug: 'pro',
    name: 'Professional Cloud',
    tier: 'rental',
    description: 'Node dedicated untuk toko akun aktif dengan volume transaksi tinggi dan branding kustom.',
    price_idr: 299000,
    billing_cycle: 'monthly',
    features: [
      'Kapasitas hingga 1.000 transaksi akun / hari',
      'Dedicated Cloud Worker 24/7 (Prioritas CPU)',
      'Custom Nama Bot, Foto Profil & Pesan Sambutan',
      'Unlimited Kategori & Stok Kredensial Terenkripsi',
      'Webhook Log Transaksi ke Channel Admin',
      'Ekspor laporan transaksi CSV / Audit log',
      'Prioritas bantuan teknis 24/7'
    ],
    is_popular: true
  },
  {
    slug: 'enterprise',
    name: 'Enterprise Cloud',
    tier: 'rental',
    description: 'Infrastruktur cluster terisolasi untuk distributor akun skala besar dan multi-bot.',
    price_idr: 999000,
    billing_cycle: 'monthly',
    features: [
      'Transaksi akun harian tanpa batas kuota',
      'Cluster VPS Terisolasi (SLA Uptime 99.9%)',
      'Manajemen Multi-Bot hingga 5 Token sekaligus',
      'Integrasi Custom Webhook & REST API',
      'Enkripsi kredensial AES-256-GCM dedicated',
      'Account Manager & Engineer khusus 1-on-1'
    ],
    is_popular: false
  },
  {
    slug: 'script',
    name: 'Full Source Code (Script Only)',
    tier: 'script',
    description: 'Miliki source code penuh Node.js, Express, Telegraf & skema SQL tanpa enkripsi untuk self-hosting.',
    price_idr: 300000,
    billing_cycle: 'one_time',
    features: [
      '100% Unencrypted Source Code (Node.js + Telegraf)',
      'Backend Express API & Supabase PostgreSQL Schema',
      'Modul Enkripsi Stok Akun AES-256-GCM',
      'Integrasi Midtrans Snap, QRIS & Verifikasi Manual',
      'Lisensi komersial penuh (Bebas modifikasi)',
      'Panduan deployment VPS Ubuntu / Docker'
    ],
    is_popular: false
  }
]

async function buildHeaders(requireAuth = true, hasBody = false) {
  const headers = {}
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (requireAuth) {
    const token = await getAccessToken()
    if (!token) {
      const err = new Error('Sesi login tidak ditemukan. Silakan masuk terlebih dahulu.')
      err.status = 401
      throw err
    }
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function apiRequest(path, { method = 'GET', body = undefined, requireAuth = true } = {}) {
  const headers = await buildHeaders(requireAuth, body !== undefined)
  const url = path.startsWith('http')
    ? path
    : path === '/health'
      ? '/health'
      : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null)
  } else {
    const text = await response.text().catch(() => '')
    payload = text ? { error: text } : null
  }

  if (!response.ok) {
    const err = new Error(payload?.error || `Permintaan gagal (${response.status})`)
    err.status = response.status
    err.payload = payload
    throw err
  }

  return payload
}

export function fileToDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onprogress = (evt) => {
      if (evt.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((evt.loaded / evt.total) * 70))
      }
    }
    reader.onload = () => {
      if (typeof onProgress === 'function') onProgress(85)
      resolve(String(reader.result || ''))
    }
    reader.onerror = () => reject(new Error('Gagal membaca file bukti pembayaran.'))
    reader.readAsDataURL(file)
  })
}

export function formatIdr(amount) {
  const num = Number(amount || 0)
  return `Rp ${num.toLocaleString('id-ID')}`
}

export function formatDateId(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// PUBLIC ENDPOINTS
export const fetchHealth = () => apiRequest('/health', { requireAuth: false })

export const fetchPlans = async () => {
  try {
    const res = await apiRequest('/plans', { requireAuth: false })
    if (Array.isArray(res?.plans) && res.plans.length > 0) {
      return { plans: res.plans, isFallback: false }
    }
    return { plans: FALLBACK_PLANS, isFallback: true }
  } catch (err) {
    return { plans: FALLBACK_PLANS, isFallback: true, error: err.message }
  }
}

// USER ORDER ENDPOINTS
export const createOrder = (planSlug, paymentMethod = 'qris', notes = '') =>
  apiRequest('/orders', {
    method: 'POST',
    body: {
      plan_slug: planSlug,
      payment_method: paymentMethod,
      ...(notes ? { notes } : {})
    }
  })

export const fetchMyOrders = () => apiRequest('/orders/mine')

export const fetchOrderById = (orderId) =>
  apiRequest(`/orders/${encodeURIComponent(orderId)}`)

export const uploadOrderProof = async (orderId, file, onProgress) => {
  if (!orderId) throw new Error('ID Pesanan wajib diisi.')
  if (!file) throw new Error('Pilih file bukti transfer terlebih dahulu.')

  const contentType = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  if (!ALLOWED_PROOF_MIMES.has(contentType)) {
    throw new Error('Format file ditolak. Gunakan JPG, PNG, atau WEBP.')
  }
  if (file.size > MAX_PROOF_SIZE_BYTES) {
    throw new Error('Ukuran file melebihi batas maksimal 5MB.')
  }

  const fileBase64 = await fileToDataUrl(file, onProgress)
  const result = await apiRequest(`/orders/${encodeURIComponent(orderId)}/proof`, {
    method: 'POST',
    body: {
      file_base64: fileBase64,
      file_name: file.name,
      content_type: contentType
    }
  })
  if (typeof onProgress === 'function') onProgress(100)
  return result
}

// USER DASHBOARD & OPERATIONAL ENDPOINTS
export const fetchDashboard = () => apiRequest('/dashboard')

export const fetchTransactions = () => apiRequest('/transactions')

export const fetchBots = () => apiRequest('/bots')

export const createBot = (botToken) =>
  apiRequest('/bots', {
    method: 'POST',
    body: { bot_token: botToken }
  })

export const startBot = (botId) =>
  apiRequest(`/bots/${encodeURIComponent(botId)}/start`, { method: 'POST' })

export const stopBot = (botId) =>
  apiRequest(`/bots/${encodeURIComponent(botId)}/stop`, { method: 'POST' })

export const fetchCategories = () => apiRequest('/categories')

export const fetchAccounts = () => apiRequest('/accounts')

export const createAccount = ({ category_id, title, price_idr, credentials }) =>
  apiRequest('/accounts', {
    method: 'POST',
    body: {
      category_id,
      title,
      price_idr: Number(price_idr),
      credentials
    }
  })

export const deleteAccount = (accountId) =>
  apiRequest(`/accounts/${encodeURIComponent(accountId)}`, { method: 'DELETE' })

export const fetchLicense = () => apiRequest('/license')

export const updateMyProfile = ({ full_name, business_name, phone }) =>
  apiRequest('/me', {
    method: 'PUT',
    body: { full_name, business_name, phone }
  })

// ADMIN ENDPOINTS
export const fetchAdminOrders = (status = 'pending_verification') => {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/admin/orders${q}`)
}

export const approveAdminOrder = (orderId) =>
  apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/approve`, {
    method: 'POST'
  })

export const rejectAdminOrder = (orderId, reason) =>
  apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/reject`, {
    method: 'POST',
    body: { reason }
  })

export default {
  API_BASE,
  fetchHealth,
  fetchPlans,
  createOrder,
  fetchMyOrders,
  fetchOrderById,
  uploadOrderProof,
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
  updateMyProfile,
  fetchAdminOrders,
  approveAdminOrder,
  rejectAdminOrder
}
