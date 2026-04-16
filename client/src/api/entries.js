import request from '@/utils/request.js'

export function getEntries(params = {}) {
  return request.get('/api/entries', { params })
}

export function getEntryById(id) {
  return request.get(`/api/entries/${id}`)
}

export function createEntry(data) {
  return request.post('/api/entries', data)
}

export function updateEntry(id, data) {
  return request.put(`/api/entries/${id}`, data)
}

export function deleteEntry(id) {
  return request.delete(`/api/entries/${id}`)
}

export function getHealthReport() {
  return request.get('/api/entries/health')
}
