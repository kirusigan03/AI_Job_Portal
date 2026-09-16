package com.smartjob.user_service.dto;

public class UserEmailResponse {

    private Long userId;
    private String email;
    private String firstName;

    public UserEmailResponse() {
    }

    public UserEmailResponse(Long userId, String email, String firstName) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
}
