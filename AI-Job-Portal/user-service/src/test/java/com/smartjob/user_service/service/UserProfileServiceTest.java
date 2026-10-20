package com.smartjob.user_service.service;

import com.smartjob.user_service.exception.GlobalExceptionHandler;
import com.smartjob.user_service.exception.DuplicateProfileException;
import com.smartjob.user_service.exception.ResourceNotFoundException;
import com.smartjob.user_service.dto.CreateProfileRequest;
import com.smartjob.user_service.dto.UpdateProfileRequest;
import com.smartjob.user_service.entity.UserProfile;
import com.smartjob.user_service.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;

class UserProfileServiceTest {

    @Test
    void createsProfileAndCopiesOptionalFields() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        when(repository.existsByUserId(42L)).thenReturn(false);
        when(repository.save(org.mockito.ArgumentMatchers.any(UserProfile.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        UserProfileService service = new UserProfileService(repository);
        CreateProfileRequest request = new CreateProfileRequest();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setLocation("Colombo");
        request.setBio("Engineer");

        UserProfile profile = service.createProfile(42L, "ada@example.com", request);

        assertEquals(42L, profile.getUserId());
        assertEquals("ada@example.com", profile.getEmail());
        assertEquals("Ada", profile.getFirstName());
        assertEquals("Lovelace", profile.getLastName());
        assertEquals("Colombo", profile.getLocation());
        assertEquals("Engineer", profile.getBio());
        verify(repository).save(profile);
    }

    @Test
    void duplicateProfileIsRejectedWithoutSaving() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        when(repository.existsByUserId(42L)).thenReturn(true);
        UserProfileService service = new UserProfileService(repository);
        CreateProfileRequest request = new CreateProfileRequest();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");

        assertThrows(DuplicateProfileException.class,
                () -> service.createProfile(42L, "ada@example.com", request));
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void updateChangesOnlyFieldsProvidedByRequest() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        UserProfile existing = new UserProfile(42L, "ada@example.com", "Ada", "Lovelace");
        existing.setLocation("Colombo");
        when(repository.findByUserId(42L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);
        UserProfileService service = new UserProfileService(repository);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Augusta");

        UserProfile updated = service.updateProfile(42L, request);

        assertEquals("Augusta", updated.getFirstName());
        assertEquals("Lovelace", updated.getLastName());
        assertEquals("Colombo", updated.getLocation());
        verify(repository).save(existing);
    }

    @Test
    void listsProfilesFromRepository() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        List<UserProfile> profiles = List.of(new UserProfile(42L, "ada@example.com", "Ada", "Lovelace"));
        when(repository.findAll()).thenReturn(profiles);

        assertEquals(profiles, new UserProfileService(repository).getAllProfiles());
    }

    @Test
    void deletesExistingProfileAndDoesNotDeleteWhenMissing() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        UserProfile profile = new UserProfile(42L, "ada@example.com", "Ada", "Lovelace");
        when(repository.findByUserId(42L)).thenReturn(Optional.of(profile));
        when(repository.findByUserId(43L)).thenReturn(Optional.empty());
        UserProfileService service = new UserProfileService(repository);

        service.deleteProfile(42L);

        assertThrows(ResourceNotFoundException.class, () -> service.deleteProfile(43L));
        verify(repository, times(1)).delete(profile);
    }

    @Test
    void missingProfileReturnsNotFound() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        when(repository.findByUserId(42L)).thenReturn(Optional.empty());
        UserProfileService service = new UserProfileService(repository);

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class, () -> service.getProfile(42L));
        var response = new GlobalExceptionHandler().handleNotFound(exception);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Profile not found", response.getBody().get("message"));
    }
}
