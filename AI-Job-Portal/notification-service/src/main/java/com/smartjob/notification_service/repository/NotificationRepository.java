package com.smartjob.notification_service.repository;

import com.smartjob.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Notification> findByUserIdAndIsReadFalse(
            Long userId
    );
}
