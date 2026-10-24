package com.pitcc.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;


@Document(collection = "ads")
@CompoundIndexes({
        @CompoundIndex(
                name = "ads_collection_item_status",
                def = "{'collectionItemId': 1, 'status': 1}"
        ),
        @CompoundIndex(
                name = "ads_seller_status",
                def = "{'sellerId': 1, 'status': 1}"
        ),
        @CompoundIndex(
                name = "ads_status_created_at",
                def = "{'status': 1, 'createdAt': -1}"
        )
})
public class Ad {

    @Id
    private String id;

    private String sellerId;
    private String collectionItemId;

    private Integer quantity;
    private Integer remainingQuantity;
    private String description;

    private boolean saleEnabled;
    private boolean tradeEnabled;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    private AdStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant cancelledAt;
    private Instant soldOutAt;

    protected Ad() {
    }

    public Ad(
            String sellerId,
            CollectionItem item,
            int quantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice,
            String description,
            Instant now
    ) {
        if (sellerId == null || sellerId.isBlank()) {
            throw new IllegalArgumentException("O vendedor precisa ser informado.");
        }

        if (item == null || !sellerId.equals(item.getUserId())) {
            throw new IllegalArgumentException("O item precisa pertencer ao vendedor.");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade precisa ser maior que zero.");
        }

        if (!saleEnabled && !tradeEnabled) {
            throw new IllegalArgumentException("Selecione uma modalidade.");
        }

        if (saleEnabled && (unitPrice == null || unitPrice.signum() <= 0)) {
            throw new IllegalArgumentException("Informe o preço por unidade.");
        }

        this.sellerId = sellerId;
        this.collectionItemId = item.getId();
        this.quantity = quantity;
        this.remainingQuantity = quantity;
        this.saleEnabled = saleEnabled;
        this.tradeEnabled = tradeEnabled;
        this.description = description == null || description.isBlank()
                ? null
                : description.strip();
        // Anúncio só de troca nunca guarda preço.
        this.unitPrice = saleEnabled ? unitPrice : null;
        this.status = AdStatus.ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
        this.cancelledAt = null;
        this.soldOutAt = null;
    }

    public String getId() {
        return id;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getCollectionItemId() {
        return collectionItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public boolean isSaleEnabled() {
        return saleEnabled;
    }

    public boolean isTradeEnabled() {
        return tradeEnabled;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public AdStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getCancelledAt(){
        return cancelledAt;
    }

    public Instant getSoldOutAt() {
        return soldOutAt;
    }

}
