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
        try {
            // 取得訂單
            Order order = orderService.getOrderById(orderId);
            
            // 檢查訂單狀態
            if (!"待付款".equals(order.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("訂單已付款或無效");
            }
            
            // 請求 LINE Pay
            PaymentResponse response = linePayService.requestPayment(order);
            
            if ("0000".equals(response.getReturnCode())) {
                // 儲存 transactionId 與 orderId 的對應
                transactionOrderMap.put(response.getInfo().getTransactionId(), orderId);
                
                // 回傳付款 URL
                Map<String, String> result = new HashMap<>();
                result.put("paymentUrl", response.getInfo().getPaymentUrl().getWeb());
                result.put("transactionId", response.getInfo().getTransactionId());
                
                return ResponseEntity.ok(result);
            } else {
                log.error("LINE Pay 請求失敗: {}", response.getReturnMessage());
                return ResponseEntity.badRequest().body("付款請求失敗");
            }
            
        } catch (Exception e) {
            log.error("LINE Pay 請求錯誤", e);
            return ResponseEntity.internalServerError().body("系統錯誤");
        }
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
                return "redirect:/checkout?error=invalid_transaction";
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
                
                // 重導向到成功頁面
                return "redirect:/checkout?success=true&orderId=" + orderId;
            } else {
                log.error("LINE Pay 確認失敗: {}", response.getReturnMessage());
                return "redirect:/checkout?error=payment_failed";
            }
            
        } catch (Exception e) {
            log.error("LINE Pay 確認錯誤", e);
            return "redirect:/checkout?error=system_error";
        }
    }
    
    /**
     * 取消付款
     */
    @GetMapping("/cancel")
    public String cancelPayment(@RequestParam(required = false) String transactionId) {
        // 清除暫存
        if (transactionId != null) {
            transactionOrderMap.remove(transactionId);
        }
        
        return "redirect:/checkout?error=payment_cancelled";
    }
}