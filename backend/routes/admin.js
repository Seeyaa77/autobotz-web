import express from 'express'
import { supabaseAdmin } from '../config.js'
import { requireAdmin, createRateLimiter } from '../middleware/auth.js'
import {
  isValidUuid,
  activateOrderEntitlements,
  rejectOrderRecord,
  formatOrder,
  formatAdminOrder
} from '../services/orders.js'

const router = express.Router()
router.use(requireAdmin)

const adminActionLimiter = createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: 'admin-write' })

const VALID_ORDER_STATUSES = new Set([
  'pending',
  'pending_verification',
  'paid',
  'failed',
  'refunded',
  'expired',
  'all'
])

async function listAdminOrders(req, res) {
  try {
    const statusParam =
      typeof req.query.status === 'string' && req.query.status.trim()
        ? req.query.status.trim().toLowerCase()
        : 'pending_verification'

    if (!VALID_ORDER_STATUSES.has(statusParam)) {
      return res.status(400).json({ error: 'Invalid status filter' })
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        plans (id, slug, tier, name, price_idr, billing_cycle),
        profiles:user_id (id, email, full_name, business_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusParam !== 'all') {
      query = query.eq('payment_status', statusParam)
    }

    const { data, error } = await query
    if (error) {
      console.error('[admin] Fetch orders error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch orders' })
    }

    const orders = await Promise.all((data || []).map(formatAdminOrder))
    return res.json({ orders })
  } catch (err) {
    console.error('[admin] List orders unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

router.get('/orders', listAdminOrders)
router.get('/orders/pending', listAdminOrders)

router.post('/orders/:id/approve', adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid order id format' })
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('[admin] Order fetch error:', fetchError.message)
      return res.status(500).json({ error: 'Failed to load order' })
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (order.payment_status === 'paid') {
      return res.status(409).json({ error: 'Order is already paid' })
    }
    if (order.payment_status === 'refunded') {
      return res.status(400).json({ error: 'Cannot approve a refunded order' })
    }

    const updated = await activateOrderEntitlements(order, { verifiedBy: req.user.id })
    const formatted = await formatOrder(updated)
    return res.json({ order: formatted })
  } catch (err) {
    console.error('[admin] Approve error:', err.message)
    return res.status(500).json({ error: 'Failed to approve order' })
  }
})

router.post('/orders/:id/reject', adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid order id format' })
    }

    const { reason } = req.body || {}
    if (reason !== undefined && typeof reason !== 'string') {
      return res.status(400).json({ error: 'reason must be a string' })
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('[admin] Order fetch error:', fetchError.message)
      return res.status(500).json({ error: 'Failed to load order' })
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (order.payment_status === 'paid') {
      return res.status(409).json({ error: 'Cannot reject an already paid order' })
    }

    const updated = await rejectOrderRecord(order, {
      verifiedBy: req.user.id,
      reason: reason || ''
    })
    const formatted = await formatOrder(updated)
    return res.json({ order: formatted })
  } catch (err) {
    console.error('[admin] Reject error:', err.message)
    return res.status(500).json({ error: 'Failed to reject order' })
  }
})

export default router
