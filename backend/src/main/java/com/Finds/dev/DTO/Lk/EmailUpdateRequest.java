package com.Finds.dev.DTO.Lk;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailUpdateRequest(
        @NotBlank(message = "New email cannot be empty")
        @Email(message = "Invalid email format")
        String newEmail
) {}
