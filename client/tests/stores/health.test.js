import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHealthStore } from '@/stores/health.js'

vi.mock('@/api/entries.js', () => ({
  getHealthReport: vi.fn()
}))

import { getHealthReport } from '@/api/entries.js'

describe('health store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useHealthStore()
    vi.clearAllMocks()
  })

  it('initial state', () => {
    expect(store.healthReport).toBeNull()
  })

  it('fetchHealth sets healthReport', async () => {
    const report = {
      score: 75,
      weakPasswords: [],
      reusedPasswords: [],
      oldPasswords: []
    }
    getHealthReport.mockResolvedValue({ data: report })

    await store.fetchHealth()

    expect(store.healthReport).toEqual(report)
    expect(getHealthReport).toHaveBeenCalled()
  })
})
