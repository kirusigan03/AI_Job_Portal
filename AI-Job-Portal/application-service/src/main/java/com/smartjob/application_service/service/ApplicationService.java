package com.smartjob.application_service.service;

import com.smartjob.application_service.client.JobClient;
import com.smartjob.application_service.dto.CreateApplicationRequest;
import com.smartjob.application_service.dto.JobResponse;
import com.smartjob.application_service.entity.ApplicationStatus;
import com.smartjob.application_service.entity.JobApplication;
import com.smartjob.application_service.event.ApplicationStatusChangedEvent;
import com.smartjob.application_service.event.ApplicationSubmittedEvent;
import com.smartjob.application_service.exception.BadRequestException;
import com.smartjob.application_service.exception.DuplicateApplicationException;
import com.smartjob.application_service.exception.ResourceNotFoundException;
import com.smartjob.application_service.repository.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private static final Logger log =
            LoggerFactory.getLogger(ApplicationService.class);

    private static final String
            APPLICATION_SUBMITTED_TOPIC =
            "application-submitted";

    private static final String
            APPLICATION_STATUS_CHANGED_TOPIC =
            "application-status-changed";

    private final JobApplicationRepository
            applicationRepository;

    private final KafkaTemplate<String, Object>
            kafkaTemplate;

    private final JobClient jobClient;

    public ApplicationService(
            JobApplicationRepository applicationRepository,
            KafkaTemplate<String, Object> kafkaTemplate,
            JobClient jobClient
    ) {
        this.applicationRepository =
                applicationRepository;

        this.kafkaTemplate =
                kafkaTemplate;

        this.jobClient = jobClient;
    }

    public JobApplication apply(
            Long candidateId,
            CreateApplicationRequest request
    ) {

        JobResponse job;

        try {

            job = jobClient.getJob(
                    request.getJobId()
            );

        } catch (Exception ex) {

            throw new BadRequestException(
                    "Unable to verify job. Job service may be unavailable."
            );
        }

        if (job == null) {

            throw new ResourceNotFoundException(
                    "Job not found"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(job.getStatus())) {

            throw new BadRequestException(
                    "This job is not accepting applications"
            );
        }

        if (applicationRepository
                .findByJobIdAndCandidateId(
                        request.getJobId(),
                        candidateId
                )
                .isPresent()) {

            throw new DuplicateApplicationException(
                    "You have already applied for this job"
            );
        }

        JobApplication application =
                new JobApplication();

        application.setJobId(
                request.getJobId()
        );

        application.setCandidateId(
                candidateId
        );

        application.setResumeId(
                request.getResumeId()
        );

        application.setStatus(
                ApplicationStatus.APPLIED
        );

        JobApplication saved =
                applicationRepository.save(
                        application
                );

        ApplicationSubmittedEvent event =
                new ApplicationSubmittedEvent(
                        saved.getId(),
                        saved.getJobId(),
                        saved.getCandidateId(),
                        saved.getResumeId()
                );

        publishApplicationSubmittedEvent(event);

        return saved;
    }

    private void publishApplicationSubmittedEvent(
            ApplicationSubmittedEvent event
    ) {

        try {

            kafkaTemplate.send(
                    APPLICATION_SUBMITTED_TOPIC,
                    event.getApplicationId().toString(),
                    event
            ).exceptionally(ex -> {

                log.warn(
                        "Failed to publish {} for application {}: {}",
                        APPLICATION_SUBMITTED_TOPIC,
                        event.getApplicationId(),
                        ex.getMessage()
                );

                return null;
            });

        } catch (Exception ex) {

            log.warn(
                    "Could not send {} for application {}: {}",
                    APPLICATION_SUBMITTED_TOPIC,
                    event.getApplicationId(),
                    ex.getMessage()
            );
        }
    }

    private void publishApplicationStatusChangedEvent(
            ApplicationStatusChangedEvent event
    ) {

        try {

            kafkaTemplate.send(
                    APPLICATION_STATUS_CHANGED_TOPIC,
                    event.getApplicationId().toString(),
                    event
            ).exceptionally(ex -> {

                log.warn(
                        "Failed to publish {} for application {}: {}",
                        APPLICATION_STATUS_CHANGED_TOPIC,
                        event.getApplicationId(),
                        ex.getMessage()
                );

                return null;
            });

        } catch (Exception ex) {

            log.warn(
                    "Could not send {} for application {}: {}",
                    APPLICATION_STATUS_CHANGED_TOPIC,
                    event.getApplicationId(),
                    ex.getMessage()
            );
        }
    }

    public JobApplication getApplication(
            Long id
    ) {

        return applicationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found"
                        )
                );
    }

    public List<JobApplication>
    getCandidateApplications(Long candidateId) {

        return applicationRepository
                .findByCandidateId(candidateId);
    }

    public List<JobApplication>
    getJobApplications(Long jobId) {

        return applicationRepository
                .findByJobId(jobId);
    }

    public JobApplication updateStatus(
            Long id,
            ApplicationStatus newStatus
    ) {

        JobApplication application =
                getApplication(id);

        ApplicationStatus oldStatus =
                application.getStatus();

        application.setStatus(newStatus);

        JobApplication saved =
                applicationRepository.save(
                        application
                );

        ApplicationStatusChangedEvent event =
                new ApplicationStatusChangedEvent(
                        saved.getId(),
                        saved.getCandidateId(),
                        saved.getJobId(),
                        oldStatus.name(),
                        newStatus.name()
                );

        publishApplicationStatusChangedEvent(event);

        return saved;
    }
}