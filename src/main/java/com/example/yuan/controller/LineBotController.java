package com.example.yuan.controller;

import com.linecorp.bot.model.event.Event;
import com.linecorp.bot.model.event.MessageEvent;
import com.linecorp.bot.model.event.message.TextMessageContent;
import com.linecorp.bot.model.message.Message;
import com.linecorp.bot.model.message.TextMessage;
import com.linecorp.bot.spring.boot.annotation.EventMapping;
import com.linecorp.bot.spring.boot.annotation.LineMessageHandler;
import org.springframework.web.bind.annotation.RestController;

@RestController
@LineMessageHandler
public class LineBotController {
    
    @EventMapping
    public Message handleTextMessageEvent(MessageEvent<TextMessageContent> event) {
        String userMessage = event.getMessage().getText();
        System.out.println("收到訊息: " + userMessage);
        
        // 簡單的自動回覆
        if (userMessage.contains("訂單")) {
            return new TextMessage("您好！訂單相關問題請聯繫客服，或查看最新訂單通知。");
        } else if (userMessage.contains("你好") || userMessage.contains("您好")) {
            return new TextMessage("您好！歡迎來到小花圓🌸 我是您的訂單助手，有任何問題都可以詢問我喔！");
        } else if (userMessage.contains("營業時間")) {
            return new TextMessage("我們的營業時間是：\n週一至週五 10:00-18:00\n週六 10:00-17:00\n週日公休");
        }
        
        return new TextMessage("感謝您的訊息！如需協助請輸入：\n" +
                             "「訂單」- 查詢訂單相關\n" +
                             "「營業時間」- 查看營業時間");
    }
    
    @EventMapping
    public void handleDefaultMessageEvent(Event event) {
        System.out.println("收到事件: " + event);
    }
}