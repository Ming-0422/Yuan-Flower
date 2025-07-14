package com.example.yuan.controller;

import com.example.yuan.dto.linepay.LinePayDTO.*;
import com.example.yuan.model.Order;
import com.example.yuan.service.LinePayService;
import com.example.yuan.service.OrderService;

import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/line-pay")
public class LinePayController {
    
    private static final Logger logger = LoggerFactory.getLogger(LinePayController.class);
    
    private final LinePayService linePayService;
    private final OrderService orderService;
    
    // 暫存 transactionId 與 orderId 的對應關係
    private static final Map<String, Long> transactionOrderMap = new HashMap<>();
    
    public LinePayController(LinePayService linePayService, OrderService orderService) {
        this.linePayService = linePayService;
        this.orderService = orderService;
    }
    
    /**
     * 發起 LINE Pay 付款
     */
    @PostMapping("/request/{orderId}")
    public ResponseEntity<?> requestPayment(@PathVariable Long orderId) {
        logger.info("=== 開始處理 LINE Pay 付款請求 ===");
        logger.info("訂單ID: {}", orderId);
        
        try {
            // 檢查 LINE Pay 設定
            Map<String, String> envCheck = checkLinePayEnvironment();
            if (!envCheck.isEmpty()) {
                logger.error("LINE Pay 環境變數設定問題: {}", envCheck);
                return ResponseEntity.badRequest().body(envCheck);
            }
            
            // 取得訂單
            Order order = orderService.getOrderById(orderId);
            logger.info("找到訂單: {}, 金額: {}", order.getOrderId(), order.getTotalAmount());
            
            // 檢查訂單狀態
            if (!"待付款".equals(order.getPaymentStatus())) {
                logger.warn("訂單狀態不正確: {}", order.getPaymentStatus());
                return ResponseEntity.badRequest().body(Map.of("error", "訂單已付款或無效"));
            }
            
            // 更新訂單付款方式
            order.setPaymentMethod("LINE Pay");
            orderService.updateOrder(order);
            logger.info("已更新訂單付款方式為 LINE Pay");
            
            // 請求 LINE Pay
            logger.info("開始請求 LINE Pay API");
            PaymentResponse response = linePayService.requestPayment(order);
            
            if (response == null) {
                logger.error("LINE Pay 回應為 null");
                return ResponseEntity.internalServerError().body(Map.of("error", "LINE Pay 服務無回應"));
            }
            
            logger.info("LINE Pay 回應代碼: {}", response.getReturnCode());
            
            if ("0000".equals(response.getReturnCode())) {
                // 儲存 transactionId 與 orderId 的對應
                String transactionId = response.getInfo().getTransactionId();
                transactionOrderMap.put(transactionId, orderId);
                logger.info("成功建立付款請求，交易ID: {}", transactionId);
                
                // 回傳付款 URL
                Map<String, String> result = new HashMap<>();
                result.put("paymentUrl", response.getInfo().getPaymentUrl().getWeb());
                result.put("transactionId", transactionId);
                
                return ResponseEntity.ok(result);
            } else {
                logger.error("LINE Pay 請求失敗: 代碼={}, 訊息={}", 
                    response.getReturnCode(), response.getReturnMessage());
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "付款請求失敗",
                    "code", response.getReturnCode(),
                    "message", response.getReturnMessage()
                ));
            }
            
        } catch (Exception e) {
            logger.error("LINE Pay 請求錯誤", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "系統錯誤", 
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 檢查 LINE Pay 環境變數設定
     */
    private Map<String, String> checkLinePayEnvironment() {
        Map<String, String> errors = new HashMap<>();
        
        String channelId = System.getenv("LINE_PAY_CHANNEL_ID");
        String channelSecret = System.getenv("LINE_PAY_CHANNEL_SECRET");
        String appBaseUrl = System.getenv("APP_BASE_URL");
        
        if (channelId == null || channelId.trim().isEmpty() || "your_line_pay_channel_id".equals(channelId)) {
            errors.put("LINE_PAY_CHANNEL_ID", "未設定或使用預設值");
        }
        
        if (channelSecret == null || channelSecret.trim().isEmpty() || "your_line_pay_channel_secret".equals(channelSecret)) {
            errors.put("LINE_PAY_CHANNEL_SECRET", "未設定或使用預設值");
        }
        
        if (appBaseUrl == null || appBaseUrl.trim().isEmpty()) {
            errors.put("APP_BASE_URL", "未設定");
        }
        
        logger.info("環境變數檢查結果:");
        logger.info("LINE_PAY_CHANNEL_ID: {}", channelId != null ? channelId.substring(0, Math.min(channelId.length(), 8)) + "..." : "null");
        logger.info("LINE_PAY_CHANNEL_SECRET: {}", channelSecret != null ? "已設定" : "未設定");
        logger.info("APP_BASE_URL: {}", appBaseUrl);
        
        return errors;
    }
    
    /**
     * LINE Pay 付款完成回調
     */
    @GetMapping("/confirm")
    public String confirmPayment(
            @RequestParam String transactionId,
            @RequestParam(required = false) Long orderId) {
        try {
            // 如果沒有 orderId，從暫存取得
            if (orderId == null) {
                orderId = transactionOrderMap.get(transactionId);
            }
            
            if (orderId == null) {
                return "redirect:/?error=invalid_transaction";
            }
            
            // 取得訂單
            Order order = orderService.getOrderById(orderId);
            
            // 確認付款
            ConfirmResponse response = linePayService.confirmPayment(
                transactionId, 
                order.getTotalAmount()
            );
            
            if ("0000".equals(response.getReturnCode())) {
                // 更新訂單狀態
                order.setPaymentStatus("已付款");
                order.setStatus("processing");
                orderService.updateOrder(order);
                
                // 清除暫存
                transactionOrderMap.remove(transactionId);
                
                // 重導向到首頁並顯示成功訊息
                return "redirect:/?success=true&orderId=" + orderId;
            } else {
                log.error("LINE Pay 確認失敗: {}", response.getReturnMessage());
                return "redirect:/?error=payment_failed";
            }
            
        } catch (Exception e) {
            log.error("LINE Pay 確認錯誤", e);
            return "redirect:/?error=system_error";
        }
    }
    
    /**
     * 取消付款
     */
    @GetMapping("/cancel")
    public String cancelPayment(@RequestParam(required = false) String transactionId) {
        logger.info("LINE Pay 付款被取消: transactionId={}", transactionId);
        
        // 清除暫存
        if (transactionId != null) {
            transactionOrderMap.remove(transactionId);
        }
        
        return "redirect:/checkout?error=payment_cancelled";
    }
}