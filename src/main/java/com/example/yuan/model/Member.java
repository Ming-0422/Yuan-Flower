package com.example.yuan.model; // 或 com.example.yuan.entity;

import jakarta.persistence.*; // 使用jakarta而非javax

@Entity
@Table(name = "members") // 對應資料庫的資料表名稱
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 資料庫中 `id` 欄位對應的 Java 型別

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // 儲存雜湊後的密碼

    private String address;
    private String phone;

    // Constructors (建構子)
    public Member() {}

    public Member(String username, String email, String password, String address, String phone) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.address = address;
        this.phone = phone;
    }

    // Getters and Setters (取得器和設定器)
    // 您可以使用 Lombok 的 @Data 註解來自動生成，但這裡手寫以供參考
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}