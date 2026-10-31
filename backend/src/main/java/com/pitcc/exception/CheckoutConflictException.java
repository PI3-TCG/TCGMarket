package com.pitcc.exception;

import com.pitcc.dto.CheckoutValidationResponse;

/** Os itens selecionados mudaram e o pedido não pode ser criado como está. */
public class CheckoutConflictException extends RuntimeException {

    private final CheckoutValidationResponse validation;

    public CheckoutConflictException(CheckoutValidationResponse validation) {
        super("Alguns itens do carrinho mudaram. Revise-os antes de continuar.");
        this.validation = validation;
    }

    public CheckoutValidationResponse getValidation() {
        return validation;
    }
}
