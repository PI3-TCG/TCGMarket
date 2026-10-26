
package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

public class AdReservation {

    private String adId;
    private int quantity;
    private AdReservationStatus status;

    private boolean saleEnabled;
    private boolean tradeEnabled;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    private String pendingOperationId;
    private Integer pendingQuantity;
    private Boolean pendingSaleEnabled;
    private Boolean pendingTradeEnabled;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal pendingUnitPrice;

    private Instant createdAt;
    private Instant updatedAt;

    protected AdReservation() {
    }

    public AdReservation(
            String adId,
            int quantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice,
            Instant now
    ) {
        if (adId == null || adId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador do anúncio obrigatório."
            );
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "A reserva precisa ter quantidade positiva."
            );
        }

        if (!saleEnabled && !tradeEnabled) {
            throw new IllegalArgumentException(
                    "Selecione ao menos uma modalidade."
            );
        }

        if (saleEnabled &&
                (unitPrice == null || unitPrice.signum() <= 0)) {
            throw new IllegalArgumentException(
                    "Informe um preço válido."
            );
        }

        if (now == null) {
            throw new IllegalArgumentException(
                    "Informe a data da operação."
            );
        }

        this.adId = adId;
        this.quantity = quantity;
        this.status = AdReservationStatus.PENDING_CREATION;
        this.saleEnabled = saleEnabled;
        this.tradeEnabled = tradeEnabled;
        this.unitPrice = saleEnabled ? unitPrice : null;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public String getAdId() {
        return adId;
    }

    public int getQuantity() {
        return quantity;
    }

    public AdReservationStatus getStatus() {
        return status;
    }

    public boolean isSaleEnabled() {
        return saleEnabled;
    }

    public boolean isTradeEnabled() {
        return tradeEnabled;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public String getPendingOperationId() {
        return pendingOperationId;
    }

    public Integer getPendingQuantity() {
        return pendingQuantity;
    }

    public Boolean getPendingSaleEnabled() {
        return pendingSaleEnabled;
    }

    public Boolean getPendingTradeEnabled() {
        return pendingTradeEnabled;
    }

    public BigDecimal getPendingUnitPrice() {
        return pendingUnitPrice;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
