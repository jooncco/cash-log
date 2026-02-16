#!/bin/bash
# Start Cash Log infrastructure services

set -e

echo "🚀 Starting Cash Log infrastructure..."

# Navigate to docker directory
cd "$(dirname "$0")/../docker"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please run './infrastructure/scripts/setup.sh' first"
    exit 1
fi

# Start services
docker-compose up -d

echo ""
echo "✅ Services started!"
echo ""
echo "Check status with:"
echo "  cd infrastructure/docker && docker-compose ps"
echo ""
echo "View logs with:"
echo "  cd infrastructure/docker && docker-compose logs -f mysql"
echo ""
echo "Connect to MySQL:"
echo "  mysql -h localhost -P 3306 -u cashlog -p"
