package com.smartjob.job_service.service;

import com.smartjob.job_service.dto.CreateJobRequest;
import com.smartjob.job_service.entity.Job;
import com.smartjob.job_service.entity.JobStatus;
import com.smartjob.job_service.exception.ResourceNotFoundException;
import com.smartjob.job_service.exception.UnauthorizedException;
import com.smartjob.job_service.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job createJob(
            Long employerId,
            CreateJobRequest request
    ) {

        Job job = new Job();

        job.setEmployerId(employerId);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompanyName(request.getCompanyName());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setExperienceRequired(
                request.getExperienceRequired()
        );
        job.setJobType(request.getJobType());
        job.setStatus(JobStatus.ACTIVE);

        return jobRepository.save(job);
    }

    public Job getJob(Long id) {

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"
                        )
                );
    }

    public List<Job> getAllJobs() {

        return jobRepository.findByStatus(
                JobStatus.ACTIVE
        );
    }

    public List<Job> getEmployerJobs(
            Long employerId
    ) {

        return jobRepository.findByEmployerId(
                employerId
        );
    }

    public List<Job> searchByTitle(
            String title
    ) {

        return jobRepository
                .findByTitleContainingIgnoreCase(title);
    }

    public List<Job> searchByLocation(
            String location
    ) {

        return jobRepository
                .findByLocationContainingIgnoreCase(
                        location
                );
    }

    public Job updateStatus(
            Long jobId,
            JobStatus status,
            Long requesterId
    ) {

        Job job = getJob(jobId);

        assertOwner(job, requesterId);

        job.setStatus(status);

        return jobRepository.save(job);
    }

    public void deleteJob(Long jobId, Long requesterId) {

        Job job = getJob(jobId);

        assertOwner(job, requesterId);

        jobRepository.delete(job);
    }

    private void assertOwner(Job job, Long requesterId) {

        if (!job.getEmployerId().equals(requesterId)) {

            throw new UnauthorizedException(
                    "You do not own this job"
            );
        }
    }
}