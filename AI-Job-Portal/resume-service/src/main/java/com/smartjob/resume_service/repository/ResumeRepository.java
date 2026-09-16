package com.smartjob.resume_service.repository;

import com.smartjob.resume_service.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {

    List<Resume> findByCandidateId(
            Long candidateId
    );

    List<Resume> findByCandidateIdAndPrimaryResumeTrue(
            Long candidateId
    );
}