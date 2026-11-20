import crypto from 'crypto'
import {
  MIDTRANS_SERVER_KEY,
  BOT_TOKEN_ENC_KEY,
  ACCOUNT_CRED_ENC_KEY,
  LICENSE_SECRET,
  SUPABASE_SERVICE_ROLE_KEY,
  isConfiguredValue
} from '../config.js'

const AES_ALGO = 'aes-256-gcm'
const IV_BYTES = 12

function parseKeyMaterial(rawKey) {
  if (!isConfiguredValue(rawKey)) return null
  const trimmed = rawKey.trim()

  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return Buffer.from(trimmed, 'hex')
  }

  try {
    const b64 = Buffer.from(trimmed, 'base64')
    if (b64.length === 32) return b64
  } catch {
    // fall through
  }

  const utf8 = Buffer.from(trimmed, 'utf8')
  if (utf8.length === 32) return utf8

  if (trimmed.length >= 16) {
    return crypto.createHash('sha256').update(trimmed, 'utf8').digest()
  }

  return null
}

export function isBotEncryptionConfigured() {
  return parseKeyMaterial(BOT_TOKEN_ENC_KEY) !== null
}

export function isAccountEncryptionConfigured() {
  return parseKeyMaterial(ACCOUNT_CRED_ENC_KEY) !== null
}

function encryptWithKey(plaintext, rawKey) {
  const key = parseKeyMaterial(rawKey)
  if (!key) {
    throw new Error('Encryption key is not configured or too short (min 16 chars / 32-byte hex/base64)')
  }

  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

export function encryptBotToken(token) {
  return encryptWithKey(token, BOT_TOKEN_ENC_KEY)
}

export function encryptAccountCredentials(credentials) {
  return encryptWithKey(credentials, ACCOUNT_CRED_ENC_KEY)
}

export function verifyMidtransSignature({ order_id, status_code, gross_amount, signature_key }) {
  if (!MIDTRANS_SERVER_KEY || !order_id || !status_code || !gross_amount || !signature_key) {
    return false
  }
  const raw = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`
  const expected = crypto.createHash('sha512').update(raw).digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(signature_key), 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function generateLicenseKey(orderId, userId) {
  const secret =
    (isConfiguredValue(LICENSE_SECRET) && LICENSE_SECRET) ||
    (isConfiguredValue(BOT_TOKEN_ENC_KEY) && BOT_TOKEN_ENC_KEY) ||
    SUPABASE_SERVICE_ROLE_KEY

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`autobotz-script:${userId}:${orderId}`)
    .digest('hex')
    .toUpperCase()

  return `ABZ-${hmac.slice(0, 4)}-${hmac.slice(4, 8)}-${hmac.slice(8, 12)}-${hmac.slice(12, 16)}`
}
