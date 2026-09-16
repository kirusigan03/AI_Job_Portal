package com.smartjob.auth_service.controller;

import com.smartjob.auth_service.dto.LoginRequest;
import com.smartjob.auth_service.dto.LoginResponse;
import com.smartjob.auth_service.dto.RegisterRequest;
import com.smartjob.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "You are authenticated!"
        );
    }

    @GetMapping("/admin/test")
    public ResponseEntity<String> adminTest() {

        return ResponseEntity.ok(
                "You are an ADMIN!"
        );
    }
}