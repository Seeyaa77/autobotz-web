import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

// Helper untuk get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper untuk get session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper untuk get current JWT access token
export const getAccessToken = async () => {
  const session = await getSession()
  return session?.access_token || null
}

// Auth helpers
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  return { data, error }
}

// Profile helpers
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

const PROTECTED_PROFILE_FIELDS = new Set([
  'id',
  'email',
  'role',
  'tier',
  'current_plan_id',
  'subscription_status',
  'trial_ends_at',
  'created_at'
])

export const updateProfile = async (userId, updates = {}) => {
  const safeUpdates = {}
  for (const [key, value] of Object.entries(updates)) {
    if (!PROTECTED_PROFILE_FIELDS.has(key)) {
      safeUpdates[key] = value
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Plans helpers
export const getPlans = async (tier = null) => {
  let query = supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (tier) {
    query = query.eq('tier', tier)
  }

  const { data, error } = await query
  return { data, error }
}

export const getPlanBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return { data, error }
}

// Orders helpers
// Note: For production checkout, prefer POST /api/orders via src/lib/payment.js or src/api/client.js.
export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()
  return { data, error }
}

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      plans (
        id, slug, tier, name, price_idr, billing_cycle, features, limits, commission_percent
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Bot instances helpers (never select bot_token_encrypted)
export const getUserBots = async (userId) => {
  const { data, error } = await supabase
    .from('bot_instances')
    .select('id, user_id, order_id, plan_id, bot_name, bot_username, deployment_type, status, max_accounts_per_day, deployed_at, last_heartbeat, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getBotInstance = async (botId) => {
  const { data, error } = await supabase
    .from('bot_instances')
    .select('id, user_id, order_id, plan_id, bot_name, bot_username, deployment_type, status, max_accounts_per_day, deployed_at, last_heartbeat, created_at, updated_at')
    .eq('id', botId)
    .single()
  return { data, error }
}

// Accounts helpers (never select credentials_encrypted)
export const getUserAccounts = async (userId, status = null) => {
  let query = supabase
    .from('accounts')
    .select(`
      id, user_id, bot_instance_id, category_id, title, description, username, price_idr, status, delivery_type, sold_at, created_at, updated_at, listed_at,
      account_categories (id, name, slug, icon)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data, error }
}

export const createAccount = async (accountData) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert(accountData)
    .select('id, user_id, category_id, title, price_idr, status, created_at')
    .single()
  return { data, error }
}

export const updateAccount = async (accountId, updates) => {
  const { data, error } = await supabase
    .from('accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .select('id, user_id, category_id, title, price_idr, status, updated_at')
    .single()
  return { data, error }
}

export const deleteAccount = async (accountId) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
  return { error }
}

// Transactions helpers (Tier 3)
export const getUserTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      accounts (title, price_idr),
      bot_instances (bot_name, bot_username)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Analytics helpers
export const getUserAnalytics = async (userId, days = 30) => {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
  return { data, error }
}

// Notifications helpers
export const getUserNotifications = async (userId, unreadOnly = false) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  return { data, error }
}

export const markNotificationRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
  return { error }
}

// Dashboard summary (using security_invoker view)
export const getDashboardSummary = async (userId) => {
  const { data, error } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

// Real-time subscriptions
export const subscribeToAuthChanges = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToBotStatus = (userId, callback) => {
  return supabase
    .channel(`bots:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bot_instances',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

const ALLOWED_PROOF_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}
const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024

// Upload payment proof directly to Supabase Storage (prefer POST /api/orders/:id/proof to validate magic bytes & link order)
export const uploadPaymentProof = async (file, orderId, userId) => {
  if (!file) {
    return { data: null, error: new Error('File is required') }
  }

  const normalizedMime = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  const fileExt = ALLOWED_PROOF_MIME_TYPES[normalizedMime]
  if (!fileExt) {
    return {
      data: null,
      error: new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.')
    }
  }
  if (file.size > MAX_PROOF_SIZE_BYTES) {
    return { data: null, error: new Error('Ukuran file maksimal 5MB.') }
  }

  const fileName = `${userId}/${orderId}-${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file, {
      contentType: normalizedMime,
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { data: null, error }
  }

  const { data: signedData } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(data.path, 600)

  const url =
    signedData?.signedUrl ||
    supabase.storage.from('payment-proofs').getPublicUrl(data.path).data.publicUrl

  return { data: { path: data.path, url }, error: null }
}

export default supabase
