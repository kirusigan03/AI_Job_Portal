package com.smartjob.notification_service.service;

import com.smartjob.notification_service.client.UserClient;
import com.smartjob.notification_service.dto.UserEmailResponse;
import com.smartjob.notification_service.entity.Notification;
import com.smartjob.notification_service.event.ApplicationStatusChangedEvent;
import com.smartjob.notification_service.event.ApplicationSubmittedEvent;
import com.smartjob.notification_service.event.CandidateEvaluatedEvent;
import com.smartjob.notification_service.exception.ResourceNotFoundException;
import com.smartjob.notification_service.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private UserClient userClient;
    private EmailService emailService;
    private NotificationService service;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        userClient = mock(UserClient.class);
        emailService = mock(EmailService.class);
        service = new NotificationService(notificationRepository, userClient, emailService);
    }

    @Test
    void applicationSubmittedCreatesUnreadNotification() {
        ApplicationSubmittedEvent event = new ApplicationSubmittedEvent();
        event.setApplicationId(40L);
        event.setCandidateId(7L);

        service.handleApplicationSubmitted(event);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals(7L, captor.getValue().getUserId());
        assertEquals("Application Submitted", captor.getValue().getTitle());
        assertEquals("Your application has been submitted successfully.", captor.getValue().getMessage());
        assertFalse(captor.getValue().isRead());
        verifyNoInteractions(userClient, emailService);
    }

    @Test
    void statusChangeCreatesNotificationAndEmailsCandidate() {
        ApplicationStatusChangedEvent event = new ApplicationStatusChangedEvent();
        event.setApplicationId(40L);
        event.setCandidateId(7L);
        event.setNewStatus("SHORTLISTED");
        UserEmailResponse user = new UserEmailResponse();
        user.setEmail("candidate@example.com");
        when(userClient.getUser(7L)).thenReturn(user);

        service.handleApplicationStatusChanged(event);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals("Application Status Updated", captor.getValue().getTitle());
        assertTrue(captor.getValue().getMessage().contains("SHORTLISTED"));
        verify(emailService).sendEmail(eq("candidate@example.com"), eq("Application Status Updated"),
                contains("Application ID: 40"));
    }

    @Test
    void candidateEmailLookupFailureDoesNotDropInAppNotification() {
        CandidateEvaluatedEvent event = new CandidateEvaluatedEvent();
        event.setCandidateId(7L);
        event.setApplicationId(40L);
        event.setMatchScore(86);
        event.setRecommendation("GOOD_MATCH");
        when(userClient.getUser(7L)).thenThrow(new IllegalStateException("user service unavailable"));

        assertDoesNotThrow(() -> service.handleCandidateEvaluated(event));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertTrue(captor.getValue().getMessage().contains("86%"));
        assertTrue(captor.getValue().getMessage().contains("GOOD_MATCH"));
        verifyNoInteractions(emailService);
    }

    @Test
    void markAsReadPersistsTheUpdatedNotificationAndMissingIdIsNotFound() {
        Notification notification = new Notification(7L, "Title", "Message");
        when(notificationRepository.findById(3L)).thenReturn(Optional.of(notification));
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        service.markAsRead(3L);

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
        assertEquals("Notification not found", assertThrows(ResourceNotFoundException.class,
                () -> service.markAsRead(99L)).getMessage());
    }
}
