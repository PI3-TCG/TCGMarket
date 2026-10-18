
package com.pitcc.service;

import com.pitcc.dto.UpdateCollectionItemRequest;
import com.pitcc.exception.CollectionItemConflictException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.model.CollectionItem;
import com.pitcc.repository.CollectionItemRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class UpdateCollectionItemService {

    private final CollectionItemRepository collectionItemRepository;
    private final MongoTemplate mongoTemplate;

    public UpdateCollectionItemService(
            CollectionItemRepository collectionItemRepository,
            MongoTemplate mongoTemplate
    ) {
        this.collectionItemRepository = collectionItemRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public void updateCollectionItem(
            String userId,
            String itemId,
            UpdateCollectionItemRequest request
    ) {
        // 1. Validar a autenticação
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        // 2. Buscar somente um item do usuário autenticado
        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        // 3. Verificar se condição ou idioma serão alterados
        boolean identityChanged =
                item.getCondition() != request.condition()
                        || item.getLanguage() != request.language();

        if (identityChanged) {
            // Procurar outra posse com a combinação desejada
            Query equivalentQuery = Query.query(
                    Criteria.where("userId").is(userId)
                            .and("cardId").is(item.getCardId())
                            .and("condition").is(request.condition())
                            .and("language").is(request.language())
            );

            if (mongoTemplate.exists(equivalentQuery, CollectionItem.class)) {
                throw new CollectionItemConflictException(
                        "Você já possui esta carta com a condição e o idioma informados."
                );
            }
        }

        // 4. Atualizar somente a posse selecionada
        // Incluímos os valores anteriores para evitar
        // sobrescrever silenciosamente uma edição concorrente.
        Query updateQuery = Query.query(
                Criteria.where("_id").is(itemId)
                        .and("userId").is(userId)
                        .and("quantity").is(item.getQuantity())
                        .and("condition").is(item.getCondition())
                        .and("language").is(item.getLanguage())
        );

        Update update = new Update()
                .set("quantity", request.quantity())
                .set("condition", request.condition())
                .set("language", request.language());

        try {
            var result = mongoTemplate.updateFirst(
                    updateQuery,
                    update,
                    CollectionItem.class
            );

            // O registro pode ter sido alterado ou removido
            // entre a leitura e a tentativa de atualização.
            if (result.getMatchedCount() == 0) {
                boolean stillExists = collectionItemRepository
                        .findByIdAndUserId(itemId, userId)
                        .isPresent();

                if (!stillExists) {
                    throw new CollectionItemNotFoundException();
                }

                throw new CollectionItemConflictException(
                        "Este item foi alterado por outra operação. "
                                + "Atualize a coleção e tente novamente."
                );
            }

        } catch (DuplicateKeyException exception) {
            // Proteção para conflitos que aconteçam
            // entre a verificação e a atualização.
            throw new CollectionItemConflictException("Este item foi alterado por outra operação. " + "Atualize a coleção e tente novamente.");
        }
    }
}
