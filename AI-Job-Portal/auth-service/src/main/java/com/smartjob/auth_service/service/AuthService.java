package com.smartjob.auth_service.service;

import com.smartjob.auth_service.dto.LoginRequest;
import com.smartjob.auth_service.dto.LoginResponse;
import com.smartjob.auth_service.dto.RegisterRequest;
import com.smartjob.auth_service.entity.Role;
import com.smartjob.auth_service.entity.User;
import com.smartjob.auth_service.repository.UserRepository;
import com.smartjob.auth_service.exception.BadRequestException;
import com.smartjob.auth_service.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already registered";
        }

        Role role;

        try {

            role = Role.valueOf(
                    request.getRole().toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new BadRequestException(
                    "Invalid role. Use JOB_SEEKER or EMPLOYER"
            );
        }

        if (role == Role.ADMIN) {

            throw new BadRequestException(
                    "ADMIN registration is not allowed"
            );
        }

        String encryptedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getEmail(),
                encryptedPassword,
                role
        );

        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadRequestException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}