package com.Finds.dev.DTO.Products;

import com.Finds.dev.Entity.Product;
import com.Finds.dev.Entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RewiewDTO(
        @NotNull(message = "Rating cannot be null")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer overall,
        
        String text
) {}
