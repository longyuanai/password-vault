<template>
  <div class="centered-card-container">
    <el-card class="centered-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="32" color="#409eff"><Lock /></el-icon>
          <h2>初始化密码保险库</h2>
        </div>
      </template>
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px" />
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="设置主密码" prop="masterPassword">
          <el-input
            v-model="form.masterPassword"
            type="password"
            placeholder="至少 8 个字符"
            show-password
            size="large"
          />
        </el-form-item>
        <el-form-item label="确认主密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入主密码"
            show-password
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="onSubmit">
            创建保险库
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth.js'

const { loading, error, handleSetup } = useAuth()
const formRef = ref()
const form = reactive({
  masterPassword: '',
  confirmPassword: ''
})

const rules = {
  masterPassword: [
    { required: true, message: '请输入主密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于 8 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认主密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.masterPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function onSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  await handleSetup(form.masterPassword)
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
