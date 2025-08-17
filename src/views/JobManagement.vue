<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">채용공고 관리</h1>
        <p class="text-gray-600 mt-1">사이트별로 채용공고를 크롤링하고 관리합니다</p>
      </div>
      <div class="flex gap-2">
        <n-button type="primary" @click="openCrawlingSiteModal" :loading="crawlingLoading">
          <template #icon>
            <n-icon>
              <RefreshOutline />
            </n-icon>
          </template>
          사이트별 크롤링
        </n-button>
        <!-- <n-button @click="handleStartAllCrawling" :loading="allCrawlingLoading">
          <template #icon>
            <n-icon>
              <CloudDownloadOutline />
            </n-icon>
          </template>
          전체 크롤링
        </n-button> -->
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

    <!-- Site Selection Modal -->
    <n-modal v-model:show="showCrawlingSiteModal" :mask-closable="false">
      <n-card
        style="width: 80vw; max-width: 800px"
        title="크롤링할 사이트 선택"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="closeCrawlingSiteModal">
            <template #icon>
              <n-icon><CloseOutline /></n-icon>
            </template>
          </n-button>
        </template>

        <div class="space-y-6">
          <!-- Site Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="site in supportedSites"
              :key="site.id"
              class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
              :class="selectedSites.includes(site.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              @click="toggleSite(site.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <n-checkbox
                    :checked="selectedSites.includes(site.id)"
                    @update:checked.stop="(checked) => handleSiteCheckbox(site.id, checked)"
                  />
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ site.name }}</h3>
                    <p class="text-sm text-gray-600">{{ site.description }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-blue-600">{{ site.totalJobs || 0 }}</p>
                  <p class="text-xs text-gray-500">기존 공고</p>
                </div>
              </div>

              <!-- Site Status -->
              <div class="mt-3 flex justify-between items-center text-sm">
                <span class="text-gray-600">
                  최근 수집: {{ site.recentJobs || 0 }}개
                </span>
                <span class="text-gray-500">
                  마지막 크롤링: {{ formatLastCrawled(site.lastCrawled) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Selection -->
          <div class="border-t pt-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">빠른 선택</span>
              <div class="flex gap-2">
                <n-button size="small" @click="selectAllSites">전체 선택</n-button>
                <n-button size="small" @click="selectPopularSites">인기 사이트</n-button>
              </div>
            </div>
          </div>

          <!-- Crawling Options -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">크롤링 옵션</h4>
            <div class="space-y-3">
              <n-checkbox v-model:checked="crawlOptions.includeDetails">
                상세 정보 수집 (느리지만 더 많은 정보)
              </n-checkbox>
              <n-checkbox v-model:checked="crawlOptions.skipExisting">
                기존 공고 중복 스킵
              </n-checkbox>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">페이지 수:</span>
                <n-input-number
                  v-model:value="crawlOptions.maxPages"
                  :min="1"
                  :max="10"
                  size="small"
                  style="width: 80px;"
                />
                <span class="text-xs text-gray-500">사이트당</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <div class="text-sm text-gray-600">
              선택된 사이트: <span class="font-semibold">{{ selectedSites.length }}개</span>
            </div>
            <div class="flex gap-2">
              <n-button @click="closeCrawlingSiteModal">취소</n-button>
              <n-button
                type="primary"
                @click="handleStartSiteCrawling"
                :loading="crawlingLoading"
                :disabled="selectedSites.length === 0"
              >
                크롤링 시작 ({{ selectedSites.length }}개 사이트)
              </n-button>
            </div>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Crawling Status Card -->
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
        <div class="flex items-center space-x-6">
          <div class="text-right">
            <p class="text-2xl font-bold text-blue-600">{{ crawlStatus.todayJobs }}</p>
            <p class="text-sm text-gray-600">오늘 수집</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-green-600">{{ crawlStatus.totalJobs }}</p>
            <p class="text-sm text-gray-600">총 공고</p>
          </div>
        </div>
      </div>

      <!-- Site Status Summary -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <div
          v-for="site in siteStatusSummary"
          :key="site.id"
          class="bg-white rounded px-3 py-2 text-center"
        >
          <div class="text-sm font-medium text-gray-900">{{ site.name }}</div>
          <div class="text-lg font-bold text-blue-600">{{ site.count }}</div>
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
            <n-icon>
              <SearchOutline />
            </n-icon>
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
        <!-- Data Table -->
        <n-data-table
          :columns="columns"
          :data="filteredJobs"
          :loading="isLoading"
          :row-key="(row) => row.id"
          size="medium"
          striped
          :pagination="false"
        />
        <!-- Pagination -->
        <div class="mt-4 flex justify-end">
          <n-pagination
            v-model:page="pagination.page"
            :page-count="pagination.pageCount"
            :page-size="pagination.pageSize"
            :item-count="pagination.total"
            show-size-picker
            :page-sizes="[10, 20, 50, 100]"
            show-quick-jumper
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, h } from 'vue'
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

// Store에서 가져오는 반응형 상태들 - 먼저 기본값으로 초기화
const {
  // Data
  filteredJobs,
  stats,
  crawlStatus,
  lastUpdate,
  pagination,
  totalPages,

  // Loading states
  isLoading,
  crawlingLoading,
  aiSearchLoading,
  addLoading,
  hasError,
  error,

  // Search and filters - 여기서 문제가 발생할 가능성이 높음
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
  getLocationCount,
} = storeToRefs(jobStore)

// 로컬 반응형 상태들 - 확실한 기본값으로 초기화
const showCrawlingSiteModal = ref(false)
const supportedSites = ref([])
const selectedSites = ref([])
const allCrawlingLoading = ref(false)
const siteStatusSummary = ref([])

// 크롤링 옵션 - 반응형으로 정의
const crawlOptions = ref({
  includeDetails: true,
  skipExisting: true,
  maxPages: 1
})

// Store 메소드들
const {
  // Data fetching
  fetchJobs,
  fetchStats,
  fetchCrawlStatus,
  refreshAll,
  handlePageChange,
  handlePageSizeChange,

  // Search and filter
  performSearch,
  performAISearch,
  applyFilters,

  getSupportedSites,
  getSiteStatuses,

  // CRUD operations
  createJob,
  deleteJob,
  startSiteCrawling,

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

// Form ref
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

// 테이블 컬럼 정의 (여기서 문제가 발생할 수 있음)
const columns = [
  {
    title: '제목',
    key: 'title',
    width: 300,
    render(row) {
      return h(NEllipsis, {
        style: { maxWidth: '280px' },
        tooltip: false
      }, {
        default: () => row.title,
        tooltip: () => row.title
      })
    }
  },
  {
    title: '회사명',
    key: 'company',
    width: 200,
    render(row) {
      return h(NEllipsis, {
        style: { maxWidth: '180px' },
        tooltip: false
      }, {
        default: () => row.company,
        tooltip: () => row.company
      })
    }
  },
  {
    title: '지역',
    key: 'location',
    width: 120,
    render(row) {
      return row.location || '-'
    }
  },
  {
    title: '직무',
    key: 'jobCategory',
    width: 120,
    render(row) {
      return row.jobCategory || '-'
    }
  },
  {
    title: '출처',
    key: 'sourceSite',
    width: 100,
    render(row) {
      return h(NTag, {
        size: 'small',
        type: getSourceColor(row.sourceSite)
      }, {
        default: () => row.sourceSite
      })
    }
  },
  {
    title: '마감일',
    key: 'createdAt',
    width: 120,
    render(row) {
      return formatDate(row.deadline)
    }
  },
  {
    title: '작업',
    key: 'actions',
    width: 120,
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(NButton, {
          size: 'small',
          onClick: () => openDetailModal(row)
        }, {
          icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
          default: () => '보기'
        }),
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleDeleteJob(row)
        }, {
          icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
        })
      ])
    }
  }
]

