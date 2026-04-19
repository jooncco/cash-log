# Components

## Page Components

### DashboardPage
- **Purpose**: 월별 수입/지출 요약, 카테고리 분석 차트, 최근 거래 표시
- **Responsibilities**: 월 선택, 요약 데이터 로드, 차트 렌더링, 최근 거래 목록 표시

### TransactionsPage
- **Purpose**: 거래 내역 CRUD 및 필터링/검색
- **Responsibilities**: 거래 목록 표시, 필터링 (기간/카테고리/태그), 거래 추가/수정/삭제 모달 트리거, 페이지네이션

### SettingsPage
- **Purpose**: 사용자 설정 (테마, 언어), 데이터 내보내기
- **Responsibilities**: 테마 토글, 언어 선택, 카테고리 관리, 내보내기 다이얼로그 트리거

## Layout Components

### AppLayout
- **Purpose**: 전체 앱 레이아웃 쉘 (헤더 + 콘텐츠 영역)
- **Responsibilities**: 라우팅 outlet 제공, 테마 적용, 글로벌 모달 렌더링

### Header
- **Purpose**: 상단 네비게이션 바
- **Responsibilities**: 페이지 간 네비게이션 (React Router Link), 현재 페이지 하이라이트

## Domain Components

### TransactionFormModal
- **Purpose**: 거래 생성/수정 폼 모달
- **Responsibilities**: 폼 입력 (날짜, 금액, 유형, 카테고리, 태그, 메모), 유효성 검증, API 호출

### CategoryFormModal
- **Purpose**: 카테고리 생성/수정 폼 모달
- **Responsibilities**: 카테고리 이름/색상 입력, 유효성 검증, API 호출

### ConfirmDialog
- **Purpose**: 삭제 등 파괴적 작업 확인 다이얼로그
- **Responsibilities**: 확인/취소 액션 처리

### ExportDialog
- **Purpose**: 데이터 내보내기 형식 선택 및 다운로드
- **Responsibilities**: 형식 선택 (CSV/Excel/PDF), 기간 선택, 백엔드 Export API 호출 → 브라우저 다운로드

### MonthlySummaryCard
- **Purpose**: 월별 수입/지출/잔액 요약 카드
- **Responsibilities**: 요약 데이터 표시

### CategoryPieChart
- **Purpose**: 카테고리별 지출 파이 차트
- **Responsibilities**: Chart.js 파이 차트 렌더링

### MonthlyTrendChart
- **Purpose**: 월별 지출 추이 라인/바 차트
- **Responsibilities**: Chart.js 차트 렌더링

### TransactionList
- **Purpose**: 거래 목록 테이블
- **Responsibilities**: 거래 행 렌더링, 수정/삭제 액션, 정렬

### TransactionFilters
- **Purpose**: 거래 필터링 UI
- **Responsibilities**: 기간/카테고리/태그/유형 필터 입력, 필터 상태 관리

## Common UI Components

### Button, Input, Card, Spinner, Modal, Select, DatePicker, Badge, Toast
- **Purpose**: 재사용 가능한 기본 UI 요소
- **Responsibilities**: 일관된 스타일링, 접근성, 이벤트 핸들링
