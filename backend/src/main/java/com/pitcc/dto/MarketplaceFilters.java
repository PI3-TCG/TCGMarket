package com.pitcc.dto;

import com.pitcc.model.CardGame;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MarketplaceFilters(

        @Size(
                max = 100,
                message = "A pesquisa deve ter no máximo 100 caracteres."
        )
        String search,

        CardGame game,

        @Pattern(
                regexp = "SALE|TRADE|BOTH",
                message = "Selecione uma modalidade válida."
        )
        String modality

) {

    public MarketplaceFilters {
        search = normalize(search);
        modality = normalize(modality);
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.strip();
    }
}