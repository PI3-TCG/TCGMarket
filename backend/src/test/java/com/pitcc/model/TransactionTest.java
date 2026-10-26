package com.pitcc.model;

import org.junit.jupiter.api.Test;

import static com.pitcc.model.PurchaseFixtures.NOW;
import static com.pitcc.model.PurchaseFixtures.item;
import static com.pitcc.model.PurchaseFixtures.savedOrder;
import static org.junit.jupiter.api.Assertions.*;

class TransactionTest {

    @Test
    void paidOrderBecomesSaleWithCopiedItems() {
        Order order = savedOrder(item("pikachu", 2, "45.00"));
        order.markPaid(NOW);

        Transaction transaction = Transaction.fromPaidOrder(order, NOW);

        assertEquals(TransactionType.SALE, transaction.getType());
        assertEquals("order-1", transaction.getSourceId());
        assertEquals("seller", transaction.getSellerId());
        assertEquals("buyer", transaction.getBuyerId());
        assertEquals(0, order.getTotalAmount().compareTo(transaction.getTotalAmount()));

        TransactionItem copied = transaction.getItems().getFirst();

        assertEquals("seller", copied.getFromUserId());
        assertEquals("buyer", copied.getToUserId());
        assertEquals("Pikachu", copied.getCard().getName());
        assertEquals(2, copied.getQuantity());
    }

    @Test
    void unpaidOrFailedOrdersDoNotGenerateTransactions() {
        Order pending = savedOrder(item("pikachu", 1, "45.00"));

        assertThrows(IllegalArgumentException.class, () ->
                Transaction.fromPaidOrder(pending, NOW)
        );

        pending.markPaymentFailed(NOW);

        assertThrows(IllegalArgumentException.class, () ->
                Transaction.fromPaidOrder(pending, NOW)
        );
    }
}
