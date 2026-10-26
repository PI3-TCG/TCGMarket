package com.pitcc.model;

import java.time.Instant;

/**
 * Exemplares de um anúncio separados para um pedido enquanto o pagamento
 * está pendente. Identificar a reserva pelo pedido torna reservar, liberar
 * e consumir idempotentes: a operação só tem efeito se a reserva existir
 * (ou ainda não existir, no caso de reservar).
 */
public class AdPurchaseHold {

    private String orderId;
    private int quantity;
    private Instant createdAt;

    protected AdPurchaseHold() {
    }

    public AdPurchaseHold(String orderId, int quantity, Instant now) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("O pedido da reserva é obrigatório.");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("A reserva precisa ter quantidade positiva.");
        }

        this.orderId = orderId;
        this.quantity = quantity;
        this.createdAt = now;
    }

    public String getOrderId() {
        return orderId;
    }

    public int getQuantity() {
        return quantity;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
