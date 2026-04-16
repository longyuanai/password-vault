import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntriesStore } from '@/stores/entries.js'

vi.mock('@/api/entries.js', () => ({
  getEntries: vi.fn(),
  getEntryById: vi.fn(),
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getHealthReport: vi.fn()
}))

import * as entriesApi from '@/api/entries.js'

describe('entries store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEntriesStore()
    vi.clearAllMocks()
  })

  it('initial state', () => {
    expect(store.entries).toEqual([])
    expect(store.currentEntry).toBeNull()
    expect(store.pagination.page).toBe(1)
    expect(store.filters).toEqual({ search: '', category: '' })
  })

  it('fetchList updates entries and pagination', async () => {
    const mockData = {
      entries: [{ id: 1, title: 'Test' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
    }
    entriesApi.getEntries.mockResolvedValue({ data: mockData })

    await store.fetchList()

    expect(store.entries).toEqual(mockData.entries)
    expect(store.pagination.total).toBe(1)
  })

  it('fetchList merges filters and params', async () => {
    const mockData = { entries: [], pagination: { page: 2, limit: 20, total: 0, totalPages: 0 } }
    entriesApi.getEntries.mockResolvedValue({ data: mockData })

    store.setFilters({ search: 'gmail' })
    await store.fetchList({ page: 2 })

    expect(entriesApi.getEntries).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'gmail', page: 2 })
    )
  })

  it('fetchById sets currentEntry', async () => {
    const entry = { id: 1, title: 'GitHub', username: 'user' }
    entriesApi.getEntryById.mockResolvedValue({ data: entry })

    await store.fetchById(1)

    expect(store.currentEntry).toEqual(entry)
    expect(entriesApi.getEntryById).toHaveBeenCalledWith(1)
  })

  it('create calls api', async () => {
    const newEntry = { title: 'New', password: '123' }
    entriesApi.createEntry.mockResolvedValue({ data: { id: 1, ...newEntry } })

    await store.create(newEntry)

    expect(entriesApi.createEntry).toHaveBeenCalledWith(newEntry)
  })

  it('update calls api with id and data', async () => {
    entriesApi.updateEntry.mockResolvedValue({ data: {} })

    await store.update(1, { title: 'Updated' })

    expect(entriesApi.updateEntry).toHaveBeenCalledWith(1, { title: 'Updated' })
  })

  it('remove calls api', async () => {
    entriesApi.deleteEntry.mockResolvedValue({ data: {} })

    await store.remove(1)

    expect(entriesApi.deleteEntry).toHaveBeenCalledWith(1)
  })

  it('setFilters merges with existing filters', () => {
    store.setFilters({ search: 'test' })
    expect(store.filters).toEqual({ search: 'test', category: '' })

    store.setFilters({ category: 'social' })
    expect(store.filters).toEqual({ search: 'test', category: 'social' })
  })
})
