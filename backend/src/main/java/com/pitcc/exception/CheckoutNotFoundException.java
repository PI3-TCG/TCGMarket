package com.pitcc.exception;

public class CheckoutNotFoundException extends RuntimeException {

    public CheckoutNotFoundException() {
        super("Checkout não encontrado.");
    }
}
