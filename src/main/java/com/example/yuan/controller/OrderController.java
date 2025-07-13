package com.example.yuan.controller;

import com.example.yuan.dto.OrderRequest;
import com.example.yuan.model.Order;
import com.example.yuan.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap; // 新增導入
import java.util.List;
import java.util.Map; // 新增導入

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, 
                                       Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("=== 開始建立訂單 ==="); // 新增日誌
            System.out.println("用戶: " + username); // 新增日誌
            System.out.println("訂單資料: " + orderRequest); // 新增日誌
            
            Order order = orderService.createOrder(orderRequest, username);
            
            // 創建一個簡單的回應物件，避免序列化整個 Order 物件
            Map<String, Object> response = new HashMap<>(); // 修改為 Map
            response.put("orderId", order.getOrderId());
            response.put("message", "訂單建立成功");
            
            return ResponseEntity.ok(response); // 修改為 ResponseEntity.ok
            
        } catch (Exception e) {
            System.err.println("=== 訂單建立失敗 ==="); // 新增日誌
            System.err.println("錯誤類型: " + e.getClass().getName()); // 新增日誌
            System.err.println("錯誤訊息: " + e.getMessage()); // 新增日誌
            e.printStackTrace(); // 確保錯誤堆疊被列印
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "訂單建立失敗");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // 修改為 INTERNAL_SERVER_ERROR
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
