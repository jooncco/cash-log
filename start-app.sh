#!/bin/bash
# Cash Log 전체 애플리케이션 기동 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

log_info "Cash Log 애플리케이션 시작 중..."
echo ""

# 1. 사전 요구사항 확인
log_info "사전 요구사항 확인 중..."

# Docker 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되어 있지 않습니다. Docker를 먼저 설치해주세요."
    exit 1
fi

# Docker Compose 확인
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되어 있지 않습니다. Docker Compose를 먼저 설치해주세요."
    exit 1
fi

# Java 확인
if ! command -v java &> /dev/null; then
    log_error "Java가 설치되어 있지 않습니다. Java 21+를 먼저 설치해주세요."
    exit 1
fi

# Node.js 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되어 있지 않습니다. Node.js 18+를 먼저 설치해주세요."
    exit 1
fi

log_success "모든 사전 요구사항이 충족되었습니다."
echo ""

# 2. 인프라 설정 확인 및 시작
log_info "데이터베이스 인프라 확인 중..."

if [ ! -f "infrastructure/docker/.env" ]; then
    log_warning ".env 파일이 없습니다. 초기 설정을 실행합니다..."
    cd infrastructure/scripts
    ./setup.sh
    cd "$PROJECT_ROOT"
    
    log_warning "infrastructure/docker/.env 파일을 편집하여 안전한 비밀번호를 설정하세요."
    log_warning "설정 후 이 스크립트를 다시 실행해주세요."
    exit 0
fi

# 데이터베이스 시작
log_info "MySQL 데이터베이스 시작 중..."
cd infrastructure/scripts
./start.sh
cd "$PROJECT_ROOT"

# 데이터베이스가 준비될 때까지 대기
log_info "데이터베이스 준비 대기 중..."
sleep 10

log_success "데이터베이스가 시작되었습니다."
echo ""

# 3. 환경 변수 설정
log_info "환경 변수 설정 중..."

# .env 파일에서 DB 비밀번호 읽기
if [ -f "infrastructure/docker/.env" ]; then
    export $(grep -v '^#' infrastructure/docker/.env | xargs)
    export DB_USER=${MYSQL_USER:-cashlog}
    export DB_PASSWORD=${MYSQL_PASSWORD}
    log_success "환경 변수가 설정되었습니다."
else
    log_error "infrastructure/docker/.env 파일을 찾을 수 없습니다."
    exit 1
fi
echo ""

# 4. 백엔드 빌드 및 실행
log_info "백엔드 애플리케이션 빌드 중..."
cd apps/backend

# Maven wrapper에 실행 권한 부여
chmod +x mvnw

# 백엔드 빌드
./mvnw clean package -DskipTests

log_success "백엔드 빌드 완료"

# 백엔드를 백그라운드에서 실행
log_info "백엔드 애플리케이션 시작 중..."
nohup ./mvnw spring-boot:run > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/backend.pid"

log_success "백엔드가 백그라운드에서 시작되었습니다 (PID: $BACKEND_PID)"
log_info "백엔드 로그: $PROJECT_ROOT/backend.log"

cd "$PROJECT_ROOT"
echo ""

# 백엔드가 준비될 때까지 대기
log_info "백엔드 서버 준비 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_success "백엔드 서버가 준비되었습니다."
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "백엔드 서버 시작 시간 초과. 로그를 확인하세요: $PROJECT_ROOT/backend.log"
        exit 1
    fi
    sleep 2
done
echo ""

# 5. 프론트엔드 설정 및 실행
log_info "프론트엔드 애플리케이션 설정 중..."
cd apps/frontend

# .env.local 파일 확인 및 생성
if [ ! -f ".env.local" ]; then
    log_info ".env.local 파일 생성 중..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
    log_success ".env.local 파일이 생성되었습니다."
fi

# 의존성 설치 (node_modules가 없는 경우에만)
if [ ! -d "node_modules" ]; then
    log_info "프론트엔드 의존성 설치 중..."
    npm install
    log_success "의존성 설치 완료"
fi

# 프론트엔드를 백그라운드에서 실행
log_info "프론트엔드 애플리케이션 시작 중..."
nohup npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/frontend.pid"

log_success "프론트엔드가 백그라운드에서 시작되었습니다 (PID: $FRONTEND_PID)"
log_info "프론트엔드 로그: $PROJECT_ROOT/frontend.log"

cd "$PROJECT_ROOT"
echo ""

# 프론트엔드가 준비될 때까지 대기
log_info "프론트엔드 서버 준비 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "프론트엔드 서버가 준비되었습니다."
        break
    fi
    if [ $i -eq 30 ]; then
        log_warning "프론트엔드 서버 시작 확인 실패. 로그를 확인하세요: $PROJECT_ROOT/frontend.log"
    fi
    sleep 2
done
echo ""

# 6. 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Cash Log 애플리케이션이 성공적으로 시작되었습니다! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 애플리케이션 접속:"
echo "   • 프론트엔드:  http://localhost:3000"
echo "   • 백엔드 API:  http://localhost:8080"
echo "   • API 문서:    http://localhost:8080/swagger-ui.html"
echo ""
echo "📊 프로세스 정보:"
echo "   • 백엔드 PID:  $BACKEND_PID"
echo "   • 프론트엔드 PID: $FRONTEND_PID"
echo ""
echo "📝 로그 파일:"
echo "   • 백엔드:  $PROJECT_ROOT/backend.log"
echo "   • 프론트엔드: $PROJECT_ROOT/frontend.log"
echo ""
echo "🛑 애플리케이션 종료:"
echo "   ./stop-app.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
