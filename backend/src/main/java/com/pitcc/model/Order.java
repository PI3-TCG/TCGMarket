package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Pedido de um comprador a um único vendedor. Um checkout com anúncios de
 * vendedores diferentes gera um pedido por vendedor, cada um com seu
 * pagamento e seu resultado.
 *
 * <p>As transições devolvem {@code false} quando o pedido já está no estado
 * pedido, para que webhooks e reprocessamentos repetidos não tenham efeito.
 */
@Document(collection = "orders")
@CompoundIndexes({
        @CompoundIndex(name = "orders_checkout", def = "{'checkoutId': 1}"),
        @CompoundIndex(name = "orders_buyer_created_at", def = "{'buyerId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "orders_seller_created_at", def = "{'sellerId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "orders_status_updated_at", def = "{'status': 1, 'updatedAt': 1}")
})
public class Order {

    @Id
    private String id;

    private String checkoutId;
    private String buyerId;
    private String sellerId;

    private List<OrderItem> items;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal totalAmount;

    private DeliveryAddress deliveryAddress;

    private OrderStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant paidAt;
    private Instant completedAt;
    private Instant failedAt;

    @Version
    private Long version;

    protected Order() {
    }

    public Order(
            String checkoutId,
            String buyerId,
            String sellerId,
            List<OrderItem> items,
            DeliveryAddress deliveryAddress,
            Instant now
    ) {
        if (checkoutId == null || checkoutId.isBlank()) {
            throw new IllegalArgumentException("O checkout do pedido é obrigatório.");
        }

        if (buyerId == null || buyerId.isBlank()) {
            throw new IllegalArgumentException("O comprador é obrigatório.");
        }

        if (sellerId == null || sellerId.isBlank()) {
            throw new IllegalArgumentException("O vendedor é obrigatório.");
        }

        if (buyerId.equals(sellerId)) {
            throw new IllegalArgumentException("Não é possível comprar o próprio anúncio.");
        }

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("O pedido precisa ter ao menos um item.");
        }

        Set<String> adIds = new HashSet<>();

        for (OrderItem item : items) {
            if (!adIds.add(item.getAdId())) {
                throw new IllegalArgumentException("Cada anúncio aparece uma única vez no pedido.");
            }
        }

        if (deliveryAddress == null) {
            throw new IllegalArgumentException("O endereço de entrega é obrigatório.");
        }

        this.checkoutId = checkoutId;
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.items = List.copyOf(items);
        this.totalAmount = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.deliveryAddress = deliveryAddress;
        this.status = OrderStatus.PENDING_PAYMENT;
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Pagamento aprovado. */
    public boolean markPaid(Instant now) {
        if (status == OrderStatus.PAID || status == OrderStatus.COMPLETED) {
            return false;
        }

        requireStatus(OrderStatus.PENDING_PAYMENT);

        this.status = OrderStatus.PAID;
        this.paidAt = now;
        this.updatedAt = now;
        return true;
    }

    /** Pagamento recusado, cancelado ou expirado. */
    public boolean markPaymentFailed(Instant now) {
        if (status == OrderStatus.PAYMENT_FAILED) {
            return false;
        }

        requireStatus(OrderStatus.PENDING_PAYMENT);

        this.status = OrderStatus.PAYMENT_FAILED;
        this.failedAt = now;
        this.updatedAt = now;
        return true;
    }

    /** Cartas transferidas ao comprador e transação registrada. */
    public boolean complete(Instant now) {
        if (status == OrderStatus.COMPLETED) {
            return false;
        }

        requireStatus(OrderStatus.PAID);

        this.status = OrderStatus.COMPLETED;
        this.completedAt = now;
        this.updatedAt = now;
        return true;
    }

    private void requireStatus(OrderStatus expected) {
        if (status != expected) {
            throw new IllegalStateException(
                    "O pedido está " + status + " e não pode sair desse estado."
            );
        }
    }

    public String getId() {
        return id;
    }

    public String getCheckoutId() {
        return checkoutId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public DeliveryAddress getDeliveryAddress() {
        return deliveryAddress;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getFailedAt() {
        return failedAt;
    }

    public Long getVersion() {
        return version;
    }
}
