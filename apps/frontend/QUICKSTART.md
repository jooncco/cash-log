# Cash Log 데스크톱 앱 빠른 시작 가이드

## 📦 설치

### 자동 설치 (권장)

프로젝트 루트에서 설치 스크립트를 실행하세요:

```bash
./install.sh
```

스크립트가 자동으로:
1. 필수 도구 확인 (Docker, Java, Node.js)
2. 데이터베이스 설정
3. 앱 빌드 및 패키징
4. /Applications에 설치
5. 앱 실행

### 수동 설치

#### 1. 인프라 설정

```bash
./infrastructure/scripts/setup.sh
```

`.env` 파일이 생성되면 편집하여 비밀번호를 설정하세요:

```bash
nano infrastructure/docker/.env
```

#### 2. 앱 빌드 및 패키징

```bash
cd apps/frontend
npm install
npm run package:mac
```

#### 3. 앱 설치

```bash
sudo cp -R "release/mac-universal/Cash Log.app" /Applications/
```

#### 4. 앱 실행

- Spotlight (Cmd + Space)에서 "Cash Log" 검색
- Applications 폴더에서 실행
- Launchpad에서 실행

## 🏗️ 앱 구조

### 리소스 구조

```
/Applications/Cash Log.app/
└── Contents/
    ├── MacOS/
    │   └── Cash Log              # 실행 파일
    ├── Resources/
    │   └── resources/
    │       ├── backend.jar       # Spring Boot 백엔드 (81MB)
    │       ├── docker-compose.yml # MySQL 설정 (하드코딩된 비밀번호)
    │       └── config.json       # DB 연결 정보
    └── Frameworks/               # Electron 프레임워크
```

### 데이터 저장 위치

- **앱 로그**: `~/Library/Application Support/cashlog-desktop/backend.log`
- **데이터베이스**: Docker 볼륨 `docker_mysql-data`
- **Docker 네트워크**: `docker_default`

## 🚀 앱 실행 프로세스

앱을 실행하면 다음 순서로 서비스가 시작됩니다:

1. **Electron 앱 시작** (즉시)
2. **Docker 컨테이너 정리** (기존 컨테이너 제거)
3. **MySQL 컨테이너 시작** (5-10초)
   - 이미지: `mysql:8.0`
   - 포트: `3306`
   - 볼륨: `docker_mysql-data`
4. **데이터베이스 헬스체크** (최대 30초)
5. **백엔드 JAR 실행** (5-10초)
   - Spring Boot 시작
   - Flyway 마이그레이션
   - API 서버 준비
6. **프론트엔드 로드** (즉시)

**총 소요 시간**: 약 10-20초

## 🔍 문제 해결

### 앱이 시작되지 않는 경우

#### 1. Docker Desktop 확인

```bash
docker ps
```

Docker Desktop이 실행 중이어야 합니다.

#### 2. 로그 확인

```bash
tail -f ~/Library/Application\ Support/cashlog-desktop/backend.log
```

로그에서 에러 메시지를 확인하세요:
- `ERROR: DB process error: Error: spawn docker-compose ENOENT` → Docker Compose 경로 문제
- `ERROR: Docker compose failed with code 1` → Docker 컨테이너 시작 실패
- `ERROR: Failed to start database` → 데이터베이스 시작 실패

#### 3. Docker 컨테이너 확인

```bash
docker ps | grep cashlog
```

`cashlog-mysql` 컨테이너가 실행 중이어야 합니다.

#### 4. 백엔드 상태 확인

```bash
curl http://localhost:8080/actuator/health
```

응답: `{"status":"UP"}`

### 데이터가 보이지 않는 경우

#### 1. API 연결 확인

```bash
curl http://localhost:8080/api/transactions
```

#### 2. 데이터베이스 볼륨 확인

```bash
docker volume ls | grep mysql
```

#### 3. 테스트 데이터 추가

```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionDate": "2026-03-07",
    "originalAmount": 50000,
    "originalCurrency": "KRW",
    "transactionType": "EXPENSE",
    "categoryId": 1,
    "description": "테스트 지출"
  }'
```

### 포트 충돌

다른 애플리케이션이 포트를 사용 중인 경우:

```bash
# MySQL 포트 (3306) 확인
lsof -i :3306

# 백엔드 포트 (8080) 확인
lsof -i :8080
```

### 앱 재시작

```bash
# 앱 종료
killall "Cash Log"

# Docker 컨테이너 정리
docker rm -f cashlog-mysql

# 앱 재실행
open "/Applications/Cash Log.app"
```

## 🛠️ 개발 모드

개발 중에는 앱을 패키징하지 않고 실행할 수 있습니다:

```bash
cd apps/frontend
npm run dev
```

이 경우:
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8080`
- 개발자 도구 자동 열림

## 📊 로그 모니터링

실시간 로그 확인:

```bash
tail -f ~/Library/Application\ Support/cashlog-desktop/backend.log
```

주요 로그 메시지:
- `=== Starting backend services ===` - 서비스 시작
- `Starting database...` - DB 시작
- `Database is ready` - DB 준비 완료
- `Starting backend...` - 백엔드 시작
- `Backend is ready` - 백엔드 준비 완료
- `=== Backend services started successfully ===` - 모든 서비스 시작 완료

## 🗑️ 앱 제거

```bash
# 앱 삭제
sudo rm -rf "/Applications/Cash Log.app"

# Docker 컨테이너 및 볼륨 삭제 (데이터 포함)
docker rm -f cashlog-mysql
docker volume rm docker_mysql-data

# 앱 데이터 삭제
rm -rf ~/Library/Application\ Support/cashlog-desktop
```

**주의**: 볼륨을 삭제하면 모든 거래 데이터가 삭제됩니다!

## 📝 추가 정보

- [프로젝트 README](../../README.md)
- [빌드 지침](../../aidlc-docs/construction/build-and-test/build-instructions.md)
- [백엔드 API 문서](http://localhost:8080/swagger-ui.html) (앱 실행 후)
