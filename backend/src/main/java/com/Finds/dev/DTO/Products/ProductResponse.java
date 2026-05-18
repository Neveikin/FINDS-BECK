package com.Finds.dev.DTO.Products;

import com.Finds.dev.Entity.Product;
import java.util.List;

public record ProductResponse(
        String id,
        String name,
        boolean isFavorite,
        String imageUrl,
        java.math.BigDecimal price,
        String material,
        List<Product.ProductSize> availableSizes
) {
}
