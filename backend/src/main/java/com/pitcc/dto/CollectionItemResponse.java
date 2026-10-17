package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;

public record CollectionItemResponse(
        String id,
        Integer quantity,
        CardCondition condition,
        CardLanguage language,
        CollectionCardResponse card
) {
}