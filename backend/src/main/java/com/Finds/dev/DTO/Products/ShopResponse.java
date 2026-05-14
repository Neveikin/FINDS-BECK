package com.Finds.dev.DTO.Products;

public record ShopResponse(
        String id,
        String name,
        String logoUrl,
        boolean isFavorite
) {
}
