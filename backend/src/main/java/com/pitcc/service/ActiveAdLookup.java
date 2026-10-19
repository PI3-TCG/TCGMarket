package com.pitcc.service;

/**
 * Informa se um item da coleção está vinculado a um anúncio ativo.
 * Itens anunciados não podem ser removidos da coleção.
 */
public interface ActiveAdLookup {

    boolean hasActiveAdFor(String collectionItemId);
}
