# Application Design Plan

## Scope
Electron 데스크톱 앱의 프론트엔드를 순수 Vite + React SPA 웹 앱으로 재설계

## Plan

- [x] 1. 컴포넌트 식별 및 정의 (components.md)
  - [x] 1.1 페이지 컴포넌트 정의 (Dashboard, Transactions, Settings)
  - [x] 1.2 레이아웃 컴포넌트 정의 (AppLayout, Header)
  - [x] 1.3 공통 UI 컴포넌트 정의 (Button, Input, Card, Spinner, Modal)
  - [x] 1.4 도메인 컴포넌트 정의 (TransactionForm, CategoryChart, ExportDialog 등)
- [x] 2. 컴포넌트 메서드 정의 (component-methods.md)
  - [x] 2.1 각 페이지 컴포넌트의 주요 인터페이스
  - [x] 2.2 API 클라이언트 메서드 시그니처
  - [x] 2.3 Zustand 스토어 인터페이스
- [x] 3. 서비스 레이어 정의 (services.md)
  - [x] 3.1 API 서비스 모듈 (transactions, categories, tags, analytics, export, session)
  - [x] 3.2 라우팅 서비스 (React Router 구성)
  - [x] 3.3 i18n 서비스
- [x] 4. 컴포넌트 의존성 정의 (component-dependency.md)
  - [x] 4.1 컴포넌트 간 의존성 매트릭스
  - [x] 4.2 데이터 흐름 다이어그램
- [x] 5. 통합 설계 문서 (application-design.md)
