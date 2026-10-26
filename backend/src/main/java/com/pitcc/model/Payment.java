package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Tentativa de pagamento de um pedido. Guarda apenas identificadores e
 * status do gateway; nenhum dado de cartão é armazenado (RNF03).
 *
 * <p>Cada pedido tem uma única tentativa. Depois de uma recusa, "Tentar
 * novamente" gera um novo checkout, que revalida preço e disponibilidade.
 */
@Document(collection = "payments")
@CompoundIndex(
        name = "payments_status_created_at",
        def = "{'status': 1, 'createdAt': 1}"
)
public class Payment {

    @Id
    private String id;

    @Indexed(name = "uk_payments_order", unique = true)
    private String orderId;

    private String buyerId;

    // Enviada ao gateway (X-Idempotency-Key): reenviar a criação não duplica a cobrança.
    @Indexed(name = "uk_payments_idempotency_key", unique = true)
    private String idempotencyKey;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    private PaymentProvider provider;
    private PaymentMethod method;
    private PaymentStatus status;

    @Indexed(name = "uk_payments_provider_payment", unique = true, sparse = true)
    private String providerPaymentId;

    private String providerStatusDetail;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    @Version
    private Long version;

    protected Payment() {
    }

    public Payment(
            Order order,
            PaymentProvider provider,
            PaymentMethod method,
            Instant now
    ) {
        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException("O pagamento precisa de um pedido salvo.");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("O pedido não está aguardando pagamento.");
        }

        if (provider == null || method == null) {
            throw new IllegalArgumentException("Informe o provedor e o método de pagamento.");
        }

        this.orderId = order.getId();
        this.buyerId = order.getBuyerId();
        this.amount = order.getTotalAmount();
        this.idempotencyKey = UUID.randomUUID().toString();
        this.provider = provider;
        this.method = method;
        this.status = PaymentStatus.PENDING;
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Registra o id devolvido pelo gateway; reenviar o mesmo id não muda nada. */
    public void registerProviderPayment(String providerPaymentId, Instant now) {
        if (providerPaymentId == null || providerPaymentId.isBlank()) {
            throw new IllegalArgumentException("O identificador do gateway é obrigatório.");
        }

        if (this.providerPaymentId != null) {
            if (!this.providerPaymentId.equals(providerPaymentId)) {
                throw new IllegalStateException("O pagamento já está vinculado a outra cobrança.");
            }

            return;
        }

        this.providerPaymentId = providerPaymentId;
        this.updatedAt = now;
    }

    /**
     * Aplica o resultado do gateway uma única vez.
     *
     * @return {@code false} se o mesmo resultado já tinha sido aplicado
     */
    public boolean resolve(PaymentStatus result, String providerStatusDetail, Instant now) {
        if (result == null || !result.isFinal()) {
            throw new IllegalArgumentException("Informe um resultado final de pagamento.");
        }

        if (status == result) {
            return false;
        }

        if (status.isFinal()) {
            throw new IllegalStateException(
                    "O pagamento já foi finalizado como " + status + "."
            );
        }

        this.status = result;
        this.providerStatusDetail = providerStatusDetail;
        this.resolvedAt = now;
        this.updatedAt = now;
        return true;
    }

    public String getId() {
        return id;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public String getProviderStatusDetail() {
        return providerStatusDetail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public Long getVersion() {
        return version;
    }
}
