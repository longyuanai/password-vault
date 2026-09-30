import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { deriveKey, generateSalt, encrypt, decrypt } from '../src/utils/crypto.js'

// 仅使用明显的假数据
const FAKE_MASTER = 'fake-master-pass'

describe('utils/crypto', () => {
  it('generateSalt 生成 32 字节随机 hex', () => {
    const a = generateSalt()
    const b = generateSalt()
    assert.match(a, /^[0-9a-f]{64}$/)
    assert.notEqual(a, b)
  })

  it('deriveKey 对相同输入确定、对不同 salt/密码不同，长度 32 字节', () => {
    const salt = generateSalt()
    const k1 = deriveKey(FAKE_MASTER, salt)
    const k2 = deriveKey(FAKE_MASTER, salt)
    assert.equal(k1.length, 32)
    assert.ok(k1.equals(k2))
    assert.ok(!k1.equals(deriveKey(FAKE_MASTER + '-x', salt)))
    assert.ok(!k1.equals(deriveKey(FAKE_MASTER, generateSalt())))
  })

  it('encrypt/decrypt 往返，含 Unicode 与空字符串', () => {
    const key = crypto.randomBytes(32)
    for (const text of ['fake-password-123', '', '中文密码-示例', 'x'.repeat(1000)]) {
      assert.equal(decrypt(encrypt(text, key), key), text)
    }
  })

  it('密文格式为 iv:authTag:ciphertext，且每次加密 IV 不同', () => {
    const key = crypto.randomBytes(32)
    const c1 = encrypt('fake-password-123', key)
    const c2 = encrypt('fake-password-123', key)
    const [iv, tag, body] = c1.split(':')
    assert.match(iv, /^[0-9a-f]{24}$/)
    assert.match(tag, /^[0-9a-f]{32}$/)
    assert.match(body, /^[0-9a-f]+$/)
    assert.notEqual(c1, c2)
  })

  it('使用错误密钥解密会失败', () => {
    const c = encrypt('fake-password-123', crypto.randomBytes(32))
    assert.throws(() => decrypt(c, crypto.randomBytes(32)))
  })

  it('密文被篡改时认证失败', () => {
    const key = crypto.randomBytes(32)
    const [iv, tag, body] = encrypt('fake-password-123', key).split(':')
    const flipped = (body[0] === '0' ? '1' : '0') + body.slice(1)
    assert.throws(() => decrypt(`${iv}:${tag}:${flipped}`, key))
  })
})
