# Requirements — Electron to Web Application Migration

## Intent Analysis
- **User Request**: Electron 기반 네이티브 데스크톱 앱을 Web Application으로 변경
- **Request Type**: Migration
- **Scope**: Multiple Components (프론트엔드 전체 재구성, 인프라 Docker Compose 통합)
- **Complexity**: Complex

---

## Functional Requirements

### FR-01: Vite + React SPA 웹 애플리케이션
- 현재 Electron renderer에서 사용하는 Vite + React 구조를 순수 웹 SPA로 전환
- 기존 코드를 참고하되 새로 작성
- React Router 기반 클라이언트 사이드 라우팅 구현
- 페이지: 대시보드, 거래내역, 설정

### FR-02: Electron 의존성 완전 제거
- Electron 메인 프로세스 코드 제거 (`src/main/`)
- Preload 스크립트 제거 (`src/preload/`)
- IPC 통신 코드 제거
- 시스템 트레이, 네이티브 메뉴 코드 제거
- `electron`, `electron-builder`, `electron-store` 등 Electron 관련 의존성 제거
- 백엔드 자동 시작 로직 제거 (BackendManager)

### FR-03: 거래 관리 기능 유지
- 수입/지출 기록 (날짜, 금액, 카테고리, 태그, 메모)
- 거래 목록 조회, 수정, 삭제
- 기간별, 카테고리별, 태그별 필터링 및 검색

### FR-04: 대시보드 및 데이터 시각화 유지
- 월별 수입/지출 요약
- 카테고리별 지출 분석 (파이 차트)
- 월별 지출 추이 차트
- Top 거래 내역

### FR-05: 데이터 내보내기 (브라우저 다운로드)
- 백엔드 Export API를 통한 CSV, Excel, PDF 다운로드
- 프론트엔드에서 Electron 파일 시스템 대신 브라우저 다운로드 API 사용
- Electron 전용 내보내기 라이브러리 (exceljs, pdfkit, papaparse) 프론트엔드에서 제거

### FR-06: 설정 기능 유지
- 테마 선택 (라이트/다크 모드)
- 언어 선택 (한국어/영어)
- 세션 설정은 백엔드 Session API를 통해 저장

### FR-07: 태그 관리 유지
- 태그 생성, 수정, 삭제
- 거래에 다중 태그 할당

### FR-08: Docker Compose 통합 실행 환경
- 프론트엔드(Nginx로 정적 파일 서빙) + 백엔드(Spring Boot) + DB(MySQL)를 Docker Compose로 통합
- `docker compose up` 한 번으로 전체 스택 실행
- 프론트엔드용 Dockerfile 추가 (빌드 → Nginx 서빙)

---

## Non-Functional Requirements

### NFR-01: 기존 백엔드 API 호환성
- 백엔드 코드 변경 없음 (Spring Boot REST API 그대로 유지)
- 프론트엔드는 기존 API 엔드포인트를 그대로 호출

### NFR-02: 반응형 웹 디자인
- 데스크톱 및 모바일 브라우저 지원
- TailwindCSS 기반 반응형 레이아웃

### NFR-03: 국제화 (i18n)
- 한국어/영어 지원 유지
- 브라우저 환경에 맞는 i18n 라이브러리 사용

### NFR-04: 상태 관리
- Zustand 기반 클라이언트 상태 관리 유지

### NFR-05: 보안
- Security Extension 규칙 적용 (SECURITY-01 ~ 전체)
- HTTPS 통신, CORS 설정, 입력 검증

### NFR-06: 테스트
- Property-Based Testing 규칙 적용 (PBT-01 ~ 전체)
- Jest + React Testing Library 기반 프론트엔드 테스트
- 비즈니스 로직에 대한 PBT 테스트 포함

---

## Out of Scope
- 백엔드 코드 변경 (API, 비즈니스 로직, DB 스키마)
- 사용자 인증/인가 (현재 미구현, 이번 마이그레이션 범위 외)
- 클라우드 배포 (Docker Compose 로컬 실행까지만)
- PWA (Progressive Web App) 기능

---

## Technical Decisions
- **프레임워크**: Vite + React (SPA)
- **라우팅**: React Router
- **상태 관리**: Zustand
- **스타일링**: TailwindCSS
- **차트**: Chart.js + react-chartjs-2
- **HTTP 클라이언트**: Axios
- **빌드 도구**: Vite
- **컨테이너화**: Docker + Nginx (프론트엔드 서빙)
- **오케스트레이션**: Docker Compose (프론트엔드 + 백엔드 + MySQL)
