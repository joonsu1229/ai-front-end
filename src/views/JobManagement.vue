<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">채용공고 관리</h1>
        <p class="text-gray-600 mt-1">크롤링한 채용공고를 관리하고 검색합니다</p>
      </div>
      <div class="flex gap-2">
        <n-button type="primary" @click="handleStartCrawling" :loading="crawlingLoading">
          <template #icon>
            <n-icon>
              <RefreshOutline />
            </n-icon>
          </template>
          크롤링 시작
        </n-button>
        <n-button @click="openAddModal">
          <template #icon>
            <n-icon>
              <AddOutline />
            </n-icon>
          </template>
          수동 추가
        </n-button>
      </div>
    </div>

    <!-- Crawling Status -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <n-icon size="24" color="#3b82f6">
            <CloudDownloadOutline />
          </n-icon>
          <div>
            <h3 class="font-semibold text-gray-900">크롤링 상태</h3>
            <p class="text-sm text-gray-600">마지막 업데이트: {{ lastUpdate }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-blue-600">{{ crawlStatus.todayJobs }}</p>
          <p class="text-sm text-gray-600">오늘 수집</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <n-input
            v-model:value="searchQuery"
            placeholder="채용공고 제목, 회사명, 설명으로 검색..."
            clearable
            @input="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon>
                <SearchOutline />
              </n-icon>
            </template>
          </n-input>
        </div>
        <div class="flex gap-2">
          <n-select
            v-model:value="filterCategory"
            :options="categoryOptions"
            placeholder="직무"
            class="w-32"
            clearable
            @update:value="handleFilter"
          />
          <n-select
            v-model:value="filterLocation"
            :options="locationOptions"
            placeholder="지역"
            class="w-32"
            clearable
            @update:value="handleFilter"
          />
          <n-select
            v-model:value="filterSource"
            :options="sourceOptions"
            placeholder="출처"
            class="w-32"
            clearable
            @update:value="handleFilter"
          />
          <n-button @click="handleRefresh" :loading="isLoading">
            <template #icon>
              <n-icon>
                <RefreshOutline />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
      
      <!-- AI Search -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <n-input
          v-model:value="aiSearchQuery"
          placeholder="AI 유사도 검색: 원하는 직무나 기술을 자연어로 입력하세요..."
          @keyup.enter="handleAISearch"
        >
          <template #prefix>
            <n-icon>
              <BulbOutline />
            </n-icon>
          </template>
          <template #suffix>
            <n-button text @click="handleAISearch" :loading="aiSearchLoading">
              AI 검색
            </n-button>
          </template>
        </n-input>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 채용공고</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalJobs }}</p>
          </div>
          <n-icon size="24" color="#6366f1">
            <BriefcaseOutline />
          </n-icon>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">개발 직군</p>
            <p class="text-2xl font-bold text-green-600">{{ getCategoryCount('개발') }}</p>
          </div>
          <n-icon size="24" color="#10b981">
            <CodeOutline />
          </n-icon>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">신입 가능</p>
            <p class="text-2xl font-bold text-blue-600">{{ getExperienceCount('신입') }}</p>
          </div>
          <n-icon size="24" color="#3b82f6">
            <SchoolOutline />
          </n-icon>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">서울 지역</p>
            <p class="text-2xl font-bold text-yellow-600">{{ getLocationCount('서울') }}</p>
          </div>
          <n-icon size="24" color="#f59e0b">
            <LocationOutline />
          </n-icon>
        </div>
      </div>
    </div>

    <!-- Jobs Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-4 py-5 sm:p-6">
        <n-data-table
          :columns="columns"
          :data="filteredJobs"
          :loading="isLoading"
          :pagination="paginationConfig"
          :row-key="(row) => row.id"
          size="medium"
          striped
        />
      </div>
    </div>

    <!-- Job Detail Modal -->
    <n-modal v-model:show="showDetailModal" :mask-closable="false">
      <n-card
        style="width: 90vw; max-width: 1000px"
        title="채용공고 상세"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="closeDetailModal">
            <template #icon>
              <n-icon><CloseOutline /></n-icon>
            </template>
          </n-button>
        </template>
        
        <div v-if="selectedJob" class="space-y-6">
          <!-- Job Header -->
          <div class="border-b pb-4">
            <h2 class="text-2xl font-bold mb-3">{{ selectedJob.title }}</h2>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <n-icon><BusinessOutline /></n-icon>
                <span class="font-medium">{{ selectedJob.company }}</span>
              </div>
              <div class="flex items-center gap-2" v-if="selectedJob.location">
                <n-icon><LocationOutline /></n-icon>
                <span>{{ selectedJob.location }}</span>
              </div>
              <div class="flex items-center gap-2" v-if="selectedJob.salary">
                <n-icon><CardOutline /></n-icon>
                <span>{{ selectedJob.salary }}</span>
              </div>
              <n-tag size="small" :type="getSourceColor(selectedJob.sourceSite)">
                {{ selectedJob.sourceSite }}
              </n-tag>
            </div>
          </div>

          <!-- Job Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div v-if="selectedJob.experienceLevel">
                <h4 class="font-semibold text-gray-900 mb-2">경력</h4>
                <p class="text-gray-700">{{ selectedJob.experienceLevel }}</p>
              </div>
              
              <div v-if="selectedJob.employmentType">
                <h4 class="font-semibold text-gray-900 mb-2">고용형태</h4>
                <p class="text-gray-700">{{ selectedJob.employmentType }}</p>
              </div>
              
              <div v-if="selectedJob.jobCategory">
                <h4 class="font-semibold text-gray-900 mb-2">직무분야</h4>
                <p class="text-gray-700">{{ selectedJob.jobCategory }}</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">등록일</h4>
                <p class="text-gray-700">{{ formatDate(selectedJob.createdAt) }}</p>
              </div>
              
              <div v-if="selectedJob.deadline">
                <h4 class="font-semibold text-gray-900 mb-2">마감일</h4>
                <p class="text-gray-700">{{ formatDate(selectedJob.deadline) }}</p>
              </div>
              
              <div v-if="selectedJob.sourceUrl">
                <h4 class="font-semibold text-gray-900 mb-2">원본 링크</h4>
                <n-button tag="a" :href="selectedJob.sourceUrl" target="_blank" text type="primary">
                  채용공고 보러가기
                  <template #icon>
                    <n-icon><OpenOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedJob.description">
            <h4 class="font-semibold text-gray-900 mb-3">채용내용</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {{ selectedJob.description }}
              </div>
            </div>
          </div>

          <!-- Requirements -->
          <div v-if="selectedJob.requirements">
            <h4 class="font-semibold text-gray-900 mb-3">자격요건</h4>
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {{ selectedJob.requirements }}
              </div>
            </div>
          </div>

          <!-- Benefits -->
          <div v-if="selectedJob.benefits">
            <h4 class="font-semibold text-gray-900 mb-3">복리혜택</h4>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {{ selectedJob.benefits }}
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="closeDetailModal">닫기</n-button>
            <n-button type="error" @click="handleDeleteJob(selectedJob)" v-if="selectedJob">
              삭제
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Add Job Modal -->
    <n-modal v-model:show="showAddModal" :mask-closable="false">
      <n-card
        style="width: 80vw; max-width: 800px"
        title="수동 채용공고 추가"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="closeAddModal">
            <template #icon>
              <n-icon><CloseOutline /></n-icon>
            </template>
          </n-button>
        </template>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <n-form-item label="채용공고 제목" path="title">
              <n-input
                v-model:value="formData.title"
                placeholder="채용공고 제목을 입력하세요"
                :maxlength="500"
                show-count
              />
            </n-form-item>
            
            <n-form-item label="회사명" path="company">
              <n-input
                v-model:value="formData.company"
                placeholder="회사명을 입력하세요"
                :maxlength="200"
              />
            </n-form-item>
            
            <n-form-item label="지역" path="location">
              <n-input
                v-model:value="formData.location"
                placeholder="근무 지역을 입력하세요"
              />
            </n-form-item>
            
            <n-form-item label="직무분야" path="jobCategory">
              <n-select
                v-model:value="formData.jobCategory"
                :options="jobCategoryOptions"
                placeholder="직무분야를 선택하세요"
              />
            </n-form-item>
            
            <n-form-item label="경력" path="experienceLevel">
              <n-select
                v-model:value="formData.experienceLevel"
                :options="experienceOptions"
                placeholder="경력을 선택하세요"
              />
            </n-form-item>
            
            <n-form-item label="고용형태" path="employmentType">
              <n-select
                v-model:value="formData.employmentType"
                :options="employmentOptions"
                placeholder="고용형태를 선택하세요"
              />
            </n-form-item>
          </div>
          
          <n-form-item label="연봉/급여" path="salary">
            <n-input
              v-model:value="formData.salary"
              placeholder="연봉이나 급여 정보를 입력하세요"
            />
          </n-form-item>
          
          <n-form-item label="채용내용" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="채용내용을 입력하세요"
              :rows="4"
              :maxlength="5000"
              show-count
            />
          </n-form-item>
          
          <n-form-item label="자격요건" path="requirements">
            <n-input
              v-model:value="formData.requirements"
              type="textarea"
              placeholder="자격요건을 입력하세요"
              :rows="3"
              :maxlength="3000"
              show-count
            />
          </n-form-item>
          
          <n-form-item label="복리혜택" path="benefits">
            <n-input
              v-model:value="formData.benefits"
              type="textarea"
              placeholder="복리혜택을 입력하세요"
              :rows="3"
              :maxlength="2000"
              show-count
            />
          </n-form-item>
          
          <n-form-item label="원본 URL" path="sourceUrl">
            <n-input
              v-model:value="formData.sourceUrl"
              placeholder="채용공고 원본 URL을 입력하세요 (선택사항)"
            />
          </n-form-item>
        </n-form>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="closeAddModal">취소</n-button>
            <n-button
              type="primary"
              @click="handleSubmit"
              :loading="addLoading"
            >
              추가
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useMessage, NButton, NIcon, NTag, NEllipsis } from 'naive-ui'
import { 
  AddOutline,
  SearchOutline,
  RefreshOutline,
  BriefcaseOutline,
  CodeOutline,
  SchoolOutline,
  LocationOutline,
  CloseOutline,
  EyeOutline,
  TrashOutline,
  BusinessOutline,
  CardOutline,
  OpenOutline,
  CloudDownloadOutline,
  BulbOutline
} from '@vicons/ionicons5'
import { useJobManagementStore } from '@/stores/jobManagementStore'
import { storeToRefs } from 'pinia'

