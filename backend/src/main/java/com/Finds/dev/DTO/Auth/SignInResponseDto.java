package com.Finds.dev.DTO.Auth;

public record SignInResponseDto(
    String token,
    String refreshToken,
    UserData user
) {
    public record UserData(
        String id,
        String email,
        String name,
        String role
    ) {}
}
