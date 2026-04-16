<template>
  <div class="page-container">
    <h2 style="margin-bottom: 16px">设置</h2>

    <el-card header="修改主密码" style="margin-bottom: 16px">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px" />
      <el-alert v-if="pwdSuccess" title="主密码修改成功" type="success" show-icon :closable="false" style="margin-bottom: 16px" />
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-position="top">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onChangePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card header="数据管理">
      <div class="data-actions">
        <div class="data-action-item">
          <p>导出所有密码条目</p>
          <el-button @click="onExport('json')">导出 JSON</el-button>
          <el-button @click="onExport('csv')">导出 CSV</el-button>
        </div>
        <el-divider />
        <div class="data-action-item">
          <p>导入密码条目</p>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json"
            :on-change="onFileChange"
          >
            <el-button>选择 JSON 文件</el-button>
          </el-upload>
          <el-button type="primary" :loading="importing" :disabled="!importFile" @click="onImport" style="margin-top: 8px">
            确认导入
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/composables/useAuth.js'
import { exportEntries, importEntries } from '@/api/tools.js'

const { loading, error, handleChangePassword } = useAuth()
const pwdFormRef = ref()
const pwdSuccess = ref(false)
const importing = ref(false)
const importFile = ref(null)
const uploadRef = ref()

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于 8 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function onChangePassword() {
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) return
  pwdSuccess.value = false
  await handleChangePassword(pwdForm.oldPassword, pwdForm.newPassword)
  if (!error.value) {
    pwdSuccess.value = true
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  }
}

async function onExport(format) {
  try {
    const res = await exportEntries(format)
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `passwords-export.${format}`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

function onFileChange(file) {
  importFile.value = file.raw
}

async function onImport() {
  if (!importFile.value) return
  importing.value = true
  try {
    const text = await importFile.value.text()
    const entries = JSON.parse(text)
    await importEntries(Array.isArray(entries) ? entries : entries.data || [], 'json')
    ElMessage.success('导入成功')
    importFile.value = null
    uploadRef.value?.clearFiles()
  } catch {
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}
</script>
<style scoped>
.data-actions {
  padding: 4px 0;
}
.data-action-item p {
  margin: 0 0 8px;
  color: #606266;
}
</style>
