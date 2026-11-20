import express from 'express'
import {
  FRONTEND_URL,
  STORAGE_BUCKET,
  MIDTRANS_CLIENT_KEY,
  supabaseAdmin,
  midtransSnap,
  getAllowedOrigins,
  isMidtransConfigured,
  getManualPaymentInstructions
} from '../config.js'
import { createRateLimiter } from '../middleware/auth.js'
import {
  ALLOWED_PAYMENT_METHODS,
  isValidUuid,
  normalizePaymentMethod,
  resolvePlan,
  ensureProfileExists,
  decodeAndValidateProofUpload,
  activateOrderEntitlements,
  formatOrder
} from '../services/orders.js'

const router = express.Router()
const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 25, keyPrefix: 'orders-write' })
const proofUploadLimiter = createRateLimiter({ windowMs: 60_000, max: 10, keyPrefix: 'proof-upload' })
const allowedOrigins = getAllowedOrigins()

async function createMidtransSnapForOrder(order, user, profile, callbackUrl) {
  let finishUrl = `${FRONTEND_URL}/payment?order=${order.id}`
  if (typeof callbackUrl === 'string' && callbackUrl.trim()) {
    try {
      const parsed = new URL(callbackUrl.trim())
      const origin = parsed.origin.replace(/\/+$/, '')
      if (allowedOrigins.includes(origin)) {
        finishUrl = parsed.toString()
      }
    } catch {
      // ignore invalid callback URL
    }
  }

  const snapPayload = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.amount_idr
    },
    item_details: [
      {
        id: order.plans?.slug || order.plan_id,
        price: order.amount_idr,
        quantity: 1,
        name: (order.plans?.name || 'Autobotz Plan').slice(0, 50)
      }
    ],
    customer_details: {
      first_name: (profile?.full_name || profile?.business_name || user.email || 'Customer').slice(
        0,
        50
      ),
      email: user.email,
      phone: profile?.phone || ''
    },
    callbacks: {
      finish: finishUrl
    }
  }

  const snapTx = await midtransSnap.createTransaction(snapPayload)

  await supabaseAdmin
    .from('orders')
    .update({
      payment_method: 'midtrans',
      payment_reference: snapTx.token,
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id)

  return {
    snap_token: snapTx.token,
    redirect_url: snapTx.redirect_url,
    client_key: MIDTRANS_CLIENT_KEY || null
  }
}

async function handleProofUpload(req, res, orderId) {
  try {
    if (!isValidUuid(orderId)) {
      return res.status(400).json({ error: 'Valid UUID order id is required' })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) {
      console.error('[proof] Order lookup error:', orderError.message)
      return res.status(500).json({ error: 'Failed to load order' })
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: order does not belong to current user' })
    }
    if (order.payment_status === 'paid' || order.payment_status === 'refunded') {
      return res.status(409).json({
        error: `Cannot upload proof for order with status '${order.payment_status}'`
      })
    }

    const decoded = decodeAndValidateProofUpload(req.body || {})
    if (decoded.error) {
      return res.status(400).json({ error: decoded.error })
    }

    const storagePath = `${req.user.id}/${order.id}-${Date.now()}.${decoded.ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, decoded.buffer, {
        contentType: decoded.mimeType,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('[proof] Storage upload error:', uploadError.message)
      return res.status(500).json({ error: 'Failed to store payment proof' })
    }

    const canonicalRef = `storage://${STORAGE_BUCKET}/${storagePath}`
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_proof_url: canonicalRef,
        payment_status: 'pending_verification',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select('*, plans(*)')
      .single()

    if (updateError) {
      console.error('[proof] Order update error:', updateError.message)
      return res.status(500).json({ error: 'Proof uploaded, but failed to link to order' })
    }

    const formatted = await formatOrder(updatedOrder)
    return res.json({ order: formatted })
  } catch (err) {
    console.error('[proof] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to upload payment proof' })
  }
}

// POST /api/orders - Create order with authoritative server-side price from plans table
router.post('/orders', writeLimiter, async (req, res) => {
  try {
    const { plan_slug, plan_id, payment_method, notes, callback_url } = req.body || {}
    const planIdentifier = plan_slug || plan_id

    if (!planIdentifier || typeof planIdentifier !== 'string') {
      return res.status(400).json({ error: 'plan_slug is required' })
    }

    const normalizedMethod = normalizePaymentMethod(payment_method)
    if (!ALLOWED_PAYMENT_METHODS.has(normalizedMethod)) {
      return res.status(400).json({
        error: "Invalid payment_method. Allowed values: 'qris', 'bank', 'midtrans'"
      })
    }

    if (normalizedMethod === 'midtrans' && !isMidtransConfigured()) {
      return res.status(501).json({
        error: 'Midtrans payment gateway belum dikonfigurasi di server. Gunakan QRIS atau Transfer Bank.'
      })
    }

    const { plan, error: planError } = await resolvePlan(planIdentifier)
    if (planError) {
      console.error('[orders] Plan lookup error:', planError)
      return res.status(500).json({ error: 'Failed to validate selected plan' })
    }
    if (!plan) {
      return res.status(404).json({ error: 'Selected plan not found or inactive' })
    }

    const profile = await ensureProfileExists(req.user)
    const cleanNotes = typeof notes === 'string' ? notes.trim().slice(0, 500) : null

    const { data: createdOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: req.user.id,
        plan_id: plan.id,
        amount_idr: plan.price_idr,
        billing_cycle: plan.billing_cycle,
        payment_method: normalizedMethod,
        payment_status: 'pending',
        notes: cleanNotes
      })
      .select('*, plans(*)')
      .single()

    if (insertError) {
      console.error('[orders] Insert error:', insertError.message)
      return res.status(500).json({ error: 'Failed to create order' })
    }

    const instructions = getManualPaymentInstructions()
    let payment = undefined

    if (normalizedMethod === 'midtrans' && midtransSnap) {
      try {
        payment = await createMidtransSnapForOrder(createdOrder, req.user, profile, callback_url)
      } catch (midtransErr) {
        console.error('[orders] Midtrans Snap error:', midtransErr.message)
        await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'failed', notes: 'Midtrans Snap initialization failed' })
          .eq('id', createdOrder.id)
        return res.status(502).json({ error: 'Gagal membuat transaksi Midtrans Snap' })
      }
    }

    const formatted = await formatOrder(createdOrder)
    return res.status(201).json({
      order: formatted,
      ...(payment ? { payment } : {}),
      instructions
    })
  } catch (err) {
    console.error('[orders] Create unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders/mine - Current user's orders (registered BEFORE /orders/:id)
router.get('/orders/mine', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[orders] List mine error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch orders' })
    }

    const orders = await Promise.all((data || []).map(formatOrder))
    return res.json({ orders })
  } catch (err) {
    console.error('[orders] List mine unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/orders/:id - Single order (owner or admin only)
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid order id format' })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[orders] Get by id error:', error.message)
      return res.status(500).json({ error: 'Failed to load order' })
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.user_id !== req.user.id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: cannot access another user order' })
      }
    }

    const formatted = await formatOrder(order)
    return res.json({ order: formatted })
  } catch (err) {
    console.error('[orders] Get by id unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load order' })
  }
})

