// @/jobs.js
import apiClient from './index'

export const jobsAPI = {
  // Get jobs with filtering and pagination
  async getJobs(params = {}) {
    const searchParams = new URLSearchParams()

    if (params.search) searchParams.append('search', params.search)
    if (params.category) searchParams.append('category', params.category)
    if (params.location) searchParams.append('location', params.location)
    if (params.source) searchParams.append('source', params.source)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)

    const queryString = searchParams.toString()
    const url = queryString ? `/jobs?${queryString}` : '/jobs'

    const response = await apiClient.get(url)
    return response.data
  },

  // Get job by ID
  async getJobById(id) {
    const response = await apiClient.get(`/jobs/${id}`)
    return response.data
  },

  // Create new job
  async createJob(jobData) {
    const response = await apiClient.post('/jobs', jobData)
    return response.data
  },

  // Update job
  async updateJob(id, jobData) {
    const response = await apiClient.put(`/jobs/${id}`, jobData)
    return response.data
  },

  // Delete job
  async deleteJob(id) {
    const response = await apiClient.delete(`/jobs/${id}`)
    return response.data
  },

  // Bulk delete jobs
  async bulkDelete(jobIds) {
    const response = await apiClient.delete('/jobs/bulk', {
      data: { ids: jobIds }
    })
    return response.data
  },

  // Get statistics
  async getStats() {
    const response = await apiClient.get('/jobs/stats')
    return response.data
  },

  // Get crawling status
  async getCrawlStatus() {
    const response = await apiClient.get('/jobs/crawl/status')
    return response.data
  },

  // Start crawling (all sites)
  async startCrawling() {
    const response = await apiClient.post('/jobs/crawl')
    return response.data
  },

  // Stop crawling
  async stopCrawling() {
    const response = await apiClient.post('/jobs/crawl/stop')
    return response.data
  },

  // Get supported crawling sites
  async getSupportedSites() {
    const response = await apiClient.get('/jobs/crawl/sites')
    return response.data
  },

  // Get site crawling status
  async getSiteStatuses() {
    const response = await apiClient.get('/jobs/crawl/sites/status')
    return response.data
  },

  // Start crawling specific sites
  async startSiteCrawling(sites, options = {}) {
    const response = await apiClient.post('/jobs/crawl/sites', {
      sites,
      options
    })
    return response.data
  },

  // AI-powered semantic search
  async aiSearch(params) {
    const response = await apiClient.post('/jobs/search/hybrid', params)
    return response.data
  },

  // Advanced search with filters
  async advancedSearch(params) {
    const response = await apiClient.post('/jobs/search/advanced', params)
    return response.data
  },

  // Export jobs to CSV/Excel
  async exportJobs(format = 'csv', filters = {}) {
    const response = await apiClient.post(`/jobs/export/${format}`, filters, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get job categories
  async getCategories() {
    const response = await apiClient.get('/jobs/categories')
    return response.data
  },

  // Get companies
  async getCompanies(search = '') {
    const params = search ? { search } : {}
    const response = await apiClient.get('/jobs/companies', { params })
    return response.data
  },

  // Get locations
  async getLocations(search = '') {
    const params = search ? { search } : {}
    const response = await apiClient.get('/jobs/locations', { params })
    return response.data
  },

  // Get trending keywords
  async getTrendingKeywords(period = '7d') {
    const response = await apiClient.get(`/jobs/trending?period=${period}`)
    return response.data
  },

  // Get job recommendations based on user profile
  async getRecommendations(userProfile) {
    const response = await apiClient.post('/jobs/recommendations', userProfile)
    return response.data
  },

  // Mark job as favorite
  async addToFavorites(jobId) {
    const response = await apiClient.post(`/jobs/${jobId}/favorite`)
    return response.data
  },

  // Remove job from favorites
  async removeFromFavorites(jobId) {
    const response = await apiClient.delete(`/jobs/${jobId}/favorite`)
    return response.data
  },

  // Get user's favorite jobs
  async getFavorites() {
    const response = await apiClient.get('/jobs/favorites')
    return response.data
  },

  // Apply to job (if integration with application system exists)
  async applyToJob(jobId, applicationData) {
    const response = await apiClient.post(`/jobs/${jobId}/apply`, applicationData)
    return response.data
  },

  // Get application status
  async getApplicationStatus(jobId) {
    const response = await apiClient.get(`/jobs/${jobId}/application-status`)
    return response.data
  },

  // Report job posting (for spam/inappropriate content)
  async reportJob(jobId, reason) {
    const response = await apiClient.post(`/jobs/${jobId}/report`, { reason })
    return response.data
  },

  // Get job posting analytics (for admin)
  async getAnalytics(period = '30d') {
    const response = await apiClient.get(`/jobs/analytics?period=${period}`)
    return response.data
  },

  // Refresh job data from source
  async refreshJobData(jobId) {
    const response = await apiClient.post(`/jobs/${jobId}/refresh`)
    return response.data
  },

  // Get similar jobs
  async getSimilarJobs(jobId, limit = 10) {
    const response = await apiClient.get(`/jobs/${jobId}/similar?limit=${limit}`)
    return response.data
  },

  // Auto-categorize job based on content
  async categorizeJob(jobData) {
    const response = await apiClient.post('/jobs/categorize', jobData)
    return response.data
  },

  // Extract skills from job description
  async extractSkills(description) {
    const response = await apiClient.post('/jobs/extract-skills', { description })
    return response.data
  },

  // Get salary insights for a position
  async getSalaryInsights(params) {
    const response = await apiClient.post('/jobs/salary-insights', params)
    return response.data
  },

  // Schedule job alerts
  async createJobAlert(alertData) {
    const response = await apiClient.post('/jobs/alerts', alertData)
    return response.data
  },

  // Get user's job alerts
  async getJobAlerts() {
    const response = await apiClient.get('/jobs/alerts')
    return response.data
  },

  // Update job alert
  async updateJobAlert(alertId, alertData) {
    const response = await apiClient.put(`/jobs/alerts/${alertId}`, alertData)
    return response.data
  },

  // Delete job alert
  async deleteJobAlert(alertId) {
    const response = await apiClient.delete(`/jobs/alerts/${alertId}`)
    return response.data
  }
}