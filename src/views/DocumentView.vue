<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">문서 관리</h1>
        <p class="text-gray-600 mt-1">검색 데이터베이스의 문서를 관리합니다</p>
      </div>
      <n-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <n-icon>
            <AddOutline />
          </n-icon>
        </template>
        새 문서 추가
      </n-button>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <n-input
            v-model:value="searchQuery"
            placeholder="문서 제목이나 내용으로 검색..."
            clearable
            @input="handleSearch"
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
            placeholder="카테고리 필터"
            class="w-40"
            clearable
            @update:value="handleFilter"
          />
          <n-button @click="handleRefresh" :loading="documentStore.isLoading">
            <template #icon>
              <n-icon>
                <RefreshOutline />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 문서 수</p>
            <p class="text-2xl font-bold text-gray-900">{{ documentStore.documents.length }}</p>
          </div>
          <n-icon size="24" color="#6366f1">
            <DocumentTextOutline />
          </n-icon>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">기술 문서</p>
            <p class="text-2xl font-bold text-green-600">{{ getCategoryCount('technology') }}</p>
          </div>
          <n-icon size="24" color="#10b981">
            <CodeOutline />
          </n-icon>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">데이터베이스</p>
            <p class="text-2xl font-bold text-blue-600">{{ getCategoryCount('database') }}</p>
          </div>
          <n-icon size="24" color="#3b82f6">
            <ServerOutline />
          </n-icon>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">AI 문서</p>
            <p class="text-2xl font-bold text-yellow-600">{{ getCategoryCount('ai') }}</p>
          </div>
          <n-icon size="24" color="#f59e0b">
            <IdCardOutline />
          </n-icon>
        </div>
      </div>
    </div>

    <!-- Documents Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-4 py-5 sm:p-6">
        <n-data-table
          :columns="columns"
          :data="filteredDocuments"
          :loading="documentStore.isLoading"
          :pagination="paginationConfig"
          :row-key="(row) => row.id"
          size="medium"
          striped
        />
      </div>
    </div>

    <!-- Create/Edit Document Modal -->
    <n-modal v-model:show="showCreateModal" :mask-closable="false">
      <n-card
        style="width: 80vw; max-width: 800px"
        :title="editingDocument ? '문서 수정' : '새 문서 추가'"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="closeModal">
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
          <n-form-item label="제목" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="문서 제목을 입력하세요"
              :maxlength="500"
              show-count
            />
          </n-form-item>

          <n-form-item label="카테고리" path="category">
            <n-select
              v-model:value="formData.category"
              :options="categorySelectOptions"
              placeholder="카테고리를 선택하세요"
            />
          </n-form-item>

          <n-form-item label="내용" path="content">
            <n-input
              v-model:value="formData.content"
              type="textarea"
              placeholder="문서 내용을 입력하세요"
              :rows="10"
              :maxlength="10000"
              show-count
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="closeModal">취소</n-button>
            <n-button
              type="primary"
              @click="handleSubmit"
              :loading="documentStore.isLoading"
            >
              {{ editingDocument ? '수정' : '생성' }}
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Delete Confirmation Modal -->
    <n-modal v-model:show="showDeleteModal">
      <n-card
        style="width: 400px"
        title="문서 삭제 확인"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-space vertical>
          <n-text>정말로 이 문서를 삭제하시겠습니까?</n-text>
          <n-text strong>{{ deletingDocument?.title }}</n-text>
          <n-text depth="3" size="small">
            이 작업은 되돌릴 수 없습니다.
          </n-text>
        </n-space>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showDeleteModal = false">취소</n-button>
            <n-button
              type="error"
              @click="confirmDelete"
              :loading="documentStore.isLoading"
            >
              삭제
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Document Preview Modal -->
    <n-modal v-model:show="showPreviewModal" :mask-closable="false">
      <n-card
        style="width: 80vw; max-width: 900px"
        title="문서 미리보기"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showPreviewModal = false">
            <template #icon>
              <n-icon><CloseOutline /></n-icon>
            </template>
          </n-button>
        </template>

        <div v-if="previewDocument" class="space-y-4">
          <div>
            <h2 class="text-xl font-bold mb-2">{{ previewDocument.title }}</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <span>{{ documentStore.formatDate(previewDocument.createdAt) }}</span>
              <n-divider vertical />
              <n-tag size="small" :type="getCategoryColor(previewDocument.category)">
                {{ documentStore.getCategoryLabel(previewDocument.category) }}
              </n-tag>
              <n-divider vertical />
              <span>ID: {{ previewDocument.id }}</span>
            </div>
          </div>

          <n-divider />

          <div class="prose max-w-none">
            <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {{ previewDocument.content }}
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="editDocument(previewDocument)">
              <template #icon>
                <n-icon><CreateOutline /></n-icon>
              </template>
              수정
            </n-button>
            <n-button type="error" @click="deleteDocument(previewDocument)">
              <template #icon>
                <n-icon><TrashOutline /></n-icon>
              </template>
              삭제
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, NButton, NIcon, NTag, NText, NEllipsis } from 'naive-ui'
import { useDocumentStore } from '@/stores/documentStore'
import {
  AddOutline,
  SearchOutline,
  RefreshOutline,
  DocumentTextOutline,
  CodeOutline,
  ServerOutline,
  IdCardOutline,
  CloseOutline,
  CreateOutline,
  TrashOutline,
  EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const documentStore = useDocumentStore()

// Reactive data
const searchQuery = ref('')
const filterCategory = ref('')
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showPreviewModal = ref(false)
const editingDocument = ref(null)
const deletingDocument = ref(null)
const previewDocument = ref(null)
const formRef = ref(null)

// Form data
const formData = ref({
  title: '',
  content: '',
  category: ''
})

// Form rules
const formRules = {
  title: [
    { required: true, message: '제목을 입력해주세요', trigger: 'blur' },
    { min: 1, max: 500, message: '제목은 1-500자 사이여야 합니다', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '카테고리를 선택해주세요', trigger: 'change' }
  ],
  content: [
    { required: true, message: '내용을 입력해주세요', trigger: 'blur' },
    { min: 10, max: 10000, message: '내용은 10-10000자 사이여야 합니다', trigger: 'blur' }
  ]
}

// Options
const categoryOptions = [
  { label: '전체', value: '' },
  { label: '기술', value: 'technology' },
  { label: '데이터베이스', value: 'database' },
  { label: 'AI', value: 'ai' }
]

const categorySelectOptions = [
  { label: '기술', value: 'technology' },
  { label: '데이터베이스', value: 'database' },
  { label: 'AI', value: 'ai' }
]

// Table configuration
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    align: 'center'
  },
  {
    title: '제목',
    key: 'title',
    minWidth: 200,
    render: (row) => h(NEllipsis, { style: { maxWidth: '300px' } }, {
      default: () => row.title
    })
  },
  {
    title: '카테고리',
    key: 'category',
    width: 120,
    render: (row) => h(NTag, {
      size: 'small',
      type: getCategoryColor(row.category)
    }, {
      default: () => documentStore.getCategoryLabel(row.category)
    })
  },
  {
    title: '생성일',
    key: 'createdAt',
    width: 150,
    render: (row) => documentStore.formatDate(row.createdAt)
  },
  {
    title: '수정일',
    key: 'updatedAt',
    width: 150,
    render: (row) => documentStore.formatDate(row.updatedAt)
  },
  {
    title: '작업',
    key: 'actions',
    width: 180,
    align: 'center',
    render: (row) => [
      h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'info',
        onClick: () => previewDocumentHandler(row)
      }, {
        icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
        default: () => '보기'
      }),
      h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'primary',
        onClick: () => editDocument(row),
        style: { marginLeft: '8px' }
      }, {
        icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
        default: () => '수정'
      }),
      h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'error',
        onClick: () => deleteDocument(row),
        style: { marginLeft: '8px' }
      }, {
        icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
        default: () => '삭제'
      })
    ]
  }
]

