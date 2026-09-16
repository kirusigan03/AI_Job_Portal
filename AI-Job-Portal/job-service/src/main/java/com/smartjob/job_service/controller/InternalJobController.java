package com.smartjob.job_service.controller;

import com.smartjob.job_service.entity.Job;
import com.smartjob.job_service.exception.UnauthorizedException;
import com.smartjob.job_service.service.JobService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service endpoint, not exposed publicly through the gateway.
 * Callers must present the shared internal service key.
 */
@RestController
@RequestMapping("/internal/jobs")
public class InternalJobController {

    private final JobService jobService;

    @Value("${internal.service-key}")
    private String serviceKey;

    public InternalJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/{id}")
    public Job getJob(
            @PathVariable Long id,
            @RequestHeader("X-Internal-Service-Key") String providedKey
    ) {

        if (!serviceKey.equals(providedKey)) {
            throw new UnauthorizedException("Invalid internal service key");
        }

        return jobService.getJob(id);
    }
}
