package com.smartjob.job_service.controller;

import com.smartjob.job_service.dto.CreateJobRequest;
import com.smartjob.job_service.entity.Job;
import com.smartjob.job_service.entity.JobStatus;
import com.smartjob.job_service.exception.BadRequestException;
import com.smartjob.job_service.security.UserPrincipal;
import com.smartjob.job_service.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        if (!"EMPLOYER".equals(principal.getRole())) {

            throw new BadRequestException(
                    "Only employers can create jobs"
            );
        }

        return ResponseEntity.ok(
                jobService.createJob(
                        principal.getUserId(),
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobService.getJob(id)
        );
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Job>> getEmployerJobs(
            @PathVariable Long employerId
    ) {

        return ResponseEntity.ok(
                jobService.getEmployerJobs(
                        employerId
                )
        );
    }

    @GetMapping("/search/title")
    public ResponseEntity<List<Job>> searchByTitle(
            @RequestParam String title
    ) {

        return ResponseEntity.ok(
                jobService.searchByTitle(title)
        );
    }

    @GetMapping("/search/location")
    public ResponseEntity<List<Job>> searchByLocation(
            @RequestParam String location
    ) {

        return ResponseEntity.ok(
                jobService.searchByLocation(location)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Job> updateStatus(
            @PathVariable Long id,
            @RequestParam JobStatus status,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        Long ownerId = "ADMIN".equals(principal.getRole())
                ? jobService.getJob(id).getEmployerId()
                : principal.getUserId();

        return ResponseEntity.ok(
                jobService.updateStatus(
                        id,
                        status,
                        ownerId
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        Long ownerId = "ADMIN".equals(principal.getRole())
                ? jobService.getJob(id).getEmployerId()
                : principal.getUserId();

        jobService.deleteJob(id, ownerId);

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }
}