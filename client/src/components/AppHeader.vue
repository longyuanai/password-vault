<template>
  <el-header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <el-icon :size="24"><Lock /></el-icon>
        <span class="logo-text">密码保险库</span>
      </router-link>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        :ellipsis="false"
        router
        class="header-menu"
      >
        <el-menu-item index="/">
          <el-icon><List /></el-icon>密码列表
        </el-menu-item>
        <el-menu-item index="/generator">
          <el-icon><MagicStick /></el-icon>生成器
        </el-menu-item>
        <el-menu-item index="/health">
          <el-icon><Odometer /></el-icon>健康检查
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>设置
        </el-menu-item>
      </el-menu>
      <el-button type="warning" plain @click="handleLock" class="lock-btn">
        <el-icon><Lock /></el-icon>锁定
      </el-button>
    </div>
  </el-header>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Lock, List, MagicStick, Odometer, Setting } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const { handleLock } = useAuth()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/entries') || path === '/') return '/'
  if (path.startsWith('/generator')) return '/generator'
  if (path.startsWith('/health')) return '/health'
  if (path.startsWith('/settings')) return '/settings'
  return path
})
</script>
<style scoped>
.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: var(--header-height);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.header-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #409eff;
  margin-right: 24px;
  flex-shrink: 0;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
}
.header-menu {
  flex: 1;
  border-bottom: none !important;
}
.lock-btn {
  flex-shrink: 0;
  margin-left: 12px;
}
</style>
