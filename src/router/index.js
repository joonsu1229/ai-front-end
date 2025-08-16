import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '@/views/SearchView.vue'
import DocumentView from '@/views/DocumentView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import JobManagement from '@/views/JobManagement.vue'

const routes = [
  {
    path: '/',
    name: 'JobManagement',
    component: JobManagement,
    meta: {
      title: '채용정보 관리',
      icon: 'document'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView,
    meta: {
      title: '검색',
      icon: 'search'
    }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: DocumentView,
    meta: {
      title: '문서 관리',
      icon: 'document'
    }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: AnalyticsView,
    meta: {
      title: '분석',
      icon: 'analytics'
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router