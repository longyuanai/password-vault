import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// 使用临时目录中的独立数据库，不触碰 server/data
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pv-test-'))
process.env.DB_PATH = path.join(tmpDir, 'vault.db')

const { AuthService } = await import('../src/services/authService.js')
const { EntryService } = await import('../src/services/entryService.js')
const { getDb } = await import('../src/models/database.js')

// 仅使用明显的假数据
const FAKE_MASTER = 'fake-master-pass-0000'
const FAKE_MASTER_NEW = 'fake-master-pass-1111'

describe('AuthService + EntryService（临时 SQLite）', () => {
  let token

  before(async () => {
    assert.equal(AuthService.isSetup(), false)
    token = await AuthService.setup(FAKE_MASTER)
  })

  after(() => {
    AuthService.lock()
    getDb().close()
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* Windows 下可能仍被占用 */ }
  })

  it('setup 后处于已初始化、已解锁状态，且不能重复 setup', async () => {
    assert.equal(AuthService.isSetup(), true)
    assert.equal(AuthService.isUnlocked(), true)
    assert.equal(AuthService.validateSession(token), true)
    assert.equal(AuthService.validateSession('fake-wrong-token'), false)
    await assert.rejects(AuthService.setup(FAKE_MASTER), { code: 'ALREADY_SETUP' })
  })

  it('条目密码在数据库中加密存储，读取时解密', () => {
    const key = AuthService.getKey()
    const entry = EntryService.create({
      title: 'Example Site',
      username: 'user@example.com',
      password: 'fake-entry-pass-1',
      category: '其他'
    }, key)
    assert.equal(entry.password, 'fake-entry-pass-1')

    const row = getDb().prepare('SELECT encrypted_password FROM entries WHERE id = ?').get(entry.id)
    assert.ok(!row.encrypted_password.includes('fake-entry-pass-1'))
    assert.equal(EntryService.getById(entry.id, key).password, 'fake-entry-pass-1')

    const list = EntryService.getAll({ search: 'Example' }, key)
    assert.equal(list.pagination.total, 1)
    assert.equal(list.entries[0].title, 'Example Site')
  })

  it('健康检查识别弱密码与重复密码', () => {
    const key = AuthService.getKey()
    EntryService.create({ title: 'Weak Demo', password: '123456' }, key)
    EntryService.create({ title: 'Dup Demo', password: 'fake-entry-pass-1' }, key)
    const report = EntryService.healthCheck(key)
    assert.equal(report.total, 3)
    assert.deepEqual(report.weak.map((e) => e.title), ['Weak Demo'])
    assert.equal(report.reused.length, 1)
    assert.equal(report.reused[0].length, 2)
  })

  it('错误主密码无法解锁，锁定后无法取得密钥', async () => {
    AuthService.lock()
    assert.equal(AuthService.isUnlocked(), false)
    assert.throws(() => AuthService.getKey(), { code: 'VAULT_LOCKED' })
    await assert.rejects(AuthService.unlock('fake-wrong-pass'), { code: 'WRONG_PASSWORD' })
    token = await AuthService.unlock(FAKE_MASTER)
    assert.equal(AuthService.isUnlocked(), true)
  })

  it('修改主密码后条目重新加密且可用新密码解锁', async () => {
    await AuthService.changePassword(FAKE_MASTER, FAKE_MASTER_NEW)
    AuthService.lock()
    await assert.rejects(AuthService.unlock(FAKE_MASTER), { code: 'WRONG_PASSWORD' })
    await AuthService.unlock(FAKE_MASTER_NEW)
    const { entries } = EntryService.getAll({ search: 'Example' }, AuthService.getKey())
    assert.equal(entries[0].password, 'fake-entry-pass-1')
  })
})
