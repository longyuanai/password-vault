import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import config from '../config/index.js'

let db = null

/**
 * 获取数据库单例
 */
export function getDb() {
  if (db) return db

  const dbPath = config.dbPath
  const dbDir = path.dirname(dbPath)

  // 确保数据目录存在
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new Database(dbPath)

  // 启用 WAL 模式提升性能
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // 初始化表结构
  db.exec(`
    CREATE TABLE IF NOT EXISTS master (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      username TEXT NOT NULL DEFAULT '',
      encrypted_password TEXT NOT NULL,
      url TEXT DEFAULT '',
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  return db
}
