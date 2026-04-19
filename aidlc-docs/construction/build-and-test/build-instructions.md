# Build and Test Instructions

## Build

### 프론트엔드 빌드
```bash
cd apps/frontend
npm install
npm run build    # tsc -b && vite build
```

빌드 결과물: `apps/frontend/dist/`

### Docker Compose 전체 스택 빌드 및 실행
```bash
# 루트 디렉토리에서
cp .env.example .env
# .env 파일 편집하여 비밀번호 설정

docker compose up -d --build
```

접속: http://localhost

## 개발 모드
```bash
# 1. 백엔드 + DB 실행 (기존 방식)
cd infrastructure/docker && docker compose up -d
cd ../../apps/backend && ./mvnw spring-boot:run

# 2. 프론트엔드 개발 서버
cd apps/frontend && npm run dev
```

접속: http://localhost:5173 (Vite dev proxy가 /api → localhost:8080 전달)

## Unit Tests
```bash
cd apps/frontend
npx jest --config jest.config.cjs
```

## Integration Tests
Docker Compose 전체 스택 실행 후:
```bash
# 헬스체크
curl http://localhost/api/actuator/health

# API 테스트
curl http://localhost/api/transactions
curl http://localhost/api/categories
curl http://localhost/api/tags
```
