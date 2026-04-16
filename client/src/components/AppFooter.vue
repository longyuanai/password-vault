<template>
  <el-footer class="app-footer">
    <span>密码保险库 &copy; {{ year }}</span>
  </el-footer>
</template>
<script setup>
const year = new Date().getFullYear()
</script>
<style scoped>
.app-footer {
  height: var(--footer-height);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}
</style>
