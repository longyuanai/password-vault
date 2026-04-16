import { ref } from 'vue'

export function useClipboard(clearDelay = 30000) {
  const copied = ref(false)
  let timer = null

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        // 自动清除剪贴板
        try {
          await navigator.clipboard.writeText('')
        } catch {}
        copied.value = false
      }, clearDelay)
    } catch {
      copied.value = false
    }
  }

  return {
    copied,
    copy
  }
}
