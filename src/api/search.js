import apiClient from './index'

export const searchAPI = {
  // 하이브리드 검색
  async hybridSearch(query, category = '', limit = 10) {
    const params = { query, limit }
    if (category) params.category = category

    const response = await apiClient.get('/search/hybrid', { params })
    return response.data
  },

  // 키워드 검색
  async lexicalSearch(query, category = '', limit = 10) {
    const params = { query, limit }
    if (category) params.category = category

    const response = await apiClient.get('/search/lexical', { params })
    return response.data
  },

    // 의미 검색
  async semanticSearch(query, category = '', limit = 10) {
    const params = { query, limit }
    if (category) params.category = category

    const response = await apiClient.get('/search/semantic', { params })
    return response.data
  },

  // Boolean 검색
  async booleanSearch(searchRequest) {
    const response = await apiClient.post('/search/boolean', searchRequest)
    return response.data
  },

  // 고급 검색
  async advancedSearch(query, category = '', useFuzzy = false, usePhrase = false, limit = 10) {
    const params = { 
      query, 
      limit,
      useFuzzy,
      usePhrase
    }
    if (category) params.category = category

    const response = await apiClient.get('/search/advanced', { params })
    return response.data
  },

  // 카테고리별 검색
  async searchByCategory(category, limit = 10) {
    const response = await apiClient.get(`/search/category/${category}`, {
      params: { limit }
    })
    return response.data
  }
}