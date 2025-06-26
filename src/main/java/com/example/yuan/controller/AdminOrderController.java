package com.example.yuan.controller;

import com.example.yuan.model.Order;
import com.example.yuan.service.OrderService;
import com.example.yuan.service.SimpleLineBotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    
    private final OrderService orderService;
    private final SimpleLineBotService lineBotService;
    
    public AdminOrderController(OrderService orderService, 
                               SimpleLineBotService lineBotService) {
        this.orderService = orderService;
        this.lineBotService = lineBotService;
    }
    
    /**
     * 取得所有訂單
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus) {
        
        List<Order> orders;
        if (status != null) {
            orders = orderService.getOrdersByStatus(status);
        } else if (paymentStatus != null) {
            orders = orderService.getOrdersByPaymentStatus(paymentStatus);
        } else {
            orders = orderService.getAllOrders();
        }
        
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    
    /**
     * 更新訂單狀態
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        
        try {
            String newStatus = request.get("status");
            Order order = orderService.getOrderById(orderId);
            String oldStatus = order.getStatus();
            
            order.setStatus(newStatus);
            Order updatedOrder = orderService.updateOrder(order);
            
            // 發送 LINE 通知
            lineBotService.sendStatusUpdateNotification(updatedOrder, oldStatus, newStatus);
            
            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * 確認付款
     */
    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable Long orderId) {
        try {
            Order order = orderService.updatePaymentStatus(orderId, "已付款");
            
            // 發送付款確認通知
            lineBotService.sendPaymentConfirmation(order);
            
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * 取得待處理訂單數量
     */
    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Integer>> getPendingOrdersCount() {
        int pendingOrders = orderService.getOrdersByStatus("pending").size();
        int unpaidOrders = orderService.getOrdersByPaymentStatus("待付款").size();
        
        return new ResponseEntity<>(Map.of(
            "pendingOrders", pendingOrders,
            "unpaidOrders", unpaidOrders
        ), HttpStatus.OK);
    }
}