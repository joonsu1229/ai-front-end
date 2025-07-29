import apiClient from './index'

export const analyticsAPI = {
  // 인기 검색어 조회
  async getPopularQueries(limit = 10) {
    const response = await apiClient.get('/analytics/popular-queries', {
      params: { limit }
    })
    return response.data
  },

  // 총 검색 횟수 조회
  async getTotalSearches() {
    const response = await apiClient.get('/analytics/total-searches')
    return response.data
  }
}