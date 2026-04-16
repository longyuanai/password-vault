<template>
  <el-container class="app-layout">
    <AppHeader />
    <el-main class="app-main">
      <router-view />
    </el-main>
    <AppFooter />
  </el-container>
</template>
<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAutoLock } from '@/composables/useAutoLock.js'

useAutoLock()
</script>
<style scoped>
.app-layout {
  min-height: 100vh;
  flex-direction: column;
}
.app-main {
  flex: 1;
  padding: 0;
}
</style>
