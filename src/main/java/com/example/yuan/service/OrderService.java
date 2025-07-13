package com.example.yuan.service;

import com.example.yuan.dto.OrderRequest;
import com.example.yuan.model.Member;
import com.example.yuan.model.Order;
import com.example.yuan.model.OrderItem;
import com.example.yuan.repository.MemberRepository;
import com.example.yuan.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final SimpleLineBotService lineBotService;
    
    public OrderService(OrderRepository orderRepository, 
                        MemberRepository memberRepository,
                        SimpleLineBotService lineBotService) {
        this.orderRepository = orderRepository;
        this.memberRepository = memberRepository;
        this.lineBotService = lineBotService;
    }
    
    public Order createOrder(OrderRequest request, String username) throws Exception {
        Order order = new Order();
        
        // 設定會員（必須有登入）
        if (username == null || username.trim().isEmpty()) {
            throw new Exception("請先登入會員");
        }
        
        Member member = memberRepository.findByUsername(username)
            .orElseThrow(() -> new Exception("會員不存在"));
        order.setMember(member);
        System.out.println("為會員 " + username + " 建立訂單");
        
        // 設定顧客資料
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerEmail(request.getCustomerEmail());
        
        // 設定收件人資料
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setShippingAddress(request.getShippingAddress());
        
        // 設定運送資訊
        order.setShippingMethod(request.getShippingMethod());
        order.setShippingFee(request.getShippingFee());
        order.setDeliveryDate(request.getDeliveryDate());
        order.setOrderNotes(request.getOrderNotes());
        
        // 設定銀行帳號後五碼
        order.setBankAccountLast5(request.getBankAccountLast5());
        
        // 計算總金額
        BigDecimal subtotal = BigDecimal.ZERO;
        
        // 添加訂單項目
        for (OrderRequest.CartItem cartItem : request.getCartItems()) {
            OrderItem orderItem = new OrderItem(
                cartItem.getProductId(),
                cartItem.getProductName(),
                cartItem.getQuantity(),
                cartItem.getPrice()
            );
            order.addOrderItem(orderItem);
            subtotal = subtotal.add(orderItem.getSubtotal());
        }
        
        // 設定總金額（商品小計 + 運費）
        BigDecimal totalAmount = subtotal.add(
            request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO
        );
        order.setTotalAmount(totalAmount);
        
        // 儲存訂單
        Order savedOrder = orderRepository.save(order);
        System.out.println("訂單已儲存，訂單編號: " + savedOrder.getOrderId());
        
        // 發送 LINE Bot 通知
        try {
            System.out.println("準備發送 LINE Bot 通知...");
            lineBotService.sendOrderNotification(savedOrder)
                .thenAccept(result -> {
                    System.out.println("LINE Bot 通知結果: " + result);
                    if ("success".equals(result)) {
                        // 在異步線程中更新訂單狀態
                        Order orderToUpdate = orderRepository.findById(savedOrder.getOrderId()).orElse(null);
                        if (orderToUpdate != null) {
                            orderToUpdate.setLineNotified(true);
                            orderToUpdate.setLineNotifiedAt(LocalDateTime.now());
                            orderRepository.save(orderToUpdate);
                            System.out.println("LINE Bot 通知狀態已更新");
                        }
                    }
                })
                .exceptionally(ex -> {
                    System.err.println("LINE Bot 通知處理異常: " + ex.getMessage());
                    ex.printStackTrace();
                    return null;
                }); 
        } catch (Exception e) {
            // 記錄錯誤但不影響訂單建立
            System.err.println("LINE Bot 通知發送失敗: " + e.getMessage());
            e.printStackTrace();
        }
        
        return savedOrder;
    }
    
    public List<Order> getOrdersByUsername(String username) {
        Member member = memberRepository.findByUsername(username)
            .orElse(null);
        if (member == null) {
            return List.of();
        }
        return orderRepository.findByMemberOrderByOrderDateDesc(member);
    }
    
    public Order getOrderById(Long orderId) throws Exception {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new Exception("訂單不存在"));
    }
    
    public Order updatePaymentStatus(Long orderId, String status) throws Exception {
        Order order = getOrderById(orderId);
        order.setPaymentStatus(status);
        
        if ("已付款".equals(status)) {
            order.setStatus("processing");
        }
        
        return orderRepository.save(order);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> getOrdersByPaymentStatus(String paymentStatus) {
        return orderRepository.findByPaymentStatus(paymentStatus);
    }
    
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }

    // 更新訂單付款方式為 LINE Pay
    public Order updatePaymentMethodToLinePay(Long orderId) throws Exception {
        Order order = getOrderById(orderId);
        order.setPaymentMethod("LINE Pay");
        return orderRepository.save(order);
    }

    // 更新訂單 LINE Pay 交易資訊
    public Order updateLinePayTransaction(Long orderId, String transactionId) throws Exception {
        Order order = getOrderById(orderId);
        // 可以在 Order entity 新增 linePayTransactionId 欄位來儲存
        // order.setLinePayTransactionId(transactionId); // 如果 Order 類別有此欄位，請取消此行註解
        return orderRepository.save(order);
    }
}