<template>
  <el-input
    v-model="keyword"
    placeholder="搜索密码条目..."
    clearable
    :prefix-icon="Search"
    style="max-width: 320px"
    @input="onInput"
    @clear="emit('search', '')"
  />
</template>
<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { debounce } from '@/utils/helpers.js'

const emit = defineEmits(['search'])
const keyword = ref('')

const onInput = debounce((val) => {
  emit('search', val)
}, 300)
</script>
