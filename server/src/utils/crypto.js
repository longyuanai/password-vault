import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const SALT_LENGTH = 32
const KEY_LENGTH = 32
const ITERATIONS = 600000
const DIGEST = 'sha512'

/**
 * 派生加密密钥 (PBKDF2)
 */
export function deriveKey(masterPassword, salt) {
  const saltBuffer = Buffer.from(salt, 'hex')
  return crypto.pbkdf2Sync(masterPassword, saltBuffer, ITERATIONS, KEY_LENGTH, DIGEST)
}

/**
 * 生成随机 salt
 */
export function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH).toString('hex')
}

/**
 * AES-256-GCM 加密
 * 返回格式: iv:authTag:ciphertext (hex)
 */
export function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * AES-256-GCM 解密
 */
export function decrypt(encrypted, key) {
  const [ivHex, authTagHex, ciphertext] = encrypted.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
