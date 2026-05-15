package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.ProductCreateDTO;
import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.Entity.Category;
import com.Finds.dev.Entity.Product;
import com.Finds.dev.Entity.ProductImage;
import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Repositories.CategoryRepository;
import com.Finds.dev.Repositories.ProductImageRepository;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Services.ProductService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/product")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ProductController {
    ProductService productService;
    ProductRepository productRepository;
    ShopRepository shopRepository;
    CategoryRepository categoryRepository;
    ProductImageRepository productImageRepository;

    public ProductController(ProductRepository productRepository, 
                             ProductService productService, 
                             ShopRepository shopRepository,
                             CategoryRepository categoryRepository,
                             ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.shopRepository = shopRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) String id, @RequestParam(required = false) String shopId) {
        if (id != null) {
            Object result = productService.getProducts(id);
            if (result instanceof Product p) {
                return ResponseEntity.ok(constructProductResponse(p));
            }
            return ResponseEntity.ok(result);
        } else if (shopId != null) {
            List<Product> products = productRepository.findByShopId(shopId);
            return ResponseEntity.ok(products.stream().map(this::constructProductResponse).toList());
        } else {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products.stream().map(this::constructProductResponse).toList());
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularProducts(@RequestParam(required = false) Integer limit) {
        List<Product> allProducts = productRepository.findAll();
        List<Product> targetProducts = (limit != null && limit > 0) 
            ? allProducts.stream().limit(limit).toList() 
            : allProducts;
        return ResponseEntity.ok(targetProducts.stream().map(this::constructProductResponse).toList());
    }

    private Map<String, Object> constructProductResponse(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("material", p.getMaterial());
        map.put("isActive", p.getIsActive());
        map.put("category", p.getCategory() != null ? p.getCategory().getName() : null);
        map.put("brand", p.getShop() != null ? p.getShop().getName() : "Unknown");
        
        // Find main image or first image
        String mainImageUrl = "";
        List<ProductImage> images = productImageRepository.findByProductId(p.getId());
        if (!images.isEmpty()) {
            mainImageUrl = images.stream()
                .filter(img -> img.getIsMain() != null && img.getIsMain())
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.get(0).getImageUrl());
        }
        map.put("image", mainImageUrl);
        map.put("imageUrl", mainImageUrl); // Fallback
        
        return map;
    }

    
    @PostMapping("/add/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#shopId, authentication)")
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

    @DeleteMapping("/delete/{productId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isExistInOwners(#productId, authentication)")
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
