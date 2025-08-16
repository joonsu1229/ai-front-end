import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jobsAPI } from '@/api/jobManagement'

export const useJobManagementStore = defineStore('jobManagement', () => {
  // State
  const jobPostings = ref([])
  const loading = ref(false)
  const crawlingLoading = ref(false)
  const aiSearchLoading = ref(false)
  const addLoading = ref(false)
  const error = ref(null)

  // Search and Filter State
  const searchQuery = ref('')
  const aiSearchQuery = ref('')
  const filterCategory = ref('')
  const filterLocation = ref('')
  const filterSource = ref('')

  // Statistics
  const stats = ref({
    totalJobs: 0,
    categoryStats: [],
    topCompanies: [],
    locationStats: []
  })

  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })

  const crawlStatus = ref({
    totalJobs: 0,
    todayJobs: 0
  })

  const lastUpdate = ref('')

  // Modal State
  const showDetailModal = ref(false)
  const showAddModal = ref(false)
  const selectedJob = ref(null)

  // Form Data
  const formData = ref({
    title: '',
    company: '',
    description: '',
    location: '',
    experienceLevel: '',
    salary: '',
    employmentType: '',
    jobCategory: '',
    requirements: '',
    benefits: '',
    sourceUrl: ''
  })

  // Options
  const categoryOptions = ref([
    { label: '전체', value: '' },
    { label: '개발', value: '개발' },
    { label: '디자인', value: '디자인' },
    { label: '마케팅', value: '마케팅' },
    { label: '영업', value: '영업' },
    { label: '기획', value: '기획' }
  ])

  const locationOptions = ref([
    { label: '전체', value: '' },
    { label: '서울', value: '서울' },
    { label: '경기', value: '경기' },
    { label: '인천', value: '인천' },
    { label: '부산', value: '부산' },
    { label: '대구', value: '대구' },
    { label: '원격근무', value: '원격' }
  ])

  const sourceOptions = ref([
    { label: '전체', value: '' },
    { label: '사람인', value: '사람인' },
    { label: '잡코리아', value: '잡코리아' },
    { label: '원티드', value: '원티드' },
    { label: '수동등록', value: '수동등록' }
  ])

  const jobCategoryOptions = ref([
    { label: '개발', value: '개발' },
    { label: '디자인', value: '디자인' },
    { label: '마케팅', value: '마케팅' },
    { label: '영업', value: '영업' },
    { label: '기획', value: '기획' },
    { label: '인사', value: '인사' },
    { label: '회계', value: '회계' }
  ])

  const experienceOptions = ref([
    { label: '신입', value: '신입' },
    { label: '1-3년', value: '1-3년' },
    { label: '3-5년', value: '3-5년' },
    { label: '5-10년', value: '5-10년' },
    { label: '10년 이상', value: '10년 이상' },
    { label: '경력무관', value: '경력무관' }
  ])

  const employmentOptions = ref([
    { label: '정규직', value: '정규직' },
    { label: '계약직', value: '계약직' },
    { label: '인턴', value: '인턴' },
    { label: '프리랜서', value: '프리랜서' },
    { label: '아르바이트', value: '아르바이트' }
  ])

  // Computed
  const filteredJobs = computed(() => {
    return jobPostings.value.filter(job => {
      const matchesSearch = !searchQuery.value ||
        job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchQuery.value.toLowerCase()))

      const matchesCategory = !filterCategory.value || job.jobCategory === filterCategory.value
      const matchesLocation = !filterLocation.value ||
        (job.location && job.location.includes(filterLocation.value))
      const matchesSource = !filterSource.value || job.sourceSite === filterSource.value

      return matchesSearch && matchesCategory && matchesLocation && matchesSource
    })
  })

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasJobs = computed(() => jobPostings.value.length > 0)

  // Category Statistics
  const getCategoryCount = computed(() => (category) => {
    return filteredJobs.value.filter(job => job.jobCategory === category).length
  })

  const getExperienceCount = computed(() => (experience) => {
    return filteredJobs.value.filter(job =>
      job.experienceLevel && job.experienceLevel.includes(experience)
    ).length
  })

  const getLocationCount = computed(() => (location) => {
    return filteredJobs.value.filter(job =>
      job.location && job.location.includes(location)
    ).length
  })

  const setPagination = (page, pageSize) => {
    pagination.value.page = page
    pagination.value.pageSize = pageSize
  }

  // Actions - Data Fetching
