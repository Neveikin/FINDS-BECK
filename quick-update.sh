#!/bin/bash

# Скрипт для быстрого обновления только измененных файлов
# Использование: bash quick-update.sh

set -e

echo "⚡ Быстрое обновление проекта..."

cd /opt/finds-beck

# Обновляем только измененные Java файлы в бэкенде
echo "🔄 Копируем обновленные файлы бэкенда..."
docker compose -f docker-compose.prod.yml stop backend
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

echo "⏳ Ожидаем запуска бэкенда (15 секунд)..."
sleep 15

# Обновляем фронтенд
echo "🔄 Обновляем фронтенд..."
docker compose -f docker-compose.prod.yml stop frontend nginx
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend nginx

echo "⏳ Ожидаем запуска фронтенда (10 секунд)..."
sleep 10

echo "✅ Быстрое обновление завершено!"
docker compose -f docker-compose.prod.yml ps
