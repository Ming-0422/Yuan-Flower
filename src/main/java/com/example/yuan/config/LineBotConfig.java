package com.example.yuan.config;

import com.linecorp.bot.client.LineMessagingClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LineBotConfig {
    
    @Value("${line.bot.channel-token}")
    private String channelAccessToken;
    
    @Bean
    public LineMessagingClient lineMessagingClient() {
        return LineMessagingClient.builder(channelAccessToken).build();
    }
}