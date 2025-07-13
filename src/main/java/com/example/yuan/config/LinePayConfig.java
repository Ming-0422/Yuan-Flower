package com.example.yuan.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;

@Data
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "line.pay")
public class LinePayConfig implements InitializingBean {
    private String channelId;
    private String channelSecret;
    private String apiUrl;
    private String confirmUrl;
    private String cancelUrl;
    
    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("=== LINE Pay 配置檢查 ===");
        log.info("Channel ID: {}", channelId != null ? maskString(channelId) : "null");
        log.info("Channel Secret: {}", channelSecret != null ? "已設定" : "null");
        log.info("API URL: {}", apiUrl);
        log.info("Confirm URL: {}", confirmUrl);
        log.info("Cancel URL: {}", cancelUrl);
        
        // 檢查環境變數
        String envChannelId = System.getenv("LINE_PAY_CHANNEL_ID");
        String envChannelSecret = System.getenv("LINE_PAY_CHANNEL_SECRET");
        String envAppBaseUrl = System.getenv("APP_BASE_URL");
        
        log.info("=== 環境變數檢查 ===");
        log.info("LINE_PAY_CHANNEL_ID: {}", envChannelId != null ? maskString(envChannelId) : "未設定");
        log.info("LINE_PAY_CHANNEL_SECRET: {}", envChannelSecret != null ? "已設定" : "未設定");
        log.info("APP_BASE_URL: {}", envAppBaseUrl != null ? envAppBaseUrl : "未設定");
        
        // 如果 properties 設定為空或預設值，嘗試從環境變數讀取
        if (channelId == null || channelId.equals("your_line_pay_channel_id")) {
            if (envChannelId != null && !envChannelId.equals("your_line_pay_channel_id")) {
                this.channelId = envChannelId;
                log.info("使用環境變數的 Channel ID");
            }
        }
        
        if (channelSecret == null || channelSecret.equals("your_line_pay_channel_secret")) {
            if (envChannelSecret != null && !envChannelSecret.equals("your_line_pay_channel_secret")) {
                this.channelSecret = envChannelSecret;
                log.info("使用環境變數的 Channel Secret");
            }
        }
        
        // 驗證必要設定
        if (channelId == null || channelId.equals("your_line_pay_channel_id")) {
            log.warn("⚠️ LINE Pay Channel ID 未正確設定");
        }
        
        if (channelSecret == null || channelSecret.equals("your_line_pay_channel_secret")) {
            log.warn("⚠️ LINE Pay Channel Secret 未正確設定");
        }
        
        if (channelId != null && channelSecret != null && 
            !channelId.equals("your_line_pay_channel_id") && 
            !channelSecret.equals("your_line_pay_channel_secret")) {
            log.info("✅ LINE Pay 配置驗證成功");
        } else {
            log.error("❌ LINE Pay 配置驗證失敗");
        }
    }
    
    private String maskString(String str) {
        if (str == null || str.length() <= 8) {
            return str;
        }
        return str.substring(0, 4) + "****" + str.substring(str.length() - 4);
    }
}