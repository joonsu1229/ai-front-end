<template>
  <div class="space-y-6">
    <!-- Upload Methods -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <n-card 
        :class="{ 'ring-2 ring-blue-500': uploadMethod === 'file' }"
        class="cursor-pointer hover:shadow-lg transition-all"
        @click="uploadMethod = 'file'"
      >
        <div class="text-center">
          <n-icon size="32" color="#3b82f6" class="mb-2">
            <DocumentText />
          </n-icon>
          <h3 class="font-semibold">파일 업로드</h3>
          <p class="text-sm text-gray-500">PDF, DOCX, TXT 파일</p>
        </div>
      </n-card>
      
      <n-card 
        :class="{ 'ring-2 ring-blue-500': uploadMethod === 'url' }"
        class="cursor-pointer hover:shadow-lg transition-all"
        @click="uploadMethod = 'url'"
      >
        <div class="text-center">
          <n-icon size="32" color="#10b981" class="mb-2">
            <Link />
          </n-icon>
          <h3 class="font-semibold">URL 입력</h3>
          <p class="text-sm text-gray-500">웹페이지 크롤링</p>
        </div>
      </n-card>
      
      <n-card 
        :class="{ 'ring-2 ring-blue-500': uploadMethod === 'text' }"
        class="cursor-pointer hover:shadow-lg transition-all"
        @click="uploadMethod = 'text'"
      >
        <div class="text-center">
          <n-icon size="32" color="#f59e0b" class="mb-2">
            <Create />
          </n-icon>
          <h3 class="font-semibold">텍스트 입력</h3>
          <p class="text-sm text-gray-500">직접 텍스트 작성</p>
        </div>
      </n-card>
    </div>

    <!-- File Upload -->
    <div v-if="uploadMethod === 'file'" class="space-y-4">
      <n-upload
        multiple
        directory-dnd
        :max="10"
        :file-list="fileList"
        :before-upload="beforeUpload"
        @update:file-list="handleFileListChange"
        @finish="handleUploadFinish"
        @error="handleUploadError"
        class="w-full"
      >
        <n-upload-dragger class="!h-48">
          <div class="text-center">
            <n-icon size="48" color="#d1d5db" class="mb-4">
              <CloudUpload />
            </n-icon>
            <n-text class="text-lg font-semibold">
              파일을 드래그하거나 클릭하여 업로드
            </n-text>
            <n-text depth="3" class="block mt-2">
              PDF, DOCX, TXT, MD 파일 지원 (최대 50MB)
            </n-text>
          </div>
        </n-upload-dragger>
      </n-upload>

      <!-- Upload Progress -->
      <div v-if="uploadingFiles.length > 0" class="space-y-2">
        <h4 class="font-medium">업로드 진행상황</h4>
        <div
          v-for="file in uploadingFiles"
          :key="file.id"
          class="bg-gray-50 rounded-lg p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">{{ file.name }}</span>
            <span class="text-xs text-gray-500">{{ file.status }}</span>
          </div>
          <n-progress
            :percentage="file.progress"
            :status="file.status === 'error' ? 'error' : file.status === 'finished' ? 'success' : 'info'"
            :show-indicator="false"
          />
        </div>
      </div>
    </div>

    <!-- URL Upload -->
    <div v-if="uploadMethod === 'url'" class="space-y-4">
      <div class="space-y-3">
        <n-input
          v-model:value="urlInput"
          type="textarea"
          :rows="4"
          placeholder="URL을 입력하세요 (한 줄에 하나씩)&#10;https://example.com/article1&#10;https://example.com/article2"
        />
        <div class="flex items-center space-x-4">
          <n-checkbox v-model:checked="crawlOptions.includeLinks">
            링크된 페이지도 크롤링
          </n-checkbox>
          <n-input-number
            v-model:value="crawlOptions.maxDepth"
            :min="1"
            :max="3"
            placeholder="최대 깊이"
            size="small"
            style="width: 100px"
          />
        </div>
      </div>
      
      <n-button
        @click="crawlUrls"
        type="primary"
        :loading="crawling"
        :disabled="!urlInput.trim()"
        class="w-full"
      >
        <template #icon>
          <n-icon><Globe /></n-icon>
        </template>
        웹페이지 크롤링 시작
      </n-button>

      <!-- Crawl Results -->
      <div v-if="crawlResults.length > 0" class="space-y-2">
        <h4 class="font-medium">크롤링 결과</h4>
        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="result in crawlResults"
            :key="result.url"
            class="bg-gray-50 rounded-lg p-3"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ result.title }}</p>
                <p class="text-xs text-gray-500 truncate">{{ result.url }}</p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ result.content.substring(0, 100) }}...
                </p>
              </div>
              <div class="ml-2">
                <n-tag
                  size="small"
                  :type="result.status === 'success' ? 'success' : 'error'"
                >
                  {{ result.status }}
                </n-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Input -->
    <div v-if="uploadMethod === 'text'" class="space-y-4">
      <n-input
        v-model:value="textContent.title"
        placeholder="문서 제목을 입력하세요"
      />
      <n-input
        v-model:value="textContent.content"
        type="textarea"
        :rows="12"
        placeholder="문서 내용을 입력하세요..."
        show-count
      />
      
      <div class="flex items-center space-x-4">
        <n-select
          v-model:value="textContent.type"
          :options="textTypeOptions"
          placeholder="문서 유형"
          style="width: 150px"
        />
        <n-input
          v-model:value="textContent.tags"
          placeholder="태그 (쉼표로 구분)"
          class="flex-1"
        />
      </div>
      
      <n-button
        @click="uploadText"
        type="primary"
        :loading="uploadingText"
        :disabled="!textContent.title.trim() || !textContent.content.trim()"
        class="w-full"
      >
        <template #icon>
          <n-icon><Save /></n-icon>
        </template>
        텍스트 문서 저장
      </n-button>
    </div>

    <!-- Processing Settings -->
    <n-card title="처리 설정" class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block">
            청크 크기
          </label>
          <n-input-number
            v-model:value="processingOptions.chunkSize"
            :min="100"
            :max="2000"
            :step="100"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">
            텍스트를 나눌 청크의 크기 (토큰 단위)
          </p>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block">
            청크 겹침
          </label>
          <n-input-number
            v-model:value="processingOptions.chunkOverlap"
            :min="0"
            :max="500"
            :step="50"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">
            인접한 청크 간의 겹침 크기
          </p>
        </div>
        
        <div class="md:col-span-2">
          <n-checkbox-group v-model:value="processingOptions.features">
            <div class="grid grid-cols-2 gap-2">
              <n-checkbox value="extract_images">이미지 추출</n-checkbox>
              <n-checkbox value="extract_tables">표 추출</n-checkbox>
              <n-checkbox value="ocr_processing">OCR 처리</n-checkbox>
              <n-checkbox value="auto_summarize">자동 요약</n-checkbox>
            </div>
          </n-checkbox-group>
        </div>
      </div>
    </n-card>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-3 pt-4 border-t">
      <n-button @click="$emit('close')">
        취소
      </n-button>
      <n-button
        @click="processDocuments"
        type="primary"
        :loading="processing"
        :disabled="!canProcess"
      >
        <template #icon>
          <n-icon><CheckmarkCircle /></n-icon>
        </template>
        문서 처리 시작
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import {
  DocumentText,
  Link,
  Create,
  CloudUpload,
  Globe,
  Save,
  CheckmarkCircle
} from '@vicons/ionicons5'
import axios from 'axios'

