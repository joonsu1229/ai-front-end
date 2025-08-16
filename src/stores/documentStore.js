import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentAPI } from '@/api/document'

export const useDocumentStore = defineStore('document', () => {
  // State
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentDocument = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // Computed
  const hasDocuments = computed(() => documents.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

  // Actions
  const fetchDocuments = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await documentAPI.getAllDocuments()
      documents.value = response.data
      pagination.value.total = response.data.length
    } catch (err) {
      error.value = err.message || '문서를 불러오는 중 오류가 발생했습니다.'
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  const getDocument = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await documentAPI.getDocument(id)
      currentDocument.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || '문서를 불러오는 중 오류가 발생했습니다.'
      currentDocument.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const createDocument = async (documentData) => {
    loading.value = true
    error.value = null

    try {
      const response = await documentAPI.createDocument(documentData)
      documents.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (err) {
      error.value = err.message || '문서 생성 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDocument = async (id, documentData) => {
    loading.value = true
    error.value = null

    try {
      const response = await documentAPI.updateDocument(id, documentData)
      const index = documents.value.findIndex(doc => doc.id === id)
      if (index !== -1) {
        documents.value[index] = response.data
      }
      if (currentDocument.value?.id === id) {
        currentDocument.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message || '문서 수정 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDocument = async (id) => {
    loading.value = true
    error.value = null

    try {
      await documentAPI.deleteDocument(id)
      documents.value = documents.value.filter(doc => doc.id !== id)
      pagination.value.total -= 1
      if (currentDocument.value?.id === id) {
        currentDocument.value = null
      }
    } catch (err) {
      error.value = err.message || '문서 삭제 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentDocument = () => {
    currentDocument.value = null
  }

  const setPagination = (page, pageSize) => {
    pagination.value.page = page
    pagination.value.pageSize = pageSize
  }

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'technology': '기술',
      'database': '데이터베이스',
      'ai': 'AI',
      '': '미분류'
    }
    return categoryMap[category] || category
  }

  const getDocumentsByCategory = (category) => {
    if (!category || category === '') return documents.value
    return documents.value.filter(doc => doc.category === category)
  }

  const searchDocuments = (query) => {
    if (!query) return documents.value

    const lowercaseQuery = query.toLowerCase()
    return documents.value.filter(doc =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery)
    )
  }

  return {
    // State
    documents,
    loading,
    error,
    currentDocument,
    pagination,

    // Computed
    hasDocuments,
    isLoading,
    hasError,
    totalPages,

    // Actions
    fetchDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    clearError,
    clearCurrentDocument,
    setPagination,

    // Helper functions
    formatDate,
    getCategoryLabel,
    getDocumentsByCategory,
    searchDocuments
  }
})