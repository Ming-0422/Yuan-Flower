package com.example.yuan.service;

import com.example.yuan.model.Order;
import com.example.yuan.model.OrderItem;
import com.linecorp.bot.client.LineMessagingClient;
import com.linecorp.bot.model.PushMessage;
import com.linecorp.bot.model.message.FlexMessage;
import com.linecorp.bot.model.message.TextMessage;
import com.linecorp.bot.model.message.flex.component.*;
import com.linecorp.bot.model.message.flex.container.Bubble;
import com.linecorp.bot.model.message.flex.container.FlexContainer;
import com.linecorp.bot.model.message.flex.unit.*;
import com.linecorp.bot.model.message.flex.properties.BlockStyle; // <--- 確保這行有引入
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class LineBotService {

    private final LineMessagingClient lineMessagingClient;

    @Value("${line.bot.channel-token}")
    private String channelToken;

    @Value("${line.bot.admin-user-id}")
    private String adminUserId; // 管理員的 LINE User ID

    public LineBotService(LineMessagingClient lineMessagingClient) {
        this.lineMessagingClient = lineMessagingClient;
    }

    public CompletableFuture<String> sendOrderNotification(Order order) {
        try {
            // 建立 Flex Message
            FlexMessage flexMessage = buildOrderFlexMessage(order);

            // 發送給管理員
            PushMessage pushMessage = new PushMessage(adminUserId, flexMessage);

            return lineMessagingClient.pushMessage(pushMessage)
                .thenApply(response -> {
                    System.out.println("LINE Bot 通知發送成功");
                    return "success";
                })
                .exceptionally(throwable -> {
                    System.err.println("LINE Bot 通知發送失敗: " + throwable.getMessage());
                    throwable.printStackTrace();
                    // 如果 Flex Message 失敗，嘗試發送純文字訊息
                    sendSimpleTextNotification(order);
                    return "failed";
                });
        } catch (Exception e) {
            System.err.println("建立 LINE Bot 訊息失敗: " + e.getMessage());
            e.printStackTrace();
            // 發送簡單文字訊息作為備用方案
            sendSimpleTextNotification(order);
            return CompletableFuture.completedFuture("failed");
        }
    }

    private void sendSimpleTextNotification(Order order) {
        String message = buildSimpleOrderMessage(order);
        TextMessage textMessage = new TextMessage(message);
        PushMessage pushMessage = new PushMessage(adminUserId, textMessage);

        lineMessagingClient.pushMessage(pushMessage)
            .exceptionally(throwable -> {
                System.err.println("簡單文字訊息也發送失敗: " + throwable.getMessage());
                return null;
            });
    }

    private FlexMessage buildOrderFlexMessage(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        // Header
        Box headerBox = Box.builder()
            .layout(FlexLayout.VERTICAL)
            .contents(Arrays.asList(
                Text.builder()
                    .text("🌸 新訂單通知")
                    .weight(Text.TextWeight.BOLD)
                    .size(FlexFontSize.LG)
                    .color("#ff6b9d")
                    .build(),
                Text.builder()
                    .text("訂單編號 #" + order.getOrderId())
                    .size(FlexFontSize.SM)
                    .color("#888888")
                    .margin(FlexMarginSize.MD)
                    .build()
            ))
            // 在這裡直接為 headerBox 設定背景色
            .styles(BlockStyle.builder().backgroundColor("#ffeef8").build()) // <-- 這裡不同
            .build();

        // Body components
        List<FlexComponent> bodyContents = new ArrayList<>();

        // 訂單資訊
        bodyContents.add(createInfoBox("📅 訂單時間", order.getOrderDate().format(formatter)));
        bodyContents.add(createSeparator());

        // 顧客資料
        bodyContents.add(createSectionTitle("👤 顧客資料"));
        bodyContents.add(createInfoBox("姓名", order.getCustomerName()));
        bodyContents.add(createInfoBox("電話", order.getCustomerPhone()));
        bodyContents.add(createInfoBox("Email", order.getCustomerEmail()));
        bodyContents.add(createSeparator());

        // 收件資料
        bodyContents.add(createSectionTitle("📦 收件資料"));
        bodyContents.add(createInfoBox("收件人", order.getRecipientName()));
        bodyContents.add(createInfoBox("電話", order.getRecipientPhone()));
        bodyContents.add(createInfoBox("地址", order.getShippingAddress()));
        bodyContents.add(createInfoBox("運送方式", order.getShippingMethod()));

        if (order.getDeliveryDate() != null) {
            bodyContents.add(createInfoBox("希望到貨日",
                order.getDeliveryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))));
        }
        bodyContents.add(createSeparator());

        // 訂單明細
        bodyContents.add(createSectionTitle("🛒 訂單明細"));
        for (OrderItem item : order.getOrderItems()) {
            bodyContents.add(createOrderItemBox(item));
        }

        // 運費
        bodyContents.add(createInfoBox("運費", "NT$ " + order.getShippingFee()));
        bodyContents.add(createSeparator());

        // 總金額
        bodyContents.add(Box.builder()
            .layout(FlexLayout.HORIZONTAL)
            .contents(Arrays.asList(
                Text.builder()
                    .text("總計")
                    .size(FlexFontSize.LG)
                    .weight(Text.TextWeight.BOLD)
                    .flex(1)
                    .build(),
                Text.builder()
                    .text("NT$ " + order.getTotalAmount())
                    .size(FlexFontSize.LG)
                    .weight(Text.TextWeight.BOLD)
                    .color("#ff6b9d")
                    .align(FlexAlign.END)
                    .build()
            ))
            .margin(FlexMarginSize.LG)
            .build());

        // 備註
        if (order.getOrderNotes() != null && !order.getOrderNotes().isEmpty()) {
            bodyContents.add(createSeparator());
            bodyContents.add(createSectionTitle("📝 備註"));
            bodyContents.add(Text.builder()
                .text(order.getOrderNotes())
                .size(FlexFontSize.SM)
                .color("#666666")
                .wrap(true)
                .build());
        }

        // Footer
        Box footerBox = Box.builder()
            .layout(FlexLayout.VERTICAL)
            .contents(Arrays.asList(
                createInfoBox("付款方式", order.getPaymentMethod()),
                createInfoBox("付款狀態", order.getPaymentStatus())
            ))
            // 在這裡直接為 footerBox 設定背景色
            .styles(BlockStyle.builder().backgroundColor("#f9f9f9").build()) // <-- 這裡不同
            .build();

        // 建立 Bubble
        Bubble bubble = Bubble.builder()
            .header(headerBox)
            .body(Box.builder()
                .layout(FlexLayout.VERTICAL)
                .contents(bodyContents)
                .build())
            .footer(footerBox)
            // 將這整個 .styles(Bubble.BubbleStyle.builder()...) 區塊完全刪除
            .build();

        return FlexMessage.builder()
            .altText("新訂單通知 #" + order.getOrderId())
            .contents(bubble)
            .build();
    }

    private Box createInfoBox(String label, String value) {
        return Box.builder()
            .layout(FlexLayout.HORIZONTAL)
            .contents(Arrays.asList(
                Text.builder()
                    .text(label)
                    .size(FlexFontSize.SM)
                    .color("#888888")
                    .flex(2)
                    .build(),
                Text.builder()
                    .text(value)
                    .size(FlexFontSize.SM)
                    .flex(3)
                    .wrap(true)
                    .build()
            ))
            .margin(FlexMarginSize.SM)
            .build();
    }

    private Text createSectionTitle(String title) {
        return Text.builder()
            .text(title)
            .weight(Text.TextWeight.BOLD)
            .size(FlexFontSize.MD)
            .margin(FlexMarginSize.LG)
            .build();
    }

    private Separator createSeparator() {
        return Separator.builder()
            .margin(FlexMarginSize.LG)
            .build();
    }

    private Box createOrderItemBox(OrderItem item) {
        return Box.builder()
            .layout(FlexLayout.HORIZONTAL)
            .contents(Arrays.asList(
                Text.builder()
                    .text(item.getProductName() + " x" + item.getQuantity())
                    .size(FlexFontSize.SM)
                    .flex(3)
                    .wrap(true)
                    .build(),
                Text.builder()
                    .text("NT$ " + item.getSubtotal())
                    .size(FlexFontSize.SM)
                    .align(FlexAlign.END)
                    .build()
            ))
            .margin(FlexMarginSize.SM)
            .build();
    }

    private String buildSimpleOrderMessage(Order order) {
        StringBuilder message = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        message.append("🌸 新訂單通知 🌸\n");
        message.append("================\n\n");

        // 訂單基本資訊
        message.append("📋 訂單編號: #").append(order.getOrderId()).append("\n");
        message.append("📅 訂單時間: ").append(order.getOrderDate().format(formatter)).append("\n");
        message.append("💰 總金額: NT$ ").append(order.getTotalAmount()).append("\n\n");

        // 顧客資料
        message.append("👤 顧客資料:\n");
        message.append("姓名: ").append(order.getCustomerName()).append("\n");
        message.append("電話: ").append(order.getCustomerPhone()).append("\n");
        message.append("Email: ").append(order.getCustomerEmail()).append("\n\n");

        // 收件人資料
        message.append("📦 收件人資料:\n");
        message.append("收件人: ").append(order.getRecipientName()).append("\n");
        message.append("電話: ").append(order.getRecipientPhone()).append("\n");
        message.append("地址: ").append(order.getShippingAddress()).
                append("\n");
        message.append("運送方式: ").append(order.getShippingMethod()).append("\n");

        if (order.getDeliveryDate() != null) {
            message.append("希望到貨日: ").append(order.getDeliveryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))).append("\n");
        }
        if (order.getDeliveryTime() != null && !order.getDeliveryTime().isEmpty()) {
            message.append("希望時段: ").append(order.getDeliveryTime()).append("\n");
        }
        message.append("\n");

        // 訂單明細
        message.append("🛒 訂單明細:\n");
        for (OrderItem item : order.getOrderItems()) {
            message.append("• ").append(item.getProductName())
                    .append(" x").append(item.getQuantity())
                    .append(" = NT$ ").append(item.getSubtotal())
                    .append("\n");
        }

        message.append("\n運費: NT$ ").append(order.getShippingFee()).append("\n");
        message.append("================\n");
        message.append("總計: NT$ ").append(order.getTotalAmount()).append("\n");

        // 備註
        if (order.getOrderNotes() != null && !order.getOrderNotes().isEmpty()) {
            message.append("\n📝 備註: ").append(order.getOrderNotes()).append("\n");
        }

        message.append("\n💳 付款方式: ").append(order.getPaymentMethod());
        message.append("\n💵 付款狀態: ").append(order.getPaymentStatus());

        return message.toString();
    }
}