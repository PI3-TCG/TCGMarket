package com.pitcc.model;

import java.math.BigDecimal;

import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Item do pedido com preço e carta copiados no checkout.
 * As referências ao anúncio e ao item da coleção servem para baixar a
 * quantidade e transferir as cartas, não para exibir o histórico.
 */
public class OrderItem {

    private String adId;
    private String collectionItemId;
    private CardSnapshot card;
    private int quantity;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal subtotal;

    protected OrderItem() {
    }

    public OrderItem(
            String adId,
            String collectionItemId,
            CardSnapshot card,
            int quantity,
            BigDecimal unitPrice
    ) {
        if (adId == null || adId.isBlank()) {
            throw new IllegalArgumentException("O anúncio do item é obrigatório.");
        }

        if (collectionItemId == null || collectionItemId.isBlank()) {
            throw new IllegalArgumentException("O item da coleção do vendedor é obrigatório.");
        }

        if (card == null) {
            throw new IllegalArgumentException("Os dados da carta são obrigatórios.");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade precisa ser maior que zero.");
        }

        if (unitPrice == null || unitPrice.signum() <= 0) {
            throw new IllegalArgumentException("O preço unitário precisa ser maior que zero.");
        }

        this.adId = adId;
        this.collectionItemId = collectionItemId;
        this.card = card;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public String getAdId() {
        return adId;
    }

    public String getCollectionItemId() {
        return collectionItemId;
    }

    public CardSnapshot getCard() {
        return card;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}
