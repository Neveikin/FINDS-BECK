package com.Finds.dev.DTO.Products;

import com.Finds.dev.Entity.Product;
import com.Finds.dev.Entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

public record RewiewDTO(
        Integer overall,
        String text
) {
}
