# Services

## API Service Layer

### APIClient (lib/api/client.ts)
- **Purpose**: HTTP 통신 기반 클래스
- **Responsibilities**: Base URL 관리, 요청/응답 처리, 에러 핸들링, 파일 다운로드
- **Communication**: Backend REST API (http://localhost:8080)
- **Note**: 환경변수 `VITE_API_URL`로 base URL 설정

### Domain API Modules (lib/api/*.ts)
- **transactionApi**: 거래 CRUD + 필터링/페이지네이션
- **categoryApi**: 카테고리 CRUD
- **tagApi**: 태그 CRUD
- **analyticsApi**: 월별 요약, 카테고리 분석, 추이 데이터
- **exportApi**: CSV/Excel/PDF 파일 다운로드
- **sessionApi**: 사용자 세션 설정 (테마)

## Routing Service (React Router)

### Router Configuration
- **Purpose**: 클라이언트 사이드 라우팅
- **Routes**:
  - `/` → DashboardPage
  - `/transactions` → TransactionsPage
  - `/settings` → SettingsPage
- **Layout**: AppLayout이 모든 라우트를 감싸는 공통 레이아웃
- **Implementation**: `createBrowserRouter` + `RouterProvider`

## i18n Service

### i18n (lib/i18n.ts)
- **Purpose**: 한국어/영어 국제화
- **Responsibilities**: 번역 키 관리, 언어 전환, 날짜/숫자 포맷팅
- **Implementation**: 경량 커스텀 i18n (기존 구현 참고) 또는 react-i18next

## File Download Service

### downloadFile (lib/download.ts)
- **Purpose**: 브라우저 파일 다운로드 유틸리티
- **Responsibilities**: Blob → 브라우저 다운로드 트리거 (anchor 태그 기반)
- **Replaces**: Electron의 파일 시스템 직접 접근
