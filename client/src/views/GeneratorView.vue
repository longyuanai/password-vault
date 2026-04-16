<template>
  <div class="page-container">
    <h2 style="margin-bottom: 16px">密码生成器</h2>
    <el-card>
      <el-form label-position="top">
        <el-form-item label="密码长度">
          <el-slider v-model="options.length" :min="6" :max="64" show-input />
        </el-form-item>
        <el-form-item label="字符类型">
          <el-checkbox v-model="options.uppercase">大写字母 (A-Z)</el-checkbox>
          <el-checkbox v-model="options.lowercase">小写字母 (a-z)</el-checkbox>
          <el-checkbox v-model="options.numbers">数字 (0-9)</el-checkbox>
          <el-checkbox v-model="options.symbols">特殊符号 (!@#$...)</el-checkbox>
        </el-form-item>
        <el-form-item label="排除字符">
          <el-input v-model="options.excludeChars" placeholder="输入需要排除的字符" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onGenerate">生成密码</el-button>
        </el-form-item>
      </el-form>

      <template v-if="password">
        <el-divider />
        <div class="result-area">
          <div class="password-display">
            <code>{{ password }}</code>
          </div>
          <div class="result-actions">
            <PasswordStrengthBar :strength="strength" />
            <el-button type="success" @click="copy(password)" :disabled="copied">
              {{ copied ? '已复制' : '复制密码' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { usePasswordGenerator } from '@/composables/usePasswordGenerator.js'
import { useClipboard } from '@/composables/useClipboard.js'
import PasswordStrengthBar from '@/components/PasswordStrengthBar.vue'

const { password, strength, loading, generate } = usePasswordGenerator()
const { copied, copy } = useClipboard()

const options = reactive({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeChars: ''
})

function onGenerate() {
  generate({ ...options })
}
</script>
<style scoped>
.result-area {
  text-align: center;
}
.password-display {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.password-display code {
  font-size: 20px;
  word-break: break-all;
  color: #303133;
}
.result-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
</style>
