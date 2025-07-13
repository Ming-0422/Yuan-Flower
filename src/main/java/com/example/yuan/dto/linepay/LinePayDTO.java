package com.example.yuan.dto.linepay;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

// Wrapper class to hold all Line Pay DTOs in one file.
public class LinePayDTO {

    private LinePayDTO() {
        // Private constructor to prevent instantiation
    }

    // 請求付款 Request
    @Data
    @Getter
    @Setter
    public static class PaymentRequest {
        private BigDecimal amount;
        private String currency = "TWD";
        private String orderId;
        private List<Package> packages;
        private RedirectUrls redirectUrls;

        @Data
        @Getter
        @Setter
        public static class Package {
            private String id;
            private BigDecimal amount;
            private List<Product> products;
        }

        @Data
        @Getter
        @Setter
        public static class Product {
            private String id;
            private String name;
            private String imageUrl;
            private BigDecimal quantity;
            private BigDecimal price;
        }

        @Data
        @Getter
        @Setter
        public static class RedirectUrls {
            private String confirmUrl;
            private String cancelUrl;
        }
    }

    // 請求付款 Response
    @Data
    @Getter
    @Setter
    public static class PaymentResponse {
        private String returnCode;
        private String returnMessage;
        private Info info;

        @Data
        @Getter
        @Setter
        public static class Info {
            private String transactionId;
            private PaymentUrl paymentUrl;

            @Data
            @Getter
            @Setter
            public static class PaymentUrl {
                private String web;
                private String app;
            }
        }
    }

    // 確認付款 Request
    @Data
    @Getter
    @Setter
    public static class ConfirmRequest {
        private BigDecimal amount;
        private String currency = "TWD";
    }

    // 確認付款 Response
    @Data
    @Getter
    @Setter
    public static class ConfirmResponse {
        private String returnCode;
        private String returnMessage;
        private Info info;

        @Data
        @Getter
        @Setter
        public static class Info {
            private String orderId;
            private String transactionId;
            private List<PayInfo> payInfo;

            @Data
            @Getter
            @Setter
            public static class PayInfo {
                private String method;
                private BigDecimal amount;
            }
        }
    }
}