import express from 'express'
import {
  supabaseAdmin,
  SCRIPT_LATEST_VERSION,
  SCRIPT_DOWNLOAD_BUCKET,
  SCRIPT_DOWNLOAD_PATH,
  SCRIPT_DOWNLOAD_URL,
  PROOF_SIGNED_URL_TTL_SECONDS,
  isConfiguredValue
} from '../config.js'
import { createRateLimiter } from '../middleware/auth.js'
import { isValidUuid, ensureProfileExists } from '../services/orders.js'
import {
  isBotEncryptionConfigured,
  isAccountEncryptionConfigured,
  encryptBotToken,
  encryptAccountCredentials,
  generateLicenseKey
} from '../utils/crypto.js'

const router = express.Router()
const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: 'dashboard-write' })

const TELEGRAM_TOKEN_REGEX = /^\d{6,15}:[A-Za-z0-9_-]{20,}$/

function projectBot(bot) {
  return {
    id: bot.id,
    bot_name: bot.bot_name,
    bot_username: bot.bot_username,
    status: bot.status,
    created_at: bot.created_at,
    last_heartbeat: bot.last_heartbeat || null
  }
}

function projectTransaction(tx) {
  return {
    id: tx.id,
    buyer_username: tx.buyer_username || null,
    account_title: tx.accounts?.title || null,
    gross_amount_idr: tx.gross_amount_idr,
    net_amount_idr: tx.net_amount_idr,
    payment_gateway: tx.payment_gateway || null,
    payment_status: tx.payment_status,
    created_at: tx.created_at
  }
}

function projectAccount(acc) {
  return {
    id: acc.id,
    title: acc.title,
    category_id: acc.category_id,
    category_name: acc.account_categories?.name || null,
    price_idr: acc.price_idr,
    status: acc.status,
    created_at: acc.created_at
  }
}

async function verifyTelegramBotToken(token) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'GET',
      signal: controller.signal
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.ok || !payload?.result?.is_bot) {
      return { valid: false, error: 'Token bot Telegram tidak valid atau ditolak Telegram API' }
    }

    return {
      valid: true,
      botInfo: {
        id: payload.result.id,
        first_name: payload.result.first_name || 'Autobotz Bot',
        username: payload.result.username || null
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { valid: false, error: 'Timeout saat memverifikasi token ke Telegram API' }
    }
    return { valid: false, error: 'Gagal terhubung ke Telegram API untuk verifikasi token' }
  } finally {
    clearTimeout(timeout)
  }
}

// GET /api/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id

    const [accountsRes, txAllRes, recentTxRes, botsRes] = await Promise.all([
      supabaseAdmin
        .from('accounts')
        .select('status, price_idr')
        .eq('user_id', userId),
      supabaseAdmin
        .from('transactions')
        .select('payment_status, settlement_status, net_amount_idr, gross_amount_idr')
        .eq('user_id', userId),
      supabaseAdmin
        .from('transactions')
        .select(
          'id, buyer_username, gross_amount_idr, net_amount_idr, payment_gateway, payment_status, created_at, accounts(title)'
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('bot_instances')
        .select('id, bot_name, bot_username, status, created_at, last_heartbeat')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ])

    if (accountsRes.error || txAllRes.error || recentTxRes.error || botsRes.error) {
      const firstErr =
        accountsRes.error || txAllRes.error || recentTxRes.error || botsRes.error
      console.error('[dashboard] Query error:', firstErr.message)
      return res.status(500).json({ error: 'Failed to load dashboard data' })
    }

    let activeListings = 0
    let totalSold = 0
    let soldAccountsRevenue = 0
    for (const acc of accountsRes.data || []) {
      if (acc.status === 'listed') activeListings += 1
      if (acc.status === 'sold' || acc.status === 'delivered') {
        totalSold += 1
        soldAccountsRevenue += Number(acc.price_idr || 0)
      }
    }

    let completedTransactions = 0
    let txRevenue = 0
    let pendingPayout = 0
    for (const tx of txAllRes.data || []) {
      if (tx.payment_status === 'paid') {
        completedTransactions += 1
        txRevenue += Number(tx.net_amount_idr || tx.gross_amount_idr || 0)
        if (tx.settlement_status === 'pending') {
          pendingPayout += Number(tx.net_amount_idr || 0)
        }
      }
    }

    const totalRevenue = txRevenue > 0 ? txRevenue : soldAccountsRevenue

    return res.json({
      summary: {
        total_revenue: totalRevenue,
        total_sold: totalSold,
        active_listings: activeListings,
        completed_transactions: completedTransactions,
        pending_payout: pendingPayout
      },
      bots: (botsRes.data || []).map(projectBot),
      recent_transactions: (recentTxRes.data || []).map(projectTransaction)
    })
  } catch (err) {
    console.error('[dashboard] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load dashboard data' })
  }
})

