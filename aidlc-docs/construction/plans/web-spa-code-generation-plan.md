# Code Generation Plan — Web SPA Migration

## Unit Context
- **Unit**: Frontend Web SPA + Docker Compose 통합
- **Workspace Root**: /Users/jooncco/workspace/cash-log
- **Approach**: 기존 `src/renderer/` 코드를 참고하되 새로 작성. Electron 코드 제거.
- **Target Directory**: `apps/frontend/` (기존 Electron 코드를 웹 SPA로 교체)

## Code Generation Steps

### Phase A: Project Setup & Configuration

- [x] **Step 1**: 프론트엔드 `package.json` 재작성
  - Electron 관련 의존성 제거 (electron, electron-builder, electron-store, concurrently, wait-on)
  - Electron 전용 라이브러리 제거 (exceljs, pdfkit, papaparse)
  - React Router 추가 (react-router-dom)
  - 스크립트 변경: dev → `vite`, build → `vite build`, preview → `vite preview`
  - 유지: react, react-dom, zustand, react-hook-form, chart.js, react-chartjs-2, date-fns, lucide-react, axios 제거 (fetch 사용)

- [x] **Step 2**: Vite 설정 단순화
  - `vite.config.ts` 단일 파일 (기존 main/renderer/preload 3개 → 1개)
  - React plugin, TailwindCSS, 환경변수 `VITE_API_URL` 설정
  - 개발 서버 proxy: `/api` → `http://localhost:8080`

- [x] **Step 3**: `tsconfig.json` 단순화
  - Electron 관련 설정 제거, 순수 브라우저 타겟

- [x] **Step 4**: `index.html` 업데이트
  - Vite SPA 엔트리 포인트

- [x] **Step 5**: TailwindCSS + PostCSS 설정 유지
  - `tailwind.config.js`, `postcss.config.js` 경로 업데이트

### Phase B: Core Application Code

- [x] **Step 6**: 타입 정의 (`src/types/index.ts`)
  - 기존 renderer/types/index.ts 기반, Electron 타입 제거

- [x] **Step 7**: i18n 유틸리티 (`src/lib/i18n.ts`)
  - 기존 커스텀 i18n 구현 유지 (ko/en 번역)

- [x] **Step 8**: API 클라이언트 (`src/lib/api/client.ts`)
  - fetch 기반, baseURL은 상대경로 (`/api`) — Nginx 프록시 또는 Vite dev proxy 활용
  - download 메서드 유지

- [x] **Step 9**: API 서비스 모듈
  - `src/lib/api/transactions.ts` — 거래 CRUD
  - `src/lib/api/categories.ts` — 카테고리 CRUD
  - `src/lib/api/tags.ts` — 태그 CRUD
  - `src/lib/api/analytics.ts` — 월별 요약, 카테고리 분석
  - `src/lib/api/export.ts` — CSV/Excel/PDF 다운로드
  - `src/lib/api/session.ts` — 세션 설정

- [x] **Step 10**: 파일 다운로드 유틸리티 (`src/lib/download.ts`)
  - Blob → anchor 태그 기반 브라우저 다운로드

- [x] **Step 11**: Zustand 스토어
  - `src/lib/stores/transactionStore.ts`
  - `src/lib/stores/categoryStore.ts`
  - `src/lib/stores/tagStore.ts`
  - `src/lib/stores/sessionStore.ts` (localStorage persist)
  - `src/lib/stores/uiStore.ts` (모달/토스트 상태)

### Phase C: UI Components

- [x] **Step 12**: 공통 UI 컴포넌트 (`src/components/ui/`)
  - Button, Input, Card, Spinner, Modal, Select, Badge

- [x] **Step 13**: 레이아웃 컴포넌트
  - `src/components/layout/AppLayout.tsx` — React Router Outlet + 글로벌 모달
  - `src/components/layout/Header.tsx` — React Router Link 기반 네비게이션 (BackendStatus 제거)

- [x] **Step 14**: 도메인 컴포넌트
  - `src/components/TransactionList.tsx`
  - `src/components/TransactionFilters.tsx`
  - `src/components/MonthlySummaryCard.tsx`
  - `src/components/CategoryPieChart.tsx`
  - `src/components/MonthlyTrendChart.tsx`

- [x] **Step 15**: 모달 컴포넌트
  - `src/components/modals/TransactionFormModal.tsx`
  - `src/components/modals/CategoryFormModal.tsx`
  - `src/components/modals/ConfirmDialog.tsx`
  - `src/components/modals/ExportDialog.tsx`

### Phase D: Pages & Routing

- [x] **Step 16**: 페이지 컴포넌트
  - `src/pages/DashboardPage.tsx`
  - `src/pages/TransactionsPage.tsx`
  - `src/pages/SettingsPage.tsx`

- [x] **Step 17**: React Router 설정 + 엔트리 포인트
  - `src/router.tsx` — createBrowserRouter (/, /transactions, /settings)
  - `src/main.tsx` — RouterProvider 렌더링
  - `src/globals.css` — TailwindCSS 디렉티브

### Phase E: Infrastructure & Deployment

- [x] **Step 18**: 프론트엔드 Dockerfile (multi-stage)
  - Stage 1: Node.js 빌드
  - Stage 2: Nginx 서빙

- [x] **Step 19**: Nginx 설정 (`apps/frontend/nginx.conf`)
  - SPA fallback, API 리버스 프록시

- [x] **Step 20**: 루트 Docker Compose (`docker-compose.yml`)
  - frontend + backend + mysql 3개 서비스
  - `.env.example` 환경변수 템플릿

### Phase F: Cleanup

- [x] **Step 21**: Electron 코드 제거
  - `src/main/` 디렉토리 전체 삭제
  - `src/preload/` 디렉토리 전체 삭제
  - `src/renderer/` 디렉토리 전체 삭제
  - `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts` 삭제
  - `electron-builder.yml` 삭제
  - `scripts/prepare-resources.js` 삭제
  - 레거시 Next.js 코드 삭제 (`app/`, `components/`, `lib/`, `types/`, `hooks/`, `messages/`)

### Phase G: Tests

- [x] **Step 22**: 테스트 설정 및 유닛 테스트
  - Jest + React Testing Library 설정
  - API 클라이언트 테스트
  - Zustand 스토어 테스트
  - 주요 컴포넌트 렌더링 테스트

## Total: 22 Steps
