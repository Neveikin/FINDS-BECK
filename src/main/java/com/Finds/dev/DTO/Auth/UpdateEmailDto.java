package com.Finds.dev.DTO.Auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateEmailDto(
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        String email
) {}
