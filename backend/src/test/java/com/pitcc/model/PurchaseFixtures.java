package com.pitcc.model;

import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

final class PurchaseFixtures {

    static final Instant NOW = Instant.parse("2026-10-26T12:00:00Z");

    private PurchaseFixtures() {
    }

    static CardSnapshot pikachu() {
        return new CardSnapshot(
                "card-pikachu",
                "Pikachu",
                CardGame.POKEMON,
                "Base Set",
                "58",
                "https://example.com/pikachu.png",
                CardCondition.NEAR_MINT,
                CardLanguage.PORTUGUESE
        );
    }

    static DeliveryAddress address() {
        return new DeliveryAddress(
                "Ana Souza",
                "01310-100",
                "Avenida Paulista",
                "1000",
                false,
                null,
                "Bela Vista",
                "São Paulo",
                "sp"
        );
    }

    static OrderItem item(String adId, int quantity, String unitPrice) {
        return new OrderItem(
                adId,
                "collection-" + adId,
                pikachu(),
                quantity,
                new BigDecimal(unitPrice)
        );
    }

    static Order savedOrder(OrderItem... items) {
        Order order = new Order(
                "checkout-1",
                "buyer",
                "seller",
                List.of(items),
                address(),
                NOW
        );

        ReflectionTestUtils.setField(order, "id", "order-1");
        return order;
    }
}
