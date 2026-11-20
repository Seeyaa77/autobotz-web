import { supabaseAdmin, STORAGE_BUCKET, PROOF_SIGNED_URL_TTL_SECONDS } from '../config.js'

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const LEGACY_SLUG_FALLBACKS = {
  starter: 'hosting-starter',
  pro: 'hosting-pro',
  enterprise: 'hosting-enterprise',
  script: 'script-tier1'
}

export const ALLOWED_PAYMENT_METHODS = new Set(['midtrans', 'qris', 'bank'])

export const ALLOWED_PROOF_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

export const MAX_PROOF_BYTES = 5 * 1024 * 1024 // 5MB

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value.trim())
}

export function normalizePaymentMethod(method) {
  if (!method || typeof method !== 'string') return ''
  const cleaned = method.trim().toLowerCase()
  if (cleaned === 'bank_transfer' || cleaned === 'transfer' || cleaned === 'manual') {
    return 'bank'
  }
  return cleaned
}

export function formatIdr(amount) {
  const num = Number(amount || 0)
  return 'Rp ' + num.toLocaleString('id-ID')
}

export async function resolvePlan(planIdentifier) {
  if (typeof planIdentifier !== 'string' || !planIdentifier.trim()) {
    return { plan: null, error: 'plan_slug is required' }
  }

  const raw = planIdentifier.trim()

  if (isValidUuid(raw)) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', raw)
      .eq('is_active', true)
      .maybeSingle()

    if (error) return { plan: null, error: error.message }
    return { plan: data, error: null }
  }

  const normalizedSlug = raw.toLowerCase()
  const { data: exact, error: exactErr } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('slug', normalizedSlug)
    .eq('is_active', true)
    .maybeSingle()

  if (exactErr) return { plan: null, error: exactErr.message }
  if (exact) return { plan: exact, error: null }

  const fallbackSlug = LEGACY_SLUG_FALLBACKS[normalizedSlug]
  if (fallbackSlug) {
    const { data: legacy, error: legacyErr } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('slug', fallbackSlug)
      .eq('is_active', true)
      .maybeSingle()

    if (legacyErr) return { plan: null, error: legacyErr.message }
    if (legacy) return { plan: legacy, error: null }
  }

  return { plan: null, error: null }
}

export async function ensureProfileExists(user) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, business_name, phone, role, tier, current_plan_id, subscription_status')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`)
  }

  if (existing) return existing

  const { data: created, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email || `${user.id}@autobotz.local`,
      full_name: user.user_metadata?.full_name || null,
      business_name: user.user_metadata?.business_name || null,
      phone: user.user_metadata?.phone || null,
      role: 'user',
      tier: 'free'
    })
    .select('id, email, full_name, business_name, phone, role, tier, current_plan_id, subscription_status')
    .single()

  if (insertError) {
    throw new Error(`Failed to initialize user profile: ${insertError.message}`)
  }

  return created
}

export function extractStoragePath(proofUrlOrPath) {
  if (!proofUrlOrPath || typeof proofUrlOrPath !== 'string') return null
  const value = proofUrlOrPath.trim()
  if (!value) return null

  if (value.startsWith('storage://')) {
    const rest = value.slice('storage://'.length)
    const prefix = `${STORAGE_BUCKET}/`
    return rest.startsWith(prefix) ? rest.slice(prefix.length) : rest
  }

  const marker = '/storage/v1/object/'
  const idx = value.indexOf(marker)
  if (idx !== -1) {
    const after = value.slice(idx + marker.length).split('?')[0]
    const bucketToken = `${STORAGE_BUCKET}/`
    const bucketIdx = after.indexOf(bucketToken)
    if (bucketIdx !== -1) {
      return decodeURIComponent(after.slice(bucketIdx + bucketToken.length))
    }
  }

  if (!/^https?:\/\//i.test(value)) {
    return value.replace(/^\/+/, '')
  }

  return null
}

