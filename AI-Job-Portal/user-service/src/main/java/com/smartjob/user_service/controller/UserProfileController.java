package com.smartjob.user_service.controller;

import com.smartjob.user_service.dto.CreateProfileRequest;
import com.smartjob.user_service.dto.UpdateProfileRequest;
import com.smartjob.user_service.entity.UserProfile;
import com.smartjob.user_service.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(
            UserProfileService userProfileService
    ) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/{userId}/profile")
    public ResponseEntity<UserProfile> createProfile(
            @PathVariable Long userId,
            @RequestParam String email,
            @Valid @RequestBody CreateProfileRequest request
    ) {

        return ResponseEntity.ok(
                userProfileService.createProfile(
                        userId,
                        email,
                        request
                )
        );
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfile> getProfile(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                userProfileService.getProfile(userId)
        );
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserProfile> updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request
    ) {

        return ResponseEntity.ok(
                userProfileService.updateProfile(
                        userId,
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<UserProfile>> getAllProfiles() {

        return ResponseEntity.ok(
                userProfileService.getAllProfiles()
        );
    }

    @DeleteMapping("/{userId}/profile")
    public ResponseEntity<String> deleteProfile(
            @PathVariable Long userId
    ) {

        userProfileService.deleteProfile(userId);

        return ResponseEntity.ok(
                "Profile deleted successfully"
        );
    }
}