#!/bin/bash

set -e

echo "💰 Cash Log 설치 스크립트"
echo "=========================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ 이 스크립트는 macOS에서만 실행할 수 있습니다."
  exit 1
fi

# Check for required tools
echo "📋 필수 도구 확인 중..."

if ! command -v docker &> /dev/null; then
  echo "❌ Docker가 설치되어 있지 않습니다."
  echo "   https://www.docker.com/products/docker-desktop 에서 설치해주세요."
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose가 설치되어 있지 않습니다."
  exit 1
fi

if ! command -v java &> /dev/null; then
  echo "❌ Java가 설치되어 있지 않습니다."
  echo "   Java 21 이상이 필요합니다."
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "❌ Node.js가 설치되어 있지 않습니다."
  echo "   Node.js 18 이상이 필요합니다."
  exit 1
fi

echo "✅ 모든 필수 도구가 설치되어 있습니다."
echo ""

# Setup infrastructure
echo "🔧 인프라 설정 중..."
if [ ! -f "infrastructure/docker/.env" ]; then
  ./infrastructure/scripts/setup.sh
  echo ""
  echo "⚠️  .env 파일이 생성되었습니다."
  echo "   infrastructure/docker/.env 파일을 편집하여 비밀번호를 설정해주세요."
  echo ""
  read -p "비밀번호 설정을 완료했습니까? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 설치가 취소되었습니다."
    exit 1
  fi
fi

# Build and package
echo ""
echo "📦 앱 빌드 중..."
cd apps/frontend

# Generate icon from logo.png
echo "🎨 아이콘 생성 중..."
mkdir -p build/icon.iconset
sips -z 16 16     public/logo.png --out build/icon.iconset/icon_16x16.png > /dev/null 2>&1
sips -z 32 32     public/logo.png --out build/icon.iconset/icon_16x16@2x.png > /dev/null 2>&1
sips -z 32 32     public/logo.png --out build/icon.iconset/icon_32x32.png > /dev/null 2>&1
sips -z 64 64     public/logo.png --out build/icon.iconset/icon_32x32@2x.png > /dev/null 2>&1
sips -z 128 128   public/logo.png --out build/icon.iconset/icon_128x128.png > /dev/null 2>&1
sips -z 256 256   public/logo.png --out build/icon.iconset/icon_128x128@2x.png > /dev/null 2>&1
sips -z 256 256   public/logo.png --out build/icon.iconset/icon_256x256.png > /dev/null 2>&1
sips -z 512 512   public/logo.png --out build/icon.iconset/icon_256x256@2x.png > /dev/null 2>&1
sips -z 512 512   public/logo.png --out build/icon.iconset/icon_512x512.png > /dev/null 2>&1
sips -z 1024 1024 public/logo.png --out build/icon.iconset/icon_512x512@2x.png > /dev/null 2>&1
iconutil -c icns build/icon.iconset -o build/icon.icns

npm install
npm run package:mac

if [ ! -f "release/Cash Log-1.0.0-universal.pkg" ]; then
  echo "❌ 빌드에 실패했습니다."
  exit 1
fi

echo "✅ 빌드 완료"
echo ""

# Install
echo "💾 앱 설치 중..."
sudo cp -R "release/mac-universal/Cash Log.app" /Applications/

if [ ! -d "/Applications/Cash Log.app" ]; then
  echo "❌ 설치에 실패했습니다."
  exit 1
fi

echo "✅ 설치 완료"
echo ""

# Launch
echo "🚀 앱 실행 중..."
open "/Applications/Cash Log.app"

echo ""
echo "✅ Cash Log 설치가 완료되었습니다!"
echo ""
echo "📍 설치 위치: /Applications/Cash Log.app"
echo "📊 로그 파일: ~/Library/Application Support/cashlog-desktop/backend.log"
echo ""
echo "앱이 시작되면 자동으로 데이터베이스와 백엔드가 실행됩니다."
echo "처음 실행 시 약 10-20초 정도 소요될 수 있습니다."
