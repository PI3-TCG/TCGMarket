package com.pitcc.dto;

import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Anúncio visto pelo próprio dono. {@code releasedQuantity} só é preenchido
 * em anúncios cancelados: são os exemplares liberados no cancelamento, não a
 * disponibilidade atual da coleção.
 */
public record OwnAdResponse(
        String id,
        String collectionItemId,
        AdStatus status,
        int quantity,
        int remainingQuantity,
        boolean saleEnabled,
        boolean tradeEnabled,
        BigDecimal unitPrice,
        CardCondition condition,
        CardLanguage language,
        CollectionCardResponse card,
        Instant createdAt,
        Instant updatedAt,
        Instant cancelledAt,
        Integer releasedQuantity
) {
}
