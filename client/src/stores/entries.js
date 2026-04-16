import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as entriesApi from '@/api/entries.js'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref([])
  const currentEntry = ref(null)
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const filters = ref({ search: '', category: '' })

  async function fetchList(params = {}) {
    const query = { ...filters.value, ...pagination.value, ...params }
    const res = await entriesApi.getEntries(query)
    entries.value = res.data.entries
    pagination.value = res.data.pagination
    return res
  }

  async function fetchById(id) {
    const res = await entriesApi.getEntryById(id)
    currentEntry.value = res.data
    return res
  }

  async function create(data) {
    const res = await entriesApi.createEntry(data)
    return res
  }

  async function update(id, data) {
    const res = await entriesApi.updateEntry(id, data)
    return res
  }

  async function remove(id) {
    const res = await entriesApi.deleteEntry(id)
    return res
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    entries,
    currentEntry,
    pagination,
    filters,
    fetchList,
    fetchById,
    create,
    update,
    remove,
    setFilters
  }
})
