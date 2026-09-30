import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './loader.js'

function loadApi() {
  const calls = []
  const record = (method) => (url, data) => {
    calls.push({ method, url, data })
    return Promise.resolve({ success: true })
  }
  const httpMock = { get: record('GET'), post: record('POST'), put: record('PUT'), del: record('DELETE') }
  const api = loadModule('utils/api.js', { mocks: { 'utils/request': httpMock } })
  return { api, calls }
}

describe('utils/api - 接口映射', () => {
  it('认证相关接口', () => {
    const { api, calls } = loadApi()
    api.getStatus()
    api.setup('fake-master-pass')
    api.unlock('fake-master-pass')
    api.lock()
    api.changePassword('fake-old-pass', 'fake-new-pass')
    assert.deepEqual(calls, [
      { method: 'GET', url: '/api/auth/status', data: undefined },
      { method: 'POST', url: '/api/auth/setup', data: { masterPassword: 'fake-master-pass' } },
      { method: 'POST', url: '/api/auth/unlock', data: { masterPassword: 'fake-master-pass' } },
      { method: 'POST', url: '/api/auth/lock', data: undefined },
      { method: 'POST', url: '/api/auth/change-password', data: { oldPassword: 'fake-old-pass', newPassword: 'fake-new-pass' } }
    ])
  })

  it('条目相关接口', () => {
    const { api, calls } = loadApi()
    api.getEntries()
    api.getEntries({ search: 'demo' })
    api.getEntryById('abc')
    api.createEntry({ title: 'Example' })
    api.updateEntry('abc', { title: 'Example 2' })
    api.deleteEntry('abc')
    api.getHealthReport()
    assert.deepEqual(calls, [
      { method: 'GET', url: '/api/entries', data: {} },
      { method: 'GET', url: '/api/entries', data: { search: 'demo' } },
      { method: 'GET', url: '/api/entries/abc', data: undefined },
      { method: 'POST', url: '/api/entries', data: { title: 'Example' } },
      { method: 'PUT', url: '/api/entries/abc', data: { title: 'Example 2' } },
      { method: 'DELETE', url: '/api/entries/abc', data: undefined },
      { method: 'GET', url: '/api/entries/health', data: undefined }
    ])
  })

  it('工具相关接口及默认参数', () => {
    const { api, calls } = loadApi()
    api.generatePassword()
    api.generatePassword({ length: 20 })
    api.exportEntries()
    api.importEntries([{ title: 'Example' }])
    api.importEntries([], 'csv')
    assert.deepEqual(calls, [
      { method: 'POST', url: '/api/tools/generate-password', data: {} },
      { method: 'POST', url: '/api/tools/generate-password', data: { length: 20 } },
      { method: 'GET', url: '/api/tools/export', data: { format: 'json' } },
      { method: 'POST', url: '/api/tools/import', data: { entries: [{ title: 'Example' }], format: 'json' } },
      { method: 'POST', url: '/api/tools/import', data: { entries: [], format: 'csv' } }
    ])
  })
})
