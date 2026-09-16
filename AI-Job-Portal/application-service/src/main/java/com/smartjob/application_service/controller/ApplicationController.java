package com.smartjob.application_service.controller;

import com.smartjob.application_service.dto.ApplicationStatusUpdateRequest;
import com.smartjob.application_service.dto.CreateApplicationRequest;
import com.smartjob.application_service.entity.JobApplication;
import com.smartjob.application_service.exception.BadRequestException;
import com.smartjob.application_service.security.UserPrincipal;
import com.smartjob.application_service.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService =
                applicationService;
    }

    @PostMapping
    public ResponseEntity<JobApplication> apply(
            @Valid @RequestBody
            CreateApplicationRequest request,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        if (!"JOB_SEEKER".equals(principal.getRole())) {

            throw new BadRequestException(
                    "Only job seekers can apply for jobs"
            );
        }

        return ResponseEntity.ok(
                applicationService.apply(
                        principal.getUserId(),
                        request
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplication(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                applicationService.getApplication(id)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobApplication>>
    getMyApplications(
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        return ResponseEntity.ok(
                applicationService
                        .getCandidateApplications(
                                principal.getUserId()
                        )
        );
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplication>>
    getCandidateApplications(
            @PathVariable Long candidateId,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        if (!"EMPLOYER".equals(principal.getRole())
                && !"ADMIN".equals(principal.getRole())) {

            throw new BadRequestException(
                    "Only employers or admins can view another candidate's applications"
            );
        }

        return ResponseEntity.ok(
                applicationService
                        .getCandidateApplications(
                                candidateId
                        )
        );
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>>
    getJobApplications(
            @PathVariable Long jobId
    ) {

        return ResponseEntity.ok(
                applicationService
                        .getJobApplications(jobId)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication>
    updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody
            ApplicationStatusUpdateRequest request,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        if (!"EMPLOYER".equals(principal.getRole())
                && !"ADMIN".equals(principal.getRole())) {

            throw new BadRequestException(
                    "Only employers or admins can update application status"
            );
        }

        return ResponseEntity.ok(
                applicationService.updateStatus(
                        id,
                        request.getStatus()
                )
        );
    }
}