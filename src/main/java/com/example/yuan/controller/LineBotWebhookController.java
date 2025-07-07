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
        // 目前不需要處理一般文字訊息，保持空白即可
    }
    
    @EventMapping
    public void handleDefaultMessageEvent(Event event) {
        System.out.println("收到事件: " + event);
    }
}