package com.Finds.dev.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<?> getBrands(@RequestParam(required = false) String id) {
        List<Map<String, Object>> brands = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/marketplace", "ilanevejkin", "")) {
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
                    brand.put("logoUrl", rs.getString("logoUrl"));
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
                    brand.put("logoUrl", rs.getString("logoUrl"));
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
    public ResponseEntity<?> getBrandProducts(@PathVariable String brandId) {
        List<Map<String, Object>> products = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/marketplace", "ilanevejkin", "")) {
            String sql = "SELECT id, name, description, price, stock, material, shop_id, category_id FROM products WHERE shop_id = ? AND is_active = true";
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
                product.put("brandId", rs.getString("shop_id")); // Use shop_id as brandId
                product.put("image", "/images/products/" + rs.getString("id") + ".jpg");
                products.add(product);
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
