package com.Finds.dev.DTO.Review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RewievUpdDTO(
        @NotBlank(message = "Review ID cannot be empty")
        String reviewId,
        
        @NotNull(message = "Rating cannot be null")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer overall,
        
        String text
) {}
