package com.Finds.dev.DTO.Cart;

public record CartLineRequest(String productId, String size, String color) {
    public CartLineRequest {
        productId = productId == null ? "" : productId.trim();
        size = size == null ? "" : size.trim();
        color = color == null ? "" : color.trim();
    }
}