// GET /api/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(
        'id, buyer_username, gross_amount_idr, net_amount_idr, payment_gateway, payment_status, created_at, accounts(title)'
      )
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[transactions] Query error:', error.message)
      return res.status(500).json({ error: 'Failed to load transactions' })
    }

    return res.json({
      transactions: (data || []).map(projectTransaction)
    })
  } catch (err) {
    console.error('[transactions] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load transactions' })
  }
})

// GET /api/bots
router.get('/bots', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bot_instances')
      .select('id, bot_name, bot_username, status, created_at, last_heartbeat')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[bots] List error:', error.message)
      return res.status(500).json({ error: 'Failed to load bots' })
    }

    return res.json({ bots: (data || []).map(projectBot) })
  } catch (err) {
    console.error('[bots] List unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load bots' })
  }
})

// POST /api/bots
router.post('/bots', writeLimiter, async (req, res) => {
  try {
    const { bot_token } = req.body || {}

    if (typeof bot_token !== 'string' || !TELEGRAM_TOKEN_REGEX.test(bot_token.trim())) {
      return res.status(400).json({
        error: 'Format bot_token Telegram tidak valid (contoh: 123456789:AAH...)'
      })
    }

    if (!isBotEncryptionConfigured()) {
      return res.status(503).json({
        error: 'BOT_TOKEN_ENC_KEY belum dikonfigurasi di server'
      })
    }

    const { data: paidOrders, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .select('id, plan_id, paid_at, current_period_end, plans!inner(id, slug, tier, limits)')
      .eq('user_id', req.user.id)
      .eq('payment_status', 'paid')
      .in('plans.tier', ['rental', 'hosting'])
      .order('paid_at', { ascending: false })

    if (ordersErr) {
      console.error('[bots] Entitlement lookup error:', ordersErr.message)
      return res.status(500).json({ error: 'Failed to verify active rental subscription' })
    }

    const nowMs = Date.now()
    const activeOrder = (paidOrders || []).find(
      (o) => !o.current_period_end || new Date(o.current_period_end).getTime() > nowMs
    )

    if (!activeOrder) {
      return res.status(403).json({ error: 'Butuh paket sewa aktif' })
    }

    const maxBots = Number(activeOrder.plans?.limits?.bots ?? 1)
    if (Number.isFinite(maxBots) && maxBots > 0) {
      const { count, error: countErr } = await supabaseAdmin
        .from('bot_instances')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', req.user.id)

      if (!countErr && typeof count === 'number' && count >= maxBots) {
        return res.status(409).json({
          error: `Batas maksimum bot untuk paket Anda (${maxBots} bot) sudah tercapai`
        })
      }
    }

    const cleanToken = bot_token.trim()
    const tgCheck = await verifyTelegramBotToken(cleanToken)
    if (!tgCheck.valid) {
      return res.status(400).json({ error: tgCheck.error })
    }

    const encryptedToken = encryptBotToken(cleanToken)
    const deploymentType =
      activeOrder.plans?.tier === 'hosting' ? 'vps_container' : 'saas_shared'
    const maxAccountsPerDay =
      typeof activeOrder.plans?.limits?.accounts_per_day === 'number'
        ? activeOrder.plans.limits.accounts_per_day
        : 100

    const { data: createdBot, error: insertErr } = await supabaseAdmin
      .from('bot_instances')
      .insert({
        user_id: req.user.id,
        order_id: activeOrder.id,
        plan_id: activeOrder.plan_id,
        bot_name: tgCheck.botInfo.first_name,
        bot_username: tgCheck.botInfo.username,
        bot_token_encrypted: encryptedToken,
        deployment_type: deploymentType,
        status: 'stopped',
        max_accounts_per_day: maxAccountsPerDay
      })
      .select('id, bot_name, bot_username, status, created_at, last_heartbeat')
      .single()

    if (insertErr) {
      if (insertErr.code === '23505') {
        return res.status(409).json({ error: 'Bot Telegram dengan username ini sudah terdaftar' })
      }
      console.error('[bots] Insert error:', insertErr.message)
      return res.status(500).json({ error: 'Failed to register bot' })
    }

    return res.status(201).json({ bot: projectBot(createdBot) })
  } catch (err) {
    console.error('[bots] Create unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to create bot' })
  }
})

