package com.pitcc.dto;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;

public record CollectionFilters(
        String search,
        CardGame game,
        String edition,
        String rarity,
        CardCondition condition,
        CardLanguage language
) {

    public CollectionFilters {
        search = normalize(search, 120, "A pesquisa");
        edition = normalize(edition, 200, "A edição");
        rarity = normalize(rarity, 120, "A raridade");
    }

    private static String normalize(
            String value,
            int maxLength,
            String fieldName) {

        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.strip();

        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(
                    fieldName + " deve ter no máximo "
                            + maxLength + " caracteres.");
        }

        return normalized;
    }

    public boolean hasCardFilters() {
        return search != null
                || game != null
                || edition != null
                || rarity != null;
    }
}