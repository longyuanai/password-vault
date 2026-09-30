import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadPage } from './loader.js'

// 页面依赖的 api 模块用替身替换，确保测试不发出网络请求
function apiMock() {
  const calls = []
  const api = new Proxy({}, {
    get: (_, name) => (...args) => {
      calls.push([name, ...args])
      return Promise.resolve({ data: {} })
    }
  })
  return { api, calls }
}

const withApi = (api) => ({ mocks: { 'utils/api': api } })

describe('pages/generator - localGenerate（离线降级生成）', () => {
  const page = loadPage('pages/generator/generator.js', withApi(apiMock().api))
  const all = { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeChars: '' }

  it('生成指定长度', () => {
    assert.equal(page.localGenerate({ ...all, length: 8 }).length, 8)
    assert.equal(page.localGenerate({ ...all, length: 64 }).length, 64)
  })

  it('只包含所选字符类型', () => {
    for (let i = 0; i < 20; i++) {
      assert.match(page.localGenerate({ ...all, uppercase: false, lowercase: false, symbols: false }), /^[0-9]{32}$/)
      assert.match(page.localGenerate({ ...all, numbers: false, symbols: false }), /^[A-Za-z]{32}$/)
    }
  })

  it('排除指定字符', () => {
    const opts = { ...all, uppercase: false, lowercase: false, symbols: false, excludeChars: '0123456' }
    for (let i = 0; i < 20; i++) {
      assert.match(page.localGenerate(opts), /^[789]{32}$/)
    }
  })

  it('没有可用字符时返回空字符串', () => {
    assert.equal(page.localGenerate({ length: 16 }), '')
    assert.equal(page.localGenerate({ length: 4, numbers: true, excludeChars: '0123456789' }), '')
  })
})

describe('pages/generator - calcStrength', () => {
  const page = loadPage('pages/generator/generator.js', withApi(apiMock().api))

  it('空密码为 0', () => {
    assert.equal(page.calcStrength(''), 0)
  })

  it('按长度与字符类型打分（0-4）', () => {
    assert.equal(page.calcStrength('abc'), 0)
    assert.equal(page.calcStrength('abcdefgh'), 1)
    assert.equal(page.calcStrength('abcdEFGH'), 2)
    assert.equal(page.calcStrength('abcdEF12'), 3)
    assert.equal(page.calcStrength('abcdefghijklmnop'), 2)
    assert.equal(page.calcStrength('Fake-Example-0000'), 4)
  })
})

describe('pages/entry-form - calcStrength / updateStrength', () => {
  const page = loadPage('pages/entry-form/entry-form.js', withApi(apiMock().api))

  it('打分上限为 4', () => {
    assert.equal(page.calcStrength(''), 0)
    assert.equal(page.calcStrength('abcdefgh'), 1)
    assert.equal(page.calcStrength('abcdefghijkl'), 2)
    assert.equal(page.calcStrength('abcdefghijK1'), 4)
    assert.equal(page.calcStrength('Fake-Example-0000'), 4)
  })

  it('updateStrength 同步等级、百分比和文案', () => {
    page.updateStrength('abcdefgh')
    assert.equal(page.data.strengthLevel, 'weak')
    assert.equal(page.data.strengthPercent, 25)
    assert.equal(page.data.strengthLabel, '弱')
    page.updateStrength('Fake-Example-0000')
    assert.equal(page.data.strengthLevel, 'strong')
    assert.equal(page.data.strengthPercent, 100)
    assert.equal(page.data.strengthLabel, '强')
    page.updateStrength('')
    assert.equal(page.data.strengthLevel, 'none')
  })
})

describe('pages/entry-form - updateTagList', () => {
  const page = loadPage('pages/entry-form/entry-form.js', withApi(apiMock().api))

  it('支持中英文逗号分隔并去除空白与空项', () => {
    page.updateTagList(' 工作 , demo，test ,, ')
    assert.deepEqual(page.data.tagList, ['工作', 'demo', 'test'])
  })

  it('空字符串得到空列表', () => {
    page.updateTagList('')
    assert.deepEqual(page.data.tagList, [])
  })
})

describe('pages/setup - 主密码校验', () => {
  function setupPage() {
    const mock = apiMock()
    const page = loadPage('pages/setup/setup.js', withApi(mock.api))
    return { page, calls: mock.calls }
  }

  it('未输入时提示', () => {
    const { page, calls } = setupPage()
    page.onSubmit()
    assert.equal(page.data.error, '请输入主密码')
    assert.equal(calls.length, 0)
  })

  it('少于 8 位时提示', () => {
    const { page, calls } = setupPage()
    page.onPasswordInput({ detail: { value: 'short' } })
    page.onConfirmInput({ detail: { value: 'short' } })
    page.onSubmit()
    assert.equal(page.data.error, '密码长度不能少于 8 个字符')
    assert.equal(calls.length, 0)
  })

  it('两次输入不一致时提示', () => {
    const { page, calls } = setupPage()
    page.onPasswordInput({ detail: { value: 'fake-master-pass' } })
    page.onConfirmInput({ detail: { value: 'fake-master-pass-2' } })
    page.onSubmit()
    assert.equal(page.data.error, '两次输入的密码不一致')
    assert.equal(calls.length, 0)
  })

  it('校验通过后调用 setup 接口', () => {
    const { page, calls } = setupPage()
    page.onPasswordInput({ detail: { value: 'fake-master-pass' } })
    page.onConfirmInput({ detail: { value: 'fake-master-pass' } })
    page.onSubmit()
    assert.equal(page.data.error, '')
    assert.equal(page.data.loading, true)
    assert.deepEqual(calls, [['setup', 'fake-master-pass']])
  })
})