// POST /api/bots/:id/start
router.post('/bots/:id/start', writeLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid bot id format' })
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('bot_instances')
      .select('id, user_id, status, deployed_at')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (fetchErr) return res.status(500).json({ error: 'Failed to load bot' })
    if (!existing) return res.status(404).json({ error: 'Bot not found' })
    if (existing.status === 'suspended') {
      return res.status(403).json({ error: 'Bot sedang ditangguhkan oleh admin' })
    }

    const nowIso = new Date().toISOString()
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('bot_instances')
      .update({
        status: 'running',
        deployed_at: existing.deployed_at || nowIso,
        last_heartbeat: nowIso,
        updated_at: nowIso
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id, bot_name, bot_username, status, created_at, last_heartbeat')
      .single()

    if (updateErr) return res.status(500).json({ error: 'Failed to start bot' })
    return res.json({ bot: projectBot(updated) })
  } catch (err) {
    console.error('[bots] Start error:', err.message)
    return res.status(500).json({ error: 'Failed to start bot' })
  }
})

// POST /api/bots/:id/stop
router.post('/bots/:id/stop', writeLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid bot id format' })
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('bot_instances')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (fetchErr) return res.status(500).json({ error: 'Failed to load bot' })
    if (!existing) return res.status(404).json({ error: 'Bot not found' })

    const nowIso = new Date().toISOString()
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('bot_instances')
      .update({
        status: 'stopped',
        updated_at: nowIso
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id, bot_name, bot_username, status, created_at, last_heartbeat')
      .single()

    if (updateErr) return res.status(500).json({ error: 'Failed to stop bot' })
    return res.json({ bot: projectBot(updated) })
  } catch (err) {
    console.error('[bots] Stop error:', err.message)
    return res.status(500).json({ error: 'Failed to stop bot' })
  }
})

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('account_categories')
      .select('id, name, slug, icon')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[categories] Query error:', error.message)
      return res.status(500).json({ error: 'Failed to load categories' })
    }

    return res.json({ categories: data || [] })
  } catch (err) {
    console.error('[categories] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load categories' })
  }
})

// GET /api/accounts
router.get('/accounts', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select('id, title, category_id, price_idr, status, created_at, account_categories(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[accounts] List error:', error.message)
      return res.status(500).json({ error: 'Failed to load accounts' })
    }

    return res.json({
      accounts: (data || []).map(projectAccount)
    })
  } catch (err) {
    console.error('[accounts] List unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to load accounts' })
  }
})

// POST /api/accounts
router.post('/accounts', writeLimiter, async (req, res) => {
  try {
    const { category_id, title, price_idr, credentials } = req.body || {}

    if (!isValidUuid(category_id)) {
      return res.status(400).json({ error: 'Valid UUID category_id is required' })
    }
    if (typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 200) {
      return res.status(400).json({ error: 'title must be between 2 and 200 characters' })
    }

    const numericPrice = Number(price_idr)
    if (!Number.isInteger(numericPrice) || numericPrice < 1000 || numericPrice > 1_000_000_000) {
      return res.status(400).json({
        error: 'price_idr must be an integer between 1000 and 1000000000'
      })
    }

    if (typeof credentials !== 'string' || !credentials.trim() || credentials.length > 4000) {
      return res.status(400).json({
        error: 'credentials is required and must be under 4000 characters'
      })
    }

    if (!isAccountEncryptionConfigured()) {
      return res.status(503).json({
        error: 'Encryption key (BOT_TOKEN_ENC_KEY / ACCOUNT_CRED_ENC_KEY) belum dikonfigurasi di server'
      })
    }

    const { data: category, error: catErr } = await supabaseAdmin
      .from('account_categories')
      .select('id, name')
      .eq('id', category_id)
      .eq('is_active', true)
      .maybeSingle()

    if (catErr) return res.status(500).json({ error: 'Failed to validate category' })
    if (!category) return res.status(404).json({ error: 'Category not found or inactive' })

    await ensureProfileExists(req.user)

    const encryptedCredentials = encryptAccountCredentials(credentials.trim())
    const nowIso = new Date().toISOString()

    const { data: created, error: insertErr } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: req.user.id,
        category_id: category.id,
        title: title.trim(),
        credentials_encrypted: encryptedCredentials,
        price_idr: numericPrice,
        status: 'listed',
        listed_at: nowIso
      })
      .select('id, title, category_id, price_idr, status, created_at, account_categories(name)')
      .single()

    if (insertErr) {
      console.error('[accounts] Insert error:', insertErr.message)
      return res.status(500).json({ error: 'Failed to create account listing' })
    }

    return res.status(201).json({ account: projectAccount(created) })
  } catch (err) {
    console.error('[accounts] Create unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to create account listing' })
  }
})

