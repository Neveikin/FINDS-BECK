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

    @Transactional
    public void editProduct(ProductEditDTO productEditDTO, String id) {
        BigDecimal price = productEditDTO.getPrice();
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found");
        }

        if (price.scale() > 2 || price.compareTo(BigDecimal.valueOf(0.01)) < 0) {
            throw new IllegalArgumentException("Incorrect Number Format");
        }
        
        productRepository.updateAllFieldsById(id, productEditDTO.getName(),
                productEditDTO.getDescription(), price, productEditDTO.getStock(), productEditDTO.getActive());
    }

    public List getProducts(String id) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userRole = auth.getAuthorities().iterator().next().getAuthority();

        try {
            if (userRole.equals("ROLE_ADMIN") || userRole.equals("ROLE_SELLER"))
                return productRepository.findAllProductsWithFavoriteAndImage(id);
            else
                return productRepository.findActiveProductsWithFavoriteAndImage(id);
        } catch (Exception e) {
            throw new Exception(e);
        }
    }
}
