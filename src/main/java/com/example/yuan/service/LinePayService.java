package com.example.yuan.service;

import com.example.yuan.config.LinePayConfig;
import com.example.yuan.dto.linepay.LinePayDTO.*;
import com.example.yuan.model.Order;
import com.example.yuan.model.OrderItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LinePayService {

    private static final Logger log = LoggerFactory.getLogger(LinePayService.class);

    private final LinePayConfig config;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public LinePayService(LinePayConfig config, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.config = config;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 請求付款
     */
    public PaymentResponse requestPayment(Order order) throws Exception {
        // 檢查設定
        if (config.getChannelId() == null || config.getChannelSecret() == null) {
            throw new Exception("LINE Pay 設定不完整，請檢查環境變數");
        }

        String apiPath = "/v3/payments/request";
        String nonce = UUID.randomUUID().toString();

        // 建立請求資料
        PaymentRequest request = createPaymentRequest(order);
        String requestBody = objectMapper.writeValueAsString(request);

        log.info("LINE Pay 請求資料: {}", requestBody);

        // 產生簽名
        String signature = generateSignature(
                config.getChannelSecret(),
                apiPath,
                requestBody,
                nonce);

        // 設定 Headers
        HttpHeaders headers = createHeaders(signature, nonce);

        // 發送請求
        String url = config.getApiUrl() + apiPath;
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<PaymentResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    PaymentResponse.class);

            log.info("LINE Pay 請求付款回應: {}", response.getBody());
            return response.getBody();
        } catch (Exception e) {
            log.error("LINE Pay 請求失敗", e);
            throw new Exception("LINE Pay 請求失敗: " + e.getMessage());
        }
    }

    /**
     * 確認付款
     */
    public ConfirmResponse confirmPayment(String transactionId, BigDecimal amount) throws Exception {
        String apiPath = "/v3/payments/" + transactionId + "/confirm";
        String nonce = UUID.randomUUID().toString();

        // 建立確認資料
        ConfirmRequest request = new ConfirmRequest();
        request.setAmount(amount);
        request.setCurrency("TWD");

        String requestBody = objectMapper.writeValueAsString(request);

        // 產生簽名
        String signature = generateSignature(
                config.getChannelSecret(),
                apiPath,
                requestBody,
                nonce);

        // 設定 Headers
        HttpHeaders headers = createHeaders(signature, nonce);

        // 發送請求
        String url = config.getApiUrl() + apiPath;
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<ConfirmResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ConfirmResponse.class);

            log.info("LINE Pay 確認付款回應: {}", response.getBody());
            return response.getBody();
        } catch (Exception e) {
            log.error("LINE Pay 確認失敗", e);
            throw new Exception("LINE Pay 確認失敗: " + e.getMessage());
        }
    }

    /**
     * 建立付款請求資料
     */
    private PaymentRequest createPaymentRequest(Order order) {
        PaymentRequest request = new PaymentRequest();

        // 確保金額是整數（LINE Pay 不接受小數點）
        BigDecimal totalAmount = order.getTotalAmount().setScale(0, BigDecimal.ROUND_HALF_UP);

        request.setAmount(totalAmount);
        request.setCurrency("TWD");
        request.setOrderId(String.valueOf(order.getOrderId()));

        // 設定商品資訊 - LINE Pay 需要的是 packages 陣列，每個 package 包含 products
        List<PaymentRequest.Package> packages = new ArrayList<>();
        PaymentRequest.Package pkg = new PaymentRequest.Package();
        pkg.setId("package_" + order.getOrderId());
        pkg.setAmount(totalAmount);

        // 設定商品列表
        List<PaymentRequest.Product> products = new ArrayList<>();

        // 將每個訂單項目加入產品列表
        int productIndex = 1;
        for (OrderItem item : order.getOrderItems()) {
            PaymentRequest.Product product = new PaymentRequest.Product();
            product.setId("product_" + productIndex++);
            product.setName(item.getProductName());
            product.setQuantity(new BigDecimal(item.getQuantity()));
            product.setPrice(item.getPrice().setScale(0, BigDecimal.ROUND_HALF_UP));
            products.add(product);
        }

        pkg.setProducts(products);
        packages.add(pkg);
        request.setPackages(packages);

        // 設定重導向 URL
        PaymentRequest.RedirectUrls redirectUrls = new PaymentRequest.RedirectUrls();
        redirectUrls.setConfirmUrl(config.getConfirmUrl() + "?orderId=" + order.getOrderId());
        redirectUrls.setCancelUrl(config.getCancelUrl());
        request.setRedirectUrls(redirectUrls);

        return request;
    }

    /**
     * 產生 HMAC-SHA256 簽名
     */
    private String generateSignature(String channelSecret, String uri, String requestBody, String nonce)
            throws Exception {
        String data = channelSecret + uri + requestBody + nonce;

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(channelSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);

        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }

    /**
     * 建立 HTTP Headers
     */
    private HttpHeaders createHeaders(String signature, String nonce) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-LINE-ChannelId", config.getChannelId());
        headers.set("X-LINE-Authorization-Nonce", nonce);
        headers.set("X-LINE-Authorization", signature);

        return headers;
    }
}