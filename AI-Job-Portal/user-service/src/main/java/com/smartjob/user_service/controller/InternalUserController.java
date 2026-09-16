package com.smartjob.user_service.controller;

import com.smartjob.user_service.exception.ResourceNotFoundException;
import com.smartjob.user_service.exception.UnauthorizedException;
import com.smartjob.user_service.repository.UserProfileRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service endpoint used by notification-service to resolve a
 * candidateId into an email address when sending notification emails.
 * Guarded by the shared internal service key, not a user JWT.
 */
@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserProfileRepository repository;

    @Value("${internal.service-key}")
    private String serviceKey;

    public InternalUserController(UserProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{userId}")
    public UserEmailResponse getUser(
            @PathVariable Long userId,
            @RequestHeader("X-Internal-Service-Key") String providedKey
    ) {

        if (!serviceKey.equals(providedKey)) {
            throw new UnauthorizedException("Invalid internal service key");
        }

        return repository.findByUserId(userId)
                .map(profile -> new UserEmailResponse(profile.getUserId(), profile.getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
    }

    // A small, purpose-built response instead of exposing the full
    // UserProfile (bio, links, etc.) to other services.
    public record UserEmailResponse(Long userId, String email) {
    }
}
