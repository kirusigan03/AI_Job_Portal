package com.smartjob.auth_service.service;

import com.smartjob.auth_service.dto.LoginRequest;
import com.smartjob.auth_service.dto.LoginResponse;
import com.smartjob.auth_service.dto.RegisterRequest;
import com.smartjob.auth_service.entity.Role;
import com.smartjob.auth_service.entity.User;
import com.smartjob.auth_service.exception.BadRequestException;
import com.smartjob.auth_service.repository.UserRepository;
import com.smartjob.auth_service.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        service = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void registersJobSeekerWithTrimmedUsernameAndEncodedPassword() {
        RegisterRequest request = registration("  sam  ", "sam@example.com", "secret", "job_seeker");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("sam")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        assertEquals("User registered successfully", service.register(request));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("sam", captor.getValue().getUsername());
        assertEquals("sam@example.com", captor.getValue().getEmail());
        assertEquals("encoded-secret", captor.getValue().getPassword());
        assertEquals(Role.JOB_SEEKER, captor.getValue().getRole());
    }

    @Test
    void doesNotRegisterAnAlreadyUsedEmail() {
        RegisterRequest request = registration("sam", "sam@example.com", "secret", "EMPLOYER");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertEquals("Email already registered", service.register(request));

        verify(userRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void rejectsCaseInsensitiveDuplicateUsername() {
        RegisterRequest request = registration("Sam", "new@example.com", "secret", "EMPLOYER");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("Sam")).thenReturn(true);

        BadRequestException error = assertThrows(BadRequestException.class, () -> service.register(request));

        assertEquals("Username already taken", error.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsPublicAdminRegistration() {
        RegisterRequest request = registration("root", "root@example.com", "secret", "ADMIN");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("root")).thenReturn(false);

        BadRequestException error = assertThrows(BadRequestException.class, () -> service.register(request));

        assertEquals("ADMIN registration is not allowed", error.getMessage());
        verify(userRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void rejectsUnknownRegistrationRole() {
        RegisterRequest request = registration("sam", "sam@example.com", "secret", "VISITOR");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("sam")).thenReturn(false);

        BadRequestException error = assertThrows(BadRequestException.class, () -> service.register(request));

        assertEquals("Invalid role. Use JOB_SEEKER or EMPLOYER", error.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void logsInWithValidCredentialsAndReturnsUsername() {
        LoginRequest request = login("sam@example.com", "secret");
        User user = new User("sam", "sam@example.com", "encoded-secret", Role.EMPLOYER);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded-secret")).thenReturn(true);
        when(jwtService.generateToken(null, "sam@example.com", "EMPLOYER")).thenReturn("jwt");

        LoginResponse response = service.login(request);

        assertEquals("jwt", response.getToken());
        assertEquals("sam@example.com", response.getEmail());
        assertEquals("sam", response.getUsername());
        assertEquals("EMPLOYER", response.getRole());
    }

    @Test
    void rejectsUnknownEmailAndWrongPassword() {
        LoginRequest request = login("missing@example.com", "secret");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        BadRequestException missing = assertThrows(BadRequestException.class, () -> service.login(request));
        assertEquals("Invalid email or password", missing.getMessage());

        User user = new User("missing", request.getEmail(), "encoded", Role.JOB_SEEKER);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(false);

        BadRequestException wrongPassword = assertThrows(BadRequestException.class, () -> service.login(request));
        assertEquals("Invalid email or password", wrongPassword.getMessage());
        verifyNoInteractions(jwtService);
    }

    @Test
    void fallsBackToEmailLocalPartForLegacyAccountsWithoutUsername() {
        LoginRequest request = login("old.user@example.com", "secret");
        User user = new User(null, request.getEmail(), "encoded", Role.ADMIN);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtService.generateToken(null, request.getEmail(), "ADMIN")).thenReturn("jwt");

        assertEquals("old.user", service.login(request).getUsername());
    }

    private RegisterRequest registration(String username, String email, String password, String role) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(password);
        request.setRole(role);
        return request;
    }

    private LoginRequest login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }
}
