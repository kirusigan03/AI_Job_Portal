package com.smartjob.application_service.client;

import com.smartjob.application_service.dto.JobResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "job-service")
public interface JobClient {

    @GetMapping("/api/jobs/{id}")
    JobResponse getJob(
            @PathVariable("id") Long id
    );
}
