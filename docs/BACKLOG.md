# Cash Log 개선 백로그

> 2026-07-28 코드 감사(대시보드/거래/설정 UX, 데이터 모델, 백엔드 비즈니스 로직 전반) 결과를 정리한 백로그.
> 각 항목은 `CL-xxx` ID로 참조한다. 상태는 `Open` / `In Progress` / `Done`.

## 우선순위 요약

| ID | 제목 | 분류 | 심각도 | 상태 |
|---|---|---|---|---|
| CL-001 | 외화(USD/EUR/JPY) 거래 등록이 항상 실패함 | Bug | Critical | Done |
| CL-002 | Toast 에러 피드백 시스템이 연결되어 있지 않음 | Bug | Critical | Done |
| CL-003 | 죽은 예산(budget) 필드 정리 | Data | Low | Done |
| CL-004 | 죽은 `/api/analytics/*` 엔드포인트 및 중복 집계 로직 정리 | Data | Medium | Done |
| CL-005 | CORS Origin 하드코딩 제거 | Backend | Low | Done |
| CL-006 | 태그 색상 랜덤 배정 → 결정론적 배정 | Backend | Low | Done |
| CL-007 | 거래 목록 페이지네이션 부재 | UX/Backend | Medium | Done |
| CL-008 | 필터링이 DB가 아닌 인메모리에서 수행됨 (Specification 패턴 도입) | Backend | Medium | Done |
| CL-009 | 서버 상태 관리 방식 개선 (Zustand → TanStack Query) | Frontend | Medium | Done |
| CL-010 | 월 이동 UX 개선 (빠른 이동 수단 부재) | UX | Low | Done |
| CL-011 | 삭제 확인 모달에 대상 컨텍스트 부족 | UX | Low | Done |
| CL-012 | 태그 이름 중복/공백 방지 없음 | Data | Low | Done |
| CL-013 | 대시보드에 수입 분석(카테고리/태그)이 없음 | UX | Low | Done |

---

## CL-001. 외화 거래 등록이 항상 실패함
- **분류**: Bug / Critical
- **증상**: `TransactionFormModal`에서 통화를 USD/EUR/JPY로 선택해 저장하면 항상 400 에러. `conversionRate` 입력 필드가 폼에 없는데, 백엔드(`TransactionService.calculateAmountKrw`)는 KRW가 아니면 `conversionRate`가 없으면 예외를 던짐.
- **관련 파일**: `apps/frontend/src/components/modals/TransactionFormModal.tsx`, `apps/backend/.../service/TransactionService.java:132-140`
- **해결 방향**: 통화가 KRW가 아닐 때만 노출되는 환율 입력 필드를 폼에 추가. (선택) 외부 환율 API 연동은 별도 항목으로 분리 가능.

## CL-002. Toast 에러 피드백 시스템이 연결되어 있지 않음
- **분류**: Bug / Critical
- **증상**: `Toast` 타입, `uiStore`의 `addToast`/`toasts`가 정의돼 있지만 렌더링하는 컴포넌트가 없고 어떤 store 액션도 호출하지 않음. add/update/delete 실패 시 사용자에게 아무 피드백이 없음(콘솔에만 unhandled rejection).
- **관련 파일**: `apps/frontend/src/lib/stores/uiStore.ts`, `apps/frontend/src/lib/stores/{transaction,category,tag}Store.ts`
- **해결 방향**: `ToastContainer` 컴포넌트를 만들어 `AppLayout`에 마운트하고, 각 store의 mutation catch 블록에서 `addToast`를 호출하도록 연결. `APIError.message`를 그대로 노출.
- **의존성**: CL-001이 실제로 사용자에게 보이려면 이 항목이 먼저 필요.

## CL-003. 죽은 예산(budget) 필드 정리
- **분류**: Data cleanup / Low
- **증상**: V7에서 추가된 `budget`/`budget_category` 테이블이 V8에서 삭제됐지만 `MonthlySummaryDTO`에는 `budgetTarget`/`budgetRemaining`/`budgetUsagePercentage`/`alertLevel`이 남아 항상 `null`/`"NONE"`.
- **관련 파일**: `apps/backend/.../dto/response/MonthlySummaryDTO.java`, `AnalyticsService.java`
- **해결 방향**: CL-004와 함께 처리(엔드포인트 자체를 정리하며 같이 제거).

## CL-004. 죽은 `/api/analytics/*` 엔드포인트 및 중복 집계 로직 정리
- **분류**: Data/Architecture / Medium
- **증상**: `/api/analytics/monthly-summary`, `/category-breakdown`이 백엔드에 존재하지만 프론트엔드는 호출하지 않고 전체 트랜잭션을 받아 클라이언트에서 직접 집계(`DashboardPage`, `CategoryPieChart`, `TagPieChart`). 동일 로직이 서버/클라이언트 두 곳에 있음.
- **관련 파일**: `AnalyticsController.java`, `AnalyticsService.java`, `apps/frontend/src/lib/api/analytics.ts`
- **해결 방향(택1)**:
  - (A) 미사용 엔드포인트·DTO·서비스 삭제, 클라이언트 집계 유지 (빠름, 지금 규모에 적합)
  - (B) 반대로 클라이언트 집계를 서버 API 호출로 교체 (CL-007 페이지네이션 도입 시 필수 — 페이징하면 클라이언트가 전체 데이터를 못 보므로 집계는 서버가 해야 함)
- **의존성**: CL-007을 하면 (B)가 강제됨.