// Actions - Data Fetching
const fetchJobs = async () => {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: pagination.value.page - 1, // Spring Boot는 0부터 시작
      size: pagination.value.pageSize,
      search: searchQuery.value,
      category: filterCategory.value,
      location: filterLocation.value,
      source: filterSource.value
    }

    const response = await jobsAPI.getJobs(params)
    jobPostings.value = response.content || response
    pagination.value.total = response.totalElements
    pagination.value.pageSize = response.size
    pagination.value.pageCount = response.totalPages

  } catch (err) {
    error.value = err.message || '채용공고를 불러오는 중 오류가 발생했습니다'
    jobPostings.value = []
  } finally {
    loading.value = false
  }
}
// 페이지네이션 이벤트 핸들러 추가
const handlePageChange = (page) => {
  pagination.value.page = page
  fetchJobs()
}

const handlePageSizeChange = (pageSize) => {
  pagination.value.page = 1 // 페이지 크기 변경시 첫 페이지로
  pagination.value.pageSize = pageSize
  fetchJobs()
}

  const fetchStats = async () => {
    try {
      const response = await jobsAPI.getStats()
      stats.value = response
    } catch (err) {
      console.error('통계 조회 실패:', err)
    }
  }

  const fetchCrawlStatus = async () => {
    try {
      const response = await jobsAPI.getCrawlStatus()
      crawlStatus.value = response
      lastUpdate.value = new Date().toLocaleString('ko-KR')
    } catch (err) {
      console.error('크롤링 상태 조회 실패:', err)
    }
  }

  // Actions - Crawling
  const getSupportedSites = async () => {
    try {
      const response = await jobsAPI.getSupportedSites()
      return response
    } catch (err) {
      error.value = err.message || '지원 사이트 정보를 불러올 수 없습니다'
      throw err
    }
  }

  const getSiteStatuses = async () => {
    try {
      const response = await jobsAPI.getSiteStatuses()
      return response
    } catch (err) {
      error.value = err.message || '사이트 상태를 불러올 수 없습니다'
      throw err
    }
  }

  const startSiteCrawling = async (sites, options = {}) => {
    crawlingLoading.value = true
    error.value = null

    try {
      const response = await jobsAPI.startSiteCrawling(sites, options)

      // Update status after a delay
      setTimeout(async () => {
        await fetchCrawlStatus()
        //await fetchJobs()
      }, 5000)

      return {
        success: true,
        message: response.message || `${sites.length}개 사이트 크롤링이 시작되었습니다`
      }
    } catch (err) {
      error.value = err.message || '크롤링 시작 실패'
      return {
        success: false,
        message: error.value
      }
    } finally {
      crawlingLoading.value = false
    }
  }

  const startCrawling = async () => {
    crawlingLoading.value = true
    error.value = null

    try {
      const response = await jobsAPI.startCrawling()

      // Update status after a delay
      setTimeout(async () => {
        await fetchCrawlStatus()
        await fetchJobs()
      }, 5000)

      return {
        success: true,
        message: response.message || '크롤링이 시작되었습니다'
      }
    } catch (err) {
      error.value = err.message || '크롤링 시작 실패'
      return {
        success: false,
        message: error.value
      }
    } finally {
      crawlingLoading.value = false
    }
  }

  // Actions - Search and Filter
  const performSearch = async (query = searchQuery.value) => {
    searchQuery.value = query
    await fetchJobs()
  }

  const performAISearch = async (query = aiSearchQuery.value) => {
    if (!query.trim()) return

    aiSearchLoading.value = true
    error.value = null

    try {
      const response = await jobsAPI.aiSearch({
        query,
        limit: 20
      })

      jobPostings.value = response
      searchQuery.value = '' // Clear regular search when AI search is used

      return {
        success: true,
        count: response.length,
        message: `AI 검색 결과: ${response.length}개 채용공고`
      }
    } catch (err) {
      error.value = err.message || 'AI 검색 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    } finally {
      aiSearchLoading.value = false
    }
  }

  const applyFilters = async () => {
    await fetchJobs()
  }

  const clearFilters = () => {
    searchQuery.value = ''
    aiSearchQuery.value = ''
    filterCategory.value = ''
    filterLocation.value = ''
    filterSource.value = ''
  }

  // Actions - CRUD Operations
  const createJob = async (jobData) => {
    addLoading.value = true
    error.value = null

    try {
      const response = await jobsAPI.createJob({
        ...jobData,
        sourceSite: '수동등록'
      })

      // Add to local state
      jobPostings.value.unshift(response)
      stats.value.totalJobs += 1

      return {
        success: true,
        message: '채용공고가 추가되었습니다'
      }
    } catch (err) {
      error.value = err.message || '추가 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    } finally {
      addLoading.value = false
    }
  }

  const updateJob = async (id, jobData) => {
    loading.value = true
    error.value = null

    try {
      const response = await jobsAPI.updateJob(id, jobData)

      // Update local state
      const index = jobPostings.value.findIndex(job => job.id === id)
      if (index !== -1) {
        jobPostings.value[index] = response
      }

      // Update selected job if it's the one being updated
      if (selectedJob.value?.id === id) {
        selectedJob.value = response
      }

      return {
        success: true,
        message: '채용공고가 수정되었습니다'
      }
    } catch (err) {
      error.value = err.message || '수정 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const deleteJob = async (jobId) => {
    loading.value = true
    error.value = null

    try {
      await jobsAPI.deleteJob(jobId)

      // Remove from local state
      jobPostings.value = jobPostings.value.filter(j => j.id !== jobId)
      stats.value.totalJobs -= 1

      // Close modal if deleted job was selected
      if (selectedJob.value?.id === jobId) {
        closeDetailModal()
      }

      return {
        success: true,
        message: '채용공고가 삭제되었습니다'
      }
    } catch (err) {
      error.value = err.message || '삭제 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Actions - Modal Management
  const openDetailModal = (job) => {
    selectedJob.value = job
    showDetailModal.value = true
  }

  const closeDetailModal = () => {
    selectedJob.value = null
    showDetailModal.value = false
  }

  const openAddModal = () => {
    resetFormData()
    showAddModal.value = true
  }

  const closeAddModal = () => {
    showAddModal.value = false
    resetFormData()
  }

  // Actions - Form Management
  const resetFormData = () => {
    formData.value = {
      title: '',
      company: '',
      description: '',
      location: '',
      experienceLevel: '',
      salary: '',
      employmentType: '',
      jobCategory: '',
      requirements: '',
      benefits: '',
      sourceUrl: ''
    }
  }

  const updateFormData = (field, value) => {
    formData.value[field] = value
  }

  const setFormData = (data) => {
    formData.value = { ...formData.value, ...data }
  }

  // Actions - Utility
  const refreshAll = async () => {
    await Promise.all([
      fetchJobs(),
      fetchStats(),
      fetchCrawlStatus()
    ])
  }

  const getSourceColor = (source) => {
    const colors = {
      '사람인': 'success',
      '잡코리아': 'info',
      '원티드': 'warning',
      '수동등록': 'default'
    }
    return colors[source] || 'default'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  // Actions - Bulk Operations
  const bulkDelete = async (jobIds) => {
    loading.value = true
    error.value = null

    try {
      await jobsAPI.bulkDelete(jobIds)

      // Remove from local state
      jobPostings.value = jobPostings.value.filter(job => !jobIds.includes(job.id))
      stats.value.totalJobs -= jobIds.length

      return {
        success: true,
        message: `${jobIds.length}개의 채용공고가 삭제되었습니다`
      }
    } catch (err) {
      error.value = err.message || '일괄 삭제 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const exportJobs = async (format = 'csv') => {
    try {
      const response = await jobsAPI.exportJobs(format, {
        search: searchQuery.value,
        category: filterCategory.value,
        location: filterLocation.value,
        source: filterSource.value
      })

      return {
        success: true,
        data: response,
        message: `${format.toUpperCase()} 파일이 생성되었습니다`
      }
    } catch (err) {
      error.value = err.message || '내보내기 중 오류가 발생했습니다'
      return {
        success: false,
        message: error.value
      }
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    jobPostings,
    loading,
    crawlingLoading,
    aiSearchLoading,
    addLoading,
    error,
    searchQuery,
    aiSearchQuery,
    filterCategory,
    filterLocation,
    filterSource,
    stats,
    crawlStatus,
    lastUpdate,
    showDetailModal,
    showAddModal,
    selectedJob,
    formData,
    pagination,
    totalPages,

    // Options
    categoryOptions,
    locationOptions,
    sourceOptions,
    jobCategoryOptions,
    experienceOptions,
    employmentOptions,

    // Computed
    filteredJobs,
    isLoading,
    hasError,
    hasJobs,
    getCategoryCount,
    getExperienceCount,
    getLocationCount,
    totalPages,

    // Actions - Data Fetching
    handlePageChange,
    handlePageSizeChange,
    fetchJobs,
    fetchStats,
    fetchCrawlStatus,
    refreshAll,
    setPagination,

    // Actions - Crawling
    getSupportedSites,
    getSiteStatuses,
    startSiteCrawling,
    startCrawling,

    // Actions - Search and Filter
    performSearch,
    performAISearch,
    applyFilters,
    clearFilters,

    // Actions - CRUD
    createJob,
    updateJob,
    deleteJob,
    bulkDelete,
    exportJobs,

    // Actions - Modal Management
    openDetailModal,
    closeDetailModal,
    openAddModal,
    closeAddModal,

    // Actions - Form Management
    resetFormData,
    updateFormData,
    setFormData,

    // Actions - Utility
    getSourceColor,
    formatDate,
    clearError
  }
})