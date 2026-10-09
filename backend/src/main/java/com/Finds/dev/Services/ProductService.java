package com.Finds.dev.Services;

import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.DTO.Products.ProductVariantDTO;
import com.Finds.dev.DTO.Products.VariantImageDTO;
import com.Finds.dev.DTO.Products.VariantSizeDTO;
import com.Finds.dev.Entity.*;
import com.Finds.dev.Repositories.*;
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
    ProductImageRepository productImageRepository;

    @Autowired
    ProductVariantRepository productVariantRepository;

    @Autowired
    VariantImageRepository variantImageRepository;

    @Autowired
    VariantSizeRepository variantSizeRepository;

    @Transactional
    public void editProduct(ProductEditDTO productEditDTO, String id) {
        BigDecimal price = productEditDTO.price();
        Product product = productRepository.findById(id)
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
            List<ProductImage> images = productImageRepository.findByProductId(id);
            ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain())
                    .findFirst()
                    .orElse(new ProductImage(product, productEditDTO.imageUrl(), true));

            mainImage.setImageUrl(productEditDTO.imageUrl());
            productImageRepository.save(mainImage);
        }

        // Handle variants update
        if (productEditDTO.variants() != null) {
            // Delete existing variants
            List<ProductVariant> existingVariants = productVariantRepository.findByProductId(id);
            for (ProductVariant variant : existingVariants) {
                variantImageRepository.deleteAll(variantImageRepository.findByVariantIdOrderByOrderAsc(variant.getId()));
                variantSizeRepository.deleteAll(variantSizeRepository.findByVariantId(variant.getId()));
            }
            productVariantRepository.deleteAll(existingVariants);

            // Create new variants
            for (ProductVariantDTO variantDTO : productEditDTO.variants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setColor(variantDTO.color());
                variant.setColorHex(variantDTO.colorHex());
                ProductVariant savedVariant = productVariantRepository.save(variant);

                // Save variant images
                if (variantDTO.images() != null) {
                    for (VariantImageDTO imageDTO : variantDTO.images()) {
                        VariantImage variantImage = new VariantImage();
                        variantImage.setVariant(savedVariant);
                        variantImage.setUrl(imageDTO.url());
                        variantImage.setOrder(imageDTO.order() != null ? imageDTO.order() : 0);
                        variantImageRepository.save(variantImage);
                    }
                }

                // Save variant sizes
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
