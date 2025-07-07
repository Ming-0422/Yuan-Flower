package com.example.yuan.controller;

import com.example.yuan.model.Member;
import com.example.yuan.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    // ✅ 只保留這一個註冊方法 - 有驗證的版本
    @PostMapping("/register")
    public ResponseEntity<?> registerMember(@Valid @RequestBody Member member, BindingResult bindingResult) {
        try {
            // 檢查驗證錯誤
            if (bindingResult.hasErrors()) {
                StringBuilder errorMessage = new StringBuilder();
                bindingResult.getFieldErrors()
                        .forEach(error -> errorMessage.append(error.getDefaultMessage()).append("; "));
                return new ResponseEntity<>(errorMessage.toString(), HttpStatus.BAD_REQUEST);
            }

            Member registeredMember = memberService.registerNewMember(member);
            // 註冊成功後，不要返回密碼
            registeredMember.setPassword(null);
            return new ResponseEntity<>(registeredMember, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 獲取會員資料 (需要認證後才能訪問)
    @GetMapping("/{username}")
    public ResponseEntity<Member> getMemberByUsername(@PathVariable String username) {
        // 在實際應用中，這裡會檢查當前登入使用者是否有權限查看該資料
        return memberService.findByUsername(username)
                .map(member -> {
                    member.setPassword(null); // 返回前移除密碼
                    return new ResponseEntity<>(member, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}