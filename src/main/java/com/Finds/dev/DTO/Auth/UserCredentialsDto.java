package com.Finds.dev.DTO.Auth;

public class UserCredentialsDto {
    private String email;
    private String password;

    public UserCredentialsDto(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public UserCredentialsDto() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

