import request from '@/utils/request.js'

export function generatePassword(options = {}) {
  return request.post('/api/tools/generate-password', options)
}

export function exportEntries(format = 'json') {
  return request.get('/api/tools/export', { params: { format } })
}

export function importEntries(entries, format = 'json') {
  return request.post('/api/tools/import', { entries, format })
}
