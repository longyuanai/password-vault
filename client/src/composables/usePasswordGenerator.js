import { ref } from 'vue'
import { generatePassword as generatePasswordApi } from '@/api/tools.js'

export function usePasswordGenerator() {
  const password = ref('')
  const strength = ref('')
  const loading = ref(false)

  async function generate(options = {}) {
    loading.value = true
    try {
      const res = await generatePasswordApi(options)
      password.value = res.data.password
      strength.value = res.data.strength
    } finally {
      loading.value = false
    }
  }

  return {
    password,
    strength,
    loading,
    generate
  }
}
