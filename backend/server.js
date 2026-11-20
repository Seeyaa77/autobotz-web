import express from 'express'
import cors from 'cors'
import {
  PORT,
  NODE_ENV,
  getAllowedOrigins,
  isSupabaseConfigured,
  isMidtransConfigured
} from './config.js'
import { requireSupabase, requireAuth, createRateLimiter } from './middleware/auth.js'
import publicRouter from './routes/public.js'
import ordersRouter from './routes/orders.js'
import dashboardRouter from './routes/dashboard.js'
import adminRouter from './routes/admin.js'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  return next()
})

// Restricted CORS via ALLOWED_ORIGINS / FRONTEND_URL
const allowedOrigins = getAllowedOrigins()
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    const normalized = origin.replace(/\/+$/, '')
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true)
    }
    const err = new Error('Origin not allowed by CORS policy')
    err.status = 403
    return callback(err)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ extended: true, limit: '8mb' }))

const apiRateLimiter = createRateLimiter({ windowMs: 60_000, max: 100, keyPrefix: 'api' })

// ============================================================
// PUBLIC HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'autobotz-backend',
    version: '2.0.0',
    env: NODE_ENV,
    supabase_configured: isSupabaseConfigured(),
    midtrans_configured: isMidtransConfigured(),
    timestamp: new Date().toISOString()
  })
})

// ============================================================
// API ROUTES (/api)
// ============================================================
app.use('/api', apiRateLimiter)

// Public API routes (GET /api/plans, POST /api/payment/webhook)
app.use('/api', publicRouter)

// Authenticated API routes (Supabase JWT Bearer required)
const authApiRouter = express.Router()
authApiRouter.use(requireSupabase)
authApiRouter.use(requireAuth)
authApiRouter.use(ordersRouter)
authApiRouter.use(dashboardRouter)
authApiRouter.use('/admin', adminRouter)

app.use('/api', authApiRouter)

// 404 handler (Express 5 safe)
app.use((req, res) => {
  return res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Global error handler — consistent JSON { error }
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload is too large (max 8MB)' })
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request body' })
  }
  if (err?.status === 403) {
    return res.status(403).json({ error: err.message || 'Forbidden' })
  }

  console.error('[server] Unhandled error:', err?.message || err)
  const status = Number(err?.status) || 500
  return res.status(status).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err?.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`Autobotz backend server running on http://localhost:${PORT}`)
  console.log(
    `Config: supabase=${isSupabaseConfigured() ? 'ready' : 'missing'}, midtrans=${
      isMidtransConfigured() ? 'enabled' : 'manual-only'
    }, origins=[${allowedOrigins.join(', ')}]`
  )
})
