package com.smartjob.notification_service.client;

import com.smartjob.notification_service.config.InternalServiceFeignConfig;
import com.smartjob.notification_service.dto.UserEmailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = InternalServiceFeignConfig.class)
public interface UserClient {

    @GetMapping("/internal/users/{userId}")
    UserEmailResponse getUser(@PathVariable("userId") Long userId);
}
