#!/bin/bash

# Скрипт для обновления фронтенда на продакшн сервере
# Использование: bash update-frontend.sh

set -e

echo "🔄 Начинаем обновление фронтенда..."

# Переходим в директорию проекта
cd /opt/finds-beck

# Останавливаем фронтенд и nginx контейнеры
echo "⏸️  Останавливаем фронтенд и nginx..."
docker compose -f docker-compose.prod.yml stop frontend nginx

# Пересобираем только фронтенд
echo "🔨 Пересобираем фронтенд..."
docker compose -f docker-compose.prod.yml build frontend

# Запускаем фронтенд и nginx
echo "▶️  Запускаем фронтенд и nginx..."
docker compose -f docker-compose.prod.yml up -d frontend nginx

# Ждем 10 секунд для запуска
echo "⏳ Ожидаем запуска фронтенда..."
sleep 10

# Проверяем статус
echo "✅ Проверяем статус контейнеров..."
docker compose -f docker-compose.prod.yml ps frontend nginx

# Проверяем логи
echo "📋 Последние логи фронтенда:"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

echo "✅ Обновление фронтенда завершено!"
echo "🌐 Проверьте сайт в браузере"
