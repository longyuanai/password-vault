var http = require('./request')

// ===== Auth =====
function getStatus() {
  return http.get('/api/auth/status')
}

function setup(masterPassword) {
  return http.post('/api/auth/setup', { masterPassword: masterPassword })
}

function unlock(masterPassword) {
  return http.post('/api/auth/unlock', { masterPassword: masterPassword })
}

function lock() {
  return http.post('/api/auth/lock')
}

function changePassword(oldPassword, newPassword) {
  return http.post('/api/auth/change-password', { oldPassword: oldPassword, newPassword: newPassword })
}

// ===== Entries =====
function getEntries(params) {
  return http.get('/api/entries', params || {})
}

function getEntryById(id) {
  return http.get('/api/entries/' + id)
}

function createEntry(data) {
  return http.post('/api/entries', data)
}

function updateEntry(id, data) {
  return http.put('/api/entries/' + id, data)
}

function deleteEntry(id) {
  return http.del('/api/entries/' + id)
}

function getHealthReport() {
  return http.get('/api/entries/health')
}

// ===== Tools =====
function generatePassword(options) {
  return http.post('/api/tools/generate-password', options || {})
}

function exportEntries(format) {
  return http.get('/api/tools/export', { format: format || 'json' })
}

function importEntries(entries, format) {
  return http.post('/api/tools/import', { entries: entries, format: format || 'json' })
}

module.exports = {
  getStatus: getStatus,
  setup: setup,
  unlock: unlock,
  lock: lock,
  changePassword: changePassword,
  getEntries: getEntries,
  getEntryById: getEntryById,
  createEntry: createEntry,
  updateEntry: updateEntry,
  deleteEntry: deleteEntry,
  getHealthReport: getHealthReport,
  generatePassword: generatePassword,
  exportEntries: exportEntries,
  importEntries: importEntries
}
