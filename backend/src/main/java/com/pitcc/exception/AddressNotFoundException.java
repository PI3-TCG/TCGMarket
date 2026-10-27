package com.pitcc.exception;

public class AddressNotFoundException extends RuntimeException {

    public AddressNotFoundException() {
        super("Endereço não encontrado.");
    }
}
