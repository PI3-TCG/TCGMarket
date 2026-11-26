package com.pitcc.service;

import com.pitcc.model.CardCollection;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.User;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.PartialIndexFilter;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.schema.JsonSchemaObject;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Atribui as cartas já cadastradas a uma coleção "Minha coleção" e troca o
 * índice único para valer dentro da coleção. Roda antes da API receber tráfego.
 */
@Component
public class CollectionBackfill implements InitializingBean {

    static final String LEGACY_INDEX = "uk_collection_items_identity";
    static final String COLLECTION_INDEX = "uk_collection_items_in_collection";

    private final MongoTemplate mongoTemplate;

    public CollectionBackfill(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void afterPropertiesSet() {
        ensureCollectionIndex();
        backfillMissingCollections();
        dropLegacyIndex();
    }

    private void backfillMissingCollections() {
        Query missing = Query.query(new Criteria().orOperator(
                Criteria.where("collectionId").exists(false),
                Criteria.where("collectionId").is(null),
                Criteria.where("collectionId").is("")
        ));
        List<String> userIds = mongoTemplate.findDistinct(
                missing, "userId", CollectionItem.class, String.class);
        for (String userId : userIds) {
            if (userId == null || userId.isBlank()) {
                continue;
            }
            CardCollection collection = findOrCreateDefault(userId);
            mongoTemplate.updateMulti(
                    Query.query(Criteria.where("userId").is(userId).orOperator(
                            Criteria.where("collectionId").exists(false),
                            Criteria.where("collectionId").is(null),
                            Criteria.where("collectionId").is("")
                    )),
                    new Update().set("collectionId", collection.getId()),
                    CollectionItem.class
            );
        }
    }

    private CardCollection findOrCreateDefault(String userId) {
        CardCollection existing = mongoTemplate.findOne(
                Query.query(Criteria.where("userId").is(userId).and("name").is(CardCollection.DEFAULT_NAME)),
                CardCollection.class
        );
        if (existing != null) {
            return existing;
        }
        User user = mongoTemplate.findById(userId, User.class);
        boolean visible = user != null && user.isCollectionPublic();
        return mongoTemplate.save(
                new CardCollection(userId, CardCollection.DEFAULT_NAME, visible, Instant.now())
        );
    }

    private void ensureCollectionIndex() {
        Index index = new Index()
                .on("collectionId", Sort.Direction.ASC)
                .on("cardId", Sort.Direction.ASC)
                .on("condition", Sort.Direction.ASC)
                .on("language", Sort.Direction.ASC)
                .unique()
                .named(COLLECTION_INDEX)
                .partial(PartialIndexFilter.of(
                        Criteria.where("collectionId").type(JsonSchemaObject.Type.STRING)
                ));
        mongoTemplate.indexOps(CollectionItem.class).ensureIndex(index);
    }

    private void dropLegacyIndex() {
        boolean exists = mongoTemplate.indexOps(CollectionItem.class).getIndexInfo().stream()
                .anyMatch(info -> LEGACY_INDEX.equals(info.getName()));
        if (exists) {
            mongoTemplate.indexOps(CollectionItem.class).dropIndex(LEGACY_INDEX);
        }
    }
}
