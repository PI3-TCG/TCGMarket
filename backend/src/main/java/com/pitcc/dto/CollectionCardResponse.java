package com.pitcc.dto;

import com.pitcc.model.CardGame;

public record CollectionCardResponse(
        String id,
        String name,
        CardGame game,
        String edition,
        String cardNumber,
        String officialRarity,
        String imageUrl
) {
}