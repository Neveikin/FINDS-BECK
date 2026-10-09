# 🚀 S3 Image Storage Migration - Deployment Guide

## 📋 Overview

Полная миграция хранения изображений с base64 в БД на S3-compatible storage (Cloudflare R2).

### Проблема (До миграции)
- ❌ Frontend конвертирует изображения в base64
- ❌ Base64 увеличивает размер на 33%
- ❌ Огромные API payloads (50-100MB для списка товаров)
- ❌ Медленная загрузка страниц (5-10 секунд)
- ❌ Высокое потребление памяти (2-4GB)
- ❌ Большая нагрузка на БД

### Решение (После миграции)
- ✅ Изображения загружаются напрямую в S3
- ✅ БД хранит только URLs
- ✅ Маленькие API payloads (100-500KB)
- ✅ Быстрая загрузка (<1 секунда)
- ✅ Низкое потребление памяти (<500MB)
- ✅ Минимальная нагрузка на БД
- ✅ CDN кэширование через Cloudflare

## 📦 Что изменено

### Backend
1. **Новые файлы:**
   - `S3Config.java` - конфигурация S3 клиента
   - `ImageUploadService.java` - сервис загрузки изображений
   - `ImageUploadController.java` - API endpoints для загрузки
   - `ImageMigrationScript.java` - скрипт миграции существующих изображений

2. **Изменения:**
   - `pom.xml` - добавлена зависимость AWS SDK S3
   - `application.yml` - добавлена S3 конфигурация

3. **Новые API endpoints:**
   - `POST /api/upload/product-image` - загрузка изображения товара
   - `POST /api/upload/variant-image` - загрузка изображения варианта
   - `POST /api/upload/shop-logo` - загрузка логотипа магазина

### Frontend
1. **Новые файлы:**
   - `uploadApi.ts` - API клиент для загрузки изображений

2. **Изменения:**
   - `StoreDashboard.tsx` - использует uploadApi вместо FileReader
   - `ProductVariantsForm.tsx` - использует uploadApi вместо FileReader
   - `AdminPanel.tsx` - использует uploadApi вместо FileReader

### Документация
- `CLOUDFLARE_R2_SETUP.md` - настройка Cloudflare R2
- `MIGRATION_GUIDE.md` - инструкции по миграции
- `.env.example` - шаблон переменных окружения

## 🔧 Предварительная настройка

### 1. Создать Cloudflare R2 Bucket

Следуй инструкциям в `CLOUDFLARE_R2_SETUP.md`:
1. Создай bucket в Cloudflare R2
2. Получи API credentials
3. Настрой custom domain (опционально)
4. Настрой CORS

### 2. Настроить Environment Variables

На production сервере:

```bash
ssh root@139.100.205.250

# Создай .env файл
cd /opt/finds-beck
nano .env
```

Добавь переменные:
```bash
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=finds-shop-images
S3_CDN_URL=https://cdn.finds-shop.ru
```

### 3. Обновить docker-compose.prod.yml

Добавь environment variables в backend service:

```yaml
services:
  backend:
    environment:
      - S3_ENDPOINT=${S3_ENDPOINT}
      - S3_REGION=${S3_REGION}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - S3_CDN_URL=${S3_CDN_URL}
```

## 🚀 Deployment Steps

### Step 1: Backup Database

```bash
ssh root@139.100.205.250
cd /opt/finds-beck

# Создай backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres finds_db > backup_before_s3_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Deploy New Code

```bash
# На локальной машине
cd /Users/ilanevejkin/Desktop/FINDS-BECK
./deploy-remote.sh
```

Или вручную:

```bash
# На сервере
cd /opt/finds-beck
git pull origin main

# Rebuild backend
docker compose -f docker-compose.prod.yml build --no-cache backend

# Rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend

# Restart services
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Step 3: Verify Services

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Check health
curl http://localhost:8090/actuator/health
curl http://localhost:3000
```

### Step 4: Test Upload (Optional)

Создай тестовый товар через admin panel и загрузи изображение.

Проверь что URL начинается с `https://cdn.finds-shop.ru/` а не `data:image/`

