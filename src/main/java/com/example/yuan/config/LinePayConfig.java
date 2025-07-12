package com.example.yuan.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "line.pay")
public class LinePayConfig {
    private String channelId;
    private String channelSecret;
    private String apiUrl;
    private String confirmUrl;
    private String cancelUrl;
}