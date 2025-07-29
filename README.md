# Hybrid Search Frontend

Vue 3, Tailwind CSS, Naive UI를 사용한 하이브리드 검색 시스템의 프론트엔드입니다.

## 🚀 기술 스택

- **Vue 3** - Composition API 사용
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Pinia** - 상태 관리
- **Vue Router** - 라우팅
- **Naive UI** - UI 컴포넌트 라이브러리
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Axios** - HTTP 클라이언트

## 📁 프로젝트 구조

```
src/
├── api/                 # API 호출 함수들
│   ├── index.js        # Axios 설정
│   ├── search.js       # 검색 API
│   ├── document.js     # 문서 API
│   └── analytics.js    # 분석 API
├── components/         # 재사용 가능한 컴포넌트들
├── stores/            # Pinia 스토어들
│   ├── searchStore.js # 검색 상태 관리
│   └── documentStore.js # 문서 상태 관리
├── views/             # 페이지 컴포넌트들
│   ├── SearchView.vue # 검색 페이지
│   ├── DocumentView.vue # 문서 관리 페이지
│   └── AnalyticsView.vue # 분석 페이지
├── router/            # 라우터 설정
│   └── index.js
├── style.css          # 글로벌 스타일
├── App.vue            # 루트 컴포넌트
└── main.js            # 애플리케이션 진입점
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에서 API 서버 URL을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:5130/api
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 빌드 결과 미리보기

```bash
npm run preview
```

## 🎯 주요 기능

### 1. 검색 페이지 (`/`)
- **하이브리드 검색**: 키워드 + 의미적 검색 결합
- **키워드 검색**: 전통적인 텍스트 매칭
- **고급 검색**: 퍼지 검색, 구문 검색 옵션
- **Boolean 검색**: AND/OR/NOT 조건 검색
- **카테고리 필터링**: 기술/데이터베이스/AI 분류
- **검색 기록**: 최근 검색어 저장 및 재사용
- **실시간 결과**: 검색 결과 하이라이팅 및 스니펫

### 2. 문서 관리 페이지 (`/documents`)
- **문서 CRUD**: 생성, 조회, 수정, 삭제
- **카테고리 관리**: 문서 분류 및 필터링
- **검색 기능**: 문서 제목/내용 검색
- **통계 대시보드**: 카테고리별 문서 수 표시
- **페이지네이션**: 대량 데이터 효율적 표시

### 3. 분석 페이지 (`/analytics`)
- **검색 통계**: 총 검색 횟수, 인기 검색어
- **검색 패턴 분석**: 검색 타입별 사용률
- **카테고리 분석**: 카테고리별 검색 빈도
- **시각화**: 차트 및 그래프를 통한 데이터 표현
- **검색 기록**: 최근 검색 활동 타임라인

## 🎨 UI/UX 특징

### 디자인 시스템
- **일관성**: Naive UI 컴포넌트 기반 통일된 디자인
- **반응형**: 모바일, 태블릿, 데스크톱 지원
- **다크모드**: 시스템 설정 기반 자동 전환
- **접근성**: ARIA 속성 및 키보드 네비게이션 지원

### 애니메이션
- **페이지 전환**: 부드러운 fade 효과
- **로딩 상태**: 스켈레톤 UI 및 로딩 스피너
- **인터랙션**: 호버 효과 및 마이크로 애니메이션

### 사용자 경험
- **즉시 피드백**: 실시간 검색 결과 업데이트
- **직관적 네비게이션**: 명확한 메뉴 구조
- **에러 처리**: 친화적인 에러 메시지
- **상태 관리**: 검색 조건 및 결과 유지

## 📱 반응형 디자인

### 브레이크포인트
- **모바일**: < 768px
- **태블릿**: 768px - 1024px
- **데스크톱**: > 1024px

### 적응형 레이아웃
- **모바일**: 단일 컬럼, 햄버거 메뉴
- **태블릿**: 2컬럼 그리드, 축약된 네비게이션
- **데스크톱**: 풀 레이아웃, 사이드바 네비게이션

## 🔧 커스터마이징

### 테마 설정
`src/style.css`에서 색상 팔레트를 수정할 수 있습니다:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### 컴포넌트 확장
새로운 컴포넌트를 추가하려면:

1. `src/components/` 폴더에 Vue 파일 생성
2. Composition API 스타일로 작성
3. TypeScript 지원을 위해 `<script setup lang="ts">` 사용

### API 엔드포인트 추가
새로운 API를 추가하려면:

1. `src/api/` 폴더에 새 파일 생성
2. axios 인스턴스 사용
3. 에러 핸들링 포함

## 🚀 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### Netlify 배포
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker 배포
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 테스트

### 단위 테스트
```bash
npm run test:unit
```

### E2E 테스트
```bash
npm run test:e2e
```

### 테스트 커버리지
```bash
npm run test:coverage
```

## 📊 성능 최적화

### 번들 크기 최적화
- **Code Splitting**: 라우트별 지연 로딩
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Component Lazy Loading**: 필요시에만 컴포넌트 로드

### 런타임 최적화
- **Virtual Scrolling**: 대량 데이터 효율적 렌더링
- **Debouncing**: 검색 입력 최적화
- **Caching**: API 응답 캐싱

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 문제 해결

### 일반적인 문제들

#### 1. API 연결 오류
```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:5130/api/documents

# CORS 설정 확인
# vite.config.js의 proxy 설정 검토
```

##### 2. 빌드 오류
```bash
# 노드 모듈 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm run dev -- --force
```

#### 3. 스타일 문제
```bash
# Tailwind CSS 재빌드
npm run build:css

# PostCSS 설정 확인
# postcss.config.js 검토
```

## 📞 지원

문제가 발생하면 GitHub Issues에 보고해주세요.

---

**Happy Coding! 🎉**