// POST /api/orders/:id/proof - Upload payment proof for an order
router.post('/orders/:id/proof', proofUploadLimiter, (req, res) => {
  return handleProofUpload(req, res, req.params.id)
})

// Backward-compatible legacy alias: POST /api/upload/payment-proof
router.post('/upload/payment-proof', proofUploadLimiter, (req, res) => {
  return handleProofUpload(req, res, req.body?.order_id)
})

// Backward-compatible: POST /api/payment/create
router.post('/payment/create', writeLimiter, async (req, res) => {
  try {
    const { order_id, payment_method, callback_url } = req.body || {}
    if (!isValidUuid(order_id)) {
      return res.status(400).json({ error: 'Valid UUID order_id is required' })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', order_id)
      .maybeSingle()

    if (orderError) return res.status(500).json({ error: 'Failed to load order' })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: order does not belong to current user' })
    }
    if (order.payment_status === 'paid') {
      return res.status(409).json({ error: 'Order is already paid' })
    }

    const method = payment_method
      ? normalizePaymentMethod(payment_method)
      : normalizePaymentMethod(order.payment_method)

    if (!ALLOWED_PAYMENT_METHODS.has(method)) {
      return res.status(400).json({
        error: "Invalid payment_method. Allowed values: 'qris', 'bank', 'midtrans'"
      })
    }

    if (method === 'midtrans') {
      if (!isMidtransConfigured() || !midtransSnap) {
        return res.status(501).json({
          error: 'Midtrans payment gateway belum dikonfigurasi di server. Gunakan QRIS atau Transfer Bank.'
        })
      }

      const profile = await ensureProfileExists(req.user)
      const payment = await createMidtransSnapForOrder(order, req.user, profile, callback_url)
      const formatted = await formatOrder(order)
      return res.json({
        order: formatted,
        payment,
        token: payment.snap_token,
        redirect_url: payment.redirect_url,
        instructions: getManualPaymentInstructions()
      })
    }

    if (order.payment_method !== method) {
      await supabaseAdmin
        .from('orders')
        .update({ payment_method: method, updated_at: new Date().toISOString() })
        .eq('id', order.id)
      order.payment_method = method
    }

    const formatted = await formatOrder(order)
    return res.json({
      order: formatted,
      instructions: getManualPaymentInstructions()
    })
  } catch (err) {
    console.error('[payment] Create error:', err.message)
    return res.status(500).json({ error: 'Failed to initialize payment' })
  }
})

// Backward-compatible: GET /api/payment/status/:orderId
router.get('/payment/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    if (!isValidUuid(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId format' })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', orderId)
      .maybeSingle()

    if (error) return res.status(500).json({ error: 'Failed to check payment status' })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (order.user_id !== req.user.id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: cannot inspect another user order' })
      }
    }

    let currentOrder = order

    if (
      currentOrder.payment_method === 'midtrans' &&
      currentOrder.payment_status === 'pending' &&
      isMidtransConfigured() &&
      midtransSnap
    ) {
      try {
        const statusRes = await midtransSnap.transaction.status(currentOrder.id)
        const txStatus = statusRes?.transaction_status
        const fraudStatus = statusRes?.fraud_status

        if (txStatus === 'settlement' || (txStatus === 'capture' && fraudStatus === 'accept')) {
          currentOrder = await activateOrderEntitlements(currentOrder, {
            paymentReference: statusRes?.transaction_id || currentOrder.payment_reference
          })
        } else if (txStatus === 'expire' || ['deny', 'cancel', 'failure'].includes(txStatus)) {
          const mapped = txStatus === 'expire' ? 'expired' : 'failed'
          const { data: updated } = await supabaseAdmin
            .from('orders')
            .update({ payment_status: mapped, updated_at: new Date().toISOString() })
            .eq('id', currentOrder.id)
            .select('*, plans(*)')
            .single()
          if (updated) currentOrder = updated
        }
      } catch {
        // Midtrans returns 404 before customer picks a payment channel
      }
    }

    const formatted = await formatOrder(currentOrder)
    return res.json({
      order: formatted,
      payment_status: formatted.payment_status
    })
  } catch (err) {
    console.error('[payment] Status error:', err.message)
    return res.status(500).json({ error: 'Failed to check payment status' })
  }
})

export default router
