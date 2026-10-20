package com.smartjob.job_service.service;

import com.smartjob.job_service.dto.CreateJobRequest;
import com.smartjob.job_service.entity.Job;
import com.smartjob.job_service.entity.JobStatus;
import com.smartjob.job_service.entity.JobType;
import com.smartjob.job_service.exception.ResourceNotFoundException;
import com.smartjob.job_service.exception.UnauthorizedException;
import com.smartjob.job_service.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JobServiceTest {

    private JobRepository jobRepository;
    private JobService service;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        service = new JobService(jobRepository);
    }

    @Test
    void createsAnActiveJobForTheAuthenticatedEmployer() {
        CreateJobRequest request = createJobRequest();
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Job created = service.createJob(17L, request);

        assertEquals(17L, created.getEmployerId());
        assertEquals("Backend Engineer", created.getTitle());
        assertEquals("Build APIs", created.getDescription());
        assertEquals(JobType.FULL_TIME, created.getJobType());
        assertEquals(JobStatus.ACTIVE, created.getStatus());
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void returnsOnlyActiveJobsForPublicListing() {
        List<Job> jobs = List.of(new Job());
        when(jobRepository.findByStatus(JobStatus.ACTIVE)).thenReturn(jobs);

        assertSame(jobs, service.getAllJobs());
        verify(jobRepository).findByStatus(JobStatus.ACTIVE);
    }

    @Test
    void supportsTitleAndLocationSearch() {
        List<Job> titleMatches = List.of(new Job());
        List<Job> locationMatches = List.of(new Job(), new Job());
        when(jobRepository.findByTitleContainingIgnoreCase("engineer")).thenReturn(titleMatches);
        when(jobRepository.findByLocationContainingIgnoreCase("Colombo")).thenReturn(locationMatches);

        assertSame(titleMatches, service.searchByTitle("engineer"));
        assertSame(locationMatches, service.searchByLocation("Colombo"));
    }

    @Test
    void ownerCanCloseTheirJob() {
        Job job = job(17L);
        when(jobRepository.findById(4L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        Job updated = service.updateStatus(4L, JobStatus.CLOSED, 17L);

        assertEquals(JobStatus.CLOSED, updated.getStatus());
        verify(jobRepository).save(job);
    }

    @Test
    void anotherEmployerCannotChangeOrDeleteTheJob() {
        Job job = job(17L);
        when(jobRepository.findById(4L)).thenReturn(Optional.of(job));

        assertThrows(UnauthorizedException.class,
                () -> service.updateStatus(4L, JobStatus.CLOSED, 99L));
        assertThrows(UnauthorizedException.class,
                () -> service.deleteJob(4L, 99L));

        verify(jobRepository, never()).save(any());
        verify(jobRepository, never()).delete(any());
    }

    @Test
    void missingJobRaisesNotFound() {
        when(jobRepository.findById(88L)).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class, () -> service.getJob(88L));

        assertEquals("Job not found", error.getMessage());
    }

    private Job job(Long employerId) {
        Job job = new Job();
        job.setEmployerId(employerId);
        job.setStatus(JobStatus.ACTIVE);
        return job;
    }

    private CreateJobRequest createJobRequest() {
        CreateJobRequest request = new CreateJobRequest();
        request.setTitle("Backend Engineer");
        request.setDescription("Build APIs");
        request.setCompanyName("SmartJob");
        request.setLocation("Colombo");
        request.setSalaryMin(100000.0);
        request.setSalaryMax(150000.0);
        request.setExperienceRequired("2 years");
        request.setJobType(JobType.FULL_TIME);
        return request;
    }
}
