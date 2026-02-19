package com.Finds.dev.DTO.Lk;

public class NameUpdRequest {
    private String userId;
    private String newName;
    private String email;
    private String token;

    public NameUpdRequest() {}

    public NameUpdRequest(String userId, String newName, String email, String token) {
        this.userId = userId;
        this.newName = newName;
        this.email = email;
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
