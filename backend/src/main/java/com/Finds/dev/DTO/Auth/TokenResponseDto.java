package com.Finds.dev.DTO.Auth;

public class TokenResponseDto {
    private String accesToken;
    private String refershToken;
    private UserProfileDto user;

    public TokenResponseDto(String accesToken, String refershToken, UserProfileDto user) {
        this.accesToken = accesToken;
        this.refershToken = refershToken;
        this.user = user;
    }

    public String getAccesToken() {
        return accesToken;
    }

    public void setAccesToken(String accesToken) {
        this.accesToken = accesToken;
    }

    public String getRefershToken() {
        return refershToken;
    }

    public void setRefershToken(String refershToken) {
        this.refershToken = refershToken;
    }

    public UserProfileDto getUser() {
        return user;
    }

    public void setUser(UserProfileDto user) {
        this.user = user;
    }
}
