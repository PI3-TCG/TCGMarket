package com.pitcc.service;

import com.pitcc.dto.AddToCollectionRequest;
import com.pitcc.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import com.pitcc.exception.CatalogCardNotFoundException;

@Service
public class AddToCollectionService {

    private final CardRepository cardRepository;
    private final MongoTemplate mongoTemplate;

    public AddToCollectionService(CardRepository cardRepository, MongoTemplate mongoTemplate) {
        this.cardRepository = cardRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public void addToCollection(
            String userId,
            AddToCollectionRequest request) {

        // 1. Validar o usuário
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "O usuário precisa ser informado."
            );
        }
        // 2. Validar se a carta existe
        validateCardExists(request.cardId());
        //TODO 3. Adicionar ou incrementar a posse
        Query query = new Query();

        query.addCriteria(
                Criteria.where("userId").is(userId)
                        .and("cardId").is(request.cardId())
                        .and("condition").is(request.condition())
                        .and("language").is(request.language())
        );

        // 4. Incrementar ou criar a posse
        Update update = new Update();
        update.inc("quantity", request.quantity());

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
