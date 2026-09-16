package com.smartjob.resume_service.controller;

import com.smartjob.resume_service.entity.Resume;
import com.smartjob.resume_service.exception.UnauthorizedException;
import com.smartjob.resume_service.service.ResumeService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service endpoint, not exposed publicly through the gateway.
 * Used by ai-service to fetch a resume's extracted text when Kafka
 * triggers an evaluation (there is no user JWT to carry in that flow).
 */
@RestController
@RequestMapping("/internal/resumes")
public class InternalResumeController {

    private final ResumeService resumeService;

    @Value("${internal.service-key}")
    private String serviceKey;

    public InternalResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping("/{id}")
    public Resume getResume(
            @PathVariable Long id,
            @RequestHeader("X-Internal-Service-Key") String providedKey
    ) {

        if (!serviceKey.equals(providedKey)) {
            throw new UnauthorizedException("Invalid internal service key");
        }

        return resumeService.getResume(id);
    }
}
