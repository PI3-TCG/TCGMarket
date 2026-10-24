
package com.pitcc.service;

import com.pitcc.dto.AddToCollectionRequest;
import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.repository.CardRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddToCollectionService {

    private final CardRepository cardRepository;
    private final MongoTemplate mongoTemplate;

    public AddToCollectionService(
            CardRepository cardRepository,
            MongoTemplate mongoTemplate
    ) {
        this.cardRepository = cardRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public void addToCollection(
            String userId,
            AddToCollectionRequest request
    ) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário precisa ser informado."
            );
        }

        validateCardExists(request.cardId());

        Query query = new Query();

        query.addCriteria(
                Criteria.where("userId").is(userId)
                        .and("cardId").is(request.cardId())
                        .and("condition").is(request.condition())
                        .and("language").is(request.language())
        );

        Update update = new Update()
                .inc("quantity", request.quantity())
                .setOnInsert("committedQuantity", 0)
                .setOnInsert("adReservations", List.of());

        mongoTemplate.upsert(
                query,
                update,
                "collection_items"
        );
    }

    private void validateCardExists(String cardId) {
        if (!cardRepository.existsById(cardId)) {
            throw new CatalogCardNotFoundException();
        }
    }
}
