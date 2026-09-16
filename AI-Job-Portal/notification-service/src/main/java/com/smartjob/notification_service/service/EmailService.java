package com.smartjob.notification_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String message) {

        if (to == null || to.isBlank()) {
            log.warn("Skipping email '{}': recipient has no email on file", subject);
            return;
        }

        try {

            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(message);

            mailSender.send(mail);

        } catch (Exception e) {

            // A failed email must never break notification processing --
            // the in-app notification row is already saved by this point.
            log.error("Failed to send email '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
