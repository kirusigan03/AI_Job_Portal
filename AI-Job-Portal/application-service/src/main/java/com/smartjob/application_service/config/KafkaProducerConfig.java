package com.smartjob.application_service.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Object>
    producerFactory() {

        Map<String, Object> config =
                new HashMap<>();

        config.put(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                "localhost:9092"
        );

        config.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        config.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                JsonSerializer.class
        );

        // Fail fast when the broker is unreachable instead of
        // blocking the calling (HTTP request) thread for the
        // client's 60s default.
        config.put(
                ProducerConfig.MAX_BLOCK_MS_CONFIG,
                3000
        );

        config.put(
                ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG,
                3000
        );

        // Each consumer (notification-service, ai-service) has its
        // own copy of ApplicationSubmittedEvent in its own package.
        // Without this, JsonSerializer embeds this producer's
        // fully-qualified class name in a Kafka header, and every
        // consumer tries to load THAT class -- which doesn't exist
        // on their classpath -- instead of using their own local
        // type. Disabling the header makes every consumer just use
        // the target type it already configured for itself.
        config.put(
                JsonSerializer.ADD_TYPE_INFO_HEADERS,
                false
        );

        return new DefaultKafkaProducerFactory<>(
                config
        );
    }

    @Bean
    public KafkaTemplate<String, Object>
    kafkaTemplate() {

        return new KafkaTemplate<>(
                producerFactory()
        );
    }
}