<template>
  <div class="page-container">
    <h2 style="margin-bottom: 16px">密码健康检查</h2>
    <div v-if="!report" v-loading="loadingHealth" style="min-height: 200px" />
    <template v-else>
      <div class="score-section">
        <el-progress type="dashboard" :percentage="report.score" :color="scoreColor" :width="150">
          <template #default="{ percentage }">
            <span class="score-text">{{ percentage }}</span>
            <span class="score-label">健康分数</span>
          </template>
        </el-progress>
        <p class="total-text">共 {{ report.total }} 个密码条目</p>
      </div>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="health-card">
            <template #header>
              <span class="health-card-title" style="color: #f56c6c">
                <el-icon><WarningFilled /></el-icon> 弱密码 ({{ report.weak?.length || 0 }})
              </span>
            </template>
            <div v-if="!report.weak?.length" class="health-empty">无弱密码</div>
            <div v-for="entry in report.weak" :key="entry.id" class="health-item" @click="$router.push(`/entries/${entry.id}`)">
              {{ entry.title }}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="health-card">
            <template #header>
              <span class="health-card-title" style="color: #e6a23c">
                <el-icon><WarningFilled /></el-icon> 重复密码 ({{ report.reused?.length || 0 }})
              </span>
            </template>
            <div v-if="!report.reused?.length" class="health-empty">无重复密码</div>
            <div v-for="(group, idx) in report.reused" :key="idx" class="health-group">
              <el-tag v-for="entry in group" :key="entry.id" size="small" class="health-tag" @click="$router.push(`/entries/${entry.id}`)">
                {{ entry.title }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="health-card">
            <template #header>
              <span class="health-card-title" style="color: #909399">
                <el-icon><Clock /></el-icon> 老旧密码 ({{ report.old?.length || 0 }})
              </span>
            </template>
            <div v-if="!report.old?.length" class="health-empty">无老旧密码</div>
            <div v-for="entry in report.old" :key="entry.id" class="health-item" @click="$router.push(`/entries/${entry.id}`)">
              {{ entry.title }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import { WarningFilled, Clock } from '@element-plus/icons-vue'
import { useHealthStore } from '@/stores/health.js'

const healthStore = useHealthStore()
const loadingHealth = ref(false)
const report = computed(() => healthStore.healthReport)

const scoreColor = computed(() => {
  const s = report.value?.score || 0
  if (s >= 80) return '#67c23a'
  if (s >= 50) return '#e6a23c'
  return '#f56c6c'
})

onMounted(async () => {
  loadingHealth.value = true
  try {
    await healthStore.fetchHealth()
  } finally {
    loadingHealth.value = false
  }
})
</script>
<style scoped>
.score-section {
  text-align: center;
  margin-bottom: 24px;
}
.score-text {
  font-size: 32px;
  font-weight: 700;
}
.score-label {
  display: block;
  font-size: 13px;
  color: #909399;
}
.total-text {
  color: #909399;
  margin-top: 8px;
}
.health-card {
  margin-bottom: 16px;
}
.health-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.health-empty {
  color: #c0c4cc;
  text-align: center;
  padding: 12px 0;
}
.health-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.health-item:hover {
  color: #409eff;
}
.health-item:last-child {
  border-bottom: none;
}
.health-group {
  padding: 6px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.health-tag {
  cursor: pointer;
}
</style>
