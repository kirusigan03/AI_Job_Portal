package com.smartjob.application_service.repository;

import com.smartjob.application_service.entity.ApplicationStatus;
import com.smartjob.application_service.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByCandidateId(
            Long candidateId
    );

    List<JobApplication> findByJobId(
            Long jobId
    );

    Optional<JobApplication> findByJobIdAndCandidateId(
            Long jobId,
            Long candidateId
    );

    List<JobApplication> findByStatus(
            ApplicationStatus status
    );
}