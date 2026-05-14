package com.Finds.dev.DTO.Auth;

import jakarta.validation.constraints.NotBlank;

public record EmailConfirmDTO(
        @NotBlank(message = "Email is required")
        String email,
        
        @NotBlank(message = "Code is required")
        String code
) {}
