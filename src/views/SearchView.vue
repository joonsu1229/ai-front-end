<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">하이브리드 검색</h1>
      <p class="text-lg text-gray-600">키워드 검색과 의미적 검색을 결합한 스마트 검색</p>
    </div>

    <!-- Search Section -->
    <div class="search-card max-w-4xl mx-auto">
      <!-- Search Input -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1">
          <n-input
            v-model:value="searchQuery"
            size="large"
            placeholder="검색어를 입력하세요..."
            @keydown.enter="handleSearch"
            :loading="searchStore.isLoading"
          >
            <template #prefix>
              <n-icon :size="18">
                <SearchOutline />
              </n-icon>
            </template>
          </n-input>
        </div>
        
        <div class="flex gap-2">
          <n-select
            v-model:value="selectedCategory"
            :options="searchStore.categories"
            placeholder="카테고리"
            class="w-40"
            clearable
          />
          
          <n-button
            type="primary"
            size="large"
            @click="handleSearch"
            :loading="searchStore.isLoading"
            :disabled="!searchQuery.trim()"
          >
            <template #icon>
              <n-icon>
                <SearchOutline />
              </n-icon>
            </template>
            검색
          </n-button>
        </div>
      </div>

      <!-- Search Options -->
      <div class="flex flex-wrap gap-4 items-center mb-4">
        <n-radio-group v-model:value="searchType" size="large">
          <n-radio-button value="hybrid">Hybrid</n-radio-button>
          <n-radio-button value="semantic">Semantic</n-radio-button>
          <n-radio-button value="lexical">Lexical </n-radio-button>
          <n-radio-button value="advanced">고급</n-radio-button>
          <!-- <n-radio-button value="boolean">Boolean</n-radio-button> -->
        </n-radio-group>

        <n-button text @click="showAdvancedOptions = !showAdvancedOptions">
          <template #icon>
            <n-icon>
              <SettingsOutline />
            </n-icon>
          </template>
          고급 옵션
        </n-button>
      </div>

      <!-- Advanced Options -->
      <n-collapse-transition :show="showAdvancedOptions">
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div v-if="searchType === 'advanced'" class="space-y-4">
            <div class="flex gap-4">
              <n-checkbox v-model:checked="searchOptions.useFuzzy">
                퍼지 검색 (오타 허용)
              </n-checkbox>
              <n-checkbox v-model:checked="searchOptions.usePhrase">
                구문 검색 (정확한 구문)
              </n-checkbox>
            </div>
          </div>

          <div v-else-if="searchType === 'boolean'" class="space-y-4">
            <div>
              <n-text class="text-sm font-medium mb-2 block">반드시 포함 (AND)</n-text>
              <n-dynamic-tags v-model:value="booleanOptions.mustHave" />
            </div>
            <div>
              <n-text class="text-sm font-medium mb-2 block">포함하면 좋음 (OR)</n-text>
              <n-dynamic-tags v-model:value="booleanOptions.shouldHave" />
            </div>
            <div>
              <n-text class="text-sm font-medium mb-2 block">제외 (NOT)</n-text>
              <n-dynamic-tags v-model:value="booleanOptions.mustNotHave" />
            </div>
          </div>

          <div class="flex items-center gap-4 mt-4">
            <div class="flex items-center gap-2">
              <n-text class="text-sm">결과 수:</n-text>
              <n-input-number
                v-model:value="searchOptions.limit"
                :min="1"
                :max="50"
                size="small"
                class="w-20"
              />
            </div>
          </div>
        </div>
      </n-collapse-transition>

      <!-- Search History -->
      <div v-if="searchStore.searchHistory.length > 0" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <n-text class="text-sm font-medium">최근 검색</n-text>
          <n-button text size="tiny" @click="searchStore.clearHistory">
            지우기
          </n-button>
        </div>
        <div class="flex flex-wrap gap-2">
          <n-tag
            v-for="(item, index) in searchStore.searchHistory.slice(0, 5)"
            :key="index"
            size="small"
            closable
            @close="removeFromHistory(index)"
            @click="applyHistorySearch(item)"
            class="cursor-pointer hover:bg-primary-50"
          >
            {{ item.query }}
            <template #avatar>
              <n-icon :size="12">
                <SearchOutline />
              </n-icon>
            </template>
          </n-tag>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchStore.hasResults || searchStore.isLoading" class="max-w-4xl mx-auto">
      <!-- Results Header -->
      <div v-if="!searchStore.isLoading" class="flex justify-between items-center mb-4">
        <div>
          <n-text class="text-lg font-medium">
            검색 결과: {{ searchStore.totalResults }}개
          </n-text>
          <n-text class="text-sm text-gray-500 ml-2">
            ({{ searchStore.searchTime }}ms)
          </n-text>
        </div>
        <div class="flex items-center gap-2">
          <n-text class="text-sm text-gray-500">검색 유형:</n-text>
          <n-tag size="small" :type="getSearchTypeColor(searchStore.searchType)">
            {{ getSearchTypeLabel(searchStore.searchType) }}
          </n-tag>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="searchStore.isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="result-card">
          <n-skeleton height="24px" width="60%" class="mb-2" />
          <n-skeleton height="16px" width="40%" class="mb-3" />
          <n-skeleton height="60px" />
        </div>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-4">
        <div
          v-for="result in searchStore.searchResults"
          :key="result.document.id"
          class="result-card animate-slide-up"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 
                class="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors"
                v-html="searchStore.highlightText(result.document.title, searchStore.currentQuery)"
              />
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>{{ formatDate(result.document.createdAt) }}</span>
                <n-divider vertical />
                <n-tag size="tiny" :type="getCategoryColor(result.document.category)">
                  {{ getCategoryLabel(result.document.category) }}
                </n-tag>
                <n-divider vertical />
                <span>스코어: {{ result.score.toFixed(3) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <n-tag size="tiny" :type="getSearchTypeColor(result.searchType)">
                {{ getSearchTypeLabel(result.searchType) }}
              </n-tag>
            </div>
          </div>
          
          <div class="text-gray-700 leading-relaxed">
            <p v-html="searchStore.highlightText(result.snippet, searchStore.currentQuery)" />
          </div>
          
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex justify-between items-center">
              <div class="text-xs text-gray-400">
                ID: {{ result.document.id }}
              </div>
              <n-button size="tiny" text @click="viewFullDocument(result.document)">
                전체 보기
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!searchStore.isLoading && searchStore.currentQuery" class="text-center py-12">
      <n-empty description="검색 결과가 없습니다" size="large">
        <template #icon>
          <n-icon size="48" color="#d1d5db">
            <SearchOutline />
          </n-icon>
        </template>
        <template #extra>
          <n-text class="text-gray-500">
            다른 검색어를 시도해보세요
          </n-text>
        </template>
      </n-empty>
    </div>

    <!-- Error State -->
    <div v-if="searchStore.hasError" class="max-w-4xl mx-auto">
      <n-alert type="error" :title="searchStore.error" show-icon />
    </div>

    <!-- Category Quick Search -->
    <div class="max-w-4xl mx-auto">
      <n-divider>카테고리별 빠른 검색</n-divider>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <n-card
          v-for="category in quickSearchCategories"
          :key="category.value"
          size="small"
          hoverable
          @click="quickCategorySearch(category.value)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="text-center">
            <n-icon :size="24" class="mb-2" :color="category.color">
              <component :is="category.icon" />
            </n-icon>
            <div class="text-sm font-medium">{{ category.label }}</div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Document Modal -->
    <n-modal v-model:show="showDocumentModal" :mask-closable="false">
      <n-card
        style="width: 80vw; max-width: 800px"
        title="문서 상세"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showDocumentModal = false">
            <template #icon>
              <n-icon><CloseOutline /></n-icon>
            </template>
          </n-button>
        </template>
        
        <div v-if="selectedDocument" class="space-y-4">
          <div>
            <h2 class="text-xl font-bold mb-2">{{ selectedDocument.title }}</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <span>{{ formatDate(selectedDocument.createdAt) }}</span>
              <n-divider vertical />
              <n-tag size="small" :type="getCategoryColor(selectedDocument.category)">
                {{ getCategoryLabel(selectedDocument.category) }}
              </n-tag>
            </div>
          </div>
          
          <n-divider />
          
          <div class="prose max-w-none">
            <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {{ selectedDocument.content }}
            </div>
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useSearchStore } from '@/stores/searchStore'
import { 
  SearchOutline, 
  SettingsOutline, 
  CloseOutline,
  CodeOutline,
  ServerOutline,
  IdCardOutline,
  DocumentTextOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchStore = useSearchStore()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const searchType = ref('hybrid')
const showAdvancedOptions = ref(false)
const showDocumentModal = ref(false)
const selectedDocument = ref(null)

// Search options
const searchOptions = ref({
  useFuzzy: false,
  usePhrase: false,
  limit: 10
})

const booleanOptions = ref({
  mustHave: [],
  shouldHave: [],
  mustNotHave: []
})

// Quick search categories
const quickSearchCategories = [
  { 
    label: '기술', 
    value: 'technology', 
    icon: CodeOutline, 
    color: '#18a058' 
  },
  { 
    label: '데이터베이스', 
    value: 'database', 
    icon: ServerOutline, 
    color: '#2080f0' 
  },
  { 
    label: 'AI', 
    value: 'ai', 
    icon: IdCardOutline, 
    color: '#f0a020' 
  },
  { 
    label: '전체', 
    value: '', 
    icon: DocumentTextOutline, 
    color: '#909399' 
  }
]

// Computed properties
const currentSearchOptions = computed(() => {
  if (searchType.value === 'boolean') {
    return { ...searchOptions.value, ...booleanOptions.value }
  }
  return searchOptions.value
})

// Methods
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    message.warning('검색어를 입력해주세요')
    return
  }

  try {
    searchStore.setCategory(selectedCategory.value)
    searchStore.setSearchOptions(searchOptions.value)
    searchStore.setBooleanOptions(booleanOptions.value)

    if (searchType.value === 'boolean') {
      if (booleanOptions.value.mustHave.length === 0 && 
          booleanOptions.value.shouldHave.length === 0) {
        message.warning('Boolean 검색에서는 최소한 하나의 조건을 입력해야 합니다')
        return
      }
      await searchStore.performSearch('', 'boolean')
    } else {
      await searchStore.performSearch(searchQuery.value, searchType.value)
    }

    if (searchStore.hasError) {
      message.error(searchStore.error)
    }
  } catch (error) {
    message.error('검색 중 오류가 발생했습니다')
    console.error('Search error:', error)
  }
}

