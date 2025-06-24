package com.example.yuan.repository;

import com.example.yuan.model.Member;
import com.example.yuan.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // 根據會員查找訂單，按日期降序排列
    List<Order> findByMemberOrderByOrderDateDesc(Member member);
    
    // 根據狀態查找訂單
    List<Order> findByStatus(String status);
    
    // 根據付款狀態查找訂單
    List<Order> findByPaymentStatus(String paymentStatus);
    
    // 查找未發送 LINE 通知的訂單
    List<Order> findByLineNotifiedFalse();
}