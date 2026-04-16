import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

export function useAutoLock(timeoutMinutes = 30) {
  const authStore = useAuthStore()
  let timer = null
  const timeoutMs = timeoutMinutes * 60 * 1000

  function resetTimer() {
    if (timer) clearTimeout(timer)
    if (authStore.isUnlocked) {
      timer = setTimeout(() => {
        authStore.lock()
      }, timeoutMs)
    }
  }

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

  onMounted(() => {
    events.forEach(event => document.addEventListener(event, resetTimer))
    resetTimer()
  })

  onUnmounted(() => {
    events.forEach(event => document.removeEventListener(event, resetTimer))
    if (timer) clearTimeout(timer)
  })
}
