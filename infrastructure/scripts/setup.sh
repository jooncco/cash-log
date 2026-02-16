#!/bin/bash
# Initial setup script for Cash Log infrastructure

set -e

echo "🚀 Setting up Cash Log infrastructure..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Navigate to docker directory
cd "$(dirname "$0")/../docker"

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit docker/.env and update the passwords before starting services"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit infrastructure/docker/.env and set secure passwords"
echo "2. Run './infrastructure/scripts/start.sh' to start services"
echo "3. Verify with 'docker-compose ps' in the docker directory"