const emit = defineEmits(['uploaded', 'close'])
const message = useMessage()
const notification = useNotification()

// Upload method
const uploadMethod = ref('file')

// File upload
const fileList = ref([])
const uploadingFiles = ref([])

// URL crawling
const urlInput = ref('')
const crawling = ref(false)
const crawlResults = ref([])
const crawlOptions = reactive({
  includeLinks: false,
  maxDepth: 1
})

// Text input
const textContent = reactive({
  title: '',
  content: '',
  type: 'TEXT',
  tags: ''
})

const textTypeOptions = [
  { label: '일반 텍스트', value: 'TEXT' },
  { label: '기술 문서', value: 'TECHNICAL' },
  { label: '논문', value: 'ACADEMIC' },
  { label: '뉴스', value: 'NEWS' },
  { label: '블로그', value: 'BLOG' }
]

// Processing options
const processingOptions = reactive({
  chunkSize: 1000,
  chunkOverlap: 200,
  features: ['extract_images', 'extract_tables']
})

// Loading states
const uploadingText = ref(false)
const processing = ref(false)

// Computed
const canProcess = computed(() => {
  switch (uploadMethod.value) {
    case 'file':
      return fileList.value.length > 0
    case 'url':
      return crawlResults.value.length > 0
    case 'text':
      return textContent.title.trim() && textContent.content.trim()
    default:
      return false
  }
})