export async function resolveProofSignedUrl(
  proofUrlOrPath,
  expiresInSeconds = PROOF_SIGNED_URL_TTL_SECONDS
) {
  if (!proofUrlOrPath) return null
  const storagePath = extractStoragePath(proofUrlOrPath)
  if (!storagePath) return proofUrlOrPath

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds)

    if (!error && data?.signedUrl) {
      return data.signedUrl
    }
  } catch (err) {
    console.warn('[storage] Signed URL fallback:', err.message)
  }

  return null
}

export function detectImageMimeFromMagicBytes(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }

  return null
}

export function decodeAndValidateProofUpload({ base64, file_base64, content_type, mime_type }) {
  const rawInput = typeof file_base64 === 'string' ? file_base64 : base64
  if (!rawInput || typeof rawInput !== 'string') {
    return { error: 'file_base64 is required' }
  }

  let declaredMime =
    typeof content_type === 'string' && content_type.trim()
      ? content_type.trim().toLowerCase()
      : typeof mime_type === 'string'
        ? mime_type.trim().toLowerCase()
        : ''

  let pureBase64 = rawInput.trim()

  const dataUriMatch = pureBase64.match(/^data:([^;]+);base64,(.+)$/s)
  if (dataUriMatch) {
    if (!declaredMime) declaredMime = dataUriMatch[1].trim().toLowerCase()
    pureBase64 = dataUriMatch[2].trim()
  }

  if (declaredMime === 'image/jpg') {
    declaredMime = 'image/jpeg'
  }

  pureBase64 = pureBase64.replace(/\s+/g, '')
  if (!pureBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(pureBase64)) {
    return { error: 'Invalid base64 encoding' }
  }

  const estimatedBytes = Math.floor((pureBase64.length * 3) / 4)
  if (estimatedBytes > MAX_PROOF_BYTES + 4) {
    return { error: 'File size exceeds maximum limit of 5MB' }
  }

  const buffer = Buffer.from(pureBase64, 'base64')
  if (buffer.length === 0) {
    return { error: 'Uploaded file is empty' }
  }
  if (buffer.length > MAX_PROOF_BYTES) {
    return { error: 'File size exceeds maximum limit of 5MB' }
  }

  const detectedMime = detectImageMimeFromMagicBytes(buffer)
  if (!detectedMime || !ALLOWED_PROOF_MIME_TYPES[detectedMime]) {
    return {
      error: 'Unsupported file format. Only JPG, PNG, and WEBP images are allowed.'
    }
  }

  if (declaredMime && declaredMime !== detectedMime) {
    return {
      error: `File signature (${detectedMime}) does not match content_type (${declaredMime})`
    }
  }

  return {
    buffer,
    mimeType: detectedMime,
    ext: ALLOWED_PROOF_MIME_TYPES[detectedMime],
    size: buffer.length
  }
}

export function computePeriodEnd(billingCycle, startDate = new Date()) {
  const end = new Date(startDate.getTime())
  if (billingCycle === 'monthly') {
    end.setMonth(end.getMonth() + 1)
    return end.toISOString()
  }
  if (billingCycle === 'yearly') {
    end.setFullYear(end.getFullYear() + 1)
    return end.toISOString()
  }
  return null
}

async function updateOrderWithFallback(orderId, coreFields, optionalFields = {}) {
  const combined = { ...coreFields, ...optionalFields }
  const first = await supabaseAdmin
    .from('orders')
    .update(combined)
    .eq('id', orderId)
    .select('*, plans(*)')
    .single()

  if (!first.error) return first

  const msg = first.error.message || ''
  if (
    Object.keys(optionalFields).length > 0 &&
    (first.error.code === '42703' || first.error.code === 'PGRST204' || msg.includes('column'))
  ) {
    return supabaseAdmin
      .from('orders')
      .update(coreFields)
      .eq('id', orderId)
      .select('*, plans(*)')
      .single()
  }

  return first
}

