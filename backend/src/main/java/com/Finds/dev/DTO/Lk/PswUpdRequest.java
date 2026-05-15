package com.Finds.dev.DTO.Lk;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PswUpdRequest(
        @NotBlank(message = "User ID cannot be empty")
        String userId,
        
        @NotBlank(message = "Old password cannot be empty")
        String oldPsw,
        
        @NotBlank(message = "New password cannot be empty")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String newPsw,
        
        @NotBlank(message = "Token cannot be empty")
        String token,
        
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        String email
) {}
