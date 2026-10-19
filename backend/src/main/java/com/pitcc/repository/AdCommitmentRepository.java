package com.pitcc.repository;

import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AdCommitmentRepository {

    private final MongoTemplate mongoTemplate;

    public AdCommitmentRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Soma, por item da coleção, a quantidade restante dos anúncios ativos.
     * Itens sem anúncio ativo não aparecem no resultado.
     */
    public Map<String, Integer> sumActiveRemainingByCollectionItem(
            Collection<String> collectionItemIds
    ) {
        Map<String, Integer> committed = new HashMap<>();

        if (collectionItemIds.isEmpty()) {
            return committed;
        }

        List<Document> pipeline = List.of(
                new Document("$match", new Document("collectionItemId",
                        new Document("$in", List.copyOf(collectionItemIds)))
                        .append("status", AdStatus.ACTIVE.name())),
                new Document("$group", new Document("_id", "$collectionItemId")
                        .append("committed", new Document("$sum", "$remainingQuantity")))
        );

        mongoTemplate.getCollection(mongoTemplate.getCollectionName(Ad.class))
                .aggregate(pipeline)
                .forEach(result -> committed.put(
                        result.getString("_id"),
                        ((Number) result.get("committed")).intValue()
                ));

        return committed;
    }
}
