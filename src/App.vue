<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <!-- Logo -->
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <h1 class="text-2xl font-bold text-gray-900">
                    <img src="/jsai_logo.png" alt="JSAI" style="width: 100px; height: 80px; vertical-align: middle;">
                  </h1>
                </div>
              </div>

              <!-- Navigation -->
              <nav class="hidden md:flex space-x-8">
                <router-link
                  v-for="route in routes"
                  :key="route.name"
                  :to="{ name: route.name }"
                  class="nav-link"
                  :class="{ 'nav-link-active': $route.name === route.name }"
                >
                  <n-icon :size="18" class="mr-2">
                    <component :is="getIcon(route.meta.icon)" />
                  </n-icon>
                  {{ route.meta.title }}
                </router-link>
              </nav>

              <!-- Mobile menu button -->
              <div class="md:hidden">
                <n-button 
                  quaternary 
                  circle 
                  @click="mobileMenuOpen = !mobileMenuOpen"
                >
                  <template #icon>
                    <n-icon :size="20">
                      <MenuOutline v-if="!mobileMenuOpen" />
                      <CloseOutline v-else />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>

          <!-- Mobile menu -->
          <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200">
            <div class="px-2 pt-2 pb-3 space-y-1 bg-white">
              <router-link
                v-for="route in routes"
                :key="route.name"
                :to="{ name: route.name }"
                class="mobile-nav-link"
                :class="{ 'mobile-nav-link-active': $route.name === route.name }"
                @click="mobileMenuOpen = false"
              >
                <n-icon :size="18" class="mr-3">
                  <component :is="getIcon(route.meta.icon)" />
                </n-icon>
                {{ route.meta.title }}
              </router-link>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <div class="text-sm text-gray-500">
                © 2024 HybridSearch. Spring Boot + Vue.js로 구현된 하이브리드 검색 시스템
              </div>
              <div class="flex items-center space-x-4 mt-4 md:mt-0">
                <n-tag size="small" type="info">Java 21</n-tag>
                <n-tag size="small" type="success">Spring Boot</n-tag>
                <n-tag size="small" type="warning">Vue 3</n-tag>
                <n-tag size="small" type="error">LangChain</n-tag>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SearchOutline, 
  DocumentTextOutline, 
  BarChartOutline,
  MenuOutline,
  CloseOutline
} from '@vicons/ionicons5'

const router = useRouter()
const theme = ref(null)
const mobileMenuOpen = ref(false)

const routes = computed(() => 
  router.getRoutes().filter(route => route.meta?.title)
)

const getIcon = (iconName) => {
  const icons = {
    search: SearchOutline,
    document: DocumentTextOutline,
    analytics: BarChartOutline
  }
  return icons[iconName] || SearchOutline
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.mobile-nav-link {
  @apply flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50;
}

.mobile-nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>