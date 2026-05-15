package com.Finds.dev.DTO.Lk;

public class LkGetResponce {
    private String message;
    private String email;
    private String role;
    private String userId;
    
    public LkGetResponce(String message, String tocken) {
        this.message = message;
    }

    public LkGetResponce(String message, String email, String role, String userId) {
        this.message = message;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
