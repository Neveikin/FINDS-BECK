package com.Finds.dev.DTO.Auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record UserCredentialsDto (

        @Email
        String email,

        @NotNull
        String password
) {}

