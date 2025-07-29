import apiClient from './index'

export const documentAPI = {
  // 모든 문서 조회
  async getAllDocuments() {
    return await apiClient.get('/documents')
  },

  // 특정 문서 조회
  async getDocument(id) {
    return await apiClient.get(`/documents/${id}`)
  },

  // 문서 생성
  async createDocument(documentData) {
    return await apiClient.post('/documents', documentData)
  },

  // 문서 수정
  async updateDocument(id, documentData) {
    return await apiClient.put(`/documents/${id}`, documentData)
  },

  // 문서 삭제
  async deleteDocument(id) {
    return await apiClient.delete(`/documents/${id}`)
  }
}