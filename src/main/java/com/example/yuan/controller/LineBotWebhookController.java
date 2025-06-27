package com.example.yuan.controller;

import com.linecorp.bot.model.event.Event;
import com.linecorp.bot.model.event.MessageEvent;
import com.linecorp.bot.model.event.message.TextMessageContent;
import com.linecorp.bot.spring.boot.annotation.EventMapping;
import com.linecorp.bot.spring.boot.annotation.LineMessageHandler;

@LineMessageHandler
public class LineBotWebhookController {
    
    @EventMapping
    public void handleTextMessageEvent(MessageEvent<TextMessageContent> event) {
        System.out.println("收到訊息！");
        System.out.println("User ID: " + event.getSource().getUserId());
        System.out.println("訊息內容: " + event.getMessage().getText());
        
        // 您可以在這裡看到發送訊息的用戶的 User ID
        // 將這個 ID 設定為 admin-user-id
    }
    
    @EventMapping
    public void handleDefaultMessageEvent(Event event) {
        System.out.println("收到事件: " + event);
    }
}