package com.example.yuan.controller;

import com.example.yuan.service.SimpleLineBotService;
import com.linecorp.bot.client.LineMessagingClient;
import com.linecorp.bot.model.PushMessage;
import com.linecorp.bot.model.message.TextMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestLineBotController {
    
    private final SimpleLineBotService lineBotService;
    private final LineMessagingClient lineMessagingClient;
    
    @Value("${line.bot.admin-user-id}")
    private String adminUserId;
    
    @Value("${line.bot.channel-token}")
    private String channelToken;
    
    public TestLineBotController(SimpleLineBotService lineBotService, 
                                LineMessagingClient lineMessagingClient) {
        this.lineBotService = lineBotService;
        this.lineMessagingClient = lineMessagingClient;
    }
    
    /**
     * 測試 LINE Bot 連線
     */
    @GetMapping("/line-bot")
    public ResponseEntity<Map<String, String>> testLineBot() {
        Map<String, String> response = new HashMap<>();
        
        try {
            System.out.println("=== 測試 LINE Bot 發送 ===");
            System.out.println("Admin User ID: " + adminUserId);
            System.out.println("Channel Token 前10碼: " + (channelToken != null ? channelToken.substring(0, 10) + "..." : "null"));
            
            String message = "🌸 小花圓測試訊息 🌸\n" +
                           "================\n" +
                           "時間: " + new java.util.Date() + "\n" +
                           "如果您收到此訊息，表示 LINE Bot 正常運作！\n" +
                           "================";
            
            TextMessage textMessage = new TextMessage(message);
            PushMessage pushMessage = new PushMessage(adminUserId, textMessage);
            
            lineMessagingClient.pushMessage(pushMessage)
                .thenAccept(result -> {
                    System.out.println("測試訊息發送成功: " + result);
                    System.out.println("RequestId: " + result.getRequestId());
                    System.out.println("Message: " + result.getMessage());
                })
                .exceptionally(throwable -> {
                    System.err.println("測試訊息發送失敗: " + throwable.getMessage());
                    System.err.println("錯誤類型: " + throwable.getClass().getName());
                    throwable.printStackTrace();
                    return null;
                });
            
            response.put("status", "success");
            response.put("message", "測試訊息已發送，請檢查您的 LINE！");
            response.put("adminUserId", adminUserId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("測試發送異常: " + e.getMessage());
            e.printStackTrace();
            
            response.put("status", "error");
            response.put("message", "發送失敗: " + e.getMessage());
            response.put("errorType", e.getClass().getName());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 檢查配置
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> checkConfig() {
        Map<String, Object> config = new HashMap<>();
        
        config.put("adminUserId", adminUserId != null ? "已設定" : "未設定");
        config.put("adminUserIdLength", adminUserId != null ? adminUserId.length() : 0);
        config.put("channelToken", channelToken != null ? "已設定" : "未設定");
        config.put("channelTokenLength", channelToken != null ? channelToken.length() : 0);
        config.put("lineMessagingClient", lineMessagingClient != null ? "已注入" : "未注入");
        
        System.out.println("=== LINE Bot 配置檢查 ===");
        System.out.println("Admin User ID: " + adminUserId);
        System.out.println("Channel Token 前10碼: " + (channelToken != null ? channelToken.substring(0, 10) + "..." : "null"));
        
        return ResponseEntity.ok(config);
    }
}