package com.pitcc.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "collection_items")
public class CollectionItem {

    @Id
    private String id;

    private String userId;
    private String cardId;
    private Integer quantity;
    private CardCondition condition;
    private CardLanguage language;


    protected CollectionItem() {

    }

    public CollectionItem(String userId, String cardId, Integer quantity,
                          CardCondition condition, CardLanguage language) {

        // ===========================  VALIDAÇÕES ========================

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("O usuário não pode estar vazio ou em branco");
        }

        if (cardId == null || cardId.isBlank()) {
            throw new IllegalArgumentException("A carta a ser adicionada deve ser informada.");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("A quantidade precisar ser maior que zero.");
        }

        if (language == null) {
            throw new IllegalArgumentException("O idioma da carta precisa ser informado.");
        }

        if (condition == null) {
            throw new IllegalArgumentException("A condição da carta precisa ser informada.");
        }

        // ================================================================

        this.userId = userId;
        this.cardId = cardId;
        this.quantity = quantity;
        this.condition = condition;
        this.language = language;
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


}
