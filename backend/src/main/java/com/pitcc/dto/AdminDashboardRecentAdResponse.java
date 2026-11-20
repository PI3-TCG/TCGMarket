package com.pitcc.dto;

import com.pitcc.model.AdStatus;
import com.pitcc.model.CardGame;
import java.math.BigDecimal;
import java.time.Instant;

public record AdminDashboardRecentAdResponse(
    String id,
    String cardName,
    CardGame game,
    BigDecimal unitPrice,
    boolean tradeOnly,
    AdStatus status,
    Instant createdAt
) {}
