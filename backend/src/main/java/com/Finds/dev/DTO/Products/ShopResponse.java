package com.Finds.dev.DTO.Products;

import java.util.List;

public record ShopResponse(
        String id,
        String name,
        String logoUrl,
        boolean isFavorite,
        List<String> ownerEmails
) {
}
