package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Linha do carrinho, identificada pelo anúncio.
 * Não reserva exemplares: a quantidade pode ficar acima da disponibilidade
 * atual, e o checkout revalida antes de criar o pedido.
 */
public class CartItem {

    private String adId;
    private String sellerId;
    private int quantity;

    // Preço que o comprador viu ou aceitou; o checkout compara com o preço atual.
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal acceptedUnitPrice;

    private boolean selected;
    private Instant addedAt;
    private Instant updatedAt;

    protected CartItem() {
    }

    CartItem(
            String adId,
            String sellerId,
            int quantity,
            BigDecimal acceptedUnitPrice,
            Instant now
    ) {
        this.adId = adId;
        this.sellerId = sellerId;
        this.quantity = quantity;
        this.acceptedUnitPrice = acceptedUnitPrice;
        this.selected = true;
        this.addedAt = now;
        this.updatedAt = now;
    }

    void changeQuantity(int quantity, Instant now) {
        this.quantity = quantity;
        this.updatedAt = now;
    }

    void acceptPrice(BigDecimal unitPrice, Instant now) {
        this.acceptedUnitPrice = unitPrice;
        this.updatedAt = now;
    }

    void select(boolean selected, Instant now) {
        this.selected = selected;
        this.updatedAt = now;
    }

    public BigDecimal subtotal() {
        return acceptedUnitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public String getAdId() {
        return adId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getAcceptedUnitPrice() {
        return acceptedUnitPrice;
    }

    public boolean isSelected() {
        return selected;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
