package com.smartjob.ai_service.controller;

import com.smartjob.ai_service.entity.ResumeAnalysis;
import com.smartjob.ai_service.exception.ResourceNotFoundException;
import com.smartjob.ai_service.exception.UnauthorizedException;
import com.smartjob.ai_service.repository.ResumeAnalysisRepository;
import com.smartjob.ai_service.security.UserPrincipal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ResumeAnalysisRepository analysisRepository;

    public AiController(ResumeAnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
    }

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<ResumeAnalysis> getEvaluationForApplication(
            @PathVariable Long applicationId,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        ResumeAnalysis analysis = analysisRepository
                .findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        assertCanView(analysis, principal);

        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ResumeAnalysis> getResumeAnalysis(
            @PathVariable Long resumeId,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        ResumeAnalysis analysis = analysisRepository
                .findFirstByResumeIdOrderByCreatedAtDesc(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));

        assertCanView(analysis, principal);

        return ResponseEntity.ok(analysis);
    }

    // AI scoring is decision-support only -- the candidate can see their
    // own result, and an EMPLOYER/ADMIN can see it as part of reviewing
    // that candidate. It never decides hiring on its own.
    private void assertCanView(ResumeAnalysis analysis, UserPrincipal principal) {

        boolean isCandidate = analysis.getCandidateId().equals(principal.getUserId());
        boolean isReviewer = "EMPLOYER".equals(principal.getRole())
                || "ADMIN".equals(principal.getRole());

        if (!isCandidate && !isReviewer) {
            throw new UnauthorizedException("Access denied");
        }
    }
}
