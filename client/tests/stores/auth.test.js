import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'

vi.mock('@/api/auth.js', () => ({
  getStatus: vi.fn(),
  setup: vi.fn(),
  unlock: vi.fn(),
  lock: vi.fn(),
  changePassword: vi.fn()
}))

import * as authApi from '@/api/auth.js'

describe('auth store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('initial state', () => {
    expect(store.sessionToken).toBe('')
    expect(store.isSetup).toBe(false)
    expect(store.isUnlocked).toBe(false)
  })

  it('setSession / clearSession', () => {
    store.setSession('tok123')
    expect(store.sessionToken).toBe('tok123')
    expect(store.isUnlocked).toBe(true)
    expect(sessionStorage.getItem('session_token')).toBe('tok123')

    store.clearSession()
    expect(store.sessionToken).toBe('')
    expect(store.isUnlocked).toBe(false)
    expect(sessionStorage.getItem('session_token')).toBeNull()
  })

  it('checkStatus sets isSetup and clears session if not unlocked', async () => {
    store.setSession('old-token')
    authApi.getStatus.mockResolvedValue({ data: { isSetup: true, isUnlocked: false } })

    const result = await store.checkStatus()

    expect(result.isSetup).toBe(true)
    expect(store.isSetup).toBe(true)
    expect(store.sessionToken).toBe('')
  })

  it('checkStatus keeps session if unlocked', async () => {
    store.setSession('old-token')
    authApi.getStatus.mockResolvedValue({ data: { isSetup: true, isUnlocked: true } })

    await store.checkStatus()

    expect(store.sessionToken).toBe('old-token')
  })

  it('setup calls api and sets session', async () => {
    authApi.setup.mockResolvedValue({ data: { sessionToken: 'new-tok' } })

    await store.setup('master123')

    expect(authApi.setup).toHaveBeenCalledWith('master123')
    expect(store.isSetup).toBe(true)
    expect(store.sessionToken).toBe('new-tok')
  })

  it('unlock calls api and sets session', async () => {
    authApi.unlock.mockResolvedValue({ data: { sessionToken: 'unlock-tok' } })

    await store.unlock('master123')

    expect(authApi.unlock).toHaveBeenCalledWith('master123')
    expect(store.sessionToken).toBe('unlock-tok')
  })

  it('lock calls api and clears session', async () => {
    store.setSession('tok')
    authApi.lock.mockResolvedValue({})

    await store.lock()

    expect(authApi.lock).toHaveBeenCalled()
    expect(store.sessionToken).toBe('')
  })

  it('changePassword calls api and updates session', async () => {
    authApi.changePassword.mockResolvedValue({ data: { sessionToken: 'changed-tok' } })

    await store.changePassword('old', 'new')

    expect(authApi.changePassword).toHaveBeenCalledWith('old', 'new')
    expect(store.sessionToken).toBe('changed-tok')
  })
})
