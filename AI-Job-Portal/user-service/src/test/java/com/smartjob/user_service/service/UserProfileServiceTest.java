package com.smartjob.user_service.service;

import com.smartjob.user_service.exception.GlobalExceptionHandler;
import com.smartjob.user_service.exception.ResourceNotFoundException;
import com.smartjob.user_service.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserProfileServiceTest {
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
