package com.pitcc.model;

/** Contexto do anuncio de origem, congelado no envio da proposta. */
public class TargetAdSnapshot {

    private String sellerId;
    private String collectionItemId;
    private String cardId;
    private boolean tradeEnabled;

    protected TargetAdSnapshot() {
    }

    public TargetAdSnapshot(String sellerId, String collectionItemId,
                            String cardId, boolean tradeEnabled) {
        if (blank(sellerId) || blank(collectionItemId) || blank(cardId)) {
            throw new IllegalArgumentException("O anuncio de origem deve identificar vendedor, posse e carta.");
        }
        if (!tradeEnabled) {
            throw new IllegalArgumentException("O anuncio precisa aceitar troca.");
        }
        this.sellerId = sellerId;
        this.collectionItemId = collectionItemId;
        this.cardId = cardId;
        this.tradeEnabled = true;
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public String getSellerId() { return sellerId; }
    public String getCollectionItemId() { return collectionItemId; }
    public String getCardId() { return cardId; }
    public boolean isTradeEnabled() { return tradeEnabled; }
}
