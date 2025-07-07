package com.example.yuan.service;

import com.example.yuan.model.Order;
import com.example.yuan.model.OrderItem;
import com.linecorp.bot.client.LineMessagingClient;
import com.linecorp.bot.model.PushMessage;
import com.linecorp.bot.model.message.TextMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
public class SimpleLineBotService {
    
    private final LineMessagingClient lineMessagingClient;
    
    @Value("${line.bot.admin-user-id}")
    private String adminUserId;
    
    public SimpleLineBotService(LineMessagingClient lineMessagingClient) {
        this.lineMessagingClient = lineMessagingClient;
        System.out.println("=== LINE Bot Service 建構中 ===");
    }
    
    /**
     * 發送訂單通知（純文字版本）
     */
    public CompletableFuture<String> sendOrderNotification(Order order) {
        System.out.println("=== 開始發送 LINE Bot 通知 ===");
        System.out.println("Admin User ID: " + adminUserId);
        System.out.println("Admin User ID 長度: " + (adminUserId != null ? adminUserId.length() : 0));
        System.out.println("訂單編號: " + order.getOrderId());
        
        try {
            String message = buildOrderMessage(order);
            System.out.println("訊息內容長度: " + message.length());
            
            TextMessage textMessage = new TextMessage(message);
            PushMessage pushMessage = new PushMessage(adminUserId, textMessage);
            
            System.out.println("準備調用 LINE API...");
            
            return lineMessagingClient.pushMessage(pushMessage)
                .thenApply(response -> {
                    System.out.println("LINE Bot 通知發送成功: " + response);
                    System.out.println("Response RequestId: " + response.getRequestId());
                    System.out.println("Response Message: " + response.getMessage());
                    return "success";
                })
                .exceptionally(throwable -> {
                    System.err.println("LINE Bot 通知發送失敗: " + throwable.getMessage());
                    System.err.println("錯誤類型: " + throwable.getClass().getName());
                    throwable.printStackTrace();
                    return "failed";
                });
        } catch (Exception e) {
            System.err.println("建立 LINE Bot 訊息失敗: " + e.getMessage());
            System.err.println("錯誤類型: " + e.getClass().getName());
            e.printStackTrace();
            return CompletableFuture.completedFuture("failed");
        }
    }
    
    /**
     * 發送訂單狀態更新通知
     */
    public void sendStatusUpdateNotification(Order order, String oldStatus, String newStatus) {
        String message = String.format(
            "📦 訂單狀態更新\n" +
            "================\n" +
            "訂單編號: #%d\n" +
            "顧客: %s\n" +
            "狀態: %s → %s\n" +
            "================",
            order.getOrderId(),
            order.getCustomerName(),
            translateStatus(oldStatus),
            translateStatus(newStatus)
        );
        
        sendTextMessage(message);
    }
    
    /**
     * 發送付款確認通知
     */
    public void sendPaymentConfirmation(Order order) {
        String message = String.format(
            "💰 收到付款通知！\n" +
            "================\n" +
            "訂單編號: #%d\n" +
            "顧客: %s\n" +
            "金額: NT$ %s\n" +
            "================\n" +
            "請確認款項並安排出貨",
            order.getOrderId(),
            order.getCustomerName(),
            order.getTotalAmount()
        );
        
        sendTextMessage(message);
    }
    
    /**
     * 發送純文字訊息
     */
    private void sendTextMessage(String text) {
        try {
            TextMessage textMessage = new TextMessage(text);
            PushMessage pushMessage = new PushMessage(adminUserId, textMessage);
            
            lineMessagingClient.pushMessage(pushMessage)
                .thenAccept(response -> {
                    System.out.println("訊息發送成功: " + response);
                })
                .exceptionally(throwable -> {
                    System.err.println("訊息發送失敗: " + throwable.getMessage());
                    throwable.printStackTrace();
                    return null;
                });
        } catch (Exception e) {
            System.err.println("發送訊息時發生錯誤: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 建立訂單訊息文字
     */
    private String buildOrderMessage(Order order) {
        StringBuilder message = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        message.append("🌸 新訂單通知 🌸\n");
        message.append("================\n\n");
        
        // 訂單基本資訊
        message.append("📋 訂單編號: #").append(order.getOrderId()).append("\n");
        message.append("📅 訂單時間: ").append(order.getOrderDate().format(formatter)).append("\n");
        message.append("💰 總金額: NT$ ").append(order.getTotalAmount()).append("\n\n");
        
        // 顧客資料
        message.append("👤 顧客資料:\n");
        message.append("姓名: ").append(order.getCustomerName()).append("\n");
        message.append("電話: ").append(order.getCustomerPhone()).append("\n\n");
        
        // 收件人資料
        message.append("📦 收件人資料:\n");
        message.append("收件人: ").append(order.getRecipientName()).append("\n");
        message.append("電話: ").append(order.getRecipientPhone()).append("\n");
        message.append("地址: ").append(order.getShippingAddress()).append("\n");
        message.append("運送方式: ").append(order.getShippingMethod()).append("\n");
        
        if (order.getDeliveryDate() != null) {
            message.append("希望到貨日: ")
                   .append(order.getDeliveryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                   .append("\n");
        }
        message.append("\n");
        
        // 訂單明細
        message.append("🛒 訂單明細:\n");
        for (OrderItem item : order.getOrderItems()) {
            message.append("• ").append(item.getProductName())
                   .append(" x").append(item.getQuantity())
                   .append(" = NT$ ").append(item.getSubtotal())
                   .append("\n");
        }
        
        message.append("\n運費: NT$ ").append(order.getShippingFee()).append("\n");
        message.append("================\n");
        message.append("總計: NT$ ").append(order.getTotalAmount()).append("\n");
        
        // 備註
        if (order.getOrderNotes() != null && !order.getOrderNotes().isEmpty()) {
            message.append("\n📝 備註: ").append(order.getOrderNotes()).append("\n");
        }
        
        message.append("\n💳 付款方式: ").append(order.getPaymentMethod());
        
        // 新增銀行帳號後五碼
        if (order.getBankAccountLast5() != null && !order.getBankAccountLast5().isEmpty()) {
            message.append("\n💰 銀行帳號後五碼: ").append(order.getBankAccountLast5());
        }
        
        return message.toString();
    }
    
    /**
     * 翻譯訂單狀態
     */
    private String translateStatus(String status) {
        switch (status) {
            case "pending": return "待處理";
            case "processing": return "處理中";
            case "shipped": return "已出貨";
            case "delivered": return "已送達";
            case "cancelled": return "已取消";
            default: return status;
        }
    }
}