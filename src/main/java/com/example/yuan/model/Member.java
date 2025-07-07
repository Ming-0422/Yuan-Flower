package com.example.yuan.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "用戶名不能為空")
    @Size(min = 3, max = 20, message = "用戶名長度必須在3-20個字符之間")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用戶名只能包含字母、數字和底線")
    private String username;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "電子郵件不能為空")
    @Email(message = "請輸入有效的電子郵件地址")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "密碼不能為空")
    @Size(min = 6, message = "密碼至少需要6個字符")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z]).*$", message = "密碼必須包含至少1個大寫字母和1個小寫字母")
    private String password;

    @Column(nullable = false)
    @NotBlank(message = "電話不能為空")
    @Pattern(regexp = "^09[0-9]{8}$", message = "請輸入有效的台灣手機號碼")
    private String phone;

    // 移除 address 欄位

    // Constructors
    public Member() {}

    public Member(String username, String email, String password, String phone) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    // Getters and Setters (移除 address 相關方法)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}