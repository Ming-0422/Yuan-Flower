package com.example.yuan.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "API is working");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login-test")
    public ResponseEntity<Map<String, Object>> loginTest(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        response.put("received_username", credentials.get("username"));
        response.put("received_password_length", credentials.get("password") != null ? credentials.get("password").length() : 0);
        response.put("message", "Login test endpoint reached");
        return ResponseEntity.ok(response);
    }
}