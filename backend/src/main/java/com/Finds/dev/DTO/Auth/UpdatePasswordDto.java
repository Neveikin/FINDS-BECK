package com.Finds.dev.DTO.Auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePasswordDto(
        @NotBlank(message = "Current password cannot be empty")
        String currentPassword,

        @NotBlank(message = "New password cannot be empty")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String newPassword
) {}
