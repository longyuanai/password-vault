import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth.js'

const SESSION_KEY = 'session_token'

export const useAuthStore = defineStore('auth', () => {
  const sessionToken = ref(sessionStorage.getItem(SESSION_KEY) || '')
  const isSetup = ref(false)
  const isUnlocked = computed(() => !!sessionToken.value)

  function setSession(token) {
    sessionToken.value = token
    sessionStorage.setItem(SESSION_KEY, token)
  }

  function clearSession() {
    sessionToken.value = ''
    sessionStorage.removeItem(SESSION_KEY)
  }

  async function checkStatus() {
    const res = await authApi.getStatus()
    isSetup.value = res.data.isSetup
    // 如果后端已经不是 unlocked 状态，清除本地 session
    if (!res.data.isUnlocked) {
      clearSession()
    }
    return res.data
  }

  async function setup(masterPassword) {
    const res = await authApi.setup(masterPassword)
    isSetup.value = true
    setSession(res.data.sessionToken)
    return res
  }

  async function unlock(masterPassword) {
    const res = await authApi.unlock(masterPassword)
    setSession(res.data.sessionToken)
    return res
  }

  async function lock() {
    await authApi.lock()
    clearSession()
  }

  async function changePassword(oldPassword, newPassword) {
    const res = await authApi.changePassword(oldPassword, newPassword)
    setSession(res.data.sessionToken)
    return res
  }

  return {
    sessionToken,
    isSetup,
    isUnlocked,
    setSession,
    clearSession,
    checkStatus,
    setup,
    unlock,
    lock,
    changePassword
  }
})
