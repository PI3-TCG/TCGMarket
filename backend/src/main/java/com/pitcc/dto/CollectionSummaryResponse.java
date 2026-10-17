package com.pitcc.dto;

public record CollectionSummaryResponse(
        long totalItems,
        long totalCopies,
        long totalGames
) {
}