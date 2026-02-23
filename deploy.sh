#!/bin/bash

# Скрипт деплоя для finds-shop.ru

set -e

echo "🚀 Начинаем деплой FINDS на finds-shop.ru"

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден. Создайте его на основе .env.example"
    exit 1
fi

# Загружаем переменные окружения
source .env

echo "📦 Сборка Docker образов..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🔄 Остановка старых контейнеров..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Запуск новых контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Ожидание запуска приложений..."
sleep 30

echo "🔍 Проверка статуса..."
docker-compose -f docker-compose.prod.yml ps

echo "🧪 Проверка работоспособности API..."
curl -f https://finds-shop.ru/api/auth/signin || {
    echo "❌ API недоступен"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
}

echo "✅ Деплой успешно завершен!"
echo "🌐 Сайт доступен по адресу: https://finds-shop.ru"

# Показываем логи если есть ошибки
if docker-compose -f docker-compose.prod.yml ps | grep -q "Exit"; then
    echo "⚠️ Некоторые контейнеры завершились с ошибкой:"
    docker-compose -f docker-compose.prod.yml logs --tail=50
fi