const quickCategorySearch = async (category) => {
  try {
    selectedCategory.value = category
    searchStore.setCategory(category)
    await searchStore.searchByCategory(category)
    
    if (searchStore.hasError) {
      message.error(searchStore.error)
    }
  } catch (error) {
    message.error('카테고리 검색 중 오류가 발생했습니다')
    console.error('Category search error:', error)
  }
}

const applyHistorySearch = (historyItem) => {
  searchQuery.value = historyItem.query
  selectedCategory.value = historyItem.category
  searchType.value = historyItem.type
  handleSearch()
}

const removeFromHistory = (index) => {
  searchStore.searchHistory.splice(index, 1)
}

const viewFullDocument = (document) => {
  selectedDocument.value = document
  showDocumentModal.value = true
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategoryLabel = (category) => {
  const labels = {
    'technology': '기술',
    'database': '데이터베이스',
    'ai': 'AI',
    '': '미분류'
  }
  return labels[category] || category
}

const getCategoryColor = (category) => {
  const colors = {
    'technology': 'success',
    'database': 'info',
    'ai': 'warning',
    '': 'default'
  }
  return colors[category] || 'default'
}

const getSearchTypeLabel = (type) => {
  const labels = {
    'hybrid': 'Hybrid',
    'lexical': 'Lexical',
    'semantic': 'Semantic',
    'advanced': '고급',
    'boolean': 'Boolean',
    'category': '카테고리',
    'exact': '정확',
    'phrase': '구문',
    'fuzzy': '퍼지'
  }
  return labels[type] || type
}

const getSearchTypeColor = (type) => {
  const colors = {
    'hybrid': 'primary',
    'lexical': 'info',
    'semantic': 'info',
    'advanced': 'success',
    'boolean': 'warning',
    'category': 'default',
    'exact': 'error',
    'phrase': 'info',
    'fuzzy': 'warning'
  }
  return colors[type] || 'default'
}

// Watchers
watch(selectedCategory, (newValue) => {
  searchStore.setCategory(newValue)
})

watch(searchOptions, (newValue) => {
  searchStore.setSearchOptions(newValue)
}, { deep: true })

watch(booleanOptions, (newValue) => {
  searchStore.setBooleanOptions(newValue)
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Initialize search options from store
  searchOptions.value = { ...searchStore.searchOptions }
  booleanOptions.value = { ...searchStore.booleanOptions }
  selectedCategory.value = searchStore.selectedCategory
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.prose {
  line-height: 1.7;
}

.prose p {
  margin-bottom: 1rem;
}
</style>