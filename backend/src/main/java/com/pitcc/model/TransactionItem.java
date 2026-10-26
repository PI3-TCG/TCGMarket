package com.pitcc.model;

import java.math.BigDecimal;

import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Cartas que passaram de um usuário para outro. A direção explícita permite
 * representar vendas (vendedor → comprador) e trocas (os dois sentidos).
 */
public class TransactionItem {

    private String adId;
    private String fromUserId;
    private String toUserId;
    private CardSnapshot card;
    private int quantity;

    // Nulo quando a carta é trocada sem preço.
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    protected TransactionItem() {
    }

    public TransactionItem(
            String adId,
            String fromUserId,
            String toUserId,
            CardSnapshot card,
            int quantity,
            BigDecimal unitPrice
    ) {
        if (fromUserId == null || toUserId == null || fromUserId.equals(toUserId)) {
            throw new IllegalArgumentException("Informe usuários de origem e destino diferentes.");
        }

        if (card == null) {
            throw new IllegalArgumentException("Os dados da carta são obrigatórios.");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade precisa ser maior que zero.");
        }

        this.adId = adId;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.card = card;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getAdId() {
        return adId;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public String getToUserId() {
        return toUserId;
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
}
