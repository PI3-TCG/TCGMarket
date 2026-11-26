package com.pitcc.exception;

public class CollectionNotFoundException extends RuntimeException {

    public CollectionNotFoundException() {
        super("Coleção não encontrada.");
    }
}
