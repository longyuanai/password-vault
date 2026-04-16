import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getHealthReport } from '@/api/entries.js'

export const useHealthStore = defineStore('health', () => {
  const healthReport = ref(null)

  async function fetchHealth() {
    const res = await getHealthReport()
    healthReport.value = res.data
    return res
  }

  return {
    healthReport,
    fetchHealth
  }
})
