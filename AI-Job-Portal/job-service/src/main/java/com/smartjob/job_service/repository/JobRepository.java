package com.smartjob.job_service.repository;

import com.smartjob.job_service.entity.Job;
import com.smartjob.job_service.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository
        extends JpaRepository<Job, Long> {

    List<Job> findByEmployerId(Long employerId);

    List<Job> findByStatus(JobStatus status);

    List<Job> findByTitleContainingIgnoreCase(
            String title
    );

    List<Job> findByLocationContainingIgnoreCase(
            String location
    );
}