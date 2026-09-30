import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generate, evaluateStrength } from '../src/utils/passwordGenerator.js'

describe('utils/passwordGenerator - generate', () => {
  it('默认生成 16 位且包含全部四类字符', () => {
    for (let i = 0; i < 20; i++) {
      const pwd = generate()
      assert.equal(pwd.length, 16)
      assert.match(pwd, /[A-Z]/)
      assert.match(pwd, /[a-z]/)
      assert.match(pwd, /[0-9]/)
      assert.match(pwd, /[^A-Za-z0-9]/)
    }
  })

  it('只使用启用的字符类型', () => {
    const pwd = generate({ length: 40, uppercase: false, lowercase: false, symbols: false })
    assert.match(pwd, /^[0-9]{40}$/)
  })

  it('排除指定字符', () => {
    const pwd = generate({ length: 64, uppercase: false, lowercase: false, symbols: false, excludeChars: '01234' })
    assert.match(pwd, /^[5-9]{64}$/)
  })

  it('长度小于启用类型数时自动提升到类型数', () => {
    assert.equal(generate({ length: 1 }).length, 4)
  })

  it('没有可用字符时抛错', () => {
    assert.throws(() => generate({ uppercase: false, lowercase: false, numbers: false, symbols: false }))
    assert.throws(() => generate({ uppercase: false, lowercase: false, symbols: false, excludeChars: '0123456789' }))
  })
})

describe('utils/passwordGenerator - evaluateStrength', () => {
  it('按规则分级', () => {
    assert.equal(evaluateStrength('aaa'), 'weak')
    assert.equal(evaluateStrength('abcdefgh'), 'weak')
    assert.equal(evaluateStrength('abcdefgh1'), 'medium')
    assert.equal(evaluateStrength('Abcdefghijk1'), 'strong')
    assert.equal(evaluateStrength('Fake-Example-0000'), 'very_strong')
  })
})
