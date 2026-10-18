
package com.pitcc.exception;

public class CollectionItemNotFoundException extends RuntimeException {

    public CollectionItemNotFoundException() {
        super("Item da coleção não encontrado.");
    }
}
