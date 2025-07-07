package com.example.yuan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                response.put("authenticated", true);
                response.put("username", auth.getName());
                return ResponseEntity.ok(response);
            } else {
                response.put("authenticated", false);
                response.put("username", null);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("username", null);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}