// DELETE /api/accounts/:id
router.delete('/accounts/:id', writeLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Invalid account id format' })
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (fetchErr) return res.status(500).json({ error: 'Failed to load account' })
    if (!existing) return res.status(404).json({ error: 'Account not found' })

    if (existing.status === 'sold' || existing.status === 'delivered') {
      return res.status(409).json({ error: 'Akun yang sudah terjual tidak dapat dihapus' })
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (deleteErr) {
      console.error('[accounts] Delete error:', deleteErr.message)
      return res.status(500).json({ error: 'Failed to delete account' })
    }

    return res.json({ success: true, id })
  } catch (err) {
    console.error('[accounts] Delete unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to delete account' })
  }
})

// GET /api/license
router.get('/license', async (req, res) => {
  try {
    const { data: scriptOrders, error } = await supabaseAdmin
      .from('orders')
      .select('id, paid_at, plans!inner(slug, tier)')
      .eq('user_id', req.user.id)
      .eq('payment_status', 'paid')
      .eq('plans.tier', 'script')
      .order('paid_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[license] Query error:', error.message)
      return res.status(500).json({ error: 'Failed to check script license' })
    }

    const paidScriptOrder = scriptOrders?.[0]
    if (!paidScriptOrder) {
      return res.json({ license: null })
    }

    let downloadUrl = null
    if (isConfiguredValue(SCRIPT_DOWNLOAD_BUCKET) && isConfiguredValue(SCRIPT_DOWNLOAD_PATH)) {
      const { data: signed } = await supabaseAdmin.storage
        .from(SCRIPT_DOWNLOAD_BUCKET)
        .createSignedUrl(SCRIPT_DOWNLOAD_PATH, PROOF_SIGNED_URL_TTL_SECONDS)
      if (signed?.signedUrl) {
        downloadUrl = signed.signedUrl
      }
    } else if (isConfiguredValue(SCRIPT_DOWNLOAD_URL)) {
      downloadUrl = SCRIPT_DOWNLOAD_URL
    }

    return res.json({
      license: {
        key: generateLicenseKey(paidScriptOrder.id, req.user.id),
        version: SCRIPT_LATEST_VERSION,
        download_url: downloadUrl
      }
    })
  } catch (err) {
    console.error('[license] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to check script license' })
  }
})

// PUT /api/me
router.put('/me', writeLimiter, async (req, res) => {
  try {
    const { full_name, business_name, phone } = req.body || {}

    const updates = {}
    if (full_name !== undefined) {
      if (full_name !== null && typeof full_name !== 'string') {
        return res.status(400).json({ error: 'full_name must be a string' })
      }
      updates.full_name = full_name ? full_name.trim().slice(0, 120) : null
    }
    if (business_name !== undefined) {
      if (business_name !== null && typeof business_name !== 'string') {
        return res.status(400).json({ error: 'business_name must be a string' })
      }
      updates.business_name = business_name ? business_name.trim().slice(0, 120) : null
    }
    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') {
        return res.status(400).json({ error: 'phone must be a string' })
      }
      const cleanPhone = phone ? phone.trim().slice(0, 30) : null
      if (cleanPhone && !/^[+0-9\s()-]{6,30}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Invalid phone number format' })
      }
      updates.phone = cleanPhone
    }

    await ensureProfileExists(req.user)

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, email, full_name, business_name, phone, role, tier, current_plan_id, subscription_status, updated_at')
      .single()

    if (error) {
      console.error('[profile] Update error:', error.message)
      return res.status(500).json({ error: 'Failed to update profile' })
    }

    return res.json({ profile })
  } catch (err) {
    console.error('[profile] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
