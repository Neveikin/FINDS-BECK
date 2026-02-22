package com.Finds.dev.DTO.Auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenDto(
        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {}
