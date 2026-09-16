package com.smartjob.resume_service.controller;

import com.smartjob.resume_service.dto.ResumeUploadResponse;
import com.smartjob.resume_service.entity.Resume;
import com.smartjob.resume_service.exception.BadRequestException;
import com.smartjob.resume_service.exception.UnauthorizedException;
import com.smartjob.resume_service.security.UserPrincipal;
import com.smartjob.resume_service.service.ResumeService;

import jakarta.validation.constraints.NotNull;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestPart("file") @NotNull MultipartFile file,
            @RequestParam(defaultValue = "false") boolean primaryResume,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        if (!"JOB_SEEKER".equals(principal.getRole())) {
            throw new BadRequestException("Only job seekers can upload resumes");
        }

        ResumeUploadResponse response = resumeService.uploadResume(
                principal.getUserId(),
                file,
                primaryResume
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Resume>> getMyResumes(Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        return ResponseEntity.ok(
                resumeService.getCandidateResumes(principal.getUserId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(
            @PathVariable Long id,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Resume resume = resumeService.getResumeForViewer(
                id,
                principal.getUserId(),
                principal.getRole()
        );

        return ResponseEntity.ok(resume);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Resume>> getCandidateResumes(
            @PathVariable Long candidateId,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        boolean isSelf = candidateId.equals(principal.getUserId());
        boolean isReviewer = "EMPLOYER".equals(principal.getRole())
                || "ADMIN".equals(principal.getRole());

        if (!isSelf && !isReviewer) {
            throw new UnauthorizedException("You are not allowed to view these resumes");
        }

        return ResponseEntity.ok(resumeService.getCandidateResumes(candidateId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long id,
            Authentication authentication
    ) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        resumeService.deleteResume(id, principal.getUserId());

        return ResponseEntity.ok("Resume deleted successfully");
    }
}
