package com.pitcc.exception;

public class CollectionItemInActiveAdException extends RuntimeException {

    public CollectionItemInActiveAdException() {
        super("Esta carta está em um anúncio ativo. "
                + "Encerre o anúncio antes de removê-la da coleção.");
    }
}
