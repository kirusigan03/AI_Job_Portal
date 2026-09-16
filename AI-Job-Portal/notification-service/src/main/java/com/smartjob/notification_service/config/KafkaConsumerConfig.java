package com.smartjob.notification_service.config;

import com.smartjob.notification_service.event.ApplicationStatusChangedEvent;
import com.smartjob.notification_service.event.ApplicationSubmittedEvent;
import com.smartjob.notification_service.event.CandidateEvaluatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    private Map<String, Object> baseConsumerProperties() {

        Map<String, Object> properties =
                new HashMap<>();

        properties.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                "localhost:9092"
        );

        properties.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                "notification-service"
        );

        properties.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        properties.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                "earliest"
        );

        return properties;
    }

    // --- application-submitted ---

    @Bean
    public ConsumerFactory<String, ApplicationSubmittedEvent>
    applicationSubmittedConsumerFactory() {

        JsonDeserializer<ApplicationSubmittedEvent>
                deserializer =
                new JsonDeserializer<>(
                        ApplicationSubmittedEvent.class
                );

        deserializer.addTrustedPackages(
                "com.smartjob.*"
        );

        // Defense in depth: always use the type configured above,
        // never a class name embedded in a message header by
        // whichever producer sent it.
        deserializer.ignoreTypeHeaders();

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProperties(),
                new StringDeserializer(),
                deserializer
        );
    }

    // Explicit container factory bean, named to match the default
    // @KafkaListener(containerFactory=...) value so existing
    // listeners with no containerFactory attribute keep using this
    // one automatically.
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicationSubmittedEvent>
    kafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, ApplicationSubmittedEvent>
                factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(
                applicationSubmittedConsumerFactory()
        );

        return factory;
    }

    // --- application-status-changed ---

    @Bean
    public ConsumerFactory<String, ApplicationStatusChangedEvent>
    applicationStatusChangedConsumerFactory() {

        JsonDeserializer<ApplicationStatusChangedEvent>
                deserializer =
                new JsonDeserializer<>(
                        ApplicationStatusChangedEvent.class
                );

        deserializer.addTrustedPackages(
                "com.smartjob.*"
        );

        deserializer.ignoreTypeHeaders();

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProperties(),
                new StringDeserializer(),
                deserializer
        );
    }

    // A distinct factory bean name -- listeners for this topic must
    // reference it explicitly via
    // @KafkaListener(containerFactory = "statusChangedKafkaListenerContainerFactory"),
    // since two different ConsumerFactory<String, ?> beans with
    // different generic types can't be told apart by type alone at
    // injection time.
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicationStatusChangedEvent>
    statusChangedKafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, ApplicationStatusChangedEvent>
                factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(
                applicationStatusChangedConsumerFactory()
        );

        return factory;
    }

    // --- candidate-evaluated ---

    @Bean
    public ConsumerFactory<String, CandidateEvaluatedEvent>
    candidateEvaluatedConsumerFactory() {

        JsonDeserializer<CandidateEvaluatedEvent>
                deserializer =
                new JsonDeserializer<>(
                        CandidateEvaluatedEvent.class
                );

        deserializer.addTrustedPackages(
                "com.smartjob.*"
        );

        deserializer.ignoreTypeHeaders();

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProperties(),
                new StringDeserializer(),
                deserializer
        );
    }

    // A distinct factory bean name -- referenced explicitly via
    // @KafkaListener(containerFactory = "candidateEvaluatedKafkaListenerContainerFactory").
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, CandidateEvaluatedEvent>
    candidateEvaluatedKafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, CandidateEvaluatedEvent>
                factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(
                candidateEvaluatedConsumerFactory()
        );

        return factory;
    }
}
