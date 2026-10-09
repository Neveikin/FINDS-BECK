package com.Finds.dev.DTO.Products;

import java.util.List;

public record ProductVariantDTO(
    String id,
    String color,
    String colorHex,
    List<VariantImageDTO> images,
    List<VariantSizeDTO> sizes
) {}
