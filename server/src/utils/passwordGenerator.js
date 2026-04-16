import crypto from 'crypto'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

/**
 * 生成安全随机密码
 */
export function generate({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
  excludeChars = ''
} = {}) {
  let charset = ''
  const required = []

  if (uppercase) {
    const chars = filterChars(UPPERCASE, excludeChars)
    charset += chars
    if (chars.length) required.push(chars)
  }
  if (lowercase) {
    const chars = filterChars(LOWERCASE, excludeChars)
    charset += chars
    if (chars.length) required.push(chars)
  }
  if (numbers) {
    const chars = filterChars(NUMBERS, excludeChars)
    charset += chars
    if (chars.length) required.push(chars)
  }
  if (symbols) {
    const chars = filterChars(SYMBOLS, excludeChars)
    charset += chars
    if (chars.length) required.push(chars)
  }

  if (!charset.length) {
    throw new Error('至少需要启用一种字符类型')
  }

  if (length < required.length) {
    length = required.length
  }

  // 确保每种启用的字符类型至少出现一次
  const password = []
  for (const chars of required) {
    password.push(chars[crypto.randomInt(chars.length)])
  }

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password.push(charset[crypto.randomInt(charset.length)])
  }

  // Fisher-Yates 洗牌
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

/**
 * 评估密码强度
 */
export function evaluateStrength(password) {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  // 检查是否有连续重复字符
  if (!/(.)\1{2,}/.test(password)) score++

  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  if (score <= 5) return 'strong'
  return 'very_strong'
}

function filterChars(chars, excludeChars) {
  return chars.split('').filter(c => !excludeChars.includes(c)).join('')
}
