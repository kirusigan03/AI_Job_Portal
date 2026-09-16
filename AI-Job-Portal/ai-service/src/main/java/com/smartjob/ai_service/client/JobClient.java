package com.smartjob.ai_service.client;

import com.smartjob.ai_service.config.InternalServiceFeignConfig;
import com.smartjob.ai_service.dto.JobInternalResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "job-service", configuration = InternalServiceFeignConfig.class)
public interface JobClient {

    @GetMapping("/internal/jobs/{id}")
    JobInternalResponse getJob(@PathVariable("id") Long id);
}
