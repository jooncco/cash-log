#!/bin/bash
# Stop Cash Log infrastructure services

set -e

echo "🛑 Stopping Cash Log infrastructure..."

# Navigate to docker directory
cd "$(dirname "$0")/../docker"

# Stop services
docker-compose down

echo ""
echo "✅ Services stopped!"
echo ""
echo "Note: Data is preserved in Docker volumes"
echo "To remove data as well, run './infrastructure/scripts/clean.sh'"
