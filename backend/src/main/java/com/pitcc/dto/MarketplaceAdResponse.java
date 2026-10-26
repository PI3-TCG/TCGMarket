package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;

import java.math.BigDecimal;

public record MarketplaceAdResponse(
        String id,
        String cardId,
        String cardName,
        CardGame game,
        String edition,
        String cardNumber,
        String rarity,
        String imageUrl,
        CardCondition condition,
        CardLanguage language,
        int remainingQuantity,
        boolean saleEnabled,
        boolean tradeEnabled,
        BigDecimal unitPrice,
        String sellerUsername,
        String description,
        boolean ownAd
) {
}