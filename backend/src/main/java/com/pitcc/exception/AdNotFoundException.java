package com.pitcc.exception;

public class AdNotFoundException extends RuntimeException {

    public AdNotFoundException() {
        super("Anúncio não encontrado.");
    }
}
