# Requirement Verification Questions

## Intent Analysis
- **User Request**: Electron 기반 네이티브 데스크톱 앱을 Web Application으로 변경
- **Request Type**: Migration
- **Scope**: Multiple Components (프론트엔드 전체 재구성)
- **Complexity**: Complex

---

## Question 1: 웹 프레임워크 선택
현재 Electron 내부에서 Vite + React (SPA) 구조로 렌더링하고 있습니다. 웹 앱으로 전환 시 어떤 방식을 선호하시나요?

A) **Vite + React SPA 유지** — 현재 renderer 코드를 최소한으로 수정하여 순수 SPA로 전환 (가장 빠른 마이그레이션)
B) **Next.js (App Router)** — 기존 `app/` 디렉토리의 Next.js 코드를 활용하여 SSR/SSG 지원 웹 앱으로 전환
C) **Next.js (Pages Router)** — Pages Router 기반 Next.js 웹 앱으로 전환
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: Electron 전용 기능 처리
현재 Electron에서 사용 중인 네이티브 기능들이 있습니다. 이들을 어떻게 처리할까요?

- **시스템 트레이 (System Tray)**: 트레이 아이콘 및 메뉴
- **네이티브 메뉴 (Native Menu)**: macOS 메뉴바
- **IPC 통신**: 메인-렌더러 프로세스 간 통신
- **백엔드 자동 시작**: Electron이 Docker + Spring Boot를 자동 관리
- **파일 시스템 접근**: 로컬 파일 직접 접근

A) **모두 제거** — 웹 앱에서는 불필요한 네이티브 기능을 모두 제거하고, 브라우저 기반 대안으로 대체
B) **일부 유지** — 특정 기능은 웹 대안으로 구현 (어떤 기능인지 [Answer]: 태그 뒤에 설명해주세요)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: 백엔드 및 인프라 변경 범위
현재 백엔드(Spring Boot)는 Electron 앱이 Docker를 통해 로컬에서 자동 시작합니다. 웹 앱 전환 시 백엔드 배포 방식은?

A) **백엔드 변경 없음** — 백엔드는 그대로 두고, 프론트엔드만 웹 앱으로 전환 (개발 시 수동으로 백엔드 실행)
B) **Docker Compose로 통합** — 프론트엔드(웹) + 백엔드 + DB를 Docker Compose로 한번에 실행
C) **클라우드 배포 고려** — AWS 등 클라우드 환경에 배포할 수 있도록 설계
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4: 데이터 내보내기 기능
현재 CSV, Excel, PDF 내보내기가 Electron의 파일 시스템 접근을 통해 구현되어 있습니다. 웹 앱에서는?

A) **브라우저 다운로드** — 백엔드에서 파일을 생성하고 브라우저 다운로드로 제공 (현재 백엔드에 이미 Export API 존재)
B) **프론트엔드에서 생성** — 브라우저에서 직접 CSV/Excel/PDF 생성 후 다운로드
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: 기존 코드 활용 범위
현재 프로젝트에는 두 가지 프론트엔드 코드가 공존합니다:
1. `apps/frontend/src/renderer/` — Electron용 Vite + React SPA 코드 (최신, 실제 사용 중)
2. `apps/frontend/app/`, `components/`, `lib/` — 이전 Next.js 코드 (레거시)

A) **renderer 코드 기반** — 현재 실제 동작하는 `src/renderer/` 코드를 기반으로 웹 앱 전환
B) **레거시 Next.js 코드 기반** — 기존 `app/` 디렉토리의 Next.js 코드를 기반으로 복원/전환
C) **새로 작성** — 기존 코드를 참고하되 처음부터 새로 작성
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용할까요?

A) Yes — 모든 SECURITY 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing (PBT) 규칙을 적용할까요?

A) Yes — 모든 PBT 규칙을 blocking constraint로 적용
B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용
C) No — 모든 PBT 규칙 건너뛰기 (단순 CRUD 앱, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: A
