package com.pitcc.dto;

public record CardCollectionResponse(
        String id,
        String name,
        boolean visible,
        String coverItemId,
        String coverImageUrl,
        int cardCount
) {
}
