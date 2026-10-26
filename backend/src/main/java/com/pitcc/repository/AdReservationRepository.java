
package com.pitcc.repository;

import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.CollectionItem;

import org.bson.Document;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Repository
public class AdReservationRepository {

    private final MongoTemplate mongoTemplate;

    public AdReservationRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public boolean reserve(
            String collectionItemId,
            String userId,
            AdReservation reservation
    ) {
        Objects.requireNonNull(
                reservation,
                "Reserva obrigatória."
        );

        validateIdentifiers(collectionItemId, userId);

        int requestedQuantity = reservation.getQuantity();

        Query query = new Query();

        query.addCriteria(
                Criteria.where("_id").is(collectionItemId)
        );

        query.addCriteria(
                Criteria.where("userId").is(userId)
        );

        query.addCriteria(
                Criteria.where("adReservations.adId")
                        .ne(reservation.getAdId())
        );

        query.addCriteria(
                Criteria.expr(() ->
                        new Document(
                                "$gte",
                                List.of(
                                        new Document(
                                                "$subtract",
                                                List.of(
                                                        "$quantity",
                                                        "$committedQuantity"
                                                )
                                        ),
                                        requestedQuantity
                                )
                        )
                )
        );

        Update update = new Update()
                .inc(
                        "committedQuantity",
                        requestedQuantity
                )
                .push(
                        "adReservations",
                        reservation
                );

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean confirmCreation(
            String collectionItemId,
            String userId,
            String adId
    ) {
        Query query = Query.query(
                Criteria.where("_id").is(collectionItemId)
                        .and("userId").is(userId)
                        .and("adReservations").elemMatch(
                                Criteria.where("adId").is(adId)
                                        .and("status").is(
                                                AdReservationStatus.PENDING_CREATION
                                        )
                        )
        );

        Update update = new Update()
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.ACTIVE
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                );

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean beginCancellation(
            String collectionItemId,
            String userId,
            String adId
    ) {
        Query query = Query.query(
                Criteria.where("_id").is(collectionItemId)
                        .and("userId").is(userId)
                        .and("adReservations").elemMatch(
                                Criteria.where("adId").is(adId)
                                        .and("status").is(
                                                AdReservationStatus.ACTIVE
                                        )
                        )
        );

        Update update = new Update()
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.PENDING_CANCELLATION
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                );

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean beginUpdate(
            String collectionItemId,
            String userId,
            String adId,
            String operationId,
            int currentReservedQuantity,
            int targetReservedQuantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice
    ) {
        validateIdentifiers(collectionItemId, userId);
        validateUpdate(
                adId,
                operationId,
                currentReservedQuantity,
                targetReservedQuantity,
                saleEnabled,
                tradeEnabled,
                unitPrice
        );

        int additionalQuantity = Math.max(
                0,
                targetReservedQuantity - currentReservedQuantity
        );

        Query query = new Query();

        query.addCriteria(
                Criteria.where("_id").is(collectionItemId)
        );

        query.addCriteria(
                Criteria.where("userId").is(userId)
        );

        query.addCriteria(
                Criteria.where("committedQuantity")
                        .gte(currentReservedQuantity)
        );

        query.addCriteria(
                Criteria.where("adReservations").elemMatch(
                        Criteria.where("adId").is(adId)
                                .and("status").is(
                                        AdReservationStatus.ACTIVE
                                )
                                .and("quantity").is(
                                        currentReservedQuantity
                                )
                )
        );

        if (additionalQuantity > 0) {
            query.addCriteria(
                    Criteria.expr(() ->
                            new Document(
                                    "$gte",
                                    List.of(
                                            new Document(
                                                    "$subtract",
                                                    List.of(
                                                            "$quantity",
                                                            "$committedQuantity"
                                                    )
                                            ),
                                            additionalQuantity
                                    )
                            )
                    )
            );
        }

        Update update = new Update()
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.PENDING_UPDATE
                )
                .set(
                        "adReservations.$.pendingOperationId",
                        operationId
                )
                .set(
                        "adReservations.$.pendingQuantity",
                        targetReservedQuantity
                )
                .set(
                        "adReservations.$.pendingSaleEnabled",
                        saleEnabled
                )
                .set(
                        "adReservations.$.pendingTradeEnabled",
                        tradeEnabled
                )
                .set(
                        "adReservations.$.pendingUnitPrice",
                        saleEnabled ? unitPrice : null
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                );

        if (additionalQuantity > 0) {
            update.inc(
                    "committedQuantity",
                    additionalQuantity
            );
        }

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean confirmUpdate(
            String collectionItemId,
            String userId,
            String adId,
            String operationId,
            int currentReservedQuantity,
            int targetReservedQuantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice
    ) {
        validateIdentifiers(collectionItemId, userId);
        validateUpdate(
                adId,
                operationId,
                currentReservedQuantity,
                targetReservedQuantity,
                saleEnabled,
                tradeEnabled,
                unitPrice
        );

        int releasedQuantity = Math.max(
                0,
                currentReservedQuantity - targetReservedQuantity
        );

        Query query = Query.query(
                Criteria.where("_id").is(collectionItemId)
                        .and("userId").is(userId)
                        .and("committedQuantity")
                        .gte(releasedQuantity)
                        .and("adReservations").elemMatch(
                                Criteria.where("adId").is(adId)
                                        .and("status").is(
                                                AdReservationStatus.PENDING_UPDATE
                                        )
                                        .and("quantity").is(
                                                currentReservedQuantity
                                        )
                                        .and("pendingQuantity").is(
                                                targetReservedQuantity
                                        )
                                        .and("pendingOperationId").is(
                                                operationId
                                        )
                        )
        );

        Update update = new Update()
                .set(
                        "adReservations.$.quantity",
                        targetReservedQuantity
                )
                .set(
                        "adReservations.$.saleEnabled",
                        saleEnabled
                )
                .set(
                        "adReservations.$.tradeEnabled",
                        tradeEnabled
                )
                .set(
                        "adReservations.$.unitPrice",
                        saleEnabled ? unitPrice : null
                )
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.ACTIVE
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                )
                .unset(
                        "adReservations.$.pendingOperationId"
                )
                .unset(
                        "adReservations.$.pendingQuantity"
                )
                .unset(
                        "adReservations.$.pendingSaleEnabled"
                )
                .unset(
                        "adReservations.$.pendingTradeEnabled"
                )
                .set("adReservations.$.pendingUnitPrice", null);

        if (releasedQuantity > 0) {
            update.inc(
                    "committedQuantity",
                    -releasedQuantity
            );
        }

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean abortUpdate(
            String collectionItemId,
            String userId,
            String adId,
            String operationId,
            int currentReservedQuantity,
            int targetReservedQuantity
    ) {
        validateIdentifiers(collectionItemId, userId);

        if (adId == null || adId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador do anúncio obrigatório."
            );
        }

        if (operationId == null || operationId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador da operação obrigatório."
            );
        }

