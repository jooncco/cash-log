# 💰 cash-log
> 간단한 개인 재무 관리 **데스크톱 애플리케이션**. Electron + React 기반. Powered by [AI-DLC(v0.1.3)](https://github.com/awslabs/aidlc-workflows).

## ✨ 주요 기능

### 1. 📅 수입/지출 내역 관리
- **수입/지출 기록**: 날짜, 금액, 카테고리, 태그, 메모를 포함한 간편한 데이터 입력
- **카테고리 관리**: 식비, 교통비, 쇼핑 등 본인의 라이프스타일에 맞춘 분류 설정
- **태그 시스템**: 거래에 여러 태그를 추가하여 세밀한 분류 가능
- **필터링 & 검색**: 기간별, 카테고리별, 태그별로 과거 내역을 빠르게 조회

### 2. 📊 데이터 시각화
- **월별 캘린더**: 일별 수입/지출을 한눈에 확인할 수 있는 캘린더 뷰
- **통계 대시보드**: 월별 지출 추이를 차트로 확인
- **카테고리별 분석**: 어떤 곳에 가장 많은 돈을 썼는지 파이 차트로 분석
- **Top 거래**: 상위 수입/지출 내역 확인

### 3. 💾 데이터 영속성
- **로컬 DB 저장**: 작성한 내역이 휘발되지 않도록 안전하게 데이터 저장
- **보고서 생성 기능**: 기록된 데이터를 CSV, EXCEL, PDF 파일로 저장

## 🚀 시작하기

### 사전 요구사항
- **macOS** 11.0 이상
- **Docker Desktop** 20.10+
- **Java** 21+
- **Node.js** 18+

### 빠른 설치 (권장)

```bash
./install.sh
```

설치 스크립트가 자동으로:
1. ✅ 필수 도구 확인 (Docker, Java, Node.js)
2. ✅ 데이터베이스 설정 (.env 파일 생성)
3. ✅ 백엔드 JAR 빌드
4. ✅ 프론트엔드 빌드 및 패키징
5. ✅ /Applications에 앱 설치
6. ✅ 앱 자동 실행

**처음 실행 시**: `.env` 파일 설정이 필요합니다.
- `infrastructure/docker/.env` 파일을 편집하여 데이터베이스 비밀번호 설정
- 설정 후 스크립트가 자동으로 진행됩니다

**앱 실행 후**: 데이터베이스와 백엔드가 자동으로 시작됩니다 (10-20초 소요)

### 수동 설치

#### 방법 1: Mac 로컬에 설치

1. **인프라 설정**
```bash
./infrastructure/scripts/setup.sh
# infrastructure/docker/.env 파일을 편집하여 비밀번호 설정
```

2. **앱 빌드 및 패키징**
```bash
cd apps/frontend
npm install
npm run package:mac
```

3. **앱 설치**
```bash
sudo installer -pkg "release/Cash Log-1.0.0-universal.pkg" -target /
```

4. **앱 실행**
- Spotlight (Cmd + Space)에서 "Cash Log" 검색
- Applications 폴더에서 실행
- Launchpad에서 실행

**참고**: 앱 실행 시 DB와 백엔드가 자동으로 시작됩니다. 별도의 스크립트 실행이 필요 없습니다.

#### 앱 내부 구조

앱 설치 후 다음과 같은 구조로 리소스가 포함됩니다:

```
/Applications/Cash Log.app/
└── Contents/
    └── Resources/
        └── resources/
            ├── backend.jar           # Spring Boot 백엔드
            ├── docker-compose.yml    # MySQL 설정
            └── config.json          # DB 연결 정보
```

#### 데이터 저장 위치

- **앱 로그**: `~/Library/Application Support/cashlog-desktop/backend.log`
- **데이터베이스**: Docker 볼륨 `docker_mysql-data`

#### 문제 해결

앱이 시작되지 않는 경우:
1. Docker Desktop이 실행 중인지 확인
2. 로그 파일 확인: `tail -f ~/Library/Application\ Support/cashlog-desktop/backend.log`
3. Docker 컨테이너 확인: `docker ps | grep cashlog`
4. 백엔드 상태 확인: `curl http://localhost:8080/actuator/health`

자세한 내용은 [데스크톱 앱 가이드](apps/frontend/QUICKSTART.md)를 참조하세요.

#### 방법 2: 개발 모드 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd cash-log
```

2. **전체 애플리케이션 시작**
```bash
./start-app.sh
```

처음 실행 시 `.env` 파일 설정이 필요합니다:
- `infrastructure/docker/.env` 파일을 편집하여 비밀번호 설정
- 설정 후 `./start-app.sh`를 다시 실행

3. **애플리케이션 종료**
```bash
./stop-app.sh
```

4. **데스크톱 앱 접속**
- Electron 창이 자동으로 열립니다
- 백엔드 API: http://localhost:8080
- API 문서: http://localhost:8080/swagger-ui.html

#### 방법 3: 수동 실행 (개발자용)

1. **저장소 클론**
```bash
git clone <repository-url>
cd cash-log
```

2. **인프라 설정 (데이터베이스)**
```bash
./infrastructure/scripts/setup.sh
nano infrastructure/docker/.env  # 비밀번호 설정
./infrastructure/scripts/start.sh
```

3. **백엔드 실행**
```bash
cd apps/backend
export DB_USER=cashlog
export DB_PASSWORD=<your-password>
./mvnw spring-boot:run
```

4. **데스크톱 앱 실행**
```bash
cd apps/frontend
npm install
npm run dev
```

## 📁 프로젝트 구조

```
cash-log/
├── apps/
│   ├── backend/          # Spring Boot 백엔드
│   └── frontend/         # Electron 데스크톱 앱
├── infrastructure/       # Docker 인프라
│   ├── docker/          # Docker Compose 설정
│   └── scripts/         # 설정 및 관리 스크립트
└── aidlc-docs/          # AI-DLC 문서
```

## 📚 문서

자세한 빌드 및 테스트 지침은 다음을 참조하세요:
- [빌드 지침](./aidlc-docs/construction/build-and-test/build-instructions.md)
- [단위 테스트 지침](./aidlc-docs/construction/build-and-test/unit-test-instructions.md)
- [통합 테스트 지침](./aidlc-docs/construction/build-and-test/integration-test-instructions.md)

## 🛠️ 개발

### 백엔드 개발
```bash
cd apps/backend
export DB_USER=cashlog
export DB_PASSWORD=<your-password>
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 프론트엔드 개발
```bash
cd apps/frontend
npm run dev
```

### 테스트 실행
```bash
# 백엔드 테스트
cd apps/backend
./mvnw test

# 프론트엔드 테스트
cd apps/frontend
npm test
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
