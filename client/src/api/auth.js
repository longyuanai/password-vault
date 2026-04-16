import request from '@/utils/request.js'

export function getStatus() {
  return request.get('/api/auth/status')
}

export function setup(masterPassword) {
  return request.post('/api/auth/setup', { masterPassword })
}

export function unlock(masterPassword) {
  return request.post('/api/auth/unlock', { masterPassword })
}

export function lock() {
  return request.post('/api/auth/lock')
}

export function changePassword(oldPassword, newPassword) {
  return request.post('/api/auth/change-password', { oldPassword, newPassword })
}
