import { describe, it, expect, vi, beforeEach } from 'vitest'

const writeText = vi.fn()

Object.assign(navigator, {
  clipboard: { writeText }
})

// Must import after mocking navigator
const { useClipboard } = await import('@/composables/useClipboard.js')

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('copy sets copied to true', async () => {
    writeText.mockResolvedValue(undefined)
    const { copied, copy } = useClipboard()

    await copy('hello')

    expect(copied.value).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('copied resets after delay', async () => {
    writeText.mockResolvedValue(undefined)
    const { copied, copy } = useClipboard(1000)

    await copy('hello')
    expect(copied.value).toBe(true)

    vi.advanceTimersByTime(1000)
    // The timeout calls an async fn; flush microtasks
    await vi.runAllTimersAsync()

    expect(copied.value).toBe(false)
  })

  it('copy failure sets copied to false', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    const { copied, copy } = useClipboard()

    await copy('hello')

    expect(copied.value).toBe(false)
  })
})
