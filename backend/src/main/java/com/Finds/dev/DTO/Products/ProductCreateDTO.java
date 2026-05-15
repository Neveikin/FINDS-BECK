package com.Finds.dev.DTO.Products;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductCreateDTO(
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    String name,
    
    String description,
    
    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal price,
    
    String imageUrl,
    
    String categoryName,
    
    Integer stock,
    
    String material
) {}
