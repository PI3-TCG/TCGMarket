
package com.pitcc.service;

import com.pitcc.exception.CollectionItemInActiveAdException;
import com.pitcc.exception.CollectionItemNotFoundException;
import com.pitcc.exception.InvalidAuthenticationException;

import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.CollectionItem;

import com.pitcc.repository.CollectionItemRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class RemoveCollectionItemService {

    private final CollectionItemRepository collectionItemRepository;
    private final MongoTemplate mongoTemplate;

    public RemoveCollectionItemService(
            CollectionItemRepository collectionItemRepository,
            MongoTemplate mongoTemplate
    ) {
        this.collectionItemRepository = collectionItemRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public void removeCollectionItem(
            String userId,
            String itemId
    ) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }

        CollectionItem item = collectionItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        if (item.getCommittedQuantity() == null) {
            throw new IllegalStateException(
                    "O item não possui controle de reservas inicializado."
            );
        }

        Query deleteQuery = Query.query(
                Criteria.where("_id").is(itemId)
                        .and("userId").is(userId)
                        .and("committedQuantity").is(0)
        );

        deleteQuery.addCriteria(
                Criteria.where("adReservations.status").nin(
                        AdReservationStatus.PENDING_CREATION,
                        AdReservationStatus.ACTIVE,
                        AdReservationStatus.PENDING_UPDATE,
                        AdReservationStatus.PENDING_CANCELLATION
                )
        );

        var result = mongoTemplate.remove(
                deleteQuery,
                CollectionItem.class
        );

        if (result.getDeletedCount() == 1) {
            return;
        }

        CollectionItem current = collectionItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(CollectionItemNotFoundException::new);

        if (current.getCommittedQuantity() == null) {
            throw new IllegalStateException(
                    "O item não possui controle de reservas inicializado."
            );
        }

        throw new CollectionItemInActiveAdException();
    }
}
