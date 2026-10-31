
package com.pitcc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "collection_items")
@CompoundIndex(
        name = "uk_collection_items_identity",
        def = "{'userId': 1, 'cardId': 1, 'condition': 1, 'language': 1}",
        unique = true
)
public class CollectionItem {

    @Id
    private String id;

    private String userId;
    private String cardId;

    // Quantidade total de exemplares.
    private Integer quantity;

    private CardCondition condition;
    private CardLanguage language;

    // Quantidade comprometida em anúncios.
    private Integer committedQuantity = 0;

    // Reservas individuais vinculadas aos anúncios.
    private List<AdReservation> adReservations = new ArrayList<>();

    // Marcas "pedido:anúncio" das vendas já aplicadas, para não repetir a transferência.
    private List<String> appliedTransfers = new ArrayList<>();

    protected CollectionItem() {
    }

    public CollectionItem(
            String userId,
            String cardId,
            Integer quantity,
            CardCondition condition,
            CardLanguage language
    ) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário não pode estar vazio ou em branco."
            );
        }

        if (cardId == null || cardId.isBlank()) {
            throw new IllegalArgumentException(
                    "A carta a ser adicionada deve ser informada."
            );
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade precisa ser maior que zero."
            );
        }

        if (condition == null) {
            throw new IllegalArgumentException(
                    "A condição da carta precisa ser informada."
            );
        }

        if (language == null) {
            throw new IllegalArgumentException(
                    "O idioma da carta precisa ser informado."
            );
        }

        this.userId = userId;
        this.cardId = cardId;
        this.quantity = quantity;
        this.condition = condition;
        this.language = language;

        this.committedQuantity = 0;
        this.adReservations = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getCardId() {
        return cardId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public CardCondition getCondition() {
        return condition;
    }

    public CardLanguage getLanguage() {
        return language;
    }

    public Integer getCommittedQuantity() {
        return committedQuantity;
    }

    public List<String> getAppliedTransfers() {
        return appliedTransfers == null ? List.of() : List.copyOf(appliedTransfers);
    }

    public List<AdReservation> getAdReservations() {
        return adReservations;
    }
}