// 페이지네이션 설정
const paginationConfig = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
  prefix: ({ itemCount }) => `총 ${pagination.value.total}개`,
  onChange: handlePageChange,
  onUpdatePageSize: handlePageSizeChange
}))

// 이벤트 핸들러들
const handleSearch = async () => {
  try {
    await performSearch()
  } catch (error) {
    message.error('검색 중 오류가 발생했습니다')
  }
}

const handleAISearch = async () => {
  if (!aiSearchQuery.value?.trim()) {
    message.warning('검색어를 입력해주세요')
    return
  }

  try {
    await performAISearch()
  } catch (error) {
    message.error('AI 검색 중 오류가 발생했습니다')
  }
}

const handleFilter = async () => {
  try {
    await applyFilters()
  } catch (error) {
    message.error('필터 적용 중 오류가 발생했습니다')
  }
}

const handleRefresh = async () => {
  try {
    await refreshAll()
    message.success('데이터가 새로고침되었습니다')
  } catch (error) {
    message.error('새로고침 중 오류가 발생했습니다')
  }
}

const handleDeleteJob = async (job) => {
  try {
    await deleteJob(job.id)
    message.success('채용공고가 삭제되었습니다')
  } catch (error) {
    message.error('삭제 중 오류가 발생했습니다')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    await createJob(formData.value)
    message.success('채용공고가 추가되었습니다')
    closeAddModal()
  } catch (error) {
    if (error?.message) {
      message.error(error.message)
    } else {
      message.error('채용공고 추가 중 오류가 발생했습니다')
    }
  }
}

