package com.pitcc.exception;

public class AdUnavailableForPurchaseException extends RuntimeException {

    private final int availableQuantity;

    public AdUnavailableForPurchaseException(int availableQuantity) {
        this(availableQuantity, 0);
    }

    public AdUnavailableForPurchaseException(int availableQuantity, int quantityInCart) {
        super(message(availableQuantity, quantityInCart));
        this.availableQuantity = availableQuantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    private static String message(int available, int inCart) {
        if (available <= 0) {
            return "Este anúncio não está mais disponível para compra.";
        }

        String availableText = available == 1
                ? "Há apenas 1 exemplar disponível"
                : "Há apenas " + available + " exemplares disponíveis";

        if (inCart > 0) {
            return availableText + " e você já tem " + inCart + " no carrinho.";
        }

        return availableText + " para compra.";
    }
}
