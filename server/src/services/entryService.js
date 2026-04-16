import crypto from 'crypto'
import { getDb } from '../models/database.js'
import { encrypt, decrypt } from '../utils/crypto.js'
import { AppError } from '../utils/AppError.js'

export const EntryService = {
  /**
   * 获取条目列表（支持搜索、分类筛选、分页）
   */
  getAll({ search, category, page = 1, limit = 20 } = {}, derivedKey) {
    const db = getDb()
    let where = []
    let params = {}

    if (search) {
      where.push(`(title LIKE @search OR username LIKE @search OR url LIKE @search OR tags LIKE @search)`)
      params.search = `%${search}%`
    }
    if (category) {
      where.push(`category = @category`)
      params.category = category
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    const total = db.prepare(`SELECT COUNT(*) as count FROM entries ${whereClause}`).get(params).count
    const rows = db.prepare(
      `SELECT * FROM entries ${whereClause} ORDER BY updated_at DESC LIMIT @limit OFFSET @offset`
    ).all({ ...params, limit, offset })

    const entries = rows.map(row => decryptEntry(row, derivedKey))

    return {
      entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }
  },

  /**
   * 获取单个条目
   */
  getById(id, derivedKey) {
    const db = getDb()
    const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(id)
    if (!row) {
      throw new AppError('条目不存在', 404, 'ENTRY_NOT_FOUND')
    }
    return decryptEntry(row, derivedKey)
  },

  /**
   * 创建条目
   */
  create(data, derivedKey) {
    const db = getDb()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const encryptedPassword = encrypt(data.password || '', derivedKey)

    db.prepare(`
      INSERT INTO entries (id, title, username, encrypted_password, url, category, tags, notes, favorite, created_at, updated_at)
      VALUES (@id, @title, @username, @encrypted_password, @url, @category, @tags, @notes, @favorite, @created_at, @updated_at)
    `).run({
      id,
      title: data.title,
      username: data.username || '',
      encrypted_password: encryptedPassword,
      url: data.url || '',
      category: data.category || '',
      tags: data.tags || '',
      notes: data.notes || '',
      favorite: data.favorite ? 1 : 0,
      created_at: now,
      updated_at: now
    })

    return this.getById(id, derivedKey)
  },

  /**
   * 更新条目
   */
  update(id, data, derivedKey) {
    const db = getDb()
    const existing = db.prepare('SELECT * FROM entries WHERE id = ?').get(id)
    if (!existing) {
      throw new AppError('条目不存在', 404, 'ENTRY_NOT_FOUND')
    }

    const now = new Date().toISOString()
    const encryptedPassword = data.password !== undefined
      ? encrypt(data.password, derivedKey)
      : existing.encrypted_password

    db.prepare(`
      UPDATE entries SET
        title = @title,
        username = @username,
        encrypted_password = @encrypted_password,
        url = @url,
        category = @category,
        tags = @tags,
        notes = @notes,
        favorite = @favorite,
        updated_at = @updated_at
      WHERE id = @id
    `).run({
      id,
      title: data.title !== undefined ? data.title : existing.title,
      username: data.username !== undefined ? data.username : existing.username,
      encrypted_password: encryptedPassword,
      url: data.url !== undefined ? data.url : existing.url,
      category: data.category !== undefined ? data.category : existing.category,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      favorite: data.favorite !== undefined ? (data.favorite ? 1 : 0) : existing.favorite,
      updated_at: now
    })

    return this.getById(id, derivedKey)
  },

  /**
   * 删除条目
   */
  remove(id) {
    const db = getDb()
    const result = db.prepare('DELETE FROM entries WHERE id = ?').run(id)
    if (result.changes === 0) {
      throw new AppError('条目不存在', 404, 'ENTRY_NOT_FOUND')
    }
  },

  /**
   * 导出所有条目（解密后）
   */
  exportAll(derivedKey) {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM entries ORDER BY created_at ASC').all()
    return rows.map(row => decryptEntry(row, derivedKey))
  },

  /**
   * 批量导入条目
   */
  importEntries(entries, derivedKey) {
    const db = getDb()
    const insert = db.prepare(`
      INSERT INTO entries (id, title, username, encrypted_password, url, category, tags, notes, favorite, created_at, updated_at)
      VALUES (@id, @title, @username, @encrypted_password, @url, @category, @tags, @notes, @favorite, @created_at, @updated_at)
    `)

    const now = new Date().toISOString()
    const importMany = db.transaction((items) => {
      let count = 0
      for (const item of items) {
        insert.run({
          id: crypto.randomUUID(),
          title: item.title || '',
          username: item.username || '',
          encrypted_password: encrypt(item.password || '', derivedKey),
          url: item.url || '',
          category: item.category || '',
          tags: item.tags || '',
          notes: item.notes || '',
          favorite: item.favorite ? 1 : 0,
          created_at: item.created_at || now,
          updated_at: item.updated_at || now
        })
        count++
      }
      return count
    })

    return importMany(entries)
  },

  /**
   * 密码健康检查
   */
  healthCheck(derivedKey) {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM entries').all()
    const decrypted = rows.map(row => decryptEntry(row, derivedKey))

    const weak = []
    const reused = []
    const old = []
    const passwordMap = new Map()

    const now = Date.now()
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000

    for (const entry of decrypted) {
      const pw = entry.password

      // 弱密码检测
      if (pw.length < 8 || /^\d+$/.test(pw) || /^[a-zA-Z]+$/.test(pw)) {
        weak.push({ id: entry.id, title: entry.title })
      }

      // 重复密码检测
      if (pw) {
        if (!passwordMap.has(pw)) {
          passwordMap.set(pw, [])
        }
        passwordMap.get(pw).push({ id: entry.id, title: entry.title })
      }

      // 过期提醒
      const updatedAt = new Date(entry.updated_at).getTime()
      if (now - updatedAt > NINETY_DAYS) {
        old.push({ id: entry.id, title: entry.title, updated_at: entry.updated_at })
      }
    }

    // 筛选出重复密码组
    for (const [, entries] of passwordMap) {
      if (entries.length > 1) {
        reused.push(entries)
      }
    }

    return {
      total: decrypted.length,
      weak,
      reused,
      old,
      score: calculateHealthScore(decrypted.length, weak.length, reused.length, old.length)
    }
  },

  /**
   * 用新密钥重新加密所有条目（改主密码时用）
   */
  reEncryptAll(oldKey, newKey) {
    const db = getDb()
    const rows = db.prepare('SELECT id, encrypted_password FROM entries').all()

    const update = db.prepare('UPDATE entries SET encrypted_password = ? WHERE id = ?')
    const reEncrypt = db.transaction((items) => {
      for (const row of items) {
        const plaintext = decrypt(row.encrypted_password, oldKey)
        const newEncrypted = encrypt(plaintext, newKey)
        update.run(newEncrypted, row.id)
      }
    })

    reEncrypt(rows)
  }
}

function decryptEntry(row, derivedKey) {
  return {
    id: row.id,
    title: row.title,
    username: row.username,
    password: decrypt(row.encrypted_password, derivedKey),
    url: row.url,
    category: row.category,
    tags: row.tags,
    notes: row.notes,
    favorite: !!row.favorite,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function calculateHealthScore(total, weakCount, reusedGroupCount, oldCount) {
  if (total === 0) return 100
  const issues = weakCount + reusedGroupCount + oldCount
  const ratio = issues / total
  return Math.max(0, Math.round((1 - ratio) * 100))
}
