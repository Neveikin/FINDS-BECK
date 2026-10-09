package com.Finds.dev.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/brands")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class BrandController {

    @GetMapping("/get")
    @Cacheable(value = "brands", key = "#id != null ? 'brand_' + #id : 'all_brands'", unless = "#result == null")
    public ResponseEntity<?> getBrands(@RequestParam(required = false) String id) {
        List<Map<String, Object>> brands = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection(System.getenv("DATABASE_URL"), System.getenv("DATABASE_USERNAME"), System.getenv("DATABASE_PASSWORD"))) {
            String sql;
            if (id != null) {
                sql = "SELECT id, name, description, logo_url as logoUrl, created_at FROM shops WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, id);
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    Map<String, Object> brand = new HashMap<>();
                    brand.put("id", rs.getString("id"));
                    brand.put("name", rs.getString("name"));
                    brand.put("description", rs.getString("description"));
                    brand.put("logo", rs.getString("logoUrl")); // Frontend expects 'logo'
                    brand.put("logoUrl", rs.getString("logoUrl")); // Keep for compatibility
                    brand.put("coverImage", rs.getString("logoUrl"));
                    return ResponseEntity.ok(brand);
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                sql = "SELECT id, name, description, logo_url as logoUrl, created_at FROM shops ORDER BY created_at DESC";
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery();
                
                while (rs.next()) {
                    Map<String, Object> brand = new HashMap<>();
                    brand.put("id", rs.getString("id"));
                    brand.put("name", rs.getString("name"));
                    brand.put("description", rs.getString("description"));
                    brand.put("logo", rs.getString("logoUrl")); // Frontend expects 'logo'
                    brand.put("logoUrl", rs.getString("logoUrl")); // Keep for compatibility
                    brand.put("coverImage", rs.getString("logoUrl"));
                    brands.add(brand);
                }
                return ResponseEntity.ok(brands);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{brandId}/products")
    @Cacheable(value = "brands", key = "'brand_products_' + #brandId", unless = "#result == null")
    public ResponseEntity<?> getBrandProducts(@PathVariable String brandId) {
        List<Map<String, Object>> products = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(System.getenv("DATABASE_URL"), System.getenv("DATABASE_USERNAME"), System.getenv("DATABASE_PASSWORD"))) {
            String sql = "SELECT p.id, p.name, p.description, p.price, p.stock, p.material, p.shop_id, p.category_id, " +
                         "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = true LIMIT 1) as main_image " +
                         "FROM products p WHERE p.shop_id = ? AND p.is_active = true";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, brandId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Map<String, Object> product = new HashMap<>();
                product.put("id", rs.getString("id"));
                product.put("name", rs.getString("name"));
                product.put("description", rs.getString("description"));
                product.put("price", rs.getDouble("price"));
                product.put("stock", rs.getInt("stock"));
                product.put("material", rs.getString("material"));
                product.put("shopId", rs.getString("shop_id"));
                product.put("categoryId", rs.getString("category_id"));
                product.put("brandId", rs.getString("shop_id"));

                String mainImage = rs.getString("main_image");
                product.put("image", mainImage != null ? mainImage : "");
                product.put("imageUrl", mainImage != null ? mainImage : "");

                products.add(product);
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
