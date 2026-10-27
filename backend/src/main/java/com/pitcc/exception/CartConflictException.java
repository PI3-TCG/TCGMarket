package com.pitcc.exception;

public class CartConflictException extends RuntimeException {

    public CartConflictException() {
        super("Seu carrinho foi alterado ao mesmo tempo em outra aba. Tente novamente.");
    }
}
