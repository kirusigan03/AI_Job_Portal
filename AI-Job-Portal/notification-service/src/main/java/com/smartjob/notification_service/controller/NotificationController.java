package com.smartjob.notification_service.controller;

import com.smartjob.notification_service.entity.Notification;
import com.smartjob.notification_service.security.UserPrincipal;
import com.smartjob.notification_service.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>>
    getMyNotifications(
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService
                        .getUserNotifications(
                                principal.getUserId()
                        )
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>>
    getUserNotifications(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                notificationService
                        .getUserNotifications(userId)
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long id
    ) {

        notificationService.markAsRead(id);

        return ResponseEntity.ok(
                "Notification marked as read"
        );
    }
}
