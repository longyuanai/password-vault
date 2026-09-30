import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './loader.js'

const { formatDate, debounce, deepClone } = loadModule('utils/helpers.js')

describe('utils/helpers - formatDate', () => {
  it('空值返回占位符', () => {
    assert.equal(formatDate(''), '—')
    assert.equal(formatDate(null), '—')
    assert.equal(formatDate(undefined), '—')
  })

  it('格式化为 YYYY-MM-DD 并补零', () => {
    // 不带时区后缀，按本地时间解析，避免 CI 时区差异
    assert.equal(formatDate('2024-01-05T10:00:00'), '2024-01-05')
    assert.equal(formatDate('2023-12-31T23:59:59'), '2023-12-31')
  })

  it('支持时间戳', () => {
    const ts = new Date(2022, 8, 9, 8, 0, 0).getTime()
    assert.equal(formatDate(ts), '2022-09-09')
  })
})

describe('utils/helpers - debounce', () => {
  it('延迟内多次调用只执行最后一次，并保留参数与 this', async () => {
    const calls = []
    const ctx = {
      name: 'ctx',
      fn: debounce(function (value) {
        calls.push([this.name, value])
      }, 20)
    }
    ctx.fn(1)
    ctx.fn(2)
    ctx.fn(3)
    assert.equal(calls.length, 0)
    await new Promise((r) => setTimeout(r, 80))
    assert.deepEqual(calls, [['ctx', 3]])
  })

  it('默认延迟为 300ms', async () => {
    let count = 0
    const fn = debounce(() => { count++ })
    fn()
    await new Promise((r) => setTimeout(r, 100))
    assert.equal(count, 0)
    await new Promise((r) => setTimeout(r, 350))
    assert.equal(count, 1)
  })
})

describe('utils/helpers - deepClone', () => {
  it('返回深拷贝，修改副本不影响原对象', () => {
    const src = { title: 'Example Site', tags: ['demo', 'test'], meta: { favorite: true } }
    const copy = deepClone(src)
    assert.deepEqual(copy, src)
    assert.notEqual(copy, src)
    copy.tags.push('x')
    copy.meta.favorite = false
    assert.deepEqual(src.tags, ['demo', 'test'])
    assert.equal(src.meta.favorite, true)
  })
})
