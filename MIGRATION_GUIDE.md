# Image Migration to S3

## Overview
This script migrates all base64 data URLs from the database to S3-compatible storage (Cloudflare R2).

## Prerequisites

1. **S3 Credentials**: Set environment variables
   ```bash
   export S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   export S3_REGION="auto"
   export S3_ACCESS_KEY="your-access-key"
   export S3_SECRET_KEY="your-secret-key"
   export S3_BUCKET="your-bucket-name"
   export S3_CDN_URL="https://your-cdn-domain.com"
   ```

2. **Database Backup**: Always backup before migration
   ```bash
   pg_dump -h localhost -U postgres -d finds_db > backup_before_migration.sql
   ```

## Running the Migration

### Local Development
```bash
cd backend
mvn clean package
java -jar target/dev-0.0.1-SNAPSHOT.jar --migrate-images=true
```

### Production
```bash
# SSH to server
ssh root@your-server

# Navigate to project
cd /opt/finds-beck/backend

# Stop application
docker compose -f ../docker-compose.prod.yml stop backend

# Run migration
docker compose -f ../docker-compose.prod.yml run --rm backend \
  java -jar /app/app.jar --migrate-images=true

# Start application
docker compose -f ../docker-compose.prod.yml start backend
```

## What the Script Does

1. **Product Images**: Migrates `product_images.image_url`
2. **Variant Images**: Migrates `variant_images.url`
3. **Shop Logos**: Migrates `shops.logo_url`

For each image:
- Detects base64 data URLs (`data:image/jpeg;base64,...`)
- Decodes base64 to binary
- Uploads to S3 with unique UUID filename
- Updates database with CDN URL
- Logs success/failure

## Safety Features

- **Non-destructive**: Only updates base64 URLs, leaves CDN URLs unchanged
- **Idempotent**: Can be run multiple times safely
- **Error handling**: Continues on individual failures
- **Detailed logging**: Shows progress and errors

## Verification

After migration, verify images are accessible:

```sql
-- Check product images
SELECT id, image_url FROM product_images LIMIT 10;

-- Check variant images
SELECT id, url FROM variant_images LIMIT 10;

-- Check shop logos
SELECT id, logo_url FROM shops WHERE logo_url IS NOT NULL LIMIT 10;

-- Count remaining base64 URLs (should be 0)
SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'data:image/%';
SELECT COUNT(*) FROM variant_images WHERE url LIKE 'data:image/%';
SELECT COUNT(*) FROM shops WHERE logo_url LIKE 'data:image/%';
```

## Rollback

If migration fails, restore from backup:

```bash
# Stop application
docker compose -f docker-compose.prod.yml stop

# Restore database
psql -h localhost -U postgres -d finds_db < backup_before_migration.sql

# Start application
docker compose -f docker-compose.prod.yml start
```

## Expected Results

### Before Migration
- Database stores base64 strings (1-5MB per image)
- API responses are huge (50-100MB for product lists)
- Slow page loads (5-10 seconds)

### After Migration
- Database stores URLs (50-100 bytes per image)
- API responses are tiny (100-500KB for product lists)
- Fast page loads (<1 second)

### Performance Improvement
- **Database size**: -90% (base64 removed)
- **API payload**: -99% (URLs instead of base64)
- **Page load time**: 5-10x faster
- **Memory usage**: -95% (no large strings in memory)

## Troubleshooting

### Migration fails with "Access Denied"
- Check S3 credentials are correct
- Verify bucket exists and is accessible
- Check IAM permissions for PutObject

### Some images fail to migrate
- Check logs for specific errors
- Verify base64 data is valid
- Check S3 storage quota

### Images not loading after migration
- Verify CDN URL is correct
- Check CORS settings on S3 bucket
- Verify images are publicly accessible

## Next Steps

After successful migration:

1. **Test thoroughly**: Check all pages load correctly
2. **Monitor performance**: Verify improvements in metrics
3. **Clean up**: Consider removing old base64 data after verification period
4. **Update deployment**: Ensure new code is deployed to production
