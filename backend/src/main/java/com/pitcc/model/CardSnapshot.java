package com.pitcc.model;

/**
 * Cópia dos dados da carta no momento da negociação.
 * Pedidos e transações guardam esta cópia para que o histórico não mude
 * quando o catálogo, o item da coleção ou o anúncio forem alterados.
 */
public class CardSnapshot {

    private String cardId;
    private String name;
    private CardGame game;
    private String edition;
    private String cardNumber;
    private String imageUrl;
    private CardCondition condition;
    private CardLanguage language;

    protected CardSnapshot() {
    }

    public CardSnapshot(
            String cardId,
            String name,
            CardGame game,
            String edition,
            String cardNumber,
            String imageUrl,
            CardCondition condition,
            CardLanguage language
    ) {
        if (cardId == null || cardId.isBlank()) {
            throw new IllegalArgumentException("A carta precisa ser informada.");
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("O nome da carta é obrigatório.");
        }

        if (game == null) {
            throw new IllegalArgumentException("O jogo da carta é obrigatório.");
        }

        if (condition == null) {
            throw new IllegalArgumentException("A condição da carta é obrigatória.");
        }

        if (language == null) {
            throw new IllegalArgumentException("O idioma da carta é obrigatório.");
        }

        this.cardId = cardId;
        this.name = name;
        this.game = game;
        this.edition = edition;
        this.cardNumber = cardNumber;
        this.imageUrl = imageUrl;
        this.condition = condition;
        this.language = language;
    }

    public String getCardId() {
        return cardId;
    }

    public String getName() {
        return name;
    }

    public CardGame getGame() {
        return game;
    }

    public String getEdition() {
        return edition;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public CardCondition getCondition() {
        return condition;
    }

    public CardLanguage getLanguage() {
        return language;
    }
}
