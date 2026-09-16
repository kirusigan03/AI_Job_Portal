package com.smartjob.ai_service.config;

import com.smartjob.ai_service.event.ApplicationSubmittedEvent;
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

    @Bean
    public ConsumerFactory<String, ApplicationSubmittedEvent>
    consumerFactory() {

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

        Map<String, Object> properties =
                new HashMap<>();

        properties.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                "localhost:9092"
        );

        properties.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                "ai-service"
        );

        properties.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        properties.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                "earliest"
        );

        return new DefaultKafkaConsumerFactory<>(
                properties,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ApplicationSubmittedEvent>
    kafkaListenerContainerFactory(
            ConsumerFactory<String, ApplicationSubmittedEvent> consumerFactory
    ) {

        ConcurrentKafkaListenerContainerFactory<String, ApplicationSubmittedEvent>
                factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory);

        return factory;
    }
}