        if (currentReservedQuantity <= 0 ||
                targetReservedQuantity <= 0) {
            throw new IllegalArgumentException(
                    "As quantidades precisam ser positivas."
            );
        }

        int additionalQuantity = Math.max(
                0,
                targetReservedQuantity - currentReservedQuantity
        );

        Query query = Query.query(
                Criteria.where("_id").is(collectionItemId)
                        .and("userId").is(userId)
                        .and("committedQuantity")
                        .gte(additionalQuantity)
                        .and("adReservations").elemMatch(
                                Criteria.where("adId").is(adId)
                                        .and("status").is(
                                                AdReservationStatus.PENDING_UPDATE
                                        )
                                        .and("quantity").is(
                                                currentReservedQuantity
                                        )
                                        .and("pendingQuantity").is(
                                                targetReservedQuantity
                                        )
                                        .and("pendingOperationId").is(
                                                operationId
                                        )
                        )
        );

        Update update = new Update()
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.ACTIVE
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                )
                .unset(
                        "adReservations.$.pendingOperationId"
                )
                .unset(
                        "adReservations.$.pendingQuantity"
                )
                .unset(
                        "adReservations.$.pendingSaleEnabled"
                )
                .unset(
                        "adReservations.$.pendingTradeEnabled"
                )
                .set(
                        "adReservations.$.pendingUnitPrice",
                        null
                );

        if (additionalQuantity > 0) {
            update.inc(
                    "committedQuantity",
                    -additionalQuantity
            );
        }

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    public boolean release(
            String collectionItemId,
            String userId,
            String adId,
            int quantity,
            AdReservationStatus expectedStatus
    ) {
        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade precisa ser positiva."
            );
        }

        if (expectedStatus != AdReservationStatus.ACTIVE
                && expectedStatus != AdReservationStatus.PENDING_CREATION
                && expectedStatus != AdReservationStatus.PENDING_CANCELLATION) {
            throw new IllegalArgumentException(
                    "Estado inválido para liberação."
            );
        }

        Query query = Query.query(
                Criteria.where("_id").is(collectionItemId)
                        .and("userId").is(userId)
                        .and("committedQuantity").gte(quantity)
                        .and("adReservations").elemMatch(
                                Criteria.where("adId").is(adId)
                                        .and("quantity").is(quantity)
                                        .and("status").is(expectedStatus)
                        )
        );

        Update update = new Update()
                .inc(
                        "committedQuantity",
                        -quantity
                )
                .set(
                        "adReservations.$.status",
                        AdReservationStatus.CANCELLED
                )
                .set(
                        "adReservations.$.updatedAt",
                        Instant.now()
                );

        var result = mongoTemplate.updateFirst(
                query,
                update,
                CollectionItem.class
        );

        return result.getModifiedCount() == 1;
    }

    private void validateIdentifiers(
            String collectionItemId,
            String userId
    ) {
        if (collectionItemId == null || collectionItemId.isBlank()) {
            throw new IllegalArgumentException(
                    "Informe o item da coleção."
            );
        }

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "Informe o usuário."
            );
        }
    }

    private void validateUpdate(
            String adId,
            String operationId,
            int currentReservedQuantity,
            int targetReservedQuantity,
            boolean saleEnabled,
            boolean tradeEnabled,
            BigDecimal unitPrice
    ) {
        if (adId == null || adId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador do anúncio obrigatório."
            );
        }

        if (operationId == null || operationId.isBlank()) {
            throw new IllegalArgumentException(
                    "Identificador da operação obrigatório."
            );
        }

        if (currentReservedQuantity <= 0 ||
                targetReservedQuantity <= 0) {
            throw new IllegalArgumentException(
                    "As quantidades precisam ser positivas."
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
    }
}
