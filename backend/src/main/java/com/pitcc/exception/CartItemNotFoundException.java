package com.pitcc.exception;

public class CartItemNotFoundException extends RuntimeException {

    public CartItemNotFoundException() {
        super("Este anúncio não está mais no seu carrinho.");
    }
}
