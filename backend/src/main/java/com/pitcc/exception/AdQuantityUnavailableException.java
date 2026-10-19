package com.pitcc.exception;

public class AdQuantityUnavailableException extends RuntimeException {

    private final int availableQuantity;

    public AdQuantityUnavailableException(int availableQuantity) {
        super(message(availableQuantity));
        this.availableQuantity = availableQuantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    private static String message(int available) {
        if (available == 0) {
            return "Todos os exemplares estão em outros anúncios.";
        }

        return available == 1
                ? "A disponibilidade mudou. Agora há apenas 1 exemplar disponível."
                : "A disponibilidade mudou. Agora há apenas " + available
                        + " exemplares disponíveis.";
    }
}
