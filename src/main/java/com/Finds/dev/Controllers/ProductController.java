package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.Entity.Product;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Services.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/product")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ProductController {
    ProductService productService;
    ProductRepository productRepository;

    public ProductController(ProductRepository productRepository, ProductService productService) {
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getProducts(@RequestParam String id) {
        try {
            return ResponseEntity.ok(productService.getProducts(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/add/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#shopId, authentication)")
    public ResponseEntity<?> addProduct(@RequestBody Product product, @PathVariable String shopId) {
        try {
            productRepository.save(product);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product created successfully");
            response.put("data", Map.of(
                "productId", product.getId(),
                "productName", product.getName(),
                "shopId", shopId
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "PRODUCT_CREATION_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PatchMapping("/edit/{productId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#productId, authentication)")
    public ResponseEntity<?> editProduct(@Valid @RequestBody ProductEditDTO productEditDTO, @PathVariable String productId) {
        try {
            productService.editProduct(productEditDTO, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product updated successfully");
            response.put("data", Map.of(
                "productId", productId
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "PRODUCT_UPDATE_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

}
