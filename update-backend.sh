#!/bin/bash

# Скрипт для обновления бэкенда на продакшн сервере
# Использование: bash update-backend.sh

set -e

echo "🔄 Начинаем обновление бэкенда..."

# Переходим в директорию проекта
cd /opt/finds-beck

# Останавливаем бэкенд контейнер
echo "⏸️  Останавливаем бэкенд контейнер..."
docker compose -f docker-compose.prod.yml stop backend

# Пересобираем только бэкенд
echo "🔨 Пересобираем бэкенд..."
docker compose -f docker-compose.prod.yml build backend

# Запускаем бэкенд
echo "▶️  Запускаем бэкенд..."
docker compose -f docker-compose.prod.yml up -d backend

# Ждем 10 секунд для запуска
echo "⏳ Ожидаем запуска бэкенда..."
sleep 10

# Проверяем статус
echo "✅ Проверяем статус бэкенда..."
docker compose -f docker-compose.prod.yml ps backend

# Проверяем логи
echo "📋 Последние логи бэкенда:"
docker compose -f docker-compose.prod.yml logs --tail=20 backend

echo "✅ Обновление бэкенда завершено!"
echo "🔍 Проверьте работу API: curl http://localhost:8090/api/health"
