import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path: '/setup',
    name: 'Setup',
    component: () => import('@/views/SetupView.vue'),
    meta: { guest: true }
  },
  {
    path: '/unlock',
    name: 'Unlock',
    component: () => import('@/views/UnlockView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/EntryListView.vue')
      },
      {
        path: 'entries/new',
        name: 'EntryNew',
        component: () => import('@/views/EntryFormView.vue')
      },
      {
        path: 'entries/:id',
        name: 'EntryDetail',
        component: () => import('@/views/EntryDetailView.vue')
      },
      {
        path: 'entries/:id/edit',
        name: 'EntryEdit',
        component: () => import('@/views/EntryFormView.vue')
      },
      {
        path: 'generator',
        name: 'Generator',
        component: () => import('@/views/GeneratorView.vue')
      },
      {
        path: 'health',
        name: 'Health',
        component: () => import('@/views/HealthView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 每次路由跳转检查状态
  try {
    await authStore.checkStatus()
  } catch {
    // 后端不可达时放行，让页面自行处理
  }

  const { isSetup, isUnlocked } = authStore

  // 未初始化 → 跳转 /setup
  if (!isSetup && to.name !== 'Setup') {
    return next({ name: 'Setup' })
  }

  // 已初始化但未解锁 → 跳转 /unlock
  if (isSetup && !isUnlocked && to.meta.requiresAuth) {
    return next({ name: 'Unlock', query: { redirect: to.fullPath } })
  }

  // 已解锁访问 guest 页面 → 跳转首页
  if (isUnlocked && to.meta.guest) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
