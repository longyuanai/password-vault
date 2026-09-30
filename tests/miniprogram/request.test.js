import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './loader.js'

// 伪造的 wx / getApp，仅记录调用，不发出任何网络请求
function createEnv({ response, fail, token = '', baseUrl } = {}) {
  const env = { requests: [], redirects: [], cleared: 0 }
  const app = {
    globalData: { sessionToken: token, baseUrl },
    clearSession() { env.cleared++ }
  }
  const wx = {
    request(opts) {
      env.requests.push(opts)
      if (fail) opts.fail(fail)
      else opts.success(response)
    },
    redirectTo(opts) { env.redirects.push(opts.url) }
  }
  env.http = loadModule('utils/request.js', { globals: { wx, getApp: () => app } })
  return env
}

const OK = { statusCode: 200, data: { success: true, data: { ok: 1 } } }

describe('utils/request', () => {
  it('2xx 时 resolve 响应体，默认 GET 与默认地址', async () => {
    const env = createEnv({ response: OK })
    const res = await env.http.request({ url: '/api/auth/status' })
    assert.deepEqual(res, { success: true, data: { ok: 1 } })
    const req = env.requests[0]
    assert.equal(req.url, 'http://localhost:5000/api/auth/status')
    assert.equal(req.method, 'GET')
    assert.deepEqual(req.data, {})
    assert.equal(req.header['Content-Type'], 'application/json')
    assert.equal(req.header['x-session-token'], undefined)
  })

  it('注入会话 token、自定义 baseUrl 与自定义 header', async () => {
    const env = createEnv({
      response: { statusCode: 201, data: {} },
      token: 'fake-session-token',
      baseUrl: 'http://127.0.0.1:5000'
    })
    await env.http.request({ url: '/api/x', method: 'POST', data: { a: 1 }, header: { 'X-Test': 'yes' } })
    const req = env.requests[0]
    assert.equal(req.url, 'http://127.0.0.1:5000/api/x')
    assert.equal(req.method, 'POST')
    assert.deepEqual(req.data, { a: 1 })
    assert.equal(req.header['x-session-token'], 'fake-session-token')
    assert.equal(req.header['X-Test'], 'yes')
  })

  it('get/post/put/del 使用对应的 HTTP 方法', async () => {
    const env = createEnv({ response: OK })
    await env.http.get('/g', { q: 1 })
    await env.http.post('/p', { b: 2 })
    await env.http.put('/u', { c: 3 })
    await env.http.del('/d')
    assert.deepEqual(env.requests.map((r) => [r.method, r.url.replace('http://localhost:5000', '')]), [
      ['GET', '/g'], ['POST', '/p'], ['PUT', '/u'], ['DELETE', '/d']
    ])
    assert.deepEqual(env.requests[0].data, { q: 1 })
  })

  it('401 时清除会话、跳转解锁页并 reject', async () => {
    const env = createEnv({ response: { statusCode: 401, data: {} }, token: 'fake-session-token' })
    await assert.rejects(env.http.get('/api/entries'), (err) => {
      assert.equal(err.success, false)
      assert.equal(err.error.code, 'UNAUTHORIZED')
      return true
    })
    assert.equal(env.cleared, 1)
    assert.deepEqual(env.redirects, ['/pages/unlock/unlock'])
  })

  it('非 2xx 时透传服务端错误码与信息', async () => {
    const env = createEnv({
      response: { statusCode: 400, data: { error: { code: 'VALIDATION_ERROR', message: '参数错误' } } }
    })
    await assert.rejects(env.http.post('/api/entries', {}), {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '参数错误' }
    })
  })

  it('非 2xx 且无错误体时使用默认错误', async () => {
    const env = createEnv({ response: { statusCode: 500, data: null } })
    await assert.rejects(env.http.get('/api/x'), {
      success: false,
      error: { code: 'REQUEST_ERROR', message: '请求失败' }
    })
  })

  it('网络失败时返回 NETWORK_ERROR', async () => {
    let env = createEnv({ fail: { errMsg: 'request:fail timeout' } })
    await assert.rejects(env.http.get('/api/x'), {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'request:fail timeout' }
    })
    env = createEnv({ fail: {} })
    await assert.rejects(env.http.get('/api/x'), {
      success: false,
      error: { code: 'NETWORK_ERROR', message: '网络异常，请稍后重试' }
    })
  })
})
