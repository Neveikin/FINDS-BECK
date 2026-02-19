package com.Finds.dev.DTO.Lk;

public class EmailUpdateRequest {
    private String newEmail;
    
    public EmailUpdateRequest() {}
    
    public EmailUpdateRequest(String newEmail) {
        this.newEmail = newEmail;
    }
    
    public String getNewEmail() {
        return newEmail;
    }
    
    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }
}