## CL-005. CORS Origin 하드코딩 제거
- **분류**: Backend / Low
- **증상**: `WebConfig`에 `allowedOrigins("http://localhost:3000")`가 하드코딩. 실제 Vite dev 서버는 5173 포트, 운영은 nginx same-origin 프록시라 이 설정 자체가 이미 안 맞음.
- **관련 파일**: `apps/backend/.../config/WebConfig.java`
- **해결 방향**: `app.cors.allowed-origins` 프로퍼티로 빼서 `application.yml`/`application-dev.yml`에서 환경별로 주입.

## CL-006. 태그 색상 랜덤 배정 → 결정론적 배정
- **분류**: Backend / Low
- **증상**: `generateRandomColor()`가 24색 팔레트에서 `Math.random()`으로 매번 다르게 배정.
- **관련 파일**: `TransactionService.java:142-150`
- **해결 방향**: 태그 이름 해시 기반 결정론적 색상 선택으로 교체(같은 이름 재생성 시 안정적인 색 배정).

## CL-007. 거래 목록 페이지네이션 부재
- **분류**: UX/Backend / Medium
- **증상**: `GET /api/transactions`가 항상 전체 리스트를 반환. `PageResponse<T>` 타입은 정의돼 있지만 어디서도 쓰이지 않음. 데이터가 쌓이면 응답 크기와 렌더링 비용이 계속 증가.
- **관련 파일**: `TransactionController.java`, `apps/frontend/src/pages/TransactionsPage.tsx`, `types/index.ts`
- **해결 방향**: 백엔드에 `Pageable` 지원 추가, 프론트에 페이지 네비게이션 UI 추가.
- **의존성**: CL-008(DB 레벨 필터링)과 함께 처리하는 게 효율적 — 같은 리포지토리 메서드를 건드리게 됨. CL-004의 해결 방향 (B)를 강제.

## CL-008. 필터링이 DB가 아닌 인메모리에서 수행됨
- **분류**: Backend / Medium
- **증상**: `TransactionController.getTransactions`가 전체(또는 날짜범위) 리스트를 다 가져온 뒤 type/categoryId/tagId를 Java `.stream().filter()`로 거름. 이미 존재하는 `findByDateRangeAndType`, `findByTransactionType` 같은 리포지토리 메서드도 활용되지 않음.
- **관련 파일**: `TransactionController.java:40-67`, `TransactionRepository.java`
- **해결 방향**: `JpaSpecificationExecutor` + `Specification`으로 옵션 필터(날짜/타입/카테고리/태그)를 하나의 쿼리로 합성. (Spring Data JPA 공식 문서 권장 패턴, `Specification.allOf(...)`로 null 필터는 자동 제외됨)
- **의존성**: CL-007과 동시 진행 권장(같은 코드 영역).

## CL-009. 서버 상태 관리 방식 개선 (Zustand → TanStack Query)
- **분류**: Frontend architecture / Medium
- **증상**: `transactionStore`/`categoryStore`/`tagStore`가 로딩/에러 상태를 손수 관리하고, mutation마다 전체 리스트를 재조회(캐시/중복요청 방지/취소 없음).
- **관련 파일**: `apps/frontend/src/lib/stores/*.ts`
- **해결 방향**: TanStack Query 도입 — 조회는 `useQuery`, 변경은 `useMutation` + `invalidateQueries`로 전환. Zustand는 순수 클라이언트 상태(모달 열림/테마 등)만 유지.
- **참고**: 전체 스토어 구조를 건드리는 큰 리팩터링이라 별도 세션/PR로 분리 권장.

## CL-010. 월 이동 UX 개선
- **분류**: UX / Low
- **증상**: 대시보드에서 좌우 화살표로만 월 이동 가능. 예: 1년 전 데이터를 보려면 12번 클릭.
- **관련 파일**: `apps/frontend/src/pages/DashboardPage.tsx`
- **해결 방향**: 월 텍스트 클릭 시 년/월 선택 팝오버, 또는 트렌드 차트 클릭(이미 있음)을 더 부각.

## CL-011. 삭제 확인 모달에 대상 컨텍스트 부족
- **분류**: UX / Low
- **증상**: `ConfirmDialog`가 "이 거래를 삭제하시겠습니까?" 한 줄뿐, 날짜/금액 등 대상 식별 정보가 없어 여러 항목 중 실수로 다른 걸 지울 위험.
- **관련 파일**: `apps/frontend/src/components/modals/ConfirmDialog.tsx`, `TransactionsPage.tsx`
- **해결 방향**: 확인 메시지에 대상 요약(날짜·금액·카테고리) 삽입.

## CL-012. 태그 이름 중복/공백 방지 없음
- **분류**: Data / Low
- **증상**: "식비"와 "식비 "(트레일링 스페이스), 대소문자 다른 영문 태그가 별도로 쌓일 수 있음.
- **관련 파일**: `TransactionService.java` (`tagRepository.findByName`), `SettingsPage.tsx` 태그 추가 로직
- **해결 방향**: 저장 전 trim + 정규화(대소문자 무시 비교) 후 조회, DB 유니크 제약도 그에 맞게 점검.

## CL-013. 대시보드에 수입 분석이 없음
- **분류**: UX / Low
- **증상**: `CategoryPieChart`/`TagPieChart`가 지출(EXPENSE)만 다룸. 수입 카테고리/태그 분석 뷰가 없음.
- **관련 파일**: `apps/frontend/src/components/{Category,Tag}PieChart.tsx`
- **해결 방향**: 수입/지출 토글 또는 별도 섹션 추가.
