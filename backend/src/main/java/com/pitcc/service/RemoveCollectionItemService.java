package com.pitcc.service;

import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.stereotype.Service;

@Service
public class RemoveCollectionItemService {

    private final CollectionItemRepository collectionItemRepository;
    private final ActiveAdLookup activeAdLookup;

    public RemoveCollectionItemService(
            CollectionItemRepository collectionItemRepository,
            ActiveAdLookup activeAdLookup
    ) {
        this.collectionItemRepository = collectionItemRepository;
        this.activeAdLookup = activeAdLookup;
    }

    public void removeCollectionItem(String userId, String itemId) {
        // 1. Validar a autenticação
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        // 2. Buscar somente um item do usuário autenticado.
        // Item de outro usuário responde como inexistente.
        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        // 3. Item em anúncio ativo não pode sair da coleção
        if (activeAdLookup.hasActiveAdFor(item.getId())) {
            throw new CollectionItemInActiveAdException();
        }

        // 4. Remover apenas a posse; a carta global do catálogo é mantida
        long removed = collectionItemRepository.deleteByIdAndUserId(itemId, userId);

        // O item pode ter sido removido por outra operação
        if (removed == 0) {
            throw new CollectionItemNotFoundException();
        }
    }
}
