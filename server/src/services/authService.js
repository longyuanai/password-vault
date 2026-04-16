import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from '../models/database.js'
import { deriveKey, generateSalt } from '../utils/crypto.js'
import { EntryService } from './entryService.js'
import { AppError } from '../utils/AppError.js'
import config from '../config/index.js'

// 内存中保存的会话状态（单用户本地应用）
let unlockedKey = null
let currentSession = null
let sessionExpireTimer = null

function resetSessionTimer() {
  if (sessionExpireTimer) clearTimeout(sessionExpireTimer)
  sessionExpireTimer = setTimeout(() => {
    unlockedKey = null
    currentSession = null
    console.log('[Auth] 会话超时，已自动锁定')
  }, config.sessionTimeout * 60 * 1000)
}

export const AuthService = {
  /**
   * 检查是否已初始化（设置过主密码）
   */
  isSetup() {
    const db = getDb()
    const row = db.prepare('SELECT id FROM master WHERE id = 1').get()
    return !!row
  },

  /**
   * 是否已解锁
   */
  isUnlocked() {
    return unlockedKey !== null && currentSession !== null
  },

  /**
   * 首次设置主密码
   */
  async setup(masterPassword) {
    const db = getDb()
    if (this.isSetup()) {
      throw new AppError('主密码已设置', 400, 'ALREADY_SETUP')
    }

    const salt = generateSalt()
    const passwordHash = await bcrypt.hash(masterPassword, 10)

    db.prepare('INSERT INTO master (id, password_hash, salt) VALUES (1, ?, ?)').run(passwordHash, salt)

    // 设置后自动解锁
    unlockedKey = deriveKey(masterPassword, salt)
    currentSession = crypto.randomUUID()
    resetSessionTimer()

    return currentSession
  },

  /**
   * 解锁保险库
   */
  async unlock(masterPassword) {
    const db = getDb()
    const master = db.prepare('SELECT * FROM master WHERE id = 1').get()
    if (!master) {
      throw new AppError('尚未设置主密码', 400, 'NOT_SETUP')
    }

    const valid = await bcrypt.compare(masterPassword, master.password_hash)
    if (!valid) {
      throw new AppError('主密码错误', 401, 'WRONG_PASSWORD')
    }

    unlockedKey = deriveKey(masterPassword, master.salt)
    currentSession = crypto.randomUUID()
    resetSessionTimer()

    return currentSession
  },

  /**
   * 锁定保险库
   */
  lock() {
    unlockedKey = null
    currentSession = null
    if (sessionExpireTimer) {
      clearTimeout(sessionExpireTimer)
      sessionExpireTimer = null
    }
  },

  /**
   * 修改主密码
   */
  async changePassword(oldPassword, newPassword) {
    const db = getDb()
    const master = db.prepare('SELECT * FROM master WHERE id = 1').get()
    if (!master) {
      throw new AppError('尚未设置主密码', 400, 'NOT_SETUP')
    }

    const valid = await bcrypt.compare(oldPassword, master.password_hash)
    if (!valid) {
      throw new AppError('旧密码错误', 401, 'WRONG_PASSWORD')
    }

    const oldKey = deriveKey(oldPassword, master.salt)
    const newSalt = generateSalt()
    const newKey = deriveKey(newPassword, newSalt)
    const newHash = await bcrypt.hash(newPassword, 10)

    // 用新密钥重新加密所有条目
    EntryService.reEncryptAll(oldKey, newKey)

    // 更新主密码记录
    db.prepare('UPDATE master SET password_hash = ?, salt = ? WHERE id = 1').run(newHash, newSalt)

    // 更新内存中的密钥和会话
    unlockedKey = newKey
    currentSession = crypto.randomUUID()
    resetSessionTimer()

    return currentSession
  },

  /**
   * 验证会话令牌
   */
  validateSession(token) {
    if (token && token === currentSession) {
      resetSessionTimer()
      return true
    }
    return false
  },

  /**
   * 获取内存中的派生密钥
   */
  getKey() {
    if (!unlockedKey) {
      throw new AppError('保险库未解锁', 401, 'VAULT_LOCKED')
    }
    return unlockedKey
  }
}
