package com.pitcc.repository;

import com.pitcc.dto.MarketplaceFilters;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CollectionItem;

import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class MarketplaceSearchRepository {

    private final MongoTemplate mongoTemplate;

    public MarketplaceSearchRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Ad> findAvailableAds(
            MarketplaceFilters filters,
            Pageable pageable
    ) {
        List<Document> pipeline = new ArrayList<>();

        // Regras obrigatórias, independentemente dos filtros escolhidos.
        Document availabilityMatch = new Document(
                "status",
                AdStatus.ACTIVE.name()
        ).append(
                "remainingQuantity",
                new Document("$gt", 0)
        );

        if (filters.modality() != null) {
            switch (filters.modality()) {
                case "SALE" ->
                        availabilityMatch.append("saleEnabled", true);

                case "TRADE" ->
                        availabilityMatch.append("tradeEnabled", true);

                case "BOTH" -> {
                    availabilityMatch.append("saleEnabled", true);
                    availabilityMatch.append("tradeEnabled", true);
                }

                default -> throw new IllegalArgumentException(
                        "Modalidade inválida."
                );
            }
        }

        // Reservas de pedidos pendentes não podem ser anunciadas como livres.
        availabilityMatch.append("$expr", new Document("$gt", List.of(
                new Document("$subtract", List.of("$remainingQuantity",
                        new Document("$sum", "$purchaseHolds.quantity"))), 0)));
        if (filters.minPrice() != null || filters.maxPrice() != null) {
            availabilityMatch.append("saleEnabled", true);
            Document price = new Document();
            if (filters.minPrice() != null) price.append("$gte", new Decimal128(filters.minPrice()));
            if (filters.maxPrice() != null) price.append("$lte", new Decimal128(filters.maxPrice()));
            availabilityMatch.append("unitPrice", price);
        }
        pipeline.add(new Document("$match", availabilityMatch));

        // Só consulta as cartas quando os filtros dependem delas.
        if (filters.search() != null || filters.game() != null
                || filters.edition() != null || filters.rarity() != null
                || filters.condition() != null || filters.language() != null) {
            addCardFilters(pipeline, filters);
        }

        Document ordering = new Document();

        pageable.getSort().forEach(order -> {
            String field = "id".equals(order.getProperty())
                    ? "_id"
                    : order.getProperty();

            ordering.append(
                    field,
                    order.isAscending() ? 1 : -1
            );
        });

        pipeline.add(new Document("$sort", ordering));

        // O conteúdo e a contagem usam os mesmos filtros.
        List<Document> contentPipeline = List.of(
                new Document("$skip", pageable.getOffset()),
                new Document("$limit", pageable.getPageSize()),
                new Document(
                        "$project",
                        new Document("marketplaceItemIds", 0)
                                .append("marketplaceItem", 0)
                                .append("marketplaceCardIds", 0)
                                .append("marketplaceCard", 0)
                )
        );

        List<Document> totalPipeline = List.of(
                new Document("$count", "value")
        );

        pipeline.add(
                new Document(
                        "$facet",
                        new Document("content", contentPipeline)
                                .append("total", totalPipeline)
                )
        );

        Document result = mongoTemplate
                .getCollection(mongoTemplate.getCollectionName(Ad.class))
                .aggregate(pipeline)
                .first();

        if (result == null) {
            return Page.empty(pageable);
        }

        List<Document> contentDocuments =
                result.getList("content", Document.class);

        List<Ad> ads = contentDocuments.stream()
                .map(document -> mongoTemplate.getConverter()
                        .read(Ad.class, document))
                .toList();

        List<Document> totalDocuments =
                result.getList("total", Document.class);

        long total = totalDocuments.isEmpty()
                ? 0L
                : ((Number) totalDocuments.getFirst()
                .get("value")).longValue();

        return new PageImpl<>(ads, pageable, total);
    }

    private void addCardFilters(
            List<Document> pipeline,
            MarketplaceFilters filters
    ) {
        // Ad -> CollectionItem.
        // Aceita IDs armazenados como String ou ObjectId.
        pipeline.add(
                lookupIds("marketplaceItemIds", "$collectionItemId")
        );

        pipeline.add(
                new Document(
                        "$lookup",
                        new Document(
                                "from",
                                mongoTemplate.getCollectionName(
                                        CollectionItem.class
                                )
                        )
                                .append("localField", "marketplaceItemIds")
                                .append("foreignField", "_id")
                                .append("as", "marketplaceItem")
                )
        );

        pipeline.add(
                new Document("$unwind", "$marketplaceItem")
        );

        Document itemMatch = new Document();
        if (filters.condition() != null) itemMatch.append("marketplaceItem.condition", filters.condition().name());
        if (filters.language() != null) itemMatch.append("marketplaceItem.language", filters.language().name());
        if (!itemMatch.isEmpty()) pipeline.add(new Document("$match", itemMatch));

        // CollectionItem -> Card.
        pipeline.add(
                lookupIds(
                        "marketplaceCardIds",
                        "$marketplaceItem.cardId"
                )
        );

        pipeline.add(
                new Document(
                        "$lookup",
                        new Document(
                                "from",
                                mongoTemplate.getCollectionName(Card.class)
                        )
                                .append("localField", "marketplaceCardIds")
                                .append("foreignField", "_id")
                                .append("as", "marketplaceCard")
                )
        );

        Document cardMatch = new Document();

        if (filters.search() != null) {
            cardMatch.append(
                    "name",
                    new Document(
                            "$regex",
                            Pattern.quote(filters.search())
                    ).append("$options", "i")
            );
        }

        if (filters.game() != null) {
            cardMatch.append("game", filters.game().name());
        }

        if (filters.edition() != null) {
            cardMatch.append("edition", new Document("$regex", Pattern.quote(filters.edition())).append("$options", "i"));
        }
        if (filters.rarity() != null) {
            cardMatch.append("officialRarity", new Document("$regex", "^" + Pattern.quote(filters.rarity()) + "$").append("$options", "i"));
        }

        // Todos os filtros devem corresponder à mesma carta.
        pipeline.add(
                new Document(
                        "$match",
                        new Document(
                                "marketplaceCard",
                                new Document("$elemMatch", cardMatch)
                        )
                )
        );
    }

    private Document lookupIds(
            String targetField,
            String reference
    ) {
        Document objectIdConversion = new Document(
                "$convert",
                new Document("input", reference)
                        .append("to", "objectId")
                        .append("onError", null)
                        .append("onNull", null)
        );

        return new Document(
                "$set",
                new Document(
                        targetField,
                        List.of(reference, objectIdConversion)
                )
        );
    }
}