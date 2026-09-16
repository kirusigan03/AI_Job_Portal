package com.smartjob.user_service.service;

import com.smartjob.user_service.dto.CreateProfileRequest;
import com.smartjob.user_service.dto.UpdateProfileRequest;
import com.smartjob.user_service.entity.UserProfile;
import com.smartjob.user_service.exception.DuplicateProfileException;
import com.smartjob.user_service.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(
            UserProfileRepository userProfileRepository
    ) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile createProfile(
            Long userId,
            String email,
            CreateProfileRequest request
    ) {

        if (userProfileRepository.existsByUserId(userId)) {
                        throw new DuplicateProfileException(
                    "Profile already exists"
            );
        }

        UserProfile profile = new UserProfile(
                userId,
                email,
                request.getFirstName(),
                request.getLastName()
        );

        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setBio(request.getBio());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setProfileImageUrl(
                request.getProfileImageUrl()
        );

        return userProfileRepository.save(profile);
    }

    public UserProfile getProfile(Long userId) {

        return userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Profile not found"
                        )
                );
    }

    public UserProfile updateProfile(
            Long userId,
            UpdateProfileRequest request
    ) {

        UserProfile profile = getProfile(userId);

        if (request.getFirstName() != null) {
            profile.setFirstName(
                    request.getFirstName()
            );
        }

        if (request.getLastName() != null) {
            profile.setLastName(
                    request.getLastName()
            );
        }

        if (request.getPhone() != null) {
            profile.setPhone(
                    request.getPhone()
            );
        }

        if (request.getLocation() != null) {
            profile.setLocation(
                    request.getLocation()
            );
        }

        if (request.getBio() != null) {
            profile.setBio(
                    request.getBio()
            );
        }

        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(
                    request.getGithubUrl()
            );
        }

        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(
                    request.getLinkedinUrl()
            );
        }

        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(
                    request.getProfileImageUrl()
            );
        }

        return userProfileRepository.save(profile);
    }

    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll();
    }

    public void deleteProfile(Long userId) {

        UserProfile profile = getProfile(userId);

        userProfileRepository.delete(profile);
    }
}