package com.pitcc.service;

import org.springframework.stereotype.Component;

/**
 * Implementação usada enquanto o módulo de anúncios não existe.
 * Deve ser substituída por uma consulta aos anúncios ativos
 * (por {@code collectionItemId}) quando os anúncios forem implementados.
 */
@Component
public class NoActiveAdLookup implements ActiveAdLookup {

    @Override
    public boolean hasActiveAdFor(String collectionItemId) {
        return false;
    }
}
