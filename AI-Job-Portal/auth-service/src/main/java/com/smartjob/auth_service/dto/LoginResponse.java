package com.smartjob.auth_service.dto;

public class LoginResponse {

    private String token;
    private Long userId;
    private String email;
    private String username;
    private String role;

    public LoginResponse(String token, Long userId, String email, String username, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