const message = useMessage()
const jobStore = useJobManagementStore()

// Use store state with reactivity
const {
  // Data
  filteredJobs,
  stats,
  crawlStatus,
  lastUpdate,
  
  // Loading states
  isLoading,
  crawlingLoading,
  aiSearchLoading,
  addLoading,
  hasError,
  error,
  
  // Search and filters
  searchQuery,
  aiSearchQuery,
  filterCategory,
  filterLocation,
  filterSource,
  
  // Modal states
  showDetailModal,
  showAddModal,
  selectedJob,
  formData,
  
  // Options
  categoryOptions,
  locationOptions,
  sourceOptions,
  jobCategoryOptions,
  experienceOptions,
  employmentOptions,
  
  // Computed
  getCategoryCount,
  getExperienceCount,
  getLocationCount
} = storeToRefs(jobStore)

// Destructure methods (these don't need storeToRefs)
const {
  // Data fetching
  fetchJobs,
  fetchStats,
  fetchCrawlStatus,
  refreshAll,
  
  // Search and filter
  performSearch,
  performAISearch,
  applyFilters,
  clearFilters,
  
  // CRUD operations
  createJob,
  deleteJob,
  
  // Crawling
  startCrawling,
  
  // Modal management
  openDetailModal,
  closeDetailModal,
  openAddModal,
  closeAddModal,
  
  // Utility
  getSourceColor,
  formatDate,
  clearError
} = jobStore

