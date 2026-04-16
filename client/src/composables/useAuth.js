import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ref } from 'vue'

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref(null)

  async function handleSetup(masterPassword) {
    loading.value = true
    error.value = null
    try {
      await authStore.setup(masterPassword)
      router.push('/')
    } catch (err) {
      error.value = err.error?.message || '设置失败'
    } finally {
      loading.value = false
    }
  }

  async function handleUnlock(masterPassword) {
    loading.value = true
    error.value = null
    try {
      await authStore.unlock(masterPassword)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } catch (err) {
      error.value = err.error?.message || '解锁失败'
    } finally {
      loading.value = false
    }
  }

  async function handleLock() {
    await authStore.lock()
    router.push({ name: 'Unlock' })
  }

  async function handleChangePassword(oldPassword, newPassword) {
    loading.value = true
    error.value = null
    try {
      await authStore.changePassword(oldPassword, newPassword)
    } catch (err) {
      error.value = err.error?.message || '修改密码失败'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    handleSetup,
    handleUnlock,
    handleLock,
    handleChangePassword
  }
}
