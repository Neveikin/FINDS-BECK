package com.Finds.dev.Migration;

import com.Finds.dev.Entity.ProductImage;
import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.VariantImage;
import com.Finds.dev.Repositories.ProductImageRepository;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Repositories.VariantImageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Migration script to convert base64 data URLs to S3 CDN URLs.
 *
 * Run with: --migrate-images=true
 *
 * This script:
 * 1. Finds all base64 data URLs in database
 * 2. Decodes base64 to binary
 * 3. Uploads to S3
 * 4. Updates database with CDN URLs
 * 5. Logs all operations
 */
@Component
public class ImageMigrationScript implements CommandLineRunner {

    private final ProductImageRepository productImageRepository;
    private final VariantImageRepository variantImageRepository;
    private final ShopRepository shopRepository;
    private final S3Client s3Client;

    @Value("${s3.bucket}")
    private String bucketName;

    @Value("${s3.cdn-url}")
    private String cdnUrl;

    @Value("${migrate-images:false}")
    private boolean shouldMigrate;

    private static final Pattern DATA_URL_PATTERN = Pattern.compile("^data:image/(\\w+);base64,(.+)$");

    public ImageMigrationScript(
            ProductImageRepository productImageRepository,
            VariantImageRepository variantImageRepository,
            ShopRepository shopRepository,
            S3Client s3Client) {
        this.productImageRepository = productImageRepository;
        this.variantImageRepository = variantImageRepository;
        this.shopRepository = shopRepository;
        this.s3Client = s3Client;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!shouldMigrate) {
            return;
        }

        System.out.println("=== Starting Image Migration ===");

        int productImagesCount = migrateProductImages();
        int variantImagesCount = migrateVariantImages();
        int shopLogosCount = migrateShopLogos();

        System.out.println("=== Migration Complete ===");
        System.out.println("Product images migrated: " + productImagesCount);
        System.out.println("Variant images migrated: " + variantImagesCount);
        System.out.println("Shop logos migrated: " + shopLogosCount);
        System.out.println("Total: " + (productImagesCount + variantImagesCount + shopLogosCount));
    }

    private int migrateProductImages() {
        System.out.println("\n--- Migrating Product Images ---");
        List<ProductImage> images = productImageRepository.findAll();
        int count = 0;

        for (ProductImage image : images) {
            if (isBase64DataUrl(image.getImageUrl())) {
                try {
                    String cdnUrl = uploadBase64ToS3(image.getImageUrl(), "products");
                    image.setImageUrl(cdnUrl);
                    productImageRepository.save(image);
                    count++;
                    System.out.println("✓ Migrated product image: " + image.getId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to migrate product image " + image.getId() + ": " + e.getMessage());
                }
            }
        }

        return count;
    }

    private int migrateVariantImages() {
        System.out.println("\n--- Migrating Variant Images ---");
        List<VariantImage> images = variantImageRepository.findAll();
        int count = 0;

        for (VariantImage image : images) {
            if (isBase64DataUrl(image.getUrl())) {
                try {
                    String cdnUrl = uploadBase64ToS3(image.getUrl(), "variants");
                    image.setUrl(cdnUrl);
                    variantImageRepository.save(image);
                    count++;
                    System.out.println("✓ Migrated variant image: " + image.getId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to migrate variant image " + image.getId() + ": " + e.getMessage());
                }
            }
        }

        return count;
    }

    private int migrateShopLogos() {
        System.out.println("\n--- Migrating Shop Logos ---");
        List<Shop> shops = shopRepository.findAll();
        int count = 0;

        for (Shop shop : shops) {
            if (shop.getLogoUrl() != null && isBase64DataUrl(shop.getLogoUrl())) {
                try {
                    String cdnUrl = uploadBase64ToS3(shop.getLogoUrl(), "shops");
                    shop.setLogoUrl(cdnUrl);
                    shopRepository.save(shop);
                    count++;
                    System.out.println("✓ Migrated shop logo: " + shop.getId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to migrate shop logo " + shop.getId() + ": " + e.getMessage());
                }
            }
        }

        return count;
    }

    private boolean isBase64DataUrl(String url) {
        return url != null && url.startsWith("data:image/");
    }

    private String uploadBase64ToS3(String dataUrl, String folder) throws Exception {
        Matcher matcher = DATA_URL_PATTERN.matcher(dataUrl);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Invalid data URL format");
        }

        String mimeType = matcher.group(1);
        String base64Data = matcher.group(2);

        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        String filename = UUID.randomUUID().toString() + "." + mimeType;
        String key = folder + "/" + filename;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType("image/" + mimeType)
                .contentLength((long) imageBytes.length)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

        return cdnUrl + "/" + key;
    }
}
