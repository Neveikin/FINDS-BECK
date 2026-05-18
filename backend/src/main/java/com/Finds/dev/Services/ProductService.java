package com.Finds.dev.Services;

import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.Repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;
    
    @Autowired
    com.Finds.dev.Repositories.ProductImageRepository productImageRepository;

    @Transactional
    public void editProduct(ProductEditDTO productEditDTO, String id) {
        BigDecimal price = productEditDTO.price();
        com.Finds.dev.Entity.Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (price.scale() > 2 || price.compareTo(BigDecimal.valueOf(0.01)) < 0) {
            throw new IllegalArgumentException("Incorrect Number Format");
        }
        
        product.setName(productEditDTO.name());
        product.setDescription(productEditDTO.description());
        product.setPrice(price);
        product.setStock(productEditDTO.stock());
        product.setIsActive(productEditDTO.isActive());
        product.setMaterial(productEditDTO.material());
        product.setAvailableSizes(productEditDTO.availableSizes());
        
        productRepository.save(product);
        
        if (productEditDTO.imageUrl() != null && !productEditDTO.imageUrl().isBlank()) {
            // Update or create main image
            List<com.Finds.dev.Entity.ProductImage> images = productImageRepository.findByProductId(id);
            com.Finds.dev.Entity.ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain())
                    .findFirst()
                    .orElse(new com.Finds.dev.Entity.ProductImage(product, productEditDTO.imageUrl(), true));
            
            mainImage.setImageUrl(productEditDTO.imageUrl());
            productImageRepository.save(mainImage);
        }
    }

    public Object getProducts(String id) {
        if (id != null) {
            // Return single product by ID
            return productRepository.findById(id).orElse(null);
        } else {
            // Return all products
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userRole = auth.getAuthorities().iterator().next().getAuthority();
            String userId = auth.getName();

            if (userRole.equals("ROLE_ADMIN") || userRole.equals("ROLE_SELLER"))
                return productRepository.findAllProductsWithFavoriteAndImage(userId);
            else
                return productRepository.findActiveProductsWithFavoriteAndImage(userId);
        }
    }
}
