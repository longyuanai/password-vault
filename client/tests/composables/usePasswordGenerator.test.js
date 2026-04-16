import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePasswordGenerator } from '@/composables/usePasswordGenerator.js'

vi.mock('@/api/tools.js', () => ({
  generatePassword: vi.fn()
}))

import { generatePassword } from '@/api/tools.js'

describe('usePasswordGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initial state', () => {
    const { password, strength, loading } = usePasswordGenerator()
    expect(password.value).toBe('')
    expect(strength.value).toBe('')
    expect(loading.value).toBe(false)
  })

  it('generate updates password and strength', async () => {
    generatePassword.mockResolvedValue({
      data: { password: 'Abc123!@#', strength: 'strong' }
    })

    const { password, strength, loading, generate } = usePasswordGenerator()

    await generate({ length: 12 })

    expect(generatePassword).toHaveBeenCalledWith({ length: 12 })
    expect(password.value).toBe('Abc123!@#')
    expect(strength.value).toBe('strong')
    expect(loading.value).toBe(false)
  })

  it('loading is true during generation', async () => {
    let resolvePromise
    generatePassword.mockReturnValue(new Promise(r => { resolvePromise = r }))

    const { loading, generate } = usePasswordGenerator()

    const p = generate()
    expect(loading.value).toBe(true)

    resolvePromise({ data: { password: 'x', strength: 'weak' } })
    await p
    expect(loading.value).toBe(false)
  })
})
