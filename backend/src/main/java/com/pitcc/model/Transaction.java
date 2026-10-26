package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Registro imutável de uma negociação concluída, usado no histórico de
 * compras, vendas e trocas. É criado na conclusão e não depende do estado
 * atual do anúncio nem do pedido.
 *
 * <p>A origem é única por tipo: concluir o mesmo pedido de novo esbarra no
 * índice e não duplica o histórico.
 */
@Document(collection = "transactions")
@CompoundIndexes({
        @CompoundIndex(
                name = "uk_transactions_source",
                def = "{'type': 1, 'sourceId': 1}",
                unique = true
        ),
        @CompoundIndex(
                name = "transactions_buyer_completed_at",
                def = "{'buyerId': 1, 'completedAt': -1}"
        ),
        @CompoundIndex(
                name = "transactions_seller_completed_at",
                def = "{'sellerId': 1, 'completedAt': -1}"
        )
})
public class Transaction {

    @Id
    private String id;

    private TransactionType type;

    // Pedido que originou a venda (ou, no futuro, a proposta de troca).
    private String sourceId;

    private String sellerId;
    private String buyerId;

    private List<TransactionItem> items;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal totalAmount;

    private Instant completedAt;

    protected Transaction() {
    }

    public static Transaction fromPaidOrder(Order order, Instant now) {
        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException("A transação precisa de um pedido salvo.");
        }

        if (order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Só pedidos pagos geram transação.");
        }

        Transaction transaction = new Transaction();

        transaction.type = TransactionType.SALE;
        transaction.sourceId = order.getId();
        transaction.sellerId = order.getSellerId();
        transaction.buyerId = order.getBuyerId();
        transaction.items = order.getItems().stream()
                .map(item -> new TransactionItem(
                        item.getAdId(),
                        order.getSellerId(),
                        order.getBuyerId(),
                        item.getCard(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .toList();
        transaction.totalAmount = order.getTotalAmount();
        transaction.completedAt = now;

        return transaction;
    }

    public String getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public String getSourceId() {
        return sourceId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public List<TransactionItem> getItems() {
        return items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
