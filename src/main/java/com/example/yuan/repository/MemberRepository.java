package com.example.yuan.repository;

import com.example.yuan.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    // 根據用戶名查找會員
    Optional<Member> findByUsername(String username);
    // 根據電子郵件查找會員
    Optional<Member> findByEmail(String email);
}