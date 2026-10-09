#!/bin/bash

# Quick fix script for 502 Bad Gateway
# Server: 139.100.205.250

echo "🔍 Checking server status..."
echo ""

ssh root@139.100.205.250 << 'ENDSSH'
cd /opt/finds-beck

echo "📊 Checking container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Checking backend logs (last 50 lines):"
docker compose -f docker-compose.prod.yml logs --tail=50 backend

echo ""
echo "🔍 Checking if backend is responding:"
docker exec finds-backend curl -f http://localhost:8090/brands/get || echo "Backend not responding"

echo ""
echo "💡 Suggested fixes:"
echo "1. Restart backend: docker compose -f docker-compose.prod.yml restart backend"
echo "2. Check logs: docker compose -f docker-compose.prod.yml logs -f backend"
echo "3. Rebuild if needed: docker compose -f docker-compose.prod.yml up -d --build backend"
ENDSSH

echo ""
echo "Do you want to restart backend? (yes/no)"
read -p "> " RESTART

if [ "$RESTART" == "yes" ]; then
    echo "🔄 Restarting backend..."
    ssh root@139.100.205.250 "cd /opt/finds-beck && docker compose -f docker-compose.prod.yml restart backend"

    echo "⏳ Waiting 10 seconds..."
    sleep 10

    echo "✅ Checking status:"
    ssh root@139.100.205.250 "cd /opt/finds-beck && docker compose -f docker-compose.prod.yml ps backend"
fi
