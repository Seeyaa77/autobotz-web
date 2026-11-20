import { supabaseAdmin } from '../config.js'

export function requireSupabase(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: 'Backend database is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    })
  }
  return next()
}

export async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: 'Authentication service is not configured.'
    })
  }

  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization Bearer token' })
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    return res.status(401).json({ error: 'Empty Authorization Bearer token' })
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' })
    }

    req.user = data.user
    req.accessToken = token
    return next()
  } catch (err) {
    console.error('[auth] JWT verification error:', err.message)
    return res.status(401).json({ error: 'Authentication verification failed' })
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', req.user.id)
      .maybeSingle()

    if (error) {
      console.error('[auth] Profile lookup failed:', error.message)
      return res.status(500).json({ error: 'Failed to verify admin privileges' })
    }

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' })
    }

    req.adminProfile = profile
    return next()
  } catch (err) {
    console.error('[auth] Admin check error:', err.message)
    return res.status(500).json({ error: 'Failed to verify admin privileges' })
  }
}

export function createRateLimiter({ windowMs = 60_000, max = 120, keyPrefix = 'api' } = {}) {
  const hits = new Map()

  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }, windowMs)
  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref()
  }

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    const key = `${keyPrefix}:${ip}`
    const now = Date.now()
    let entry = hits.get(key)

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs }
      hits.set(key, entry)
    } else {
      entry.count += 1
    }

    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
      res.setHeader('Retry-After', String(retryAfterSec))
      return res.status(429).json({
        error: 'Too many requests. Please try again shortly.'
      })
    }

    return next()
  }
}
