package com.Finds.dev.DTO.Lk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NameUpdRequest(
        @NotBlank(message = "User ID cannot be empty")
        String userId,
        
        @NotBlank(message = "New name cannot be empty")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String newName,
        
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        String email,
        
        @NotBlank(message = "Token cannot be empty")
        String token
) {}
