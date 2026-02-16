package com.Finds.dev.Services;

import com.Finds.dev.DTO.Products.ProductEditDTO;
import com.Finds.dev.Repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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
}
