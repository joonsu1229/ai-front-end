<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">검색 분석</h1>
        <p class="text-gray-600 mt-1">검색 패턴과 인기 쿼리를 분석합니다</p>
      </div>
      <n-button @click="refreshData" :loading="loading">
        <template #icon>
          <n-icon>
            <RefreshOutline />
          </n-icon>
        </template>
        새로고침
      </n-button>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 검색 횟수</p>
            <p class="text-3xl font-bold text-blue-600">{{ totalSearches.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-1">누적 검색 수</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <n-icon size="24" color="#3b82f6">
              <SearchOutline />
            </n-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">인기 검색어</p>
            <p class="text-3xl font-bold text-green-600">{{ Object.keys(popularQueries).length }}</p>
            <p class="text-xs text-gray-500 mt-1">고유 검색어 수</p>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <n-icon size="24" color="#10b981">
              <TrendingUpOutline />
            </n-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">평균 검색 빈도</p>
            <p class="text-3xl font-bold text-purple-600">{{ avgSearchFrequency.toFixed(1) }}</p>
            <p class="text-xs text-gray-500 mt-1">검색어당 평균</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-lg">
            <n-icon size="24" color="#8b5cf6">
              <BarChartOutline />
            </n-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Queries Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Popular Queries List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">인기 검색어 TOP 10</h2>
            <n-select
              v-model:value="queryLimit"
              :options="limitOptions"
              size="small"
              class="w-20"
              @update:value="refreshPopularQueries"
            />
          </div>
        </div>

        <div v-if="loading" class="p-6">
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4">
              <n-skeleton height="16px" width="60%" />
              <n-skeleton height="16px" width="20%" />
            </div>
          </div>
        </div>

        <div v-else-if="Object.keys(popularQueries).length === 0" class="p-6">
          <n-empty description="검색 데이터가 없습니다">
            <template #icon>
              <n-icon size="48" color="#d1d5db">
                <SearchOutline />
              </n-icon>
            </template>
          </n-empty>
        </div>

        <div v-else class="p-6">
          <div class="space-y-3">
            <div
              v-for="([query, count], index) in sortedPopularQueries"
              :key="query"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                  <span
                    :class="getRankBadgeClass(index)"
                    class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full"
                  >
                    {{ index + 1 }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ query }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        :style="{ width: `${(count / maxQueryCount) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0">
                <span class="text-lg font-bold text-gray-900">{{ count }}</span>
                <span class="text-xs text-gray-500 ml-1">회</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Query Analytics Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">검색 패턴 분석</h2>
        </div>
        
        <div class="p-6">
          <div v-if="Object.keys(popularQueries).length === 0" class="h-64 flex items-center justify-center">
            <n-empty description="차트 데이터가 없습니다" />
          </div>
          
          <div v-else class="h-64">
            <!-- Simple Bar Chart -->
            <div class="h-full flex items-end justify-between gap-2">
              <div
                v-for="([query, count], index) in sortedPopularQueries.slice(0, 8)"
                :key="query"
                class="flex-1 flex flex-col items-center"
              >
                <div
                  class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-400"
                  :style="{ height: `${(count / maxQueryCount) * 100}%`, minHeight: '10px' }"
                ></div>
                <div class="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-top-left">
                  <span class="block w-16 truncate">{{ query.split(':')[0] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search History Analysis -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">최근 검색 활동</h2>
      </div>
      
      <div class="p-6">
        <div v-if="searchStore.searchHistory.length === 0" class="text-center py-8">
          <n-empty description="검색 기록이 없습니다">
            <template #extra>
              <n-button @click="$router.push('/')">검색하러 가기</n-button>
            </template>
          </n-empty>
        </div>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-blue-900 mb-2">하이브리드 검색</h3>
              <p class="text-2xl font-bold text-blue-600">
                {{ getSearchTypeCount('hybrid') }}
              </p>
              <p class="text-xs text-blue-700">전체의 {{ getSearchTypePercentage('hybrid') }}%</p>
            </div>

            <div class="bg-green-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-green-900 mb-2">의미 검색</h3>
              <p class="text-2xl font-bold text-green-600">
                {{ getSearchTypeCount('semantic') }}
              </p>
              <p class="text-xs text-green-700">전체의 {{ getSearchTypePercentage('semantic') }}%</p>
            </div>            
            
            <div class="bg-green-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-green-900 mb-2">키워드 검색</h3>
              <p class="text-2xl font-bold text-green-600">
                {{ getSearchTypeCount('lexical') }}
              </p>
              <p class="text-xs text-green-700">전체의 {{ getSearchTypePercentage('lexical') }}%</p>
            </div>
            
            <div class="bg-yellow-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-yellow-900 mb-2">고급/Boolean</h3>
              <p class="text-2xl font-bold text-yellow-600">
                {{ getSearchTypeCount('advanced') + getSearchTypeCount('boolean') }}
              </p>
              <p class="text-xs text-yellow-700">전체의 {{ (getSearchTypePercentage('advanced') + getSearchTypePercentage('boolean')) }}%</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, index) in searchStore.searchHistory.slice(0, 20)"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                  <n-tag size="small" :type="getSearchTypeColor(item.type)">
                    {{ getSearchTypeLabel(item.type) }}
                  </n-tag>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.query }}
                  </p>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{{ formatRelativeTime(item.timestamp) }}</span>
                    <span v-if="item.category">• {{ getCategoryLabel(item.category) }}</span>
                    <span>• {{ item.results }}개 결과</span>
                  </div>
                </div>
              </div>
              <n-button
                size="tiny"
                quaternary
                @click="repeatSearch(item)"
                title="다시 검색"
              >
                <template #icon>
                  <n-icon>
                    <RefreshOutline />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Analysis -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">카테고리별 검색 분석</h2>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="category in categoryAnalysis"
            :key="category.name"
            class="text-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div class="mb-3">
              <n-icon :size="32" :color="category.color">
                <component :is="category.icon" />
              </n-icon>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ category.label }}</h3>
            <p class="text-2xl font-bold mb-1" :style="{ color: category.color }">
              {{ category.count }}
            </p>
            <p class="text-xs text-gray-500">
              전체의 {{ category.percentage.toFixed(1) }}%
            </p>
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{ 
                  width: `${category.percentage}%`, 
                  backgroundColor: category.color 
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useSearchStore } from '@/stores/searchStore'
import { analyticsAPI } from '@/api/analytics'
import {
  SearchOutline,
  RefreshOutline,
  TrendingUpOutline,
  BarChartOutline,
  CodeOutline,
  ServerOutline,
  IdCardOutline,
  DocumentTextOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const searchStore = useSearchStore()

// Reactive data
const loading = ref(false)
const popularQueries = ref({})
const totalSearches = ref(0)
const queryLimit = ref(10)

// Options
const limitOptions = [
  { label: '5개', value: 5 },
  { label: '10개', value: 10 },
  { label: '15개', value: 15 },
  { label: '20개', value: 20 }
]

// Computed properties
const sortedPopularQueries = computed(() => {
  return Object.entries(popularQueries.value)
    .sort(([,a], [,b]) => b - a)
    .slice(0, queryLimit.value)
})

const maxQueryCount = computed(() => {
  const counts = Object.values(popularQueries.value)
  return counts.length > 0 ? Math.max(...counts) : 1
})

const avgSearchFrequency = computed(() => {
  const counts = Object.values(popularQueries.value)
  if (counts.length === 0) return 0
  return counts.reduce((sum, count) => sum + count, 0) / counts.length
})

const categoryAnalysis = computed(() => {
  const categories = [
    { 
      name: 'technology', 
      label: '기술', 
      icon: CodeOutline, 
      color: '#10b981' 
    },
    { 
      name: 'database', 
      label: '데이터베이스', 
      icon: ServerOutline, 
      color: '#3b82f6' 
    },
    { 
      name: 'ai', 
      label: 'AI', 
      icon: IdCardOutline, 
      color: '#f59e0b' 
    },
    { 
      name: '', 
      label: '전체', 
      icon: DocumentTextOutline, 
      color: '#6b7280' 
    }
  ]

  const total = searchStore.searchHistory.length
  
  return categories.map(category => {
    const count = searchStore.searchHistory.filter(item => 
      item.category === category.name
    ).length
    
    return {
      ...category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }
  })
})

// Methods
const refreshData = async () => {
  await Promise.all([
    refreshPopularQueries(),
    refreshTotalSearches()
  ])
}

const refreshPopularQueries = async () => {
  loading.value = true
  try {
    const data = await analyticsAPI.getPopularQueries(queryLimit.value)
    popularQueries.value = data
  } catch (error) {
    message.error('인기 검색어를 불러오는 중 오류가 발생했습니다')
    console.error('Popular queries error:', error)
  } finally {
    loading.value = false
  }
}

const refreshTotalSearches = async () => {
  try {
    const data = await analyticsAPI.getTotalSearches()
    totalSearches.value = data.totalSearches || 0
  } catch (error) {
    message.error('검색 통계를 불러오는 중 오류가 발생했습니다')
    console.error('Total searches error:', error)
  }
}

const repeatSearch = (searchItem) => {
  searchStore.setCategory(searchItem.category)
  router.push('/')
  // 약간의 지연 후 검색 실행
  setTimeout(() => {
    searchStore.performSearch(searchItem.query, searchItem.type)
  }, 100)
}

const getRankBadgeClass = (index) => {
  const classes = [
    'bg-yellow-400 text-yellow-900', // 1위
    'bg-gray-300 text-gray-800',     // 2위
    'bg-orange-400 text-orange-900', // 3위
  ]
  return classes[index] || 'bg-blue-100 text-blue-800'
}

const getSearchTypeCount = (type) => {
  return searchStore.searchHistory.filter(item => item.type === type).length
}

const getSearchTypePercentage = (type) => {
  const total = searchStore.searchHistory.length
  if (total === 0) return 0
  return ((getSearchTypeCount(type) / total) * 100).toFixed(1)
}

const getSearchTypeLabel = (type) => {
  const labels = {
    'hybrid': 'Hybrid',
    'lexical': 'Lexical',
    'semantic': 'Semantic',
    'advanced': '고급',
    'boolean': 'Boolean'
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
  }
  return colors[type] || 'default'
}

const getCategoryLabel = (category) => {
  const labels = {
    'technology': '기술',
    'database': '데이터베이스',
    'ai': 'AI',
    '': '전체'
  }
  return labels[category] || category
}

const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now - time
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  
  return time.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  console.log('onMounted 실행됨') // 이것부터 확인
  refreshData()
})
</script>

<style scoped>
.chart-bar {
  transition: all 0.3s ease;
}

.chart-bar:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}
</style>