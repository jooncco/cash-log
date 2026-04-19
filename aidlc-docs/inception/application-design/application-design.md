# Application Design — Cash Log Web SPA

## Overview

Electron 데스크톱 앱을 순수 Vite + React SPA 웹 앱으로 전환. 기존 renderer 코드의 구조를 참고하되 새로 작성.

## Architecture

```
Browser
  │
  ▼
Vite + React SPA (Nginx 서빙)
  ├── React Router (/, /transactions, /settings)
  ├── Pages (Dashboard, Transactions, Settings)
  ├── Domain Components (Forms, Charts, Lists)
  ├── Common UI Components (Button, Input, Card, Modal)
  ├── Zustand Stores (transaction, category, tag, session, ui)
  └── API Service Layer (fetch → Spring Boot REST API)
        │
        ▼
Spring Boot Backend (:8080) — 변경 없음
        │
        ▼
MySQL Database — 변경 없음
```

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vite + React SPA | 최소 마이그레이션 비용, 기존 renderer 구조와 동일 |
| Routing | React Router v6 | SPA 클라이언트 라우팅 표준 |
| State | Zustand | 기존 사용 중, 경량 |
| Styling | TailwindCSS | 기존 사용 중 |
| Charts | Chart.js + react-chartjs-2 | 기존 사용 중 |
| HTTP | fetch API (APIClient) | 기존 구현 유지, Axios 제거 가능 |
| i18n | 커스텀 경량 구현 | 기존 i18n.ts 참고 |
| File Download | Blob + anchor download | Electron 파일 시스템 대체 |
| Serving | Nginx (Docker) | 정적 SPA 서빙 |

## Electron 제거 항목

| 제거 대상 | 대체 |
|---|---|
| Electron main process | 없음 (불필요) |
| IPC handlers | 없음 (직접 API 호출) |
| Preload scripts | 없음 |
| System tray | 없음 |
| Native menu | 없음 |
| BackendManager | Docker Compose로 대체 |
| electron-store | Zustand + Backend Session API |
| File system access | Browser download API |

## Artifacts
- [components.md](components.md) — 컴포넌트 정의
- [component-methods.md](component-methods.md) — 메서드 시그니처
- [services.md](services.md) — 서비스 레이어
- [component-dependency.md](component-dependency.md) — 의존성 관계
