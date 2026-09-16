package com.smartjob.job_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/actuator/**")
                        .permitAll()

                        // Internal service-to-service endpoints are guarded by
                        // the X-Internal-Service-Key header inside the
                        // controller itself, not by a user JWT (Kafka-triggered
                        // calls from ai-service have no user token to carry).
                        .requestMatchers("/internal/**")
                        .permitAll()

                        // Job browsing is public. This also lets
                        // application-service's internal Feign call
                        // (job-service is called directly, not
                        // through the gateway, and doesn't carry
                        // the caller's JWT) verify a job exists
                        // without being rejected.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/jobs/**"
                        )
                        .permitAll()

                        .requestMatchers("/api/jobs/**")
                        .authenticated()

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
