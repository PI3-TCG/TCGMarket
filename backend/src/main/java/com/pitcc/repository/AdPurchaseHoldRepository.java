package com.pitcc.repository;

import com.pitcc.model.Ad;
import com.pitcc.model.AdPurchaseHold;
import com.pitcc.model.AdStatus;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Reservas de exemplares no anúncio enquanto o pagamento do pedido está pendente.
 * Cada operação é um único update condicional, identificado pelo pedido, então
 * repeti-la não tem efeito.
 */
@Repository
public class AdPurchaseHoldRepository {

    private final MongoTemplate mongoTemplate;

    public AdPurchaseHoldRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /** Reserva {@code quantity} exemplares se ainda houver disponibilidade para compra. */
    public boolean reserve(String adId, String orderId, int quantity, Instant now) {
        Document heldQuantity = new Document("$sum", new Document(
                "$ifNull", List.of("$purchaseHolds.quantity", List.of())
        ));
        Document available = new Document("$subtract", List.of("$remainingQuantity", heldQuantity));

        Query query = Query.query(Criteria.where("id").is(adId)
                .and("status").is(AdStatus.ACTIVE)
                .and("saleEnabled").is(true)
                .and("purchaseHolds.orderId").ne(orderId)
                .andOperator(Criteria.expr(
                        () -> new Document("$gte", List.of(available, quantity))
                )));

        Update update = new Update()
                .push("purchaseHolds", new AdPurchaseHold(orderId, quantity, now));

        return mongoTemplate.updateFirst(query, update, Ad.class).getModifiedCount() == 1;
    }

    public void release(String adId, String orderId) {
        Query query = Query.query(Criteria.where("id").is(adId)
                .and("purchaseHolds.orderId").is(orderId));

        Update update = new Update()
                .pull("purchaseHolds", new Document("orderId", orderId));

        mongoTemplate.updateFirst(query, update, Ad.class);
    }
}
