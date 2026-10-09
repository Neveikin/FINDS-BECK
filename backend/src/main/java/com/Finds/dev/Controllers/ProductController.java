package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.*;
import com.Finds.dev.Entity.*;
import com.Finds.dev.Repositories.*;
import com.Finds.dev.Services.ProductService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/product")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ProductController {

    ProductService productService;
    ProductRepository productRepository;
    ShopRepository shopRepository;
    CategoryRepository categoryRepository;
    ProductImageRepository productImageRepository;
    ProductVariantRepository productVariantRepository;
    VariantImageRepository variantImageRepository;
    VariantSizeRepository variantSizeRepository;
    DataSource dataSource;

    public ProductController(ProductRepository productRepository,
                             ProductService productService,
                             ShopRepository shopRepository,
                             CategoryRepository categoryRepository,
                             ProductImageRepository productImageRepository,
                             ProductVariantRepository productVariantRepository,
                             VariantImageRepository variantImageRepository,
                             VariantSizeRepository variantSizeRepository,
                             DataSource dataSource) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.shopRepository = shopRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.variantImageRepository = variantImageRepository;
        this.variantSizeRepository = variantSizeRepository;
        this.dataSource = dataSource;
    }

    @GetMapping("/get")
    @Cacheable(value = "products", key = "#id != null ? 'product_' + #id : (#shopId != null ? 'shop_' + #shopId : (#category != null ? 'category_' + #category : 'all'))", unless = "#result == null")
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String shopId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer limit) {

        // dataSource.getConnection() gets a pooled connection from HikariCP (no TCP overhead)
        try (Connection conn = dataSource.getConnection()) {

            if (id != null) {
                return ResponseEntity.ok(getProductByIdOptimized(conn, id));
            } else if (shopId != null) {
                return ResponseEntity.ok(getProductsByShopOptimized(conn, shopId));
            } else if (category != null && !category.isBlank()) {
                return ResponseEntity.ok(getProductsByCategoryOptimized(conn, category));
            } else {
                if (limit != null) {
                    return ResponseEntity.ok(getAllProductsOptimized(conn, limit));
                }
                return ResponseEntity.ok(getAllProductsOptimized(conn));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/popular")
    @Cacheable(value = "products", key = "'popular_' + (#limit != null ? #limit : 100)", unless = "#result == null")
    public ResponseEntity<?> getPopularProducts(@RequestParam(required = false) Integer limit) {
        try (Connection conn = dataSource.getConnection()) {
            return ResponseEntity.ok(getProductsOptimized(conn, "WHERE p.is_active = true ORDER BY COALESCE(p.order_count, 0) DESC", limit != null ? limit : 100, null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> getProductByIdOptimized(Connection conn, String productId) throws SQLException {
        List<Map<String, Object>> products = getProductsOptimized(conn,
            "WHERE p.id = ?", null,
            stmt -> stmt.setString(1, productId));
        return products.isEmpty() ? null : products.get(0);
    }

    private List<Map<String, Object>> getProductsByShopOptimized(Connection conn, String shopId) throws SQLException {
        return getProductsOptimized(conn,
            "WHERE p.shop_id = ? AND p.is_active = true", null,
            stmt -> stmt.setString(1, shopId));
    }

    private List<Map<String, Object>> getProductsByCategoryOptimized(Connection conn, String categoryName) throws SQLException {
        return getProductsOptimized(conn,
            "WHERE c.name = ? AND p.is_active = true", null,
            stmt -> stmt.setString(1, categoryName));
    }

    private List<Map<String, Object>> getAllProductsOptimized(Connection conn) throws SQLException {
        return getProductsOptimized(conn, "WHERE p.is_active = true", null, null);
    }

    private List<Map<String, Object>> getAllProductsOptimized(Connection conn, int limit) throws SQLException {
        return getProductsOptimized(conn, "WHERE p.is_active = true", limit, null);
    }

    /**
     * Core method: fetches products in 3 round trips total (products + variants + images+sizes).
     * Uses LATERAL JOIN instead of correlated subquery to get main image.
     */
    private List<Map<String, Object>> getProductsOptimized(Connection conn,
                                                           String whereClause,
                                                           Integer limit,
                                                           PreparedStatementSetter setter) throws SQLException {
        // Use LATERAL JOIN instead of correlated subquery - much faster for lists
        String limitClause = (limit != null) ? " LIMIT " + limit : "";
        String sql =
            "SELECT p.id, p.name, p.description, p.price, p.stock, p.material, p.is_active, " +
            "c.name AS category_name, s.name AS shop_name, " +
            "pi.image_url AS main_image " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "LEFT JOIN shops s ON p.shop_id = s.id " +
            "LEFT JOIN LATERAL (" +
            "  SELECT image_url FROM product_images " +
            "  WHERE product_id = p.id AND is_main = true LIMIT 1" +
            ") pi ON true " +
            whereClause + limitClause;

        Map<String, Map<String, Object>> productsMap = new LinkedHashMap<>();

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            if (setter != null) setter.setParameters(stmt);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String productId = rs.getString("id");
                    Map<String, Object> product = new HashMap<>();
                    product.put("id", productId);
                    product.put("name", rs.getString("name"));
                    product.put("description", rs.getString("description"));
                    product.put("price", rs.getBigDecimal("price"));
                    product.put("stock", rs.getInt("stock"));
                    product.put("material", rs.getString("material"));
                    product.put("isActive", rs.getBoolean("is_active"));
                    product.put("category", rs.getString("category_name"));
                    product.put("brand", rs.getString("shop_name"));

                    String mainImage = rs.getString("main_image");
                    product.put("image", mainImage != null ? mainImage : "");
                    product.put("imageUrl", mainImage != null ? mainImage : "");
                    product.put("variants", new ArrayList<>());

                    productsMap.put(productId, product);
                }
            }
        }

        if (productsMap.isEmpty()) {
            return new ArrayList<>();
        }

        // ---- Batch fetch variants, images, sizes in 3 additional queries ----
        // Build a safe placeholder list  e.g. (?,?,?)
        List<String> ids = new ArrayList<>(productsMap.keySet());
        String placeholders = buildPlaceholders(ids.size());

        // 1. All variants for the fetched products
        String variantsSql =
            "SELECT pv.id, pv.product_id, pv.color, pv.color_hex " +
            "FROM product_variants pv " +
            "WHERE pv.product_id IN (" + placeholders + ")";

        Map<String, List<Map<String, Object>>> variantsByProduct = new HashMap<>();
        Map<String, Map<String, Object>> variantsMap = new HashMap<>();

        try (PreparedStatement stmt = conn.prepareStatement(variantsSql)) {
            setStringParams(stmt, ids);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String variantId = rs.getString("id");
                    String productId = rs.getString("product_id");

                    Map<String, Object> variant = new HashMap<>();
                    variant.put("id", variantId);
                    variant.put("color", rs.getString("color"));
                    variant.put("colorHex", rs.getString("color_hex"));
                    variant.put("images", new ArrayList<>());
                    variant.put("sizes", new ArrayList<>());

                    variantsMap.put(variantId, variant);
                    variantsByProduct.computeIfAbsent(productId, k -> new ArrayList<>()).add(variant);
                }
            }
        }

        if (!variantsMap.isEmpty()) {
            List<String> variantIds = new ArrayList<>(variantsMap.keySet());
            String variantPlaceholders = buildPlaceholders(variantIds.size());

            // 2. All variant images
            String imagesSql =
                "SELECT vi.variant_id, vi.id, vi.url, vi.display_order " +
                "FROM variant_images vi " +
                "WHERE vi.variant_id IN (" + variantPlaceholders + ") " +
                "ORDER BY vi.display_order";

            try (PreparedStatement stmt = conn.prepareStatement(imagesSql)) {
                setStringParams(stmt, variantIds);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String variantId = rs.getString("variant_id");
                        Map<String, Object> variant = variantsMap.get(variantId);
                        if (variant != null) {
                            Map<String, Object> image = new HashMap<>();
                            image.put("id", rs.getString("id"));
                            image.put("url", rs.getString("url"));
                            image.put("order", rs.getInt("display_order"));
                            ((List<Map<String, Object>>) variant.get("images")).add(image);
                        }
                    }
                }
            }

            // 3. All variant sizes
            String sizesSql =
                "SELECT vs.variant_id, vs.size, vs.stock " +
                "FROM variant_sizes vs " +
                "WHERE vs.variant_id IN (" + variantPlaceholders + ")";

            try (PreparedStatement stmt = conn.prepareStatement(sizesSql)) {
                setStringParams(stmt, variantIds);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String variantId = rs.getString("variant_id");
                        Map<String, Object> variant = variantsMap.get(variantId);
                        if (variant != null) {
                            Map<String, Object> size = new HashMap<>();
                            size.put("size", rs.getString("size"));
                            size.put("stock", rs.getInt("stock"));
                            ((List<Map<String, Object>>) variant.get("sizes")).add(size);
                        }
                    }
                }
            }
        }

        // Merge variants into products
        for (Map.Entry<String, List<Map<String, Object>>> entry : variantsByProduct.entrySet()) {
            Map<String, Object> product = productsMap.get(entry.getKey());
            if (product != null) {
                product.put("variants", entry.getValue());
            }
        }

        return new ArrayList<>(productsMap.values());
    }

    // ---- Helpers ----

    /** Builds a (?,?,?) placeholder string for a prepared statement IN clause */
    private String buildPlaceholders(int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            if (i > 0) sb.append(',');
            sb.append('?');
        }
        return sb.toString();
    }

    /** Sets a list of String params starting from position 1 */
    private void setStringParams(PreparedStatement stmt, List<String> params) throws SQLException {
        for (int i = 0; i < params.size(); i++) {
            stmt.setString(i + 1, params.get(i));
        }
    }

    @FunctionalInterface
    private interface PreparedStatementSetter {
        void setParameters(PreparedStatement stmt) throws SQLException;
    }

    // ---- Write endpoints (unchanged logic) ----

    @PostMapping("/add/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#shopId, authentication)")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<?> addProduct(@RequestBody @Valid ProductCreateDTO dto, @PathVariable String shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found"));

        Product product = new Product();
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setShop(shop);
        product.setStock(dto.stock() != null ? dto.stock() : 0);
        product.setMaterial(dto.material());

        if (dto.categoryName() != null && !dto.categoryName().isBlank()) {
            Category category = categoryRepository.findByName(dto.categoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(dto.categoryName());
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);

        if (dto.imageUrl() != null && !dto.imageUrl().isBlank()) {
            ProductImage image = new ProductImage(savedProduct, dto.imageUrl(), true);
            productImageRepository.save(image);
        }

        if (dto.variants() != null && !dto.variants().isEmpty()) {
            for (ProductVariantDTO variantDTO : dto.variants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(savedProduct);
                variant.setColor(variantDTO.color());
                variant.setColorHex(variantDTO.colorHex());
                ProductVariant savedVariant = productVariantRepository.save(variant);

                if (variantDTO.images() != null) {
                    for (VariantImageDTO imageDTO : variantDTO.images()) {
                        VariantImage variantImage = new VariantImage();
                        variantImage.setVariant(savedVariant);
                        variantImage.setUrl(imageDTO.url());
                        variantImage.setOrder(imageDTO.order() != null ? imageDTO.order() : 0);
                        variantImageRepository.save(variantImage);
                    }
                }

                if (variantDTO.sizes() != null) {
                    for (VariantSizeDTO sizeDTO : variantDTO.sizes()) {
                        VariantSize variantSize = new VariantSize();
                        variantSize.setVariant(savedVariant);
                        variantSize.setSize(sizeDTO.size());
                        variantSize.setStock(sizeDTO.stock() != null ? sizeDTO.stock() : 0);
                        variantSizeRepository.save(variantSize);
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product created successfully");
        response.put("data", Map.of(
            "productId", savedProduct.getId(),
            "productName", savedProduct.getName(),
            "shopId", shopId
        ));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/edit/{productId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#productId, authentication)")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<?> editProduct(@Valid @RequestBody ProductEditDTO productEditDTO, @PathVariable String productId) {
        productService.editProduct(productEditDTO, productId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product updated successfully");
        response.put("data", Map.of("productId", productId));

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{productId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#productId, authentication)")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<?> deleteProduct(@PathVariable String productId) {
        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found");
        }
        productRepository.deleteById(productId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product deleted successfully");

        return ResponseEntity.ok(response);
    }
}
