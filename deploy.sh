#!/bin/bash

# Quick deployment script for FINDS-BECK
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.production to .env and fill in the values"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
required_vars=("DATABASE_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "RECAPTCHA_SECRET" "APP_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Build images
echo "🔨 Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check status
echo "📊 Checking container status..."
docker compose -f docker-compose.prod.yml ps

# Show logs
echo "📝 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your application should be available at: $APP_URL"
echo ""
echo "To view logs: docker compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker compose -f docker-compose.prod.yml stop"
