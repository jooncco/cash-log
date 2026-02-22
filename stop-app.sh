#!/bin/bash
# Cash Log 전체 애플리케이션 종료 스크립트

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

log_info "Cash Log 애플리케이션 종료 중..."
echo ""

# 1. 프론트엔드 종료
if [ -f "$PROJECT_ROOT/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/frontend.pid")
    log_info "프론트엔드 종료 중 (PID: $FRONTEND_PID)..."
    
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 2
        
        # 강제 종료가 필요한 경우
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        
        log_success "프론트엔드가 종료되었습니다."
    else
        log_warning "프론트엔드 프로세스가 이미 종료되었습니다."
    fi
    
    rm -f "$PROJECT_ROOT/frontend.pid"
else
    log_warning "frontend.pid 파일을 찾을 수 없습니다."
fi
echo ""

# 2. 백엔드 종료
if [ -f "$PROJECT_ROOT/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/backend.pid")
    log_info "백엔드 종료 중 (PID: $BACKEND_PID)..."
    
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || true
        sleep 3
        
        # 강제 종료가 필요한 경우
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        
        log_success "백엔드가 종료되었습니다."
    else
        log_warning "백엔드 프로세스가 이미 종료되었습니다."
    fi
    
    rm -f "$PROJECT_ROOT/backend.pid"
else
    log_warning "backend.pid 파일을 찾을 수 없습니다."
fi
echo ""

# 3. 데이터베이스 종료 (선택사항)
read -p "데이터베이스도 종료하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "데이터베이스 종료 중..."
    cd infrastructure/scripts
    ./stop.sh 2>/dev/null || log_warning "데이터베이스 종료 스크립트를 찾을 수 없습니다."
    cd "$PROJECT_ROOT"
    log_success "데이터베이스가 종료되었습니다."
else
    log_info "데이터베이스는 계속 실행됩니다."
fi
echo ""

# 4. 로그 파일 정리 (선택사항)
if [ -f "$PROJECT_ROOT/backend.log" ] || [ -f "$PROJECT_ROOT/frontend.log" ]; then
    read -p "로그 파일을 삭제하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$PROJECT_ROOT/backend.log"
        rm -f "$PROJECT_ROOT/frontend.log"
        log_success "로그 파일이 삭제되었습니다."
    else
        log_info "로그 파일이 보존되었습니다."
    fi
fi
echo ""

# 5. 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Cash Log 애플리케이션이 종료되었습니다."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 애플리케이션 재시작:"
echo "   ./start-app.sh"
echo ""
