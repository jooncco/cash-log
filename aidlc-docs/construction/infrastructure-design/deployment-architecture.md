# Deployment Architecture

## Docker Compose Topology

```yaml
services:
  frontend:  # Nginx + SPA static files
    build: ./apps/frontend
    ports: ["80:80"]
    depends_on:
      backend:
        condition: service_healthy

  backend:   # Spring Boot JAR
    build: ./apps/backend
    expose: ["8080"]
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/${MYSQL_DATABASE}
      - SPRING_DATASOURCE_USERNAME=${MYSQL_USER}
      - SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  mysql:     # MySQL 8.0
    image: mysql:8.0
    volumes:
      - mysql-data:/var/lib/mysql
      - ./infrastructure/docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

## Startup Sequence
1. MySQL 시작 → healthcheck 통과 대기
2. Backend 시작 → Flyway 마이그레이션 실행 → healthcheck 통과 대기
3. Frontend (Nginx) 시작 → 트래픽 수신 시작

## Frontend Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Usage
```bash
# 시작
docker compose up -d

# 종료
docker compose down

# 로그 확인
docker compose logs -f

# 전체 재빌드
docker compose up -d --build
```
