
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
    private String cardId;
    private CardCondition condition;
    private CardLanguage language;

    private Integer quantity;
    private Integer remainingQuantity;

    private boolean saleEnabled;
    private boolean tradeEnabled;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    private AdStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private String lastAppliedUpdateOperationId;
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
            Instant now
    ) {
        if (sellerId == null || sellerId.isBlank()) {
            throw new IllegalArgumentException(
                    "O vendedor precisa ser informado."
            );
        }

        if (item == null || !sellerId.equals(item.getUserId())) {
            throw new IllegalArgumentException(
                    "O item precisa pertencer ao vendedor."
            );
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade precisa ser maior que zero."
            );
        }

        if (!saleEnabled && !tradeEnabled) {
            throw new IllegalArgumentException(
                    "Selecione uma modalidade."
            );
        }

        if (saleEnabled &&
                (unitPrice == null || unitPrice.signum() <= 0)) {
            throw new IllegalArgumentException(
                    "Informe o preço por unidade."
            );
        }

        this.sellerId = sellerId;
        this.collectionItemId = item.getId();
        this.cardId = item.getCardId();
        this.condition = item.getCondition();
        this.language = item.getLanguage();

        this.quantity = quantity;
        this.remainingQuantity = quantity;

        this.saleEnabled = saleEnabled;
        this.tradeEnabled = tradeEnabled;

        this.unitPrice = saleEnabled ? unitPrice : null;

        this.status = AdStatus.ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public Ad(
            String id,
            String sellerId,
            CollectionItem item,
            int quantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice,
            Instant now
    ) {
        this(
                sellerId,
                item,
                quantity,
                saleEnabled,
                tradeEnabled,
                unitPrice,
                now
        );

        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException(
                    "O identificador do anúncio é obrigatório."
            );
        }

        this.id = id;
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

    public String getCardId() {
        return cardId;
    }

    public CardCondition getCondition() {
        return condition;
    }

    public CardLanguage getLanguage() {
        return language;
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

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public Instant getSoldOutAt() {
        return soldOutAt;
    }
    public String getLastAppliedUpdateOperationId() {
        return lastAppliedUpdateOperationId;
    }
}