const paginationConfig = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
  prefix: ({ itemCount }) => `총 ${itemCount}개`
}

// Computed properties
const filteredDocuments = computed(() => {
  let documents = documentStore.documents

  // Category filter
  if (filterCategory.value) {
    documents = documentStore.getDocumentsByCategory(filterCategory.value)
  }

  // Search filter
  if (searchQuery.value) {
    documents = documentStore.searchDocuments(searchQuery.value)
  }

  return documents
})

// Methods
const handleSearch = () => {
  // Search is handled by computed property
}

const handleFilter = () => {
  // Filter is handled by computed property
}

const handleRefresh = async () => {
  try {
    await documentStore.fetchDocuments()
    message.success('문서 목록이 새로고침되었습니다')
  } catch (error) {
    message.error('새로고침 중 오류가 발생했습니다')
  }
}

const previewDocumentHandler = (document) => {
  previewDocument.value = document
  showPreviewModal.value = true
}

const editDocument = (document) => {
  editingDocument.value = document
  formData.value = {
    title: document.title,
    content: document.content,
    category: document.category
  }
  showPreviewModal.value = false
  showCreateModal.value = true
}

const deleteDocument = (document) => {
  deletingDocument.value = document
  showPreviewModal.value = false
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await documentStore.deleteDocument(deletingDocument.value.id)
    message.success('문서가 삭제되었습니다')
    showDeleteModal.value = false
    deletingDocument.value = null
  } catch (error) {
    message.error('문서 삭제 중 오류가 발생했습니다')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (editingDocument.value) {
      await documentStore.updateDocument(editingDocument.value.id, formData.value)
      message.success('문서가 수정되었습니다')
    } else {
      await documentStore.createDocument(formData.value)
      message.success('문서가 생성되었습니다')
    }

    closeModal()
  } catch (error) {
    if (error?.message) {
      message.error(error.message)
    } else {
      message.error('양식을 확인해주세요')
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingDocument.value = null
  formData.value = {
    title: '',
    content: '',
    category: ''
  }
  formRef.value?.restoreValidation()
}

const getCategoryCount = (category) => {
  return documentStore.getDocumentsByCategory(category).length
}

const getCategoryColor = (category) => {
  const colors = {
    'technology': 'success',
    'database': 'info',
    'ai': 'warning',
    '': 'default'
  }
  return colors[category] || 'default'
}

// Lifecycle
onMounted(async () => {
  try {
    await documentStore.fetchDocuments()
  } catch (error) {
    message.error('문서 목록을 불러오는 중 오류가 발생했습니다')
  }
})
</script>

<style scoped>
.prose {
  line-height: 1.7;
}

.prose p {
  margin-bottom: 1rem;
}
</style>