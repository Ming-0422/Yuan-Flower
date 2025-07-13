package com.example.yuan.controller;

import com.example.yuan.dto.OrderRequest;
import com.example.yuan.model.Order;
import com.example.yuan.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, 
                                       Authentication authentication) {
        try {
            // 詳細日誌
            log.info("=== 開始建立訂單 ===");
            log.info("認證狀態: {}", authentication != null ? authentication.getName() : "未認證");
            log.info("顧客姓名: {}", orderRequest.getCustomerName());
            log.info("顧客電話: {}", orderRequest.getCustomerPhone());
            log.info("付款方式: {}", orderRequest.getPaymentMethod());
            log.info("購物車項目數: {}", orderRequest.getCartItems() != null ? orderRequest.getCartItems().size() : 0);
            
            // 驗證認證
            if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
                log.error("用戶未認證");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "請先登入"));
            }
            
            String username = authentication.getName();
            log.info("已登入用戶: {}", username);
            
            // 驗證訂單資料
            if (orderRequest.getCartItems() == null || orderRequest.getCartItems().isEmpty()) {
                log.error("購物車為空");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "購物車不能為空"));
            }
            
            // 建立訂單
            Order order = orderService.createOrder(orderRequest, username);
            log.info("訂單建立成功，訂單ID: {}", order.getOrderId());
            
            // 創建回應
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getOrderId());
            response.put("message", "訂單建立成功");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("=== 訂單建立失敗 ===");
            log.error("錯誤類型: {}", e.getClass().getName());
            log.error("錯誤訊息: {}", e.getMessage());
            log.error("錯誤堆疊:", e);
            
            // 返回詳細錯誤資訊
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "訂單建立失敗");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(errorResponse);
        }
    }
    
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<Order> orders = orderService.getOrdersByUsername(authentication.getName());
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId, 
                                            Authentication authentication) {
        try {
            Order order = orderService.getOrderById(orderId);
            
            // 檢查權限：只有訂單擁有者或管理員可以查看
            if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken) 
                && order.getMember() != null) {
                if (!order.getMember().getUsername().equals(authentication.getName())) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
            }
            
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PostMapping("/{orderId}/update-payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long orderId,
                                               @RequestParam String status) {
        try {
            Order order = orderService.updatePaymentStatus(orderId, status);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}