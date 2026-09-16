package com.smartjob.notification_service.service;

import com.smartjob.notification_service.client.UserClient;
import com.smartjob.notification_service.dto.UserEmailResponse;
import com.smartjob.notification_service.entity.Notification;
import com.smartjob.notification_service.event.ApplicationStatusChangedEvent;
import com.smartjob.notification_service.event.ApplicationSubmittedEvent;
import com.smartjob.notification_service.event.CandidateEvaluatedEvent;
import com.smartjob.notification_service.exception.ResourceNotFoundException;
import com.smartjob.notification_service.repository.NotificationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserClient userClient;
    private final EmailService emailService;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserClient userClient,
            EmailService emailService
    ) {
        this.notificationRepository = notificationRepository;
        this.userClient = userClient;
        this.emailService = emailService;
    }

    @KafkaListener(topics = "application-submitted", groupId = "notification-service")
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {

        log.info("Application submitted event received: {}", event.getApplicationId());

        Notification notification = new Notification(
                event.getCandidateId(),
                "Application Submitted",
                "Your application has been submitted successfully."
        );

        notificationRepository.save(notification);
    }

    @KafkaListener(
            topics = "application-status-changed",
            groupId = "notification-service",
            containerFactory = "statusChangedKafkaListenerContainerFactory"
    )
    public void handleApplicationStatusChanged(ApplicationStatusChangedEvent event) {

        log.info(
                "Application status changed: {} -> {}",
                event.getApplicationId(),
                event.getNewStatus()
        );

        String message = "Your application status has been updated to " + event.getNewStatus();

        Notification notification = new Notification(
                event.getCandidateId(),
                "Application Status Updated",
                message
        );

        notificationRepository.save(notification);

        String emailBody = """
                Your application status has changed.

                Application ID: %d
                New Status: %s

                Please log in to the Smart Job Portal for more details.
                """.formatted(event.getApplicationId(), event.getNewStatus());

        emailCandidate(
                event.getCandidateId(),
                "Application Status Updated",
                emailBody
        );
    }

    @KafkaListener(
            topics = "candidate-evaluated",
            groupId = "notification-service",
            containerFactory = "candidateEvaluatedKafkaListenerContainerFactory"
    )
    public void handleCandidateEvaluated(CandidateEvaluatedEvent event) {

        log.info(
                "Candidate evaluated: application {} scored {}",
                event.getApplicationId(),
                event.getMatchScore()
        );

        Notification notification = new Notification(
                event.getCandidateId(),
                "AI Resume Evaluation Completed",
                "Your resume received a " + event.getMatchScore()
                        + "% match score. Recommendation: " + event.getRecommendation()
        );

        notificationRepository.save(notification);

        String emailBody = """
                Your application has been evaluated.

                Match Score: %d%%
                Recommendation: %s

                You can log in to the Smart Job Portal to view the complete AI evaluation.
                """.formatted(event.getMatchScore(), event.getRecommendation());

        emailCandidate(
                event.getCandidateId(),
                "AI Resume Evaluation Completed",
                emailBody
        );
    }

    private void emailCandidate(Long candidateId, String subject, String body) {

        try {

            UserEmailResponse user = userClient.getUser(candidateId);
            emailService.sendEmail(user.getEmail(), subject, body);

        } catch (Exception e) {

            // Resolving the candidate's email is a nice-to-have here --
            // the in-app notification above has already been saved, so a
            // lookup/email failure must not fail the whole Kafka listener.
            log.error(
                    "Could not send email to candidate {}: {}",
                    candidateId,
                    e.getMessage()
            );
        }
    }

    public List<Notification> getUserNotifications(Long userId) {

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);

        notificationRepository.save(notification);
    }
}
