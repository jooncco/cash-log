#!/bin/bash
# Clean up Cash Log infrastructure (removes all data)

set -e

echo "⚠️  WARNING: This will delete all database data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🗑️  Cleaning up Cash Log infrastructure..."

# Navigate to docker directory
cd "$(dirname "$0")/../docker"

# Stop and remove containers, networks, and volumes
docker-compose down -v

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "All containers, networks, and volumes have been removed"
echo "Run './infrastructure/scripts/start.sh' to start fresh"
