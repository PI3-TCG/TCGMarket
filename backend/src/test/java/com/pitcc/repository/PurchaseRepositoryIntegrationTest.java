package com.pitcc.repository;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.Cart;
import com.pitcc.model.Checkout;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.Order;
import com.pitcc.model.OrderItem;
import com.pitcc.model.Payment;
import com.pitcc.model.PaymentMethod;
import com.pitcc.model.PaymentProvider;
import com.pitcc.model.Transaction;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class PurchaseRepositoryIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-10-26T12:00:00Z");

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CheckoutRepository checkoutRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private String buyerId;
    private String sellerId;

    @BeforeEach
    void setUp() {
        buyerId = "purchase-buyer-" + UUID.randomUUID();
        sellerId = "purchase-seller-" + UUID.randomUUID();
    }

    @AfterEach
    void tearDown() {
        cartRepository.findByUserId(buyerId).ifPresent(cartRepository::delete);

        checkoutRepository.findAll().stream()
                .filter(checkout -> checkout.getBuyerId().equals(buyerId))
                .forEach(checkoutRepository::delete);

        for (Order order : orderRepository.findAll()) {
            if (order.getBuyerId().equals(buyerId)) {
                paymentRepository.findByOrderId(order.getId()).ifPresent(paymentRepository::delete);
                orderRepository.delete(order);
            }
        }

        transactionRepository.findAll().stream()
                .filter(transaction -> transaction.getBuyerId().equals(buyerId))
                .forEach(transactionRepository::delete);
    }

    private Order savedOrder(String checkoutId) {
        CardSnapshot card = new CardSnapshot(
                "card-pikachu", "Pikachu", CardGame.POKEMON, "Base Set", "58", null,
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE
        );

        DeliveryAddress address = new DeliveryAddress(
                "Ana Souza", "01310100", "Avenida Paulista", "1000", false,
                null, "Bela Vista", "São Paulo", "SP"
        );

        return orderRepository.save(new Order(
                checkoutId,
                buyerId,
                sellerId,
                List.of(new OrderItem("ad-1", "item-1", card, 2, new BigDecimal("45.90"))),
                address,
                NOW
        ));
    }

    @Test
    void eachUserHasASingleCart() {
        cartRepository.save(new Cart(buyerId, NOW));

        assertThrows(DuplicateKeyException.class, () ->
                cartRepository.save(new Cart(buyerId, NOW))
        );
    }

    @Test
    void staleCartIsNotSavedOverANewerOne() {
        Cart saved = cartRepository.save(new Cart(buyerId, NOW));

        Cart firstTab = cartRepository.findById(saved.getId()).orElseThrow();
        Cart secondTab = cartRepository.findById(saved.getId()).orElseThrow();

        firstTab.addItem("ad-1", sellerId, 1, new BigDecimal("10.00"), 2, NOW);
        cartRepository.save(firstTab);

        secondTab.addItem("ad-2", sellerId, 1, new BigDecimal("20.00"), 2, NOW);

        assertThrows(OptimisticLockingFailureException.class, () ->
                cartRepository.save(secondTab)
        );
    }

    @Test
    void sameIdempotencyKeyDoesNotCreateASecondCheckout() {
        checkoutRepository.save(new Checkout(buyerId, "key-1", NOW));

        assertThrows(DuplicateKeyException.class, () ->
                checkoutRepository.save(new Checkout(buyerId, "key-1", NOW))
        );

        assertTrue(checkoutRepository.findByBuyerIdAndIdempotencyKey(buyerId, "key-1").isPresent());
    }

    @Test
    void orderKeepsExactAmountsAndCopiedData() {
        Order order = savedOrder("checkout-" + UUID.randomUUID());

        Order reloaded = orderRepository.findById(order.getId()).orElseThrow();

        assertEquals(new BigDecimal("91.80"), reloaded.getTotalAmount());
        assertEquals("Pikachu", reloaded.getItems().getFirst().getCard().getName());
        assertEquals("01310100", reloaded.getDeliveryAddress().getZipCode());
    }

    @Test
    void orderHasASinglePaymentAttempt() {
        Order order = savedOrder("checkout-" + UUID.randomUUID());

        paymentRepository.save(new Payment(order, PaymentProvider.SIMULATED, PaymentMethod.PIX, NOW));

        assertThrows(DuplicateKeyException.class, () ->
                paymentRepository.save(
                        new Payment(order, PaymentProvider.SIMULATED, PaymentMethod.PIX, NOW)
                )
        );
    }

    @Test
    void paymentsWithoutGatewayIdDoNotCollide() {
        Order first = savedOrder("checkout-" + UUID.randomUUID());
        Order second = savedOrder("checkout-" + UUID.randomUUID());

        paymentRepository.save(new Payment(first, PaymentProvider.SIMULATED, PaymentMethod.PIX, NOW));

        assertDoesNotThrow(() -> paymentRepository.save(
                new Payment(second, PaymentProvider.SIMULATED, PaymentMethod.PIX, NOW)
        ));
    }

    @Test
    void completingTheSameOrderTwiceDoesNotDuplicateHistory() {
        Order order = savedOrder("checkout-" + UUID.randomUUID());
        order.markPaid(NOW);

        transactionRepository.save(Transaction.fromPaidOrder(order, NOW));

        assertThrows(DuplicateKeyException.class, () ->
                transactionRepository.save(Transaction.fromPaidOrder(order, NOW))
        );
    }
}
