<template>
  <div class="strength-bar" v-if="strength">
    <el-progress :percentage="percentage" :color="color" :stroke-width="8" :show-text="false" />
    <span class="strength-label" :style="{ color }">{{ label }}</span>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  strength: {
    type: String,
    default: ''
  }
})

const strengthMap = {
  weak: { percentage: 25, color: '#f56c6c', label: '弱' },
  medium: { percentage: 50, color: '#e6a23c', label: '中' },
  strong: { percentage: 75, color: '#409eff', label: '强' },
  very_strong: { percentage: 100, color: '#67c23a', label: '非常强' }
}

const info = computed(() => strengthMap[props.strength] || { percentage: 0, color: '#c0c4cc', label: '' })
const percentage = computed(() => info.value.percentage)
const color = computed(() => info.value.color)
const label = computed(() => info.value.label)
</script>
<style scoped>
.strength-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}
.strength-bar .el-progress {
  flex: 1;
}
.strength-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
</style>
