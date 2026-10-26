package com.pitcc.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static com.pitcc.model.PurchaseFixtures.NOW;
import static com.pitcc.model.PurchaseFixtures.address;
import static com.pitcc.model.PurchaseFixtures.item;
import static com.pitcc.model.PurchaseFixtures.savedOrder;
import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    @Test
    void computesTotalFromCopiedPricesAndStartsPendingPayment() {
        Order order = savedOrder(item("pikachu", 2, "45.00"), item("sol-ring", 1, "25.00"));

        assertEquals(0, new BigDecimal("115.00").compareTo(order.getTotalAmount()));
        assertEquals(OrderStatus.PENDING_PAYMENT, order.getStatus());
        assertEquals("01310100", order.getDeliveryAddress().getZipCode());
        assertEquals("SP", order.getDeliveryAddress().getState());
    }

    @Test
    void rejectsBuyingFromYourselfEmptyOrdersAndRepeatedAds() {
        assertThrows(IllegalArgumentException.class, () -> new Order(
                "checkout-1", "same", "same", List.of(item("a", 1, "10.00")), address(), NOW
        ));

        assertThrows(IllegalArgumentException.class, () -> new Order(
                "checkout-1", "buyer", "seller", List.of(), address(), NOW
        ));

        assertThrows(IllegalArgumentException.class, () -> new Order(
                "checkout-1", "buyer", "seller",
                List.of(item("a", 1, "10.00"), item("a", 2, "10.00")),
                address(), NOW
        ));
    }

    @Test
    void approvedPathIsIdempotent() {
        Order order = savedOrder(item("pikachu", 1, "45.00"));

        assertTrue(order.markPaid(NOW));
        assertFalse(order.markPaid(NOW));
        assertTrue(order.complete(NOW));
        assertFalse(order.complete(NOW));
        assertFalse(order.markPaid(NOW));

        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        assertNotNull(order.getPaidAt());
        assertNotNull(order.getCompletedAt());
    }

    @Test
    void finalStatusesDoNotGoBack() {
        Order failed = savedOrder(item("pikachu", 1, "45.00"));

        assertTrue(failed.markPaymentFailed(NOW));
        assertFalse(failed.markPaymentFailed(NOW));
        assertThrows(IllegalStateException.class, () -> failed.markPaid(NOW));
        assertThrows(IllegalStateException.class, () -> failed.complete(NOW));

        Order paid = savedOrder(item("pikachu", 1, "45.00"));
        paid.markPaid(NOW);

        assertThrows(IllegalStateException.class, () -> paid.markPaymentFailed(NOW));
    }

    @Test
    void cannotCompleteBeforePayment() {
        Order order = savedOrder(item("pikachu", 1, "45.00"));

        assertThrows(IllegalStateException.class, () -> order.complete(NOW));
    }
}
