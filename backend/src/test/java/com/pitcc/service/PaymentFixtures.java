package com.pitcc.service;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentMethod;
import com.pitcc.model.PaymentProvider;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.test.util.ReflectionTestUtils;

final class PaymentFixtures {

  static final String BUYER = "buyer-1";

  private PaymentFixtures() {}

  static Order order(String id) {
    CardSnapshot card =
        new CardSnapshot(
            "card-1", "Dark Magician", CardGame.YUGIOH, "Starter", "006", null,
            CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
    DeliveryAddress address =
        new DeliveryAddress("Ana", "01001000", "Rua A", "10", false, null, "Centro", "São Paulo", "SP");
    Order order =
        new Order(
            "checkout-1", BUYER, "seller-1",
            List.of(
                new OrderItem("ad-1", "item-1", card, 2, new BigDecimal("10.00")),
                new OrderItem("ad-2", "item-2", card, 1, new BigDecimal("5.00"))),
            address, Instant.now());
    ReflectionTestUtils.setField(order, "id", id);
    return order;
  }

  static Payment payment(Order order, PaymentProvider provider) {
    Payment payment = new Payment(order, provider, PaymentMethod.PIX, Instant.now());
    ReflectionTestUtils.setField(payment, "id", "pay-" + order.getId());
    return payment;
  }
}
