# Infrastructure Design

## Overview
Docker Compose로 프론트엔드(Nginx) + 백엔드(Spring Boot) + DB(MySQL)를 통합 실행하는 로컬 개발/배포 환경 설계.

## Service Architecture

```
                    Browser (:80)
                        │
                        ▼
              ┌─────────────────┐
              │   Nginx (:80)   │
              │  (frontend SPA) │
              └────────┬────────┘
                       │ /api/* proxy
                       ▼
              ┌─────────────────┐
              │ Spring Boot     │
              │ (:8080)         │
              └────────┬────────┘
                       │ JDBC
                       ▼
              ┌─────────────────┐
              │ MySQL 8.0       │
              │ (:3306)         │
              └─────────────────┘
```

## Docker Services

### 1. frontend (Nginx)
- **Image**: Multi-stage build — Node.js (빌드) → Nginx (서빙)
- **Port**: 80:80
- **Responsibilities**:
  - Vite 빌드 결과물 (정적 파일) 서빙
  - `/api/*` 요청을 backend 서비스로 리버스 프록시
  - SPA fallback (모든 경로 → index.html)
- **Depends on**: backend

### 2. backend (Spring Boot)
- **Image**: 기존 Dockerfile 사용 (eclipse-temurin:21-jre-alpine)
- **Port**: 8080 (내부, 외부 노출 선택적)
- **Environment**: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- **Depends on**: mysql (healthcheck)
- **Note**: 기존 백엔드 코드 변경 없음

### 3. mysql (MySQL 8.0)
- **Image**: mysql:8.0 (기존 설정 유지)
- **Port**: 3306 (내부)
- **Volume**: mysql-data (데이터 영속성)
- **Healthcheck**: mysqladmin ping

## Network
- **cashlog-network** (bridge): 모든 서비스 간 내부 통신
- 프론트엔드 Nginx만 외부 포트 80 노출
- 백엔드는 Nginx를 통해서만 접근 (프록시)

## Nginx Configuration

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger UI proxy (개발용)
    location /swagger-ui/ {
        proxy_pass http://backend:8080/swagger-ui/;
    }
    location /v3/api-docs {
        proxy_pass http://backend:8080/v3/api-docs;
    }
}
```

## Environment Variables (.env)

```env
# MySQL
MYSQL_ROOT_PASSWORD=change_this_root_password
MYSQL_USER=cashlog
MYSQL_PASSWORD=change_this_password
MYSQL_DATABASE=cashlog

# Backend
DB_HOST=mysql
DB_PORT=3306
```

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `apps/frontend/Dockerfile` | CREATE | Multi-stage: Node build → Nginx serve |
| `apps/frontend/nginx.conf` | CREATE | Nginx 설정 (SPA fallback + API proxy) |
| `docker-compose.yml` (root) | CREATE | 통합 Docker Compose (3 services) |
| `.env.example` (root) | CREATE | 환경변수 템플릿 |
| `infrastructure/docker/docker-compose.yml` | KEEP | 기존 MySQL-only 설정 유지 (개발용) |

## Security Considerations (SECURITY Extension)
- **SECURITY-01**: MySQL은 Docker 내부 네트워크에서만 접근, 외부 포트 미노출. Backend ↔ MySQL은 Docker 내부 통신.
- **SECURITY-02**: Nginx access log 활성화 (Docker stdout)
