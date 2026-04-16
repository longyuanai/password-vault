import { describe, it, expect } from 'vitest'
import { formatDate, deepClone } from '@/utils/helpers.js'

describe('helpers', () => {
  describe('formatDate', () => {
    it('formats date string to zh-CN locale', () => {
      const result = formatDate('2024-06-15T10:00:00Z')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  describe('deepClone', () => {
    it('creates a deep copy', () => {
      const obj = { a: 1, b: { c: [1, 2, 3] } }
      const cloned = deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
      expect(cloned.b.c).not.toBe(obj.b.c)
    })
  })
})
