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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ApplicationServiceTest {

    private JobApplicationRepository applicationRepository;
    private KafkaTemplate<String, Object> kafkaTemplate;
    private JobClient jobClient;
    private ApplicationService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        applicationRepository = mock(JobApplicationRepository.class);
        kafkaTemplate = mock(KafkaTemplate.class);
        jobClient = mock(JobClient.class);
        service = new ApplicationService(applicationRepository, kafkaTemplate, jobClient);
        when(kafkaTemplate.send(anyString(), anyString(), any()))
                .thenReturn(CompletableFuture.completedFuture(null));
    }

    @Test
    void appliesToActiveJobAndPublishesSubmittedEvent() {
        CreateApplicationRequest request = applicationRequest(8L, 12L);
        when(jobClient.getJob(8L)).thenReturn(job("ACTIVE"));
        when(applicationRepository.findByJobIdAndCandidateId(8L, 31L)).thenReturn(Optional.empty());
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 101L);
            return saved;
        });

        JobApplication saved = service.apply(31L, request);

        assertEquals(8L, saved.getJobId());
        assertEquals(31L, saved.getCandidateId());
        assertEquals(12L, saved.getResumeId());
        assertEquals(ApplicationStatus.APPLIED, saved.getStatus());
        verify(kafkaTemplate).send(eq("application-submitted"), eq("101"), any(ApplicationSubmittedEvent.class));
    }

    @Test
    void rejectsJobThatIsNotAcceptingApplications() {
        when(jobClient.getJob(8L)).thenReturn(job("CLOSED"));

        BadRequestException error = assertThrows(
                BadRequestException.class, () -> service.apply(31L, applicationRequest(8L, null)));

        assertEquals("This job is not accepting applications", error.getMessage());
        verifyNoInteractions(applicationRepository);
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    void rejectsDuplicateApplication() {
        when(jobClient.getJob(8L)).thenReturn(job("active"));
        when(applicationRepository.findByJobIdAndCandidateId(8L, 31L))
                .thenReturn(Optional.of(new JobApplication()));

        assertThrows(DuplicateApplicationException.class,
                () -> service.apply(31L, applicationRequest(8L, null)));

        verify(applicationRepository, never()).save(any());
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    void missingJobRaisesNotFound() {
        when(jobClient.getJob(8L)).thenReturn(null);

        assertEquals("Job not found", assertThrows(ResourceNotFoundException.class,
                () -> service.apply(31L, applicationRequest(8L, null))).getMessage());
        verifyNoInteractions(applicationRepository);
    }

    @Test
    void jobServiceFailureIsReportedAsBadRequest() {
        when(jobClient.getJob(8L)).thenThrow(new IllegalStateException("service down"));

        assertEquals("Unable to verify job. Job service may be unavailable.",
                assertThrows(BadRequestException.class,
                        () -> service.apply(31L, applicationRequest(8L, null))).getMessage());
    }

    @Test
    void updatesApplicationStatusAndPublishesTransition() {
        JobApplication application = application(101L, 8L, 31L, ApplicationStatus.APPLIED);
        when(applicationRepository.findById(101L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(application)).thenReturn(application);

        JobApplication updated = service.updateStatus(101L, ApplicationStatus.SHORTLISTED);

        assertEquals(ApplicationStatus.SHORTLISTED, updated.getStatus());
        verify(kafkaTemplate).send(eq("application-status-changed"), eq("101"),
                org.mockito.ArgumentMatchers.argThat(event -> {
                    ApplicationStatusChangedEvent changed = (ApplicationStatusChangedEvent) event;
                    return "APPLIED".equals(changed.getOldStatus())
                            && "SHORTLISTED".equals(changed.getNewStatus());
                }));
    }

    @Test
    void missingApplicationRaisesNotFound() {
        when(applicationRepository.findById(404L)).thenReturn(Optional.empty());

        assertEquals("Application not found", assertThrows(ResourceNotFoundException.class,
                () -> service.getApplication(404L)).getMessage());
    }

    private CreateApplicationRequest applicationRequest(Long jobId, Long resumeId) {
        CreateApplicationRequest request = new CreateApplicationRequest();
        request.setJobId(jobId);
        request.setResumeId(resumeId);
        return request;
    }

    private JobResponse job(String status) {
        JobResponse response = new JobResponse();
        response.setStatus(status);
        return response;
    }

    private JobApplication application(Long id, Long jobId, Long candidateId, ApplicationStatus status) {
        JobApplication application = new JobApplication();
        ReflectionTestUtils.setField(application, "id", id);
        application.setJobId(jobId);
        application.setCandidateId(candidateId);
        application.setStatus(status);
        return application;
    }
}
