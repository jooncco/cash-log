# Cash Log Desktop App - Quick Start Guide

## 가장 빠른 방법 (권장)

```bash
./start-app.sh
```

이 스크립트가 자동으로:
1. 데이터베이스 시작
2. 백엔드 시작
3. 데스크톱 앱 시작

### 종료

```bash
./stop-app.sh
```

---

## 수동 실행 방법

### 1. 백엔드 시작 (필수)

먼저 Spring Boot 백엔드를 실행해야 합니다:

```bash
cd apps/backend
./mvnw spring-boot:run
```

백엔드가 `http://localhost:8080`에서 실행됩니다.

### 2. 데스크톱 앱 실행

#### 방법 A: 개발 모드 (권장)

```bash
cd apps/frontend
npm run dev
```

- Hot reload 지원
- DevTools 자동 열림
- 빠른 개발 사이클

#### 방법 B: 빌드 후 실행

```bash
cd apps/frontend
npm run build
npm start
```

- 프로덕션 빌드 테스트
- 실제 앱과 동일한 환경

### 3. PKG 인스톨러 생성

```bash
cd apps/frontend
npm run package:mac
```

생성된 파일: `release/Cash Log-1.0.0.pkg`

### 4. 설치 및 실행

1. PKG 파일 더블클릭
2. 설치 진행
3. `/Applications/Cash Log.app` 실행

## 문제 해결

### "Unidentified Developer" 경고

```bash
# 방법 1: 우클릭 → 열기
# 방법 2: 시스템 환경설정 → 보안 및 개인정보 보호 → "확인 없이 열기"
```

### 백엔드 연결 실패

```bash
# 백엔드 실행 확인
curl http://localhost:8080

# 환경 변수 확인
cat apps/frontend/.env
```

### 앱이 시작되지 않음

```bash
# 로그 확인 (자동 스크립트 사용 시)
tail -f desktop.log
tail -f backend.log

# 또는 개발 모드로 실행
cd apps/frontend && npm run dev
```

## 개발 워크플로우

### 자동 스크립트 사용
```bash
# 시작
./start-app.sh

# 종료
./stop-app.sh
```

### 수동 실행
```bash
# 1. 백엔드 시작
cd apps/backend && ./mvnw spring-boot:run

# 2. 새 터미널에서 데스크톱 앱 시작
cd apps/frontend && npm run dev

# 3. 코드 수정 → 자동 리로드
# 4. 테스트
# 5. 빌드 및 패키징
npm run build && npm run package:mac
```

## 단축키

- `Cmd+Q`: 앱 종료
- `Cmd+M`: 최소화
- `Cmd+Option+I`: DevTools (개발 모드)

## 시스템 트레이

- 클릭: 메뉴 표시
- Show Window: 앱 표시
- Quit: 앱 종료
