import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import midtransClient from 'midtrans-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Load backend env first, then fill missing keys (e.g. VITE_SUPABASE_URL) from .env
dotenv.config({ path: path.join(projectRoot, '.env.backend'), quiet: true })
dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true })

const PLACEHOLDER_PATTERN = /(your[-_]|xxxx|placeholder|change[-_]?me|replace[-_]?with)/i

export function isConfiguredValue(value) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  return !PLACEHOLDER_PATTERN.test(trimmed)
}

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 5000)

export const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim()

export const SUPABASE_SERVICE_ROLE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
).trim()

export const MIDTRANS_IS_PRODUCTION =
  String(process.env.MIDTRANS_IS_PRODUCTION || 'false').toLowerCase() === 'true'
export const MIDTRANS_SERVER_KEY = (process.env.MIDTRANS_SERVER_KEY || '').trim()
export const MIDTRANS_CLIENT_KEY = (process.env.MIDTRANS_CLIENT_KEY || '').trim()

export const BOT_TOKEN_ENC_KEY = (process.env.BOT_TOKEN_ENC_KEY || '').trim()
export const ACCOUNT_CRED_ENC_KEY = (
  process.env.ACCOUNT_CRED_ENC_KEY ||
  process.env.BOT_TOKEN_ENC_KEY ||
  ''
).trim()

export const LICENSE_SECRET = (process.env.LICENSE_SECRET || '').trim()
export const SCRIPT_LATEST_VERSION = (process.env.SCRIPT_LATEST_VERSION || '2.0.0').trim()
export const SCRIPT_DOWNLOAD_BUCKET = (process.env.SCRIPT_DOWNLOAD_BUCKET || '').trim()
export const SCRIPT_DOWNLOAD_PATH = (process.env.SCRIPT_DOWNLOAD_PATH || '').trim()
export const SCRIPT_DOWNLOAD_URL = (process.env.SCRIPT_DOWNLOAD_URL || '').trim()

export const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .trim()
  .replace(/\/+$/, '')

export const STORAGE_BUCKET = 'payment-proofs'
export const PROOF_SIGNED_URL_TTL_SECONDS = 600 // 10 minutes

export function getAllowedOrigins() {
  const raw = (process.env.ALLOWED_ORIGINS || '').trim()
  const origins = new Set()

  if (raw) {
    for (const entry of raw.split(',')) {
      const cleaned = entry.trim().replace(/\/+$/, '')
      if (cleaned) origins.add(cleaned)
    }
  }

  if (FRONTEND_URL) {
    origins.add(FRONTEND_URL)
  }

  if (origins.size === 0 && NODE_ENV !== 'production') {
    origins.add('http://localhost:5173')
    origins.add('http://127.0.0.1:5173')
  }

  return Array.from(origins)
}

export function isSupabaseConfigured() {
  return isConfiguredValue(SUPABASE_URL) && isConfiguredValue(SUPABASE_SERVICE_ROLE_KEY)
}

export function isMidtransConfigured() {
  return isConfiguredValue(MIDTRANS_SERVER_KEY)
}

export const supabaseAdmin = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export const midtransSnap = isMidtransConfigured()
  ? new midtransClient.Snap({
      isProduction: MIDTRANS_IS_PRODUCTION,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: isConfiguredValue(MIDTRANS_CLIENT_KEY) ? MIDTRANS_CLIENT_KEY : ''
    })
  : null

/**
 * Returns manual payment instructions sourced strictly from environment variables.
 * Never returns hard-coded bank account numbers or QRIS URLs.
 */
export function getManualPaymentInstructions() {
  const bankAccounts = []

  const jsonRaw = (process.env.MANUAL_BANK_ACCOUNTS_JSON || '').trim()
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item?.bank && item?.number && item?.holder) {
            bankAccounts.push({
              bank: String(item.bank).trim(),
              number: String(item.number).trim(),
              holder: String(item.holder).trim()
            })
          }
        }
      }
    } catch (err) {
      console.warn('[config] Invalid MANUAL_BANK_ACCOUNTS_JSON:', err.message)
    }
  }

  if (bankAccounts.length === 0) {
    const envBanks = [
      {
        bank: 'BCA',
        number: process.env.MANUAL_BANK_BCA_ACCOUNT,
        holder: process.env.MANUAL_BANK_BCA_HOLDER
      },
      {
        bank: 'Mandiri',
        number: process.env.MANUAL_BANK_MANDIRI_ACCOUNT,
        holder: process.env.MANUAL_BANK_MANDIRI_HOLDER
      },
      {
        bank: 'BRI',
        number: process.env.MANUAL_BANK_BRI_ACCOUNT,
        holder: process.env.MANUAL_BANK_BRI_HOLDER
      },
      {
        bank: 'BNI',
        number: process.env.MANUAL_BANK_BNI_ACCOUNT,
        holder: process.env.MANUAL_BANK_BNI_HOLDER
      }
    ]

    for (const item of envBanks) {
      if (isConfiguredValue(item.number) && isConfiguredValue(item.holder)) {
        bankAccounts.push({
          bank: item.bank,
          number: item.number.trim(),
          holder: item.holder.trim()
        })
      }
    }
  }

  const qrisUrl = isConfiguredValue(process.env.MANUAL_QRIS_IMAGE_URL)
    ? process.env.MANUAL_QRIS_IMAGE_URL.trim()
    : null

  return {
    bank_accounts: bankAccounts,
    qris_image_url: qrisUrl
  }
}
