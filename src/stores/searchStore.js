import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchAPI } from '@/api/search'

export const useSearchStore = defineStore('search', () => {
  // State
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentQuery = ref('')
  const searchType = ref('hybrid')
  const selectedCategory = ref('')
  const searchHistory = ref([])
  const totalResults = ref(0)
  const searchTime = ref(0)

  // Search options
  const searchOptions = ref({
    useFuzzy: false,
    usePhrase: false,
    limit: 10
  })

  // Boolean search options
  const booleanOptions = ref({
    mustHave: [],
    shouldHave: [],
    mustNotHave: []
  })

  // Computed
  const hasResults = computed(() => searchResults.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Categories
  const categories = ref([
    { label: '전체', value: '' },
    { label: '기술', value: 'technology' },
    { label: '데이터베이스', value: 'database' },
    { label: 'AI', value: 'ai' }
  ])

  // Actions
  const performSearch = async (query, type = 'hybrid') => {
    if (!query.trim()) return

    loading.value = true
    error.value = null
    currentQuery.value = query
    searchType.value = type

    const startTime = Date.now()

    try {
      let results = []
      
      switch (type) {
        case 'hybrid':
          results = await searchAPI.hybridSearch(query, selectedCategory.value, searchOptions.value.limit)
          break
        case 'lexical':
          results = await searchAPI.lexicalSearch(query, selectedCategory.value, searchOptions.value.limit)
          break
        case 'semantic':
          results = await searchAPI.semanticSearch(query, selectedCategory.value, searchOptions.value.limit)
          break          
        case 'advanced':
          results = await searchAPI.advancedSearch(
            query, 
            selectedCategory.value, 
            searchOptions.value.useFuzzy,
            searchOptions.value.usePhrase,
            searchOptions.value.limit
          )
          break
        case 'boolean':
          results = await searchAPI.booleanSearch({
            ...booleanOptions.value,
            category: selectedCategory.value,
            limit: searchOptions.value.limit
          })
          break
        default:
          results = await searchAPI.hybridSearch(query, selectedCategory.value, searchOptions.value.limit)
      }

      searchResults.value = results
      totalResults.value = results.length
      searchTime.value = Date.now() - startTime

      // Add to search history
      addToHistory(query, type)

    } catch (err) {
      error.value = err.message || '검색 중 오류가 발생했습니다.'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      loading.value = false
    }
  }

  const searchByCategory = async (category) => {
    loading.value = true
    error.value = null
    selectedCategory.value = category

    try {
      const results = await searchAPI.searchByCategory(category, searchOptions.value.limit)
      searchResults.value = results
      totalResults.value = results.length
      currentQuery.value = `카테고리: ${category}`
      searchType.value = 'category'
    } catch (err) {
      error.value = err.message || '카테고리 검색 중 오류가 발생했습니다.'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      loading.value = false
    }
  }

  const addToHistory = (query, type) => {
    const historyItem = {
      query,
      type,
      category: selectedCategory.value,
      timestamp: new Date(),
      results: totalResults.value
    }

    // Remove duplicate
    searchHistory.value = searchHistory.value.filter(item => 
      !(item.query === query && item.type === type && item.category === selectedCategory.value)
    )

    // Add to beginning
    searchHistory.value.unshift(historyItem)

    // Keep only last 20 items
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
  }

  const clearResults = () => {
    searchResults.value = []
    currentQuery.value = ''
    error.value = null
    totalResults.value = 0
    searchTime.value = 0
  }

  const clearHistory = () => {
    searchHistory.value = []
  }

  const setCategory = (category) => {
    selectedCategory.value = category
  }

  const setSearchOptions = (options) => {
    searchOptions.value = { ...searchOptions.value, ...options }
  }

  const setBooleanOptions = (options) => {
    booleanOptions.value = { ...booleanOptions.value, ...options }
  }

  const highlightText = (text, query) => {
    if (!query || !text) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<span class="search-highlight">$1</span>')
  }

  return {
    // State
    searchResults,
    loading,
    error,
    currentQuery,
    searchType,
    selectedCategory,
    searchHistory,
    totalResults,
    searchTime,
    searchOptions,
    booleanOptions,
    categories,
    
    // Computed
    hasResults,
    isLoading,
    hasError,
    
    // Actions
    performSearch,
    searchByCategory,
    clearResults,
    clearHistory,
    setCategory,
    setSearchOptions,
    setBooleanOptions,
    highlightText
  }
})