// Local refs for form handling
const formRef = ref(null)

// Form rules
const formRules = {
  title: [
    { required: true, message: '제목을 입력해주세요', trigger: 'blur' },
    { min: 1, max: 500, message: '제목은 1-500자 사이여야 합니다', trigger: 'blur' }
  ],
  company: [
    { required: true, message: '회사명을 입력해주세요', trigger: 'blur' }
  ],
  jobCategory: [
    { required: true, message: '직무분야를 선택해주세요', trigger: 'change' }
  ],
  description: [
    { required: true, message: '채용내용을 입력해주세요', trigger: 'blur' }
  ]
}

// Table configuration
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    align: 'center'
  },
  {
    title: '채용공고',
    key: 'title',
    minWidth: 250,
    render: (row) => h('div', { class: 'space-y-1' }, [
      h(NEllipsis, { style: { maxWidth: '300px' }, class: 'font-medium' }, {
        default: () => row.title
      }),
      h('div', { class: 'text-xs text-gray-500' }, [
        h('span', { class: 'font-medium' }, row.company),
        row.location ? h('span', ` • ${row.location}`) : null
      ])
    ])
  },
  {
    title: '직무/경력',
    key: 'category',
    width: 120,
    render: (row) => h('div', { class: 'space-y-1' }, [
      h(NTag, { size: 'small', type: 'info' }, {
        default: () => row.jobCategory || '미분류'
      }),
      row.experienceLevel ? h('div', { class: 'text-xs text-gray-500' }, row.experienceLevel) : null
    ])
  },
  {
    title: '출처',
    key: 'sourceSite',
    width: 100,
    render: (row) => h(NTag, {
      size: 'small',
      type: getSourceColor(row.sourceSite)
    }, {
      default: () => row.sourceSite || '수동등록'
    })
  },
  {
    title: '등록일',
    key: 'createdAt',
    width: 120,
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: '작업',
    key: 'actions',
    width: 150,
    align: 'center',
    render: (row) => [
      h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'info',
        onClick: () => openDetailModal(row)
      }, {
        icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
        default: () => '보기'
      }),
      h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'error',
        onClick: () => handleDeleteJob(row),
        style: { marginLeft: '8px' }
      }, {
        icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
      })
    ]
  }
]

