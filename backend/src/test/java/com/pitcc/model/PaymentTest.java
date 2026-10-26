package com.pitcc.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static com.pitcc.model.PurchaseFixtures.NOW;
import static com.pitcc.model.PurchaseFixtures.item;
import static com.pitcc.model.PurchaseFixtures.savedOrder;
import static org.junit.jupiter.api.Assertions.*;

class PaymentTest {

    private Payment pendingPayment() {
        return new Payment(
                savedOrder(item("pikachu", 2, "45.00")),
                PaymentProvider.SIMULATED,
                PaymentMethod.PIX,
                NOW
        );
    }

    @Test
    void copiesOrderAmountAndGeneratesIdempotencyKey() {
        Payment payment = pendingPayment();

        assertEquals("order-1", payment.getOrderId());
        assertEquals("buyer", payment.getBuyerId());
        assertEquals(0, payment.getAmount().compareTo(new BigDecimal("90.00")));
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        assertNotNull(payment.getIdempotencyKey());
        assertNotEquals(payment.getIdempotencyKey(), pendingPayment().getIdempotencyKey());
    }

    @Test
    void requiresSavedOrderWaitingForPayment() {
        Order paid = savedOrder(item("pikachu", 1, "45.00"));
        paid.markPaid(NOW);

        assertThrows(IllegalArgumentException.class, () ->
                new Payment(paid, PaymentProvider.SIMULATED, PaymentMethod.PIX, NOW)
        );
    }

    @Test
    void repeatedResultIsIgnoredAndFinalResultDoesNotChange() {
        Payment payment = pendingPayment();

        assertTrue(payment.resolve(PaymentStatus.APPROVED, "accredited", NOW));
        assertFalse(payment.resolve(PaymentStatus.APPROVED, "accredited", NOW));
        assertThrows(IllegalStateException.class, () ->
                payment.resolve(PaymentStatus.REJECTED, "failed", NOW)
        );

        assertEquals(PaymentStatus.APPROVED, payment.getStatus());
        assertEquals(NOW, payment.getResolvedAt());
    }

    @Test
    void pendingIsNotAResult() {
        assertThrows(IllegalArgumentException.class, () ->
                pendingPayment().resolve(PaymentStatus.PENDING, null, NOW)
        );
    }

    @Test
    void providerPaymentIdIsSetOnce() {
        Payment payment = pendingPayment();

        payment.registerProviderPayment("mp-123", NOW);
        payment.registerProviderPayment("mp-123", NOW);

        assertEquals("mp-123", payment.getProviderPaymentId());
        assertThrows(IllegalStateException.class, () ->
                payment.registerProviderPayment("mp-456", NOW)
        );
    }
}
