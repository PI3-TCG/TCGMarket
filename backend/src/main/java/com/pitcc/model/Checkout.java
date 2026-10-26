package com.pitcc.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Uma ação "Simular pagamento" do comprador. Agrupa os pedidos gerados
 * (um por vendedor) e garante que reenviar a mesma requisição não crie
 * pedidos duplicados: a chave de idempotência é única por comprador.
 */
@Document(collection = "checkouts")
@CompoundIndex(
        name = "uk_checkouts_buyer_idempotency_key",
        def = "{'buyerId': 1, 'idempotencyKey': 1}",
        unique = true
)
public class Checkout {

    @Id
    private String id;

    private String buyerId;
    private String idempotencyKey;
    private Instant createdAt;

    protected Checkout() {
    }

    public Checkout(String buyerId, String idempotencyKey, Instant now) {
        if (buyerId == null || buyerId.isBlank()) {
            throw new IllegalArgumentException("O comprador é obrigatório.");
        }

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("A chave de idempotência é obrigatória.");
        }

        this.buyerId = buyerId;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = now;
    }

    public String getId() {
        return id;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
