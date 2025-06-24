package com.example.yuan.service;

import com.example.yuan.model.Member;
import com.example.yuan.repository.MemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder; // 用於密碼加密
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // Spring Security 的密碼編碼器

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Member registerNewMember(Member member) throws Exception {
        // 檢查用戶名或電子郵件是否已存在
        if (memberRepository.findByUsername(member.getUsername()).isPresent()) {
            throw new Exception("用戶名已被使用");
        }
        if (memberRepository.findByEmail(member.getEmail()).isPresent()) {
            throw new Exception("電子郵件已被使用");
        }

        // 對密碼進行雜湊處理
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        return memberRepository.save(member);
    }

    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    // 更多業務邏輯，例如登入驗證 (通常由 Spring Security 處理)
    // 獲取會員資料等
}