const paginationConfig = {
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }) => `총 ${itemCount}개`
}

// Event handlers
const handleSearch = async () => {
  await performSearch()
}

const handleFilter = async () => {
  await applyFilters()
}

const handleRefresh = async () => {
  try {
    await refreshAll()
    message.success('데이터가 새로고침되었습니다')
  } catch (error) {
    message.error('새로고침 중 오류가 발생했습니다')
  }
}

const handleAISearch = async () => {
  if (!aiSearchQuery.value.trim()) return
  
  try {
    const result = await performAISearch()
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('AI 검색 중 오류가 발생했습니다')
  }
}

const handleStartCrawling = async () => {
  try {
    const result = await startCrawling()
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('크롤링 시작 실패')
  }
}

const handleDeleteJob = async (job) => {
  try {
    const result = await deleteJob(job)
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('삭제 중 오류가 발생했습니다')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const result = await createJob(formData.value)
    if (result.success) {
      message.success(result.message)
      closeAddModal()
    } else {
      message.error(result.message)
    }
  } catch (validationError) {
    // Validation failed, form will show errors
    console.warn('Form validation failed:', validationError)
  }
}

// Watch for errors from store
watch(() => hasError.value, (hasErr) => {
  if (hasErr && error.value) {
    message.error(error.value)
    clearError()
  }
})

// Lifecycle
onMounted(async () => {
  try {
    await refreshAll()
  } catch (error) {
    console.error('초기 데이터 로딩 실패:', error)
  }
})
</script>

<style scoped>
.prose {
  line-height: 1.7;
}
</style>