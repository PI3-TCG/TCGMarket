package com.pitcc.exception;

public class CollectionDeleteBlockedException extends RuntimeException {

    public CollectionDeleteBlockedException() {
        super("Não é possível excluir esta coleção enquanto houver cartas em anúncios ativos.");
    }
}
