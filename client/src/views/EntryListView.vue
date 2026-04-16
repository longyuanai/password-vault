<template>
  <div class="page-container">
    <div class="list-header">
      <h2>密码列表</h2>
    </div>
    <div class="list-toolbar">
      <SearchBar @search="onSearch" />
      <CategoryFilter :categories="categories" @select="onCategorySelect" />
    </div>
    <div v-loading="loadingList" class="list-body">
      <el-empty v-if="!loadingList && entriesStore.entries.length === 0" description="暂无密码条目" />
      <div v-else class="entry-grid">
        <EntryCard
          v-for="entry in entriesStore.entries"
          :key="entry.id"
          :entry="entry"
          @click="$router.push(`/entries/${entry.id}`)"
        />
      </div>
      <div v-if="entriesStore.pagination.totalPages > 1" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="entriesStore.pagination.limit"
          :total="entriesStore.pagination.total"
          layout="prev, pager, next"
          @current-change="onPageChange"
        />
      </div>
    </div>
    <el-button
      type="primary"
      :icon="Plus"
      size="large"
      circle
      class="fab-button"
      @click="$router.push('/entries/new')"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useEntriesStore } from '@/stores/entries.js'
import SearchBar from '@/components/SearchBar.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import EntryCard from '@/components/EntryCard.vue'

const entriesStore = useEntriesStore()
const loadingList = ref(false)
const currentPage = ref(1)

const categories = computed(() => {
  const cats = new Set(entriesStore.entries.map(e => e.category).filter(Boolean))
  return [...cats]
})

async function loadEntries() {
  loadingList.value = true
  try {
    await entriesStore.fetchList({ page: currentPage.value })
  } finally {
    loadingList.value = false
  }
}

function onSearch(keyword) {
  entriesStore.setFilters({ search: keyword })
  currentPage.value = 1
  loadEntries()
}

function onCategorySelect(cat) {
  entriesStore.setFilters({ category: cat })
  currentPage.value = 1
  loadEntries()
}

function onPageChange(page) {
  currentPage.value = page
  loadEntries()
}

onMounted(() => loadEntries())
</script>
<style scoped>
.list-header {
  margin-bottom: 16px;
}
.list-header h2 {
  margin: 0;
  font-size: 22px;
}
.list-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
