<template>
  <div class="page-container">
    <div class="form-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h2>{{ isEdit ? '编辑条目' : '新建条目' }}</h2>
    </div>

    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="例如：GitHub 账号" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名或邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <div class="password-input-row">
            <el-input v-model="form.password" type="password" show-password placeholder="密码" />
            <el-button @click="onGenerate" :loading="genLoading">生成密码</el-button>
          </div>
          <PasswordStrengthBar v-if="genStrength" :strength="genStrength" style="margin-top: 8px" />
        </el-form-item>
        <el-form-item label="网址" prop="url">
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" filterable allow-create clearable placeholder="选择或输入分类" style="width: 100%">
            <el-option v-for="cat in commonCategories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="用英文逗号分隔，例如：工作,重要" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="备注信息" />
        </el-form-item>
        <el-form-item label="收藏">
          <el-switch v-model="form.favorite" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="submitting" @click="onSubmit">
            {{ isEdit ? '保存修改' : '创建条目' }}
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEntriesStore } from '@/stores/entries.js'
import { usePasswordGenerator } from '@/composables/usePasswordGenerator.js'
import PasswordStrengthBar from '@/components/PasswordStrengthBar.vue'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const { password: genPassword, strength: genStrength, loading: genLoading, generate } = usePasswordGenerator()
const formRef = ref()
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  username: '',
  password: '',
  url: '',
  category: '',
  tags: '',
  notes: '',
  favorite: false
})

const commonCategories = ['社交媒体', '邮箱', '工作', '购物', '金融', '游戏', '其他']

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function onGenerate() {
  await generate()
  form.password = genPassword.value
}

async function onSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await entriesStore.update(route.params.id, { ...form })
      ElMessage.success('修改成功')
    } else {
      await entriesStore.create({ ...form })
      ElMessage.success('创建成功')
    }
    router.push('/')
  } catch (err) {
    ElMessage.error(err.error?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    await entriesStore.fetchById(route.params.id)
    const entry = entriesStore.currentEntry
    if (entry) {
      Object.assign(form, {
        title: entry.title || '',
        username: entry.username || '',
        password: entry.password || '',
        url: entry.url || '',
        category: entry.category || '',
        tags: entry.tags || '',
        notes: entry.notes || '',
        favorite: !!entry.favorite
      })
    }
  }
})
</script>
<style scoped>
.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.form-header h2 {
  margin: 0;
  font-size: 20px;
}
.password-input-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.password-input-row .el-input {
  flex: 1;
}
</style>
