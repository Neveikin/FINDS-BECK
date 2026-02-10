package com.Finds.dev.DTO.Lk;

public class PswUpdRequest {
    private String userId;
    private String oldPsw;
    private String newPsw;
    private String token;
    private String email;

    public PswUpdRequest() {
    }

    public PswUpdRequest(String userId, String oldPsw, String newPsw, String token, String email) {
        this.userId = userId;
        this.oldPsw = oldPsw;
        this.newPsw = newPsw;
        this.token = token;
        this.email = email;
    }

    public String getOldPsw() {
        return oldPsw;
    }

    public void setOldPsw(String oldPsw) {
        this.oldPsw = oldPsw;
    }

    public String getNewPsw() {
        return newPsw;
    }

    public void setNewPsw(String newPsw) {
        this.newPsw = newPsw;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
