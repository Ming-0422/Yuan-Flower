package com.example.yuan.config;

import com.linecorp.bot.client.LineMessagingClient;
import com.linecorp.bot.spring.boot.LineBotProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LineBotConfig {
    
    @Bean
    public LineMessagingClient lineMessagingClient(LineBotProperties properties) {
        return LineMessagingClient.builder(properties.getChannelToken()).build();
    }
}