// Methods
const beforeUpload = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown'
  ]
  
  if (!allowedTypes.includes(file.file.type)) {
    message.error('지원하지 않는 파일 형식입니다')
    return false
  }
  
  if (file.file.size > 50 * 1024 * 1024) {
    message.error('파일 크기가 50MB를 초과합니다')
    return false
  }
  
  return true
}

const handleFileListChange = (files) => {
  fileList.value = files
}

const handleUploadFinish = ({ file, event }) => {
  const response = JSON.parse(event.target.response)
  if (response.success) {
    message.success(`${file.name} 업로드 완료`)
  } else {
    message.error(`${file.name} 업로드 실패: ${response.message}`)
  }
}

const handleUploadError = ({ file, event }) => {
  message.error(`${file.name} 업로드 중 오류 발생`)
}

const crawlUrls = async () => {
  const urls = urlInput.value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url)
    
  if (urls.length === 0) {
    message.error('URL을 입력해주세요')
    return
  }

  crawling.value = true
  crawlResults.value = []
  
  try {
    const response = await axios.post('/api/documents/crawl', {
      urls,
      options: crawlOptions
    })
    
    if (response.data.success) {
      crawlResults.value = response.data.data
      notification.success({
        title: '크롤링 완료',
        content: `${crawlResults.value.length}개의 페이지를 성공적으로 크롤링했습니다`,
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Crawling error:', error)
    notification.error({
      title: '크롤링 실패',
      content: error.response?.data?.message || '웹페이지 크롤링 중 오류가 발생했습니다',
      duration: 5000
    })
  } finally {
    crawling.value = false
  }
}

const uploadText = async () => {
  uploadingText.value = true
  
  try {
    const response = await axios.post('/api/documents/text', {
      title: textContent.title,
      content: textContent.content,
      documentType: textContent.type,
      tags: textContent.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    })
    
    if (response.data.success) {
      message.success('텍스트 문서가 저장되었습니다')
      
      // Reset form
      textContent.title = ''
      textContent.content = ''
      textContent.type = 'TEXT'
      textContent.tags = ''
    }
  } catch (error) {
    console.error('Text upload error:', error)
    message.error('텍스트 저장 중 오류가 발생했습니다')
  } finally {
    uploadingText.value = false
  }
}

const processDocuments = async () => {
  processing.value = true
  
  try {
    let response
    
    switch (uploadMethod.value) {
      case 'file':
        // 파일 업로드는 이미 완료된 상태이므로 처리만 시작
        response = await axios.post('/api/documents/process', {
          fileIds: fileList.value.map(f => f.id),
          options: processingOptions
        })
        break
        
      case 'url':
        response = await axios.post('/api/documents/process-crawled', {
          crawlResults: crawlResults.value,
          options: processingOptions
        })
        break
        
      case 'text':
        // 텍스트는 이미 저장된 상태
        response = { data: { success: true, data: { title: textContent.title } } }
        break
    }
    
    if (response.data.success) {
      notification.success({
        title: '문서 처리 시작',
        content: '문서 처리가 백그라운드에서 진행됩니다. 완료되면 알림을 받으실 수 있습니다.',
        duration: 5000
      })
      
      emit('uploaded', response.data.data)
    }
  } catch (error) {
    console.error('Processing error:', error)
    notification.error({
      title: '처리 실패',
      content: error.response?.data?.message || '문서 처리 중 오류가 발생했습니다',
      duration: 5000
    })
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
:deep(.n-upload-dragger) {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.n-upload-dragger:hover) {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

:deep(.n-card) {
  transition: all 0.3s ease;
}

:deep(.n-progress-graph-line-fill) {
  transition: all 0.3s ease;
}
</style>