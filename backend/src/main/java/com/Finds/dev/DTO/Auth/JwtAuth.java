package com.Finds.dev.DTO.Auth;

public class JwtAuth {
    private String accesToken;
    private String refershToken;

    public JwtAuth() {
    }

    public JwtAuth(String accesToken, String refershToken) {
        this.accesToken = accesToken;
        this.refershToken = refershToken;
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
}
