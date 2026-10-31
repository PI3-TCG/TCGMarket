package com.pitcc.repository;

import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Movimenta exemplares entre coleções numa venda. Cada operação é um update
 * condicional marcado com {@code pedido:anúncio}; repeti-la não tem efeito.
 */
@Repository
public class CollectionTransferRepository {

    private static final String MARKS = "appliedTransfers";

    private final MongoTemplate mongoTemplate;

    public CollectionTransferRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Tira os exemplares vendidos do item do vendedor e da reserva do anúncio.
     * Só aplica se houver quantidade suficiente e a reserva estiver ativa.
     */
    public boolean debitSeller(
            String collectionItemId,
            String sellerId,
            String adId,
            int quantity,
            String mark,
            Instant now
    ) {
        Query query = Query.query(Criteria.where("_id").is(collectionItemId)
                .and("userId").is(sellerId)
                .and("quantity").gte(quantity)
                .and("committedQuantity").gte(quantity)
                .and(MARKS).ne(mark)
                .and("adReservations").elemMatch(Criteria.where("adId").is(adId)
                        .and("status").is(AdReservationStatus.ACTIVE)
                        .and("quantity").gte(quantity)));

        Update update = new Update()
                .inc("quantity", -quantity)
                .inc("committedQuantity", -quantity)
                .inc("adReservations.$.quantity", -quantity)
                .set("adReservations.$.updatedAt", now)
                .push(MARKS, mark);

        return mongoTemplate.updateFirst(query, update, CollectionItem.class).getModifiedCount() == 1;
    }

    /** Reserva que ficou sem exemplares deixa de existir para o anúncio esgotado. */
    public void closeEmptyReservation(String collectionItemId, String adId, Instant now) {
        Query query = Query.query(Criteria.where("_id").is(collectionItemId)
                .and("adReservations").elemMatch(Criteria.where("adId").is(adId)
                        .and("status").is(AdReservationStatus.ACTIVE)
                        .and("quantity").is(0)));

        Update update = new Update()
                .set("adReservations.$.status", AdReservationStatus.CANCELLED)
                .set("adReservations.$.updatedAt", now);

        mongoTemplate.updateFirst(query, update, CollectionItem.class);
    }

    public void deleteIfEmpty(String collectionItemId) {
        Query query = Query.query(Criteria.where("_id").is(collectionItemId)
                .and("quantity").lte(0)
                .and("committedQuantity").lte(0));

        mongoTemplate.remove(query, CollectionItem.class);
    }

    /** Soma os exemplares ao item do comprador, criando-o se ainda não existir. */
    public void creditBuyer(
            String buyerId,
            String cardId,
            CardCondition condition,
            CardLanguage language,
            int quantity,
            String mark
    ) {
        for (int attempt = 0; attempt < 3; attempt++) {
            Criteria identity = Criteria.where("userId").is(buyerId)
                    .and("cardId").is(cardId)
                    .and("condition").is(condition)
                    .and("language").is(language);

            Query pending = Query.query(identity).addCriteria(Criteria.where(MARKS).ne(mark));
            Update credit = new Update()
                    .inc("quantity", quantity)
                    .push(MARKS, mark);

            if (mongoTemplate.updateFirst(pending, credit, CollectionItem.class).getModifiedCount() == 1) {
                return;
            }

            Query applied = Query.query(Criteria.where("userId").is(buyerId)
                    .and("cardId").is(cardId)
                    .and("condition").is(condition)
                    .and("language").is(language)
                    .and(MARKS).is(mark));
            if (mongoTemplate.exists(applied, CollectionItem.class)) {
                return;
            }

            try {
                mongoTemplate.upsert(pending, credit
                        .setOnInsert("committedQuantity", 0)
                        .setOnInsert("adReservations", List.of()), CollectionItem.class);
                return;
            } catch (DuplicateKeyException concurrentInsert) {
                // Outro pedido criou o item agora; a próxima volta soma nele.
            }
        }

        throw new IllegalStateException("Não foi possível creditar a coleção do comprador.");
    }
}