### Step 5: Migrate Existing Images

**⚠️ ВАЖНО: Делай это только после проверки что новые загрузки работают!**

```bash
# На сервере
cd /opt/finds-beck

# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Run migration
docker compose -f docker-compose.prod.yml run --rm backend \
  java -jar /app/app.jar --migrate-images=true

# Start backend
docker compose -f docker-compose.prod.yml start backend
```

### Step 6: Verify Migration

```bash
# Check database
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d finds_db

# Count remaining base64 URLs (should be 0)
SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'data:image/%';
SELECT COUNT(*) FROM variant_images WHERE url LIKE 'data:image/%';
SELECT COUNT(*) FROM shops WHERE logo_url LIKE 'data:image/%';

# Check sample URLs
SELECT image_url FROM product_images LIMIT 5;
```

### Step 7: Test Website

1. Открой https://finds-shop.ru
2. Проверь что изображения загружаются
3. Проверь DevTools Network tab:
   - API responses должны быть маленькими (<1MB)
   - Изображения должны загружаться с CDN
4. Проверь скорость загрузки страниц

## 📊 Expected Performance Improvements

### API Payload Size
- **До:** 50-100MB для списка товаров
- **После:** 100-500KB для списка товаров
- **Улучшение:** 99% reduction

### Page Load Time
- **До:** 5-10 секунд
- **После:** <1 секунда
- **Улучшение:** 5-10x faster

### Memory Usage
- **До:** 2-4GB
- **После:** <500MB
- **Улучшение:** 80% reduction

### Database Size
- **До:** 10GB+ (с base64)
- **После:** <1GB (только URLs)
- **Улучшение:** 90% reduction

## 🔍 Monitoring

### Check CDN Cache Hit Ratio

```bash
curl -I https://cdn.finds-shop.ru/products/some-image.jpg
```

Look for:
```
cf-cache-status: HIT
```

### Check API Response Size

```bash
curl -s http://finds-shop.ru/api/product/get | wc -c
```

Should be <500KB (was 50-100MB before)

### Check Memory Usage

```bash
docker stats backend
```

Should be <500MB (was 2-4GB before)

## 🔙 Rollback Plan

Если что-то пошло не так:

### Rollback Code

```bash
cd /opt/finds-beck
git log --oneline -10  # Find previous commit
git reset --hard <previous-commit-hash>
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Rollback Database

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d finds_db < backup_before_s3_migration_*.sql
```

## ✅ Success Criteria

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] New image uploads work
- [ ] Uploaded images accessible via CDN
- [ ] Migration script completes successfully
- [ ] No base64 URLs remain in database
- [ ] All images load on website
- [ ] API responses <1MB
- [ ] Page load time <2 seconds
- [ ] Memory usage <1GB

## 🐛 Troubleshooting

### Backend fails to start
- Check S3 credentials in .env
- Check logs: `docker compose logs backend`
- Verify S3_ENDPOINT is correct

### Images not uploading
- Check S3 bucket permissions
- Verify API token has write access
- Check network connectivity to R2

### Images not loading
- Verify CDN URL is correct
- Check CORS configuration
- Verify bucket is public or has correct policy

### Migration fails
- Check database connection
- Verify S3 credentials
- Check logs for specific errors
- Restore from backup if needed

## 📞 Support

Если возникли проблемы:
1. Проверь logs: `docker compose logs -f`
2. Проверь environment variables
3. Проверь S3 credentials
4. Проверь CLOUDFLARE_R2_SETUP.md
5. Проверь MIGRATION_GUIDE.md

## 🎯 Next Steps After Deployment

1. **Monitor performance** - проверь метрики в Cloudflare
2. **Enable image optimization** - настрой Cloudflare Image Resizing
3. **Add image compression** - настрой automatic WebP/AVIF
4. **Set up alerts** - настрой мониторинг для CDN и storage
5. **Clean up old data** - после проверки можно удалить старые base64 данные

---

**Готово к деплою!** 🚀
