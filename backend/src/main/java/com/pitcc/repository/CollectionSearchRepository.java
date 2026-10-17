package com.pitcc.repository;

import com.pitcc.dto.CollectionFilters;
import com.pitcc.model.CollectionItem;
import com.pitcc.dto.CollectionFilterOptionsResponse;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import java.util.Objects;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class CollectionSearchRepository {

    private final MongoTemplate mongoTemplate;

    public CollectionSearchRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Page<CollectionItem> findOwnCollection(
            String userId,
            CollectionFilters filters,
            Pageable pageable) {

        List<Document> pipeline = new ArrayList<>();

        // Primeiro, limita a consulta à coleção do usuário autenticado.
        Document ownershipMatch = new Document("userId", userId);

        if (filters.condition() != null) {
            ownershipMatch.append(
                    "condition",
                    filters.condition().name()
            );
        }

        if (filters.language() != null) {
            ownershipMatch.append(
                    "language",
                    filters.language().name()
            );
        }

        pipeline.add(new Document("$match", ownershipMatch));

        // Consulta o catálogo somente quando um filtro depende da carta.
        if (filters.hasCardFilters()) {
            addCardFilters(pipeline, filters);
        }

        // Ordenação estável para a paginação.
        pipeline.add(
                new Document("$sort", new Document("_id", 1))
        );

        List<Document> contentPipeline = List.of(
                new Document("$skip", pageable.getOffset()),
                new Document("$limit", pageable.getPageSize()),
                new Document(
                        "$project",
                        new Document("cardLookupIds", 0)
                                .append("catalogCard", 0)
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
                .getCollection(
                        mongoTemplate.getCollectionName(CollectionItem.class)
                )
                .aggregate(pipeline)
                .first();

        if (result == null) {
            return Page.empty(pageable);
        }

        List<Document> contentDocuments =
                result.getList("content", Document.class);

        List<CollectionItem> items = contentDocuments.stream()
                .map(document -> mongoTemplate.getConverter()
                        .read(CollectionItem.class, document))
                .toList();

        List<Document> totalDocuments =
                result.getList("total", Document.class);

        long total = totalDocuments.isEmpty()
                ? 0L
                : ((Number) totalDocuments.getFirst()
                .get("value")).longValue();

        return new PageImpl<>(items, pageable, total);
    }

    private void addCardFilters(
            List<Document> pipeline,
            CollectionFilters filters) {

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
            // Trata a pesquisa como texto literal.
            // Exemplo: um "+" digitado não vira um comando de regex.
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
            cardMatch.append("edition", filters.edition());
        }

        if (filters.rarity() != null) {
            cardMatch.append("officialRarity", filters.rarity());
        }

        // Todos os filtros precisam corresponder à mesma carta.
        pipeline.add(
                new Document(
                        "$match",
                        new Document(
                                "catalogCard",
                                new Document("$elemMatch", cardMatch)
                        )
                )
        );
    }

    public CollectionFilterOptionsResponse findFilterOptions(String userId) {
        List<Document> pipeline = new ArrayList<>();

        pipeline.add(
                new Document("$match", new Document("userId", userId))
        );

        // Reutiliza a ligação com o catálogo, sem restringir por filtros.
        addCardFilters(
                pipeline,
                new CollectionFilters(null, null, null, null, null, null)
        );

        pipeline.add(new Document("$unwind", "$catalogCard"));

        pipeline.add(
                new Document(
                        "$group",
                        new Document("_id", null)
                                .append(
                                        "editions",
                                        new Document(
                                                "$addToSet",
                                                "$catalogCard.edition"
                                        )
                                )
                                .append(
                                        "rarities",
                                        new Document(
                                                "$addToSet",
                                                "$catalogCard.officialRarity"
                                        )
                                )
                )
        );

        Document result = mongoTemplate
                .getCollection(
                        mongoTemplate.getCollectionName(CollectionItem.class)
                )
                .aggregate(pipeline)
                .first();

        if (result == null) {
            return new CollectionFilterOptionsResponse(
                    List.of(),
                    List.of()
            );
        }

        return new CollectionFilterOptionsResponse(
                sortedOptions(result, "editions"),
                sortedOptions(result, "rarities")
        );
    }

    private List<String> sortedOptions(Document result, String field) {
        return result.getList(field, String.class)
                .stream()
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

}