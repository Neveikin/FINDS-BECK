package com.Finds.dev.DTO.Products;

import com.Finds.dev.Entity.Product;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductEditDTO(
        @NotBlank(message = "Name cannot be blank")
        @Size(max = 200, message = "Name must not exceed 200 characters")
        String name,
        
        String description,
        
        @NotNull(message = "Price cannot be null")
        BigDecimal price,
        
        @NotNull(message = "Stock cannot be null")
        Integer stock,
        
        String material,
        
        List<Product.ProductSize> availableSizes,

        @NotNull(message = "Active status cannot be null")
        Boolean isActive
) {}
