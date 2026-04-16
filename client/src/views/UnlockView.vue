<template>
  <div class="centered-card-container">
    <el-card class="centered-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="32" color="#409eff"><Unlock /></el-icon>
          <h2>解锁保险库</h2>
        </div>
      </template>
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px" />
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input
            v-model="masterPassword"
            type="password"
            placeholder="输入主密码"
            show-password
            size="large"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="onSubmit">
            解锁
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { Unlock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth.js'

const { loading, error, handleUnlock } = useAuth()
const masterPassword = ref('')

function onSubmit() {
  if (!masterPassword.value) return
  handleUnlock(masterPassword.value)
}
</script>
<style scoped>
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.card-header h2 {
  margin: 0;
  font-size: 20px;
}
</style>
