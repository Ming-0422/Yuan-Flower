package com.example.yuan.service;

import com.example.yuan.model.Order;
import com.example.yuan.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class LineNotificationService {
    
    @Value("${line.notify.token}")
    private String lineNotifyToken;
    
    private final RestTemplate restTemplate;
    private static final String LINE_NOTIFY_API = "https://notify-api.line.me/api/notify";
    
    public LineNotificationService() {
        this.restTemplate = new RestTemplate();
    }
    
    public void sendOrderNotification(Order order) throws Exception {
        String message = buildOrderMessage(order);
        sendLineNotify(message);
    }
    
    private String buildOrderMessage(Order order) {
        StringBuilder message = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        message.append("\n🌸 新訂單通知 🌸\n");
        message.append("================\n\n");
        
        // 訂單基本資訊
        message.append("📋 訂單編號: #").append(order.getOrderId()).append("\n");
        message.append("📅 訂單時間: ").append(order.getOrderDate().format(formatter)).append("\n");
        message.append("💰 總金額: NT$ ").append(order.getTotalAmount()).append("\n\n");
        
        // 顧客資料
        message.append("👤 顧客資料:\n");
        message.append("姓名: ").append(order.getCustomerName()).append("\n");
        message.append("電話: ").append(order.getCustomerPhone()).append("\n");
        message.append("Email: ").append(order.getCustomerEmail()).append("\n\n");
        
        // 收件人資料
        message.append("📦 收件人資料:\n");
        message.append("收件人: ").append(order.getRecipientName()).append("\n");
        message.append("電話: ").append(order.getRecipientPhone()).append("\n");
        message.append("地址: ").append(order.getShippingAddress()).append("\n");
        message.append("運送方式: ").append(order.getShippingMethod()).append("\n");
        
        if (order.getDeliveryDate() != null) {
            message.append("希望到貨日: ").append(order.getDeliveryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))).append("\n");
        }
        if (order.getDeliveryTime() != null && !order.getDeliveryTime().isEmpty()) {
            message.append("希望時段: ").append(order.getDeliveryTime()).append("\n");
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
        message.append("\n💵 付款狀態: ").append(order.getPaymentStatus());
        
        return message.toString();
    }
    
    private void sendLineNotify(String message) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBearerAuth(lineNotifyToken);
        
        Map<String, String> params = new HashMap<>();
        params.put("message", message);
        
        StringBuilder requestBody = new StringBuilder();
        params.forEach((key, value) -> {
            if (requestBody.length() > 0) {
                requestBody.append("&");
            }
            requestBody.append(key).append("=").append(value);
        });
        
        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            LINE_NOTIFY_API,
            HttpMethod.POST,
            request,
            String.class
        );
        
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new Exception("LINE 通知發送失敗: " + response.getBody());
        }
    }
}