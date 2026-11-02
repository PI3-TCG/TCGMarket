package com.pitcc.model;

/** Uma posse especifica com quantidade e fotografia historica da carta. */
public class TradeProposalItem {

    private String collectionItemId;
    private String cardId;
    private String sourceAdId;
    private int quantity;
    private CardSnapshot card;

    protected TradeProposalItem() {
    }

    public TradeProposalItem(String collectionItemId, String cardId,
                             String sourceAdId, int quantity, CardSnapshot card) {
        if (blank(collectionItemId) || blank(cardId)) {
            throw new IllegalArgumentException("Informe o item da colecao e a carta.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero.");
        }
        if (card == null || !cardId.equals(card.getCardId())) {
            throw new IllegalArgumentException("O snapshot da carta deve corresponder ao cardId.");
        }
        this.collectionItemId = collectionItemId;
        this.cardId = cardId;
        this.sourceAdId = blank(sourceAdId) ? null : sourceAdId;
        this.quantity = quantity;
        this.card = card;
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public String getCollectionItemId() { return collectionItemId; }
    public String getCardId() { return cardId; }
    public String getSourceAdId() { return sourceAdId; }
    public int getQuantity() { return quantity; }
    public CardSnapshot getCard() { return card; }
}
