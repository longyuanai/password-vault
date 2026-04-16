<template>
  <el-card shadow="hover" class="entry-card" @click="$emit('click')">
    <div class="entry-card-body">
      <div class="entry-info">
        <div class="entry-title">
          <el-icon v-if="entry.favorite" color="#f56c6c" style="margin-right: 4px"><StarFilled /></el-icon>
          <span>{{ entry.title }}</span>
        </div>
        <div class="entry-meta">
          <span v-if="entry.username" class="meta-text">{{ entry.username }}</span>
        </div>
      </div>
      <el-tag v-if="entry.category" size="small" type="info">{{ entry.category }}</el-tag>
    </div>
  </el-card>
</template>
<script setup>
import { StarFilled } from '@element-plus/icons-vue'

defineEmits(['click'])

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})
</script>
<style scoped>
.entry-card {
  cursor: pointer;
  transition: transform 0.15s;
}
.entry-card:hover {
  transform: translateY(-2px);
}
.entry-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.entry-info {
  flex: 1;
  min-width: 0;
}
.entry-title {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.entry-meta {
  margin-top: 4px;
}
.meta-text {
  color: #909399;
  font-size: 13px;
}
</style>
