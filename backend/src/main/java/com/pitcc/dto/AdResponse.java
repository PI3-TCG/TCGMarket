package com.pitcc.dto;

import com.pitcc.model.AdStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record AdResponse(
        String id,
        String collectionItemId,
        AdStatus status,
        int quantity,
        int remainingQuantity,
        boolean saleEnabled,
        boolean tradeEnabled,
        BigDecimal unitPrice,
        String description,
        Instant createdAt,
        CollectionItemAvailabilityResponse availability
) {
}
