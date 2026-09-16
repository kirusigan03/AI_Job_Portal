package com.smartjob.ai_service.repository;

import com.smartjob.ai_service.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    Optional<ResumeAnalysis> findByApplicationId(Long applicationId);

    Optional<ResumeAnalysis> findFirstByResumeIdOrderByCreatedAtDesc(Long resumeId);
}
