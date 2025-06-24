package com.example.yuan.controller;

import com.example.yuan.dto.OrderRequest;
import com.example.yuan.model.Order;
import com.example.yuan.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            // 如果用戶已登入，使用登入的用戶名；否則使用 null（訪客訂單）
            String username = authentication != null ? authentication.getName() : null;
            
            Order order = orderService.createOrder(orderRequest, username);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        if (authentication == null) {
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
            if (authentication != null && order.getMember() != null) {
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