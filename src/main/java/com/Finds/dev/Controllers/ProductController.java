package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.Entity.Product;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Services.ProductService;
import jakarta.persistence.EntityNotFoundException;
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
        return ResponseEntity.ok(productService.getProducts(id));
    }

    @PostMapping("/add/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#shopId, authentication)")
    public ResponseEntity<?> addProduct(@RequestBody @Valid Product product, @PathVariable String shopId) {
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
    }

    @PatchMapping("/edit/{productId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#productId, authentication)")
    public ResponseEntity<?> editProduct(@Valid @RequestBody ProductEditDTO productEditDTO, @PathVariable String productId) {
        productService.editProduct(productEditDTO, productId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product updated successfully");
        response.put("data", Map.of(
            "productId", productId
        ));
        
        return ResponseEntity.ok(response);
    }

}
