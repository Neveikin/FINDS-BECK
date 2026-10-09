# ⚡ Quick Start - S3 Migration

**5-минутный checklist для начала работы**

---

## 📋 Pre-Deployment (15 минут)

### 1. Cloudflare R2 Setup
```bash
# 1. Открой https://dash.cloudflare.com
# 2. R2 Object Storage → Create bucket
# 3. Имя: finds-shop-images
# 4. Create API token → Object Read & Write
# 5. Сохрани credentials
```

**Получишь:**
- Access Key ID
- Secret Access Key
- Endpoint URL
- Bucket name

### 2. Environment Variables
```bash
# На сервере
ssh root@139.100.205.250
cd /opt/finds-beck
nano .env
```

**Добавь:**
```bash
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=finds-shop-images
S3_CDN_URL=https://pub-xxxxx.r2.dev
```

### 3. Update docker-compose.prod.yml
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

---

## 🚀 Deployment (10 минут)

### 1. Backup
```bash
ssh root@139.100.205.250
cd /opt/finds-beck
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres finds_db > backup_$(date +%Y%m%d).sql
```

### 2. Deploy
```bash
# Локально
cd /Users/ilanevejkin/Desktop/FINDS-BECK
./deploy-remote.sh
```

### 3. Verify
```bash
# На сервере
docker compose -f docker-compose.prod.yml logs -f backend | grep "Started"
curl http://localhost:8090/actuator/health
```

---

## 🧪 Testing (5 минут)

### 1. Test Upload
```bash
# Открой admin panel
# Создай тестовый товар
# Загрузи изображение
# Проверь что URL начинается с https://pub-xxxxx.r2.dev/
```

### 2. Test API
```bash
curl -s http://finds-shop.ru/api/product/get | jq '.[0].image'
# Должен вернуть CDN URL, не base64
```

### 3. Check Size
```bash
curl -s http://finds-shop.ru/api/product/get | wc -c
# Должно быть <500KB (было 50-100MB)
```

---

## 🔄 Migration (10 минут)

**⚠️ Только после проверки что новые загрузки работают!**

```bash
ssh root@139.100.205.250
cd /opt/finds-beck

# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Run migration
docker compose -f docker-compose.prod.yml run --rm backend \
  java -jar /app/app.jar --migrate-images=true

# Start backend
docker compose -f docker-compose.prod.yml start backend
```

---

## ✅ Verification

```bash
# Check database
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d finds_db -c \
  "SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'data:image/%';"

# Should return 0
```

---

## 📊 Success Metrics

После деплоя проверь:

- [ ] Backend запустился без ошибок
- [ ] Frontend запустился без ошибок
- [ ] Новые изображения загружаются в R2
- [ ] API response size <1MB
- [ ] Page load time <2s
- [ ] Memory usage <1GB
- [ ] Все изображения отображаются

---

## 🐛 Quick Troubleshooting

### Backend не стартует
```bash
docker compose -f docker-compose.prod.yml logs backend
# Проверь S3 credentials в .env
```

### Изображения не загружаются
```bash
# Проверь bucket permissions
# Проверь CORS настройки
# Проверь API token
```

### Migration fails
```bash
# Restore backup
psql -U postgres -d finds_db < backup_YYYYMMDD.sql
```

---

## 📚 Full Documentation

Для детальной информации:

1. **`S3_MIGRATION_SUMMARY.md`** - Полный обзор
2. **`DEPLOYMENT_S3_MIGRATION.md`** - Детальный deployment guide
3. **`CLOUDFLARE_R2_SETUP.md`** - Настройка R2
4. **`MIGRATION_GUIDE.md`** - Инструкции миграции

---

## 🎯 Expected Results

### Before
- ❌ API: 50-100MB
- ❌ Load: 5-10s
- ❌ Memory: 2-4GB

### After
- ✅ API: 100-500KB (99% ↓)
- ✅ Load: <1s (10x ↑)
- ✅ Memory: <500MB (80% ↓)

---

**Total Time: ~40 minutes**

**Ready? Start with step 1!** 🚀
