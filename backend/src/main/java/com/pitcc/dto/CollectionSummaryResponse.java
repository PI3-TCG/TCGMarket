package com.pitcc.dto;

import com.pitcc.model.CardGame;
import java.util.List;

public record CollectionSummaryResponse(
        long totalItems,
        long totalCopies,
        long totalGames,
        List<CardGame> games
) {
}