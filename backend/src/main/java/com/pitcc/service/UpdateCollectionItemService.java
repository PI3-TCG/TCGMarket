
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
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        boolean identityChanged =
                item.getCondition() != request.condition()
                        || item.getLanguage() != request.language();

        if (identityChanged) {
            Query equivalentQuery = Query.query(
                    Criteria.where("userId").is(userId)
                            .and("cardId").is(item.getCardId())
                            .and("condition").is(request.condition())
                            .and("language").is(request.language())
            );

            if (mongoTemplate.exists(
                    equivalentQuery,
                    CollectionItem.class
            )) {
                throw new CollectionItemConflictException(
                        "Você já possui esta carta com a condição "
                                + "e o idioma informados."
                );
            }
        }

        Query updateQuery = Query.query(
                Criteria.where("_id").is(itemId)
                        .and("userId").is(userId)
                        .and("quantity").is(item.getQuantity())
                        .and("condition").is(item.getCondition())
                        .and("language").is(item.getLanguage())
        );

        if (identityChanged) {
            updateQuery.addCriteria(
                    Criteria.where("committedQuantity").is(0)
            );
        } else {
            updateQuery.addCriteria(
                    Criteria.where("committedQuantity")
                            .gte(0)
                            .lte(request.quantity())
            );
        }

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

            if (result.getMatchedCount() == 0) {
                boolean stillExists = collectionItemRepository
                        .findByIdAndUserId(itemId, userId)
                        .isPresent();

                if (!stillExists) {
                    throw new CollectionItemNotFoundException();
                }

                throw new CollectionItemConflictException(
                        "Não foi possível atualizar o item. "
                                + "A quantidade pode estar comprometida "
                                + "em anúncios ou o item pode ter sido "
                                + "alterado por outra operação. "
                                + "Atualize a coleção e tente novamente."
                );
            }

        } catch (DuplicateKeyException exception) {
            throw new CollectionItemConflictException(
                    "Este item foi alterado por outra operação. "
                            + "Atualize a coleção e tente novamente."
            );
        }
    }
}