export async function activateOrderEntitlements(
  order,
  { verifiedBy = null, paymentReference = null } = {}
) {
  const now = new Date()
  const nowIso = now.toISOString()

  let plan = order.plans
  if (!plan && order.plan_id) {
    const { data } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', order.plan_id)
      .maybeSingle()
    plan = data
  }

  const periodEnd = computePeriodEnd(order.billing_cycle || plan?.billing_cycle, now)

  const coreUpdate = {
    payment_status: 'paid',
    paid_at: nowIso,
    current_period_start: nowIso,
    current_period_end: periodEnd,
    updated_at: nowIso
  }

  if (paymentReference) {
    coreUpdate.payment_reference = paymentReference
  }

  const optionalAudit = verifiedBy ? { verified_by: verifiedBy, verified_at: nowIso } : {}

  const { data: updatedOrder, error: orderError } = await updateOrderWithFallback(
    order.id,
    coreUpdate,
    optionalAudit
  )

  if (orderError) {
    throw new Error(`Failed to update order status: ${orderError.message}`)
  }

  if (plan) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        tier: plan.tier,
        current_plan_id: plan.id,
        subscription_status: 'active',
        updated_at: nowIso
      })
      .eq('id', order.user_id)

    if (profileError) {
      console.error('[orders] Failed to activate user profile plan:', profileError.message)
    }
  }

  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: order.user_id,
      type: 'payment_approved',
      title: 'Pembayaran Berhasil Diverifikasi',
      message: `Pesanan paket ${plan?.name || 'Autobotz'} sebesar ${formatIdr(order.amount_idr)} telah aktif.`,
      data: { order_id: order.id, plan_id: order.plan_id, plan_slug: plan?.slug || null }
    })
  } catch (notifyErr) {
    console.warn('[orders] Notification insert warning:', notifyErr.message)
  }

  return updatedOrder
}

export async function rejectOrderRecord(order, { verifiedBy = null, reason = '' } = {}) {
  const nowIso = new Date().toISOString()
  const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : ''

  const coreUpdate = {
    payment_status: 'failed',
    notes: cleanReason || 'Bukti pembayaran ditolak oleh admin',
    updated_at: nowIso
  }

  const optionalAudit = {
    ...(verifiedBy ? { verified_by: verifiedBy, verified_at: nowIso } : {}),
    ...(cleanReason ? { rejection_reason: cleanReason } : {})
  }

  const { data: updatedOrder, error } = await updateOrderWithFallback(
    order.id,
    coreUpdate,
    optionalAudit
  )

  if (error) {
    throw new Error(`Failed to reject order: ${error.message}`)
  }

  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: order.user_id,
      type: 'payment_rejected',
      title: 'Pembayaran Ditolak',
      message: cleanReason
        ? `Pesanan ${order.id} ditolak: ${cleanReason}`
        : `Pesanan ${order.id} ditolak. Silakan periksa bukti transfer dan unggah ulang.`,
      data: { order_id: order.id, reason: cleanReason || null }
    })
  } catch (notifyErr) {
    console.warn('[orders] Notification insert warning:', notifyErr.message)
  }

  return updatedOrder
}

export async function formatOrder(order) {
  if (!order) return null
  const signedProofUrl = await resolveProofSignedUrl(
    order.payment_proof_url,
    PROOF_SIGNED_URL_TTL_SECONDS
  )

  return {
    id: order.id,
    plan_slug: order.plans?.slug || null,
    plan_name: order.plans?.name || null,
    amount_idr: order.amount_idr,
    billing_cycle: order.billing_cycle,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    payment_proof_url: signedProofUrl,
    created_at: order.created_at,
    paid_at: order.paid_at || null,
    notes: order.notes || null
  }
}

export async function formatAdminOrder(order) {
  if (!order) return null
  const signedProofUrl = await resolveProofSignedUrl(
    order.payment_proof_url,
    PROOF_SIGNED_URL_TTL_SECONDS
  )

  return {
    id: order.id,
    user_email: order.profiles?.email || null,
    plan_slug: order.plans?.slug || null,
    plan_name: order.plans?.name || null,
    amount_idr: order.amount_idr,
    billing_cycle: order.billing_cycle,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    proof_url: signedProofUrl,
    payment_proof_url: signedProofUrl,
    created_at: order.created_at,
    paid_at: order.paid_at || null,
    notes: order.notes || null
  }
}
