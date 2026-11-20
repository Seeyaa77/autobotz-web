import express from 'express'
import { supabaseAdmin, isMidtransConfigured } from '../config.js'
import { requireSupabase } from '../middleware/auth.js'
import { isValidUuid, activateOrderEntitlements } from '../services/orders.js'
import { verifyMidtransSignature } from '../utils/crypto.js'

const router = express.Router()

// GET /api/plans - Public active plans catalog
router.get('/plans', requireSupabase, async (req, res) => {
  try {
    const tier = typeof req.query.tier === 'string' ? req.query.tier.trim().toLowerCase() : null
    if (tier && !['script', 'hosting', 'rental'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier filter. Must be script, hosting, or rental.' })
    }

    let query = supabaseAdmin
      .from('plans')
      .select('slug, name, tier, description, price_idr, billing_cycle, features, limits, is_popular, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (tier) {
      query = query.eq('tier', tier)
    }

    const { data, error } = await query
    if (error) {
      console.error('[plans] Query error:', error.message)
      return res.status(500).json({ error: 'Failed to load plans' })
    }

    const plans = (data || []).map((p) => ({
      slug: p.slug,
      name: p.name,
      tier: p.tier,
      description: p.description || '',
      price_idr: p.price_idr,
      billing_cycle: p.billing_cycle,
      features: Array.isArray(p.features) ? p.features : [],
      is_popular: Boolean(p.is_popular)
    }))

    return res.json({ plans })
  } catch (err) {
    console.error('[plans] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load plans' })
  }
})

// POST /api/payment/webhook - Midtrans server-to-server notification (verified by SHA-512 signature)
router.post('/payment/webhook', requireSupabase, async (req, res) => {
  try {
    if (!isMidtransConfigured()) {
      return res.status(501).json({ error: 'Midtrans integration is not configured' })
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id
    } = req.body || {}

    if (!verifyMidtransSignature({ order_id, status_code, gross_amount, signature_key })) {
      return res.status(401).json({ error: 'Invalid Midtrans webhook signature' })
    }

    if (!isValidUuid(order_id)) {
      return res.status(400).json({ error: 'Invalid order_id in webhook payload' })
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', order_id)
      .maybeSingle()

    if (fetchError) {
      console.error('[webhook] Order lookup error:', fetchError.message)
      return res.status(500).json({ error: 'Failed to fetch order' })
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const webhookAmount = Math.round(Number(gross_amount))
    if (!Number.isFinite(webhookAmount) || webhookAmount !== order.amount_idr) {
      return res.status(400).json({ error: 'Gross amount mismatch' })
    }

    if (order.payment_status === 'paid' && ['settlement', 'capture'].includes(transaction_status)) {
      return res.json({ success: true, status: 'already_paid' })
    }

    if (
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept')
    ) {
      await activateOrderEntitlements(order, {
        paymentReference: transaction_id || order.payment_reference
      })
      return res.json({ success: true, status: 'paid' })
    }

    let nextStatus = null
    if (transaction_status === 'pending') nextStatus = 'pending'
    else if (transaction_status === 'expire') nextStatus = 'expired'
    else if (['deny', 'cancel', 'failure'].includes(transaction_status)) nextStatus = 'failed'
    else if (['refund', 'partial_refund'].includes(transaction_status)) nextStatus = 'refunded'

    if (nextStatus) {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: nextStatus,
          payment_reference: transaction_id || order.payment_reference,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
    }

    return res.json({ success: true, status: nextStatus || order.payment_status })
  } catch (err) {
    console.error('[webhook] Processing error:', err.message)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
