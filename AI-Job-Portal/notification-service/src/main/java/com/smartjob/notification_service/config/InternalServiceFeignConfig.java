package com.smartjob.notification_service.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InternalServiceFeignConfig {

    @Value("${internal.service-key}")
    private String serviceKey;

    @Bean
    public RequestInterceptor internalServiceInterceptor() {

        return requestTemplate ->
                requestTemplate.header("X-Internal-Service-Key", serviceKey);
    }
}
