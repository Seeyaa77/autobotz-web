import { supabase } from './supabase'

const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '')

// Vite dev proxies '/api' -> http://localhost:5000; prod uses VITE_BACKEND_URL + '/api'
export const API_BASE = rawBackendUrl
  ? rawBackendUrl.endsWith('/api')
    ? rawBackendUrl
    : `${rawBackendUrl}/api`
  : '/api'

const ALLOWED_PROOF_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

async function getAuthHeaders() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error || !session?.access_token) {
    throw new Error('User not authenticated')
  }

  return {
    Authorization: `Bearer ${session.access_token}`
  }
}

async function apiRequest(path, { method = 'GET', body = undefined, requireAuth = true } = {}) {
  const authHeaders = requireAuth ? await getAuthHeaders() : {}
  const headers = {
    ...authHeaders,
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
  }

  const response = await fetch(`${API_BASE}${path}`, {
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
    throw new Error(payload?.error || `Request failed with status ${response.status}`)
  }

  return payload
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Gagal membaca file bukti pembayaran'))
    reader.readAsDataURL(file)
  })
}

export const getServerPlans = async (tier = null) => {
  const query = tier ? `?tier=${encodeURIComponent(tier)}` : ''
  return apiRequest(`/plans${query}`, { requireAuth: false })
}

export const createOrder = async (planIdOrSlug, paymentMethod = 'qris', notes = '') => {
  if (!planIdOrSlug) throw new Error('Plan slug or ID is required')
  const normalizedMethod = paymentMethod === 'bank_transfer' ? 'bank' : paymentMethod
  return apiRequest('/orders', {
    method: 'POST',
    body: {
      plan_slug: planIdOrSlug,
      payment_method: normalizedMethod,
      ...(notes ? { notes } : {})
    }
  })
}

export const createPayment = async (orderId, paymentMethod = 'midtrans', options = {}) => {
  if (!orderId) throw new Error('Order ID is required')
  const normalizedMethod = paymentMethod === 'bank_transfer' ? 'bank' : paymentMethod
  const callbackUrl =
    options?.callbackUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/payment?order=${orderId}` : undefined)

  return apiRequest('/payment/create', {
    method: 'POST',
    body: {
      order_id: orderId,
      payment_method: normalizedMethod,
      ...(callbackUrl ? { callback_url: callbackUrl } : {})
    }
  })
}

export const checkPaymentStatus = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required')
  return apiRequest(`/payment/status/${encodeURIComponent(orderId)}`)
}

export const getUserOrders = async () => {
  return apiRequest('/orders/mine')
}

export const getOrderById = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required')
  return apiRequest(`/orders/${encodeURIComponent(orderId)}`)
}

export const uploadPaymentProof = async (orderId, file) => {
  if (!orderId) throw new Error('Order ID is required')
  if (!file) throw new Error('File bukti pembayaran wajib dipilih')

  const contentType = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  if (!ALLOWED_PROOF_MIMES.has(contentType)) {
    throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.')
  }
  if (file.size > MAX_PROOF_SIZE_BYTES) {
    throw new Error('Ukuran file maksimal 5MB.')
  }

  const fileBase64 = await readFileAsDataUrl(file)

  return apiRequest(`/orders/${encodeURIComponent(orderId)}/proof`, {
    method: 'POST',
    body: {
      file_base64: fileBase64,
      file_name: file.name,
      content_type: contentType
    }
  })
}

export const getAdminPendingOrders = async (status = 'pending_verification') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/admin/orders${query}`)
}

export const approveOrder = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required')
  return apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/approve`, {
    method: 'POST'
  })
}

export const rejectOrder = async (orderId, reason = '') => {
  if (!orderId) throw new Error('Order ID is required')
  return apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/reject`, {
    method: 'POST',
    body: { reason }
  })
}
