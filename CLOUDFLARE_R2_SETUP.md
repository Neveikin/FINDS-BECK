# Cloudflare R2 + CDN Setup Guide

## Step 1: Create Cloudflare R2 Bucket

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to R2 Object Storage

2. **Create Bucket**
   - Click "Create bucket"
   - Name: `finds-shop-images` (or your preferred name)
   - Location: Automatic (closest to your users)
   - Click "Create bucket"

3. **Configure Public Access**
   - Go to bucket settings
   - Enable "Public access"
   - Or configure custom domain (recommended)

## Step 2: Create API Tokens

1. **Navigate to R2 API Tokens**
   - In R2 dashboard, click "Manage R2 API Tokens"
   - Click "Create API token"

2. **Configure Token**
   - Name: `finds-shop-backend`
   - Permissions: "Object Read & Write"
   - Bucket: Select your bucket
   - Click "Create API token"

3. **Save Credentials**
   ```
   Access Key ID: <your-access-key>
   Secret Access Key: <your-secret-key>
   Endpoint: https://<account-id>.r2.cloudflarestorage.com
   ```

## Step 3: Configure Custom Domain (Recommended)

### Option A: Cloudflare CDN Domain

1. **Go to Bucket Settings**
   - Click "Connect Domain"
   - Enter subdomain: `cdn.finds-shop.ru`
   - Click "Connect domain"

2. **DNS Configuration**
   - Cloudflare automatically creates CNAME record
   - Enable "Proxied" (orange cloud) for CDN benefits

### Option B: R2.dev Domain (Quick Start)

1. **Enable Public R2.dev URL**
   - Go to bucket settings
   - Enable "Allow Access" for R2.dev subdomain
   - URL will be: `https://pub-<hash>.r2.dev`

## Step 4: Configure CORS

Add CORS policy to allow frontend access:

```json
[
  {
    "AllowedOrigins": [
      "https://finds-shop.ru",
      "https://www.finds-shop.ru",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 5: Backend Configuration

### Environment Variables

Add to `.env` or production environment:

```bash
# Cloudflare R2 Configuration
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY=<your-access-key>
S3_SECRET_KEY=<your-secret-key>
S3_BUCKET=finds-shop-images
S3_CDN_URL=https://cdn.finds-shop.ru
```

### Docker Compose

Update `docker-compose.prod.yml`:

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

## Step 6: Cloudflare CDN Optimization

### Cache Rules

1. **Go to Cloudflare Dashboard** → Your domain → Rules → Page Rules

2. **Create Cache Rule for Images**
   - URL pattern: `cdn.finds-shop.ru/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: 1 month

### Transform Rules (Optional)

Enable automatic image optimization:

1. **Go to Rules** → Transform Rules → Modify Response Header
2. Add headers:
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

### Image Resizing (Optional)

Enable Cloudflare Image Resizing for responsive images:

1. **Go to Speed** → Optimization → Image Resizing
2. Enable "Image Resizing"
3. Use in frontend:
   ```
   https://cdn.finds-shop.ru/cdn-cgi/image/width=800,quality=85/products/image.jpg
   ```

## Step 7: Security Configuration

### Bucket Policies

Restrict write access to backend only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::finds-shop-images/*"
    }
  ]
}
```

### Rate Limiting

Configure Cloudflare rate limiting:

1. **Go to Security** → WAF → Rate limiting rules
2. Create rule:
   - URL: `cdn.finds-shop.ru/*`
   - Requests: 1000 per minute per IP
   - Action: Block

## Step 8: Testing

### Test Upload

```bash
curl -X POST http://localhost:8090/api/upload/product-image \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@test-image.jpg"
```

Expected response:
```json
{
  "success": true,
  "url": "https://cdn.finds-shop.ru/products/abc-123.jpg"
}
```

### Test CDN Access

```bash
curl -I https://cdn.finds-shop.ru/products/abc-123.jpg
```

Expected headers:
```
HTTP/2 200
cache-control: public, max-age=31536000, immutable
cf-cache-status: HIT
```

## Step 9: Migration

Run migration script to move existing images:

```bash
# Backup database first
pg_dump finds_db > backup.sql

# Run migration
java -jar backend.jar --migrate-images=true

# Verify
curl http://localhost:8090/product/get | jq '.[] | .image'
```

## Performance Expectations

### Before (Base64 in DB)
- Product list API: 50-100MB
- Page load: 5-10 seconds
- Database size: 10GB+
- Memory usage: 2-4GB

### After (R2 + CDN)
- Product list API: 100-500KB (99% reduction)
- Page load: <1 second (10x faster)
- Database size: <1GB (90% reduction)
- Memory usage: <500MB (80% reduction)

## Monitoring

### Cloudflare Analytics

Monitor CDN performance:
1. **Go to Analytics** → Traffic
2. Check:
   - Cache hit ratio (target: >95%)
   - Bandwidth saved
   - Requests per second

### R2 Metrics

Monitor storage usage:
1. **Go to R2** → Your bucket → Metrics
2. Check:
   - Storage used
   - Class A operations (writes)
   - Class B operations (reads)

## Cost Estimation

### Cloudflare R2 Pricing
- Storage: $0.015/GB/month
- Class A operations (writes): $4.50/million
- Class B operations (reads): $0.36/million
- Egress: FREE (via Cloudflare CDN)

### Example: 10,000 products with 5 images each
- Storage: 50,000 images × 500KB = 25GB
- Cost: 25GB × $0.015 = $0.375/month
- Bandwidth: FREE (via CDN)

**Total: ~$0.40/month** (vs $50-100/month for traditional S3 + CloudFront)

## Troubleshooting

### Images not uploading
- Check S3 credentials
- Verify bucket permissions
- Check network connectivity

### Images not loading
- Verify CDN URL is correct
- Check CORS configuration
- Verify bucket is public

### Slow image loading
- Check cache hit ratio
- Verify CDN is enabled
- Check image sizes (optimize if needed)

## Next Steps

1. ✅ Configure R2 bucket
2. ✅ Set environment variables
3. ✅ Deploy backend changes
4. ✅ Run migration script
5. ✅ Test image uploads
6. ✅ Verify CDN caching
7. ✅ Monitor performance
