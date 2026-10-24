package com.pitcc.exception;

import com.pitcc.model.AdStatus;

/** O anúncio deixou de estar ativo e não aceita mais edição nem cancelamento. */
public class AdNotActiveException extends RuntimeException {

    private final AdStatus currentStatus;

    public AdNotActiveException(AdStatus currentStatus) {
        super("O status do anúncio mudou.");
        this.currentStatus = currentStatus;
    }

    public AdStatus getCurrentStatus() {
        return currentStatus;
    }
}
