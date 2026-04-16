<template>
  <el-radio-group v-model="selected" size="small" @change="onSelect">
    <el-radio-button value="">全部</el-radio-button>
    <el-radio-button v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</el-radio-button>
  </el-radio-group>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])
const selected = ref('')

function onSelect(val) {
  emit('select', val)
}
</script>
