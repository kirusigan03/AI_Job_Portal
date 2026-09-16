package com.smartjob.ai_service.client;

import com.smartjob.ai_service.config.InternalServiceFeignConfig;
import com.smartjob.ai_service.dto.ResumeInternalResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "resume-service", configuration = InternalServiceFeignConfig.class)
public interface ResumeClient {

    @GetMapping("/internal/resumes/{id}")
    ResumeInternalResponse getResume(@PathVariable("id") Long id);
}
