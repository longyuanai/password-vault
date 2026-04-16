<template>
  <div class="page-container">
    <div v-if="!entry" v-loading="true" style="min-height: 200px" />
    <template v-else>
      <div class="detail-header">
        <el-button text @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <div class="detail-actions">
          <el-button type="primary" @click="$router.push(`/entries/${entry.id}/edit`)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-popconfirm title="确定删除此条目？" confirm-button-text="删除" cancel-button-text="取消" @confirm="onDelete">
            <template #reference>
              <el-button type="danger">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <el-card>
        <template #header>
          <div class="card-title">
            <el-icon v-if="entry.favorite" color="#f56c6c"><StarFilled /></el-icon>
            <span>{{ entry.title }}</span>
            <el-tag v-if="entry.category" size="small" type="info">{{ entry.category }}</el-tag>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            <div class="field-row">
              <span>{{ entry.username || '—' }}</span>
              <el-button v-if="entry.username" text size="small" @click="copy(entry.username)">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="密码">
            <div class="field-row">
              <span :class="showPassword ? 'password-visible' : 'password-hidden'">
                {{ showPassword ? entry.password : '••••••••' }}
              </span>
              <el-button text size="small" @click="showPassword = !showPassword">
                <el-icon><View v-if="!showPassword" /><Hide v-else /></el-icon>
              </el-button>
              <el-button text size="small" @click="copy(entry.password)">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="entry.url" label="网址">
            <div class="field-row">
              <el-link :href="entry.url" target="_blank" type="primary">{{ entry.url }}</el-link>
              <el-button text size="small" @click="copy(entry.url)">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="entry.tags" label="标签">
            <el-tag v-for="tag in entry.tags.split(',')" :key="tag" size="small" style="margin-right: 4px">
              {{ tag.trim() }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="entry.notes" label="备注">
            <span style="white-space: pre-wrap">{{ entry.notes }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(entry.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(entry.updated_at) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-alert v-if="copied" title="已复制到剪贴板" type="success" show-icon :closable="false" style="margin-top: 12px" />
    </template>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, Delete, StarFilled, DocumentCopy, View, Hide } from '@element-plus/icons-vue'
import { useEntriesStore } from '@/stores/entries.js'
import { useClipboard } from '@/composables/useClipboard.js'
import { formatDate } from '@/utils/helpers.js'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const { copied, copy } = useClipboard()
const showPassword = ref(false)

const entry = computed(() => entriesStore.currentEntry)

async function onDelete() {
  await entriesStore.remove(route.params.id)
  router.push('/')
}

onMounted(() => {
  entriesStore.fetchById(route.params.id)
})
</script>
<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.detail-actions {
  display: flex;
  gap: 8px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
