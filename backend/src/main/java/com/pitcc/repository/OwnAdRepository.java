package com.pitcc.repository;

import com.pitcc.dto.OwnAdFilters;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Repository
public class OwnAdRepository {

    private final MongoTemplate mongoTemplate;

    public OwnAdRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Ad> findOwnAds(String sellerId, OwnAdFilters filters, Pageable pageable) {
        List<Document> pipeline = new ArrayList<>();

        Document ownershipMatch = new Document("sellerId", sellerId);

        if (filters.status() != null) {
            ownershipMatch.append("status", filters.status().name());
        }

        if (filters.modality() != null) {
            switch (filters.modality()) {
                case SALE -> ownershipMatch.append("saleEnabled", true);
                case TRADE -> ownershipMatch.append("tradeEnabled", true);
                case BOTH -> ownershipMatch
                        .append("saleEnabled", true)
                        .append("tradeEnabled", true);
            }
        }

        pipeline.add(new Document("$match", ownershipMatch));

        if (filters.hasCardFilters()) {
            addCardFilters(pipeline, filters);
        }

        // Mais recentes primeiro; o _id desempata para a paginação ficar estável.
        pipeline.add(new Document("$sort", new Document("createdAt", -1).append("_id", -1)));

        List<Document> contentPipeline = List.of(
                new Document("$skip", pageable.getOffset()),
                new Document("$limit", pageable.getPageSize()),
                new Document("$project", new Document("cardLookupIds", 0).append("catalogCard", 0))
        );

        pipeline.add(new Document(
                "$facet",
                new Document("content", contentPipeline)
                        .append("total", List.of(new Document("$count", "value")))
        ));

        Document result = mongoTemplate
                .getCollection(mongoTemplate.getCollectionName(Ad.class))
                .aggregate(pipeline)
                .first();

        if (result == null) {
            return Page.empty(pageable);
        }

        List<Ad> ads = result.getList("content", Document.class).stream()
                .map(document -> mongoTemplate.getConverter().read(Ad.class, document))
                .toList();

        List<Document> totalDocuments = result.getList("total", Document.class);
        long total = totalDocuments.isEmpty()
                ? 0L
                : ((Number) totalDocuments.getFirst().get("value")).longValue();

        return new PageImpl<>(ads, pageable, total);
    }

    private void addCardFilters(List<Document> pipeline, OwnAdFilters filters) {
        // Aceita referências a IDs armazenados como String ou ObjectId.
        pipeline.add(Document.parse("""
                {
                  "$set": {
                    "cardLookupIds": [
                      "$cardId",
                      {
                        "$convert": {
                          "input": "$cardId",
                          "to": "objectId",
                          "onError": null,
                          "onNull": null
                        }
                      }
                    ]
                  }
                }
                """));

        pipeline.add(Document.parse("""
                {
                  "$lookup": {
                    "from": "cards",
                    "localField": "cardLookupIds",
                    "foreignField": "_id",
                    "as": "catalogCard"
                  }
                }
                """));

        Document cardMatch = new Document();

        if (filters.search() != null) {
            // A pesquisa é texto literal, não regex.
            cardMatch.append(
                    "name",
                    new Document("$regex", Pattern.quote(filters.search())).append("$options", "i")
            );
        }

        if (filters.game() != null) {
            cardMatch.append("game", filters.game().name());
        }

        pipeline.add(new Document(
                "$match",
                new Document("catalogCard", new Document("$elemMatch", cardMatch))
        ));
    }

    /**
     * Altera modalidade e preço só se o anúncio for do vendedor e ainda estiver
     * ativo. Devolve vazio quando a condição não é atendida.
     */
    public Optional<Ad> updateIfActive(
            String adId,
            String sellerId,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice,
            Instant now) {

        Update update = new Update()
                .set("saleEnabled", saleEnabled)
                .set("tradeEnabled", tradeEnabled)
                .set("unitPrice", unitPrice)
                .set("updatedAt", now);

        return Optional.ofNullable(mongoTemplate.findAndModify(
                activeOwnAd(adId, sellerId),
                update,
                FindAndModifyOptions.options().returnNew(true),
                Ad.class
        ));
    }


    public Optional<Ad> updateQuantityIfActive(
            String adId,
            String sellerId,
            int expectedQuantity,
            int expectedRemainingQuantity,
            int newQuantity,
            int newRemainingQuantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice,
            String operationId,
            Instant now
    ) {
        if (operationId == null || operationId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador da operação obrigatório."
            );
        }

        if (expectedQuantity <= 0 ||
                expectedRemainingQuantity <= 0 ||
                newQuantity <= 0 ||
                newRemainingQuantity <= 0) {
            throw new IllegalArgumentException(
                    "As quantidades precisam ser positivas."
            );
        }

        if (expectedRemainingQuantity > expectedQuantity ||
                newRemainingQuantity > newQuantity) {
            throw new IllegalArgumentException(
                    "A quantidade restante não pode superar o total."
            );
        }

        if (!saleEnabled && !tradeEnabled) {
            throw new IllegalArgumentException(
                    "Selecione ao menos uma modalidade."
            );
        }

        if (saleEnabled &&
                (unitPrice == null || unitPrice.signum() <= 0)) {
            throw new IllegalArgumentException(
                    "Informe um preço válido."
            );
        }

        Query query = Query.query(
                Criteria.where("id").is(adId)
                        .and("sellerId").is(sellerId)
                        .and("status").is(AdStatus.ACTIVE)
                        .and("quantity").is(expectedQuantity)
                        .and("remainingQuantity").is(
                                expectedRemainingQuantity
                        )
        );

        Update update = new Update()
                .set("quantity", newQuantity)
                .set("remainingQuantity", newRemainingQuantity)
                .set("saleEnabled", saleEnabled)
                .set("tradeEnabled", tradeEnabled)
                .set(
                        "unitPrice",
                        saleEnabled ? unitPrice : null
                )
                .set("lastAppliedUpdateOperationId", operationId)
                .set("updatedAt", now);

        return Optional.ofNullable(
                mongoTemplate.findAndModify(
                        query,
                        update,
                        FindAndModifyOptions.options().returnNew(true),
                        Ad.class
                )
        );
    }


    public Optional<Ad> cancelIfActive(String adId, String sellerId, Instant now) {
        Update update = new Update()
                .set("status", AdStatus.CANCELLED)
                .set("cancelledAt", now)
                .set("updatedAt", now);

        return Optional.ofNullable(mongoTemplate.findAndModify(
                activeOwnAd(adId, sellerId),
                update,
                FindAndModifyOptions.options().returnNew(true),
                Ad.class
        ));
    }

    private Query activeOwnAd(String adId, String sellerId) {
        return Query.query(Criteria.where("id").is(adId)
                .and("sellerId").is(sellerId)
                .and("status").is(AdStatus.ACTIVE));
    }
}
