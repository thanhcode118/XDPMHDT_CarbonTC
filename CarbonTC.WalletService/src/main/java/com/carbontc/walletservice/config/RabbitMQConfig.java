package com.carbontc.walletservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // Xử lý giao dịch từ Marketplace

    public static final String TRANSACTION_QUEUE = "wallet_service_transaction_queue";
    public static final String TRANSACTION_EXCHANGE = "transaction_exchange";
    public static final String TRANSACTION_ROUTING_KEY = "transaction_created";

    @Bean
    TopicExchange transactionExchange() {
        return new TopicExchange(TRANSACTION_EXCHANGE);
    }

    @Bean
    Queue transactionQueue() {
        return QueueBuilder.durable(TRANSACTION_QUEUE).build();
    }

    @Bean
    Binding transactionBinding() {
        return BindingBuilder.bind(transactionQueue())
                .to(transactionExchange())
                .with(TRANSACTION_ROUTING_KEY);
    }

    // Xử lý Tín chỉ mới từ Carbon Lifecycle
    public static final String CREDIT_QUEUE = "wallet_service_credit_queue";
    public static final String CREDIT_EXCHANGE = "credit_exchange";
    public static final String CREDIT_ROUTING_KEY = "credit_issued";

    @Bean
    Queue creditQueue() {
        return QueueBuilder.durable(CREDIT_QUEUE).build();
    }

    @Bean
    TopicExchange creditExchange() {
        return new TopicExchange(CREDIT_EXCHANGE);
    }

    @Bean
    Binding creditBinding() {
        return BindingBuilder.bind(creditQueue()).
                to(creditExchange())
                .with(CREDIT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