// 사이트별 크롤링 관련 핸들러들
const handleStartSiteCrawling = async () => {
  if (selectedSites.value.length === 0) {
    message.warning('크롤링할 사이트를 선택해주세요')
    return
  }

  try {
    crawlingLoading.value = true
    const result = await startSiteCrawling(selectedSites.value)

    if (result.success) {
      message.success(`${selectedSites.value.length}개 사이트 크롤링이 시작되었습니다`)
      closeCrawlingSiteModal()

      // 상태 업데이트
      await Promise.all([
        fetchJobs(),
        fetchStats(),
        fetchCrawlStatus()
      ])
    } else {
      message.error(result.message || '크롤링 시작에 실패했습니다')
    }
  } catch (error) {
    message.error('크롤링 요청 중 오류가 발생했습니다')
    console.error('Site crawling error:', error)
  } finally {
    crawlingLoading.value = false
  }
}

const handleStartAllCrawling = async () => {
  try {
    allCrawlingLoading.value = true
    const result = await startAllCrawling()

    if (result.success) {
      message.success('전체 크롤링이 시작되었습니다')

      // 상태 업데이트
      await Promise.all([
        fetchJobs(),
        fetchStats(),
        fetchCrawlStatus()
      ])
    } else {
      message.error(result.message || '크롤링 시작에 실패했습니다')
    }
  } catch (error) {
    message.error('크롤링 요청 중 오류가 발생했습니다')
    console.error('All crawling error:', error)
  } finally {
    allCrawlingLoading.value = false
  }
}

// API 함수들
const fetchSupportedSites = async () => {
  try {
    const response = await getSupportedSites()
    const data = await response

    if (data.success && data.siteDetails) {
      supportedSites.value = Object.values(data.siteDetails).map(site => ({
        id: site.id,
        name: site.name,
        description: site.description,
        enabled: site.enabled,
        totalJobs: 0,
        recentJobs: 0,
        lastCrawled: null
      }))

      await fetchSiteStatuses()
    }
  } catch (error) {
    console.error('지원 사이트 조회 실패:', error)
    message.error('지원 사이트 정보를 불러올 수 없습니다')
  }
}

const fetchSiteStatuses = async () => {
  try {
    const response = await getSiteStatuses()
    const data = await response

    if (data.success && data.sites) {
      supportedSites.value = supportedSites.value.map(site => {
        const statusInfo = data.sites.find(s => s.siteId === site.id)
        if (statusInfo) {
          return {
            ...site,
            totalJobs: statusInfo.totalJobs || 0,
            recentJobs: statusInfo.recentJobs || 0,
            lastCrawled: statusInfo.lastCrawled
          }
        }
        return site
      })

      siteStatusSummary.value = supportedSites.value.map(site => ({
        id: site.id,
        name: site.name,
        count: site.totalJobs
      }))
    }
  } catch (error) {
    console.error('사이트 상태 조회 실패:', error)
  }
}

// Modal 관리
const openCrawlingSiteModal = async () => {
  showCrawlingSiteModal.value = true
  await fetchSupportedSites()
}

const closeCrawlingSiteModal = () => {
  showCrawlingSiteModal.value = false
  selectedSites.value = []
}

// 사이트 선택 관리
const toggleSite = (siteId) => {
  const index = selectedSites.value.indexOf(siteId)
  if (index > -1) {
    selectedSites.value.splice(index, 1)
  } else {
    selectedSites.value.push(siteId)
  }
}

const handleSiteCheckbox = (siteId, checked) => {
  const index = selectedSites.value.indexOf(siteId)

  if (checked && index === -1) {
    // 배열 그대로 push
    selectedSites.value.push(siteId)
  } else if (!checked && index > -1) {
    // 배열 그대로 splice
    selectedSites.value.splice(index, 1)
  }
}

const selectAllSites = () => {
  if(selectedSites.value.length == supportedSites.value.length){
    selectedSites.value = []
  }else{
    selectedSites.value = supportedSites.value.map(site => site.id)
  }
}

const selectPopularSites = () => {
  const popularSites = supportedSites.value
    .sort((a, b) => (b.totalJobs || 0) - (a.totalJobs || 0))
    .slice(0, 3)
    .map(site => site.id)
  selectedSites.value = popularSites
}

// 날짜 포맷팅
const formatLastCrawled = (lastCrawled) => {
  if (!lastCrawled || lastCrawled === '없음' || lastCrawled === '확인 불가') {
    return '없음'
  }

  try {
    const date = new Date(lastCrawled)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return '방금 전'
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  } catch (error) {
    return '확인 불가'
  }
}

// 컴포넌트 마운트시 초기화
onMounted(async () => {
  try {
    // Store 초기화 확인
    if (typeof searchQuery.value === 'undefined') {
      console.warn('Store가 제대로 초기화되지 않았습니다')
    }

    // 초기 데이터 로드
    await Promise.all([
      fetchJobs(),
      fetchStats(),
      fetchCrawlStatus()
    ])
  } catch (error) {
    console.error('초기화 오류:', error)
    message.error('데이터 로드 중 오류가 발생했습니다')
  }
})

// 에러 처리
watch(hasError, (newError) => {
  if (newError && error.value) {
    message.error(error.value)
    clearError()
  }
})
</script>

<style scoped>
.prose {
  line-height: 1.7;
